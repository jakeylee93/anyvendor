import { test } from "node:test";
import assert from "node:assert/strict";
import { zonedToUtc, utcToZonedInput } from "../../src/lib/social/time.ts";
import { escapeLinkedIn, publishInstagram, publishLinkedIn, validateForProvider, authorizeUrl } from "../../src/lib/social/providers.ts";

test("London wall time converts correctly across GMT and BST, both ways", () => {
  assert.equal(zonedToUtc("2026-12-20T19:30", "Europe/London")?.toISOString(), "2026-12-20T19:30:00.000Z");
  assert.equal(zonedToUtc("2026-07-01T09:00", "Europe/London")?.toISOString(), "2026-07-01T08:00:00.000Z");
  assert.equal(zonedToUtc("2027-03-28T12:00", "Europe/London")?.toISOString(), "2027-03-28T11:00:00.000Z");
  assert.equal(utcToZonedInput("2026-07-01T08:00:00.000Z", "Europe/London"), "2026-07-01T09:00");
  assert.equal(zonedToUtc("not a date", "Europe/London"), null);
});

test("per-channel validation follows each provider's documented limits", () => {
  const jpg = { path: "a", mime: "image/jpeg", bytes: 1000, kind: "image" as const };
  const png = { path: "b", mime: "image/png", bytes: 1000, kind: "image" as const };
  assert.deepEqual(validateForProvider("instagram", "Hi", []), ["Instagram needs a photo or video."]);
  assert.deepEqual(validateForProvider("instagram", "Hi", [png]), ["Instagram photos must be JPEG."]);
  assert.deepEqual(validateForProvider("instagram", "Hi", [jpg]), []);
  assert.deepEqual(validateForProvider("linkedin", "Hello", []), []);
  assert.match(validateForProvider("linkedin", "x".repeat(3001), [])[0], /3000/);
  assert.match(validateForProvider("linkedin", "Hi", [jpg, png])[0], /one image/);
});

test("LinkedIn text is escaped for its little format", () => {
  assert.equal(escapeLinkedIn("Party (Fri) #cocktails @ 8pm"), "Party \\(Fri\\) \\#cocktails \\@ 8pm");
});

test("OAuth URLs ask only for the documented scopes", () => {
  const li = new URL(authorizeUrl("linkedin", { clientId: "c", redirectUri: "https://x/cb", state: "s" }));
  assert.equal(li.searchParams.get("scope"), "openid profile w_member_social");
  const ig = new URL(authorizeUrl("instagram", { clientId: "c", redirectUri: "https://x/cb", state: "s" }));
  assert.equal(ig.searchParams.get("scope"), "instagram_business_basic,instagram_business_content_publish");
  const g = new URL(authorizeUrl("google_search_console", { clientId: "c", redirectUri: "https://x/cb", state: "s", codeChallenge: "abc" }));
  assert.equal(g.searchParams.get("scope"), "https://www.googleapis.com/auth/webmasters.readonly");
  assert.equal(g.searchParams.get("code_challenge_method"), "S256");
});

type Call = { url: string; init?: RequestInit };
function fakeFetch(handler: (c: Call) => Response) {
  const calls: Call[] = [];
  const f = (async (url: string | URL, init?: RequestInit) => {
    const c = { url: String(url), init };
    calls.push(c);
    return handler(c);
  }) as typeof fetch;
  return { f, calls };
}
const json = (b: unknown, status = 200, headers: Record<string, string> = {}) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json", ...headers } });

test("LinkedIn: 201 with x-restli-id is published; the version headers are sent", async () => {
  const { f, calls } = fakeFetch(() => new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:1" } }));
  const r = await publishLinkedIn({ token: "t", author: "urn:li:person:p", text: "Hi" }, f);
  assert.equal(r.outcome, "published");
  assert.equal(r.externalId, "urn:li:share:1");
  const h = calls[0].init?.headers as Record<string, string>;
  assert.equal(h["Linkedin-Version"], "202610");
  assert.equal(h["X-Restli-Protocol-Version"], "2.0.0");
});

test("LinkedIn: ambiguous server errors and network failures are never retried (no double posts)", async () => {
  assert.equal((await publishLinkedIn({ token: "t", author: "a", text: "x" }, fakeFetch(() => new Response(null, { status: 502 })).f)).outcome, "permanent_error");
  const boom = (async () => { throw new Error("socket hang up"); }) as unknown as typeof fetch;
  const r = await publishLinkedIn({ token: "t", author: "a", text: "x" }, boom);
  assert.equal(r.outcome, "permanent_error");
  assert.match(r.error!, /Check the account/);
  assert.equal((await publishLinkedIn({ token: "t", author: "a", text: "x" }, fakeFetch(() => new Response(null, { status: 429 })).f)).outcome, "retryable_error");
  assert.equal((await publishLinkedIn({ token: "t", author: "a", text: "x" }, fakeFetch(() => new Response(null, { status: 401 })).f)).outcome, "auth_error");
});

test("Instagram: container, wait for FINISHED, publish once", async () => {
  let checks = 0;
  const { f, calls } = fakeFetch(({ url, init }) => {
    if (url.endsWith("/media") && init?.method === "POST") return json({ id: "c1" });
    if (url.includes("/c1?fields=status_code")) return json({ status_code: ++checks < 2 ? "IN_PROGRESS" : "FINISHED" });
    if (url.endsWith("/media_publish")) return json({ id: "m1" });
    if (url.includes("/m1?fields=permalink")) return json({ permalink: "https://instagram.com/p/x" });
    return json({}, 404);
  });
  const r = await publishInstagram({ token: "t", igUserId: "ig", caption: "Hi", media: [{ url: "https://cdn/x.jpg", kind: "image" }] }, f, async () => {});
  assert.deepEqual([r.outcome, r.externalId, r.externalUrl], ["published", "m1", "https://instagram.com/p/x"]);
  assert.equal(calls.filter((c) => c.url.endsWith("/media_publish")).length, 1);
});

test("Instagram retry: an already-published container is recognised instead of posting again", async () => {
  const { f, calls } = fakeFetch(({ url }) => (url.includes("fields=status_code") ? json({ status_code: "PUBLISHED" }) : json({}, 500)));
  const r = await publishInstagram({ token: "t", igUserId: "ig", caption: "Hi", media: [{ url: "u", kind: "image" }], existingContainer: "c9" }, f, async () => {});
  assert.equal(r.outcome, "published");
  assert.equal(calls.some((c) => c.url.endsWith("/media_publish") || c.url.endsWith("/media")), false);
});

test("Instagram: slow video processing keeps the container for the next attempt", async () => {
  const { f } = fakeFetch(({ url, init }) => (url.endsWith("/media") && init?.method === "POST" ? json({ id: "c2" }) : json({ status_code: "IN_PROGRESS" })));
  const r = await publishInstagram({ token: "t", igUserId: "ig", caption: "", media: [{ url: "u.mp4", kind: "video" }] }, f, async () => {});
  assert.deepEqual([r.outcome, r.containerId], ["retryable_error", "c2"]);
});

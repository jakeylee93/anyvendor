import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchSummary, reportWindow } from "../../src/lib/seo/searchConsole.ts";

test("the report window is 28 days ending 3 days ago", () => {
  assert.deepEqual(reportWindow(new Date("2026-11-02T12:00:00Z")), { startDate: "2026-10-03", endDate: "2026-10-30" });
});

test("Search Console totals and top queries are read from the documented response shape; domain properties are encoded", async () => {
  const seen: string[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    seen.push(url);
    const body = JSON.parse(String(init?.body));
    return new Response(JSON.stringify(body.dimensions
      ? { rows: [{ keys: ["mobile bar hire essex"], clicks: 12, impressions: 340 }] }
      : { rows: [{ keys: [], clicks: 40, impressions: 1200, ctr: 0.0333, position: 8.2 }] }), { status: 200 });
  }) as unknown as typeof fetch;
  const s = await fetchSummary("tok", "sc-domain:example.com", f, new Date("2026-11-02T12:00:00Z"));
  assert.equal(seen[0], "https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Aexample.com/searchAnalytics/query");
  assert.deepEqual([s.clicks, s.impressions, s.position], [40, 1200, 8.2]);
  assert.deepEqual(s.topQueries, [{ query: "mobile bar hire essex", clicks: 12, impressions: 340 }]);
});

test("revoked Google access is reported as an auth problem, not as zero data", async () => {
  const f = (async () => new Response("{}", { status: 401 })) as unknown as typeof fetch;
  await assert.rejects(fetchSummary("tok", "https://example.com/", f), (e: Error & { auth?: boolean }) => e.auth === true);
});

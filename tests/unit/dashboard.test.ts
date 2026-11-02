import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLayout, WIDGETS } from "../../src/lib/business/dashboard.ts";
import { marketingScore, weekKey } from "../../src/lib/business/marketing.ts";
import { normaliseProfile, profileCompleteness, profileFromForm } from "../../src/lib/business/profile-content.ts";
import { companiesHouseLinks, normaliseCompanyNumber, normaliseKit } from "../../src/lib/business/brand-kit.ts";
import { describeCode, forecastFor } from "../../src/lib/business/weather.ts";

test("saved layouts keep their order, drop unknown widgets and pick up new ones", () => {
  const l = resolveLayout([{ id: "weather", hidden: true }, { id: "bogus" }, { id: "website" }, { id: "weather" }]);
  assert.deepEqual(l.slice(0, 2), [{ id: "weather", hidden: true }, { id: "website", hidden: false }]);
  assert.equal(l.length, WIDGETS.length);
  assert.equal(resolveLayout("garbage").length, WIDGETS.length);
});

test("weeks run Monday to Sunday in London time", () => {
  assert.equal(weekKey("2026-11-02T09:00:00Z", "Europe/London"), "2026-11-02");
  assert.equal(weekKey("2026-11-08T23:30:00Z", "Europe/London"), "2026-11-02");
  assert.equal(weekKey("2026-11-09T00:30:00Z", "Europe/London"), "2026-11-09");
});

test("marketing points come only from real planned and published posts", () => {
  const now = new Date("2026-11-05T12:00:00Z");
  const post = (when: string, status = "scheduled", published = 0) => ({ status, scheduled_for: when, targets: Array.from({ length: published }, () => ({ status: "published" })) });
  const none = marketingScore([], now, "Europe/London");
  assert.deepEqual([none.points, none.streak, none.level], [0, 0, "Getting started"]);
  const s = marketingScore(
    [
      post("2026-11-03T10:00:00Z", "published", 2),
      post("2026-11-06T10:00:00Z"),
      post("2026-11-07T10:00:00Z"),
      post("2026-11-04T10:00:00Z", "draft"),
      post("2026-11-04T10:00:00Z", "cancelled"),
      post("2026-10-27T10:00:00Z"), post("2026-10-28T10:00:00Z"), post("2026-10-29T10:00:00Z"),
    ],
    now,
    "Europe/London",
  );
  assert.deepEqual([s.planned, s.published, s.points, s.metGoal, s.streak], [3, 2, 3 * 5 + 2 * 10 + 20, true, 2]);
});

test("profiles are cleaned, scored for completeness and built from forms", () => {
  const p = normaliseProfile({ displayName: "Alice Bars", contact: { email: "nope", website: "http://insecure" }, travels: "moon" });
  assert.deepEqual([p.contact.email, p.contact.website, p.travels], ["", "", "regional"]);
  assert.deepEqual(profileCompleteness(p), { percent: 13, next: "a tagline" });
  const f = new FormData();
  f.append("displayName", "Alice Bars");
  f.append("categories", "Mobile Bars");
  f.append("categories", "Mixologists");
  f.append("services.0.title", "Cocktail bar");
  f.append("areas", "Essex\nLondon");
  f.append("socials.instagram", "https://instagram.com/alice");
  const q = profileFromForm(f);
  assert.deepEqual([q.categories, q.services.length, q.areas, q.socials.instagram], [["Mobile Bars", "Mixologists"], 1, ["Essex", "London"], "https://instagram.com/alice"]);
});

test("company numbers are validated and link to the official Companies House register", () => {
  assert.equal(normaliseCompanyNumber("1234567"), "01234567");
  assert.equal(normaliseCompanyNumber("sc123456"), "SC123456");
  assert.equal(normaliseCompanyNumber("not a number"), "");
  assert.equal(companiesHouseLinks("01234567")?.filings, "https://find-and-update.company-information.service.gov.uk/company/01234567/filing-history");
  assert.deepEqual(normaliseKit({ colours: [{ name: "Navy", hex: "#212235" }, { name: "Bad", hex: "red" }] }).colours, [{ name: "Navy", hex: "#212235" }]);
});

test("weather codes map to plain words and a missing place returns nothing rather than a guess", async () => {
  assert.equal(describeCode(61).label, "Rain");
  const f = (async () => new Response(JSON.stringify({ results: [] }), { status: 200 })) as unknown as typeof fetch;
  assert.equal(await forecastFor("Nowhereville", f, undefined), null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { covers, parseLocation } from "../../src/lib/location.ts";

test("a postcode, town or county is enough to pick an area", () => {
  assert.deepEqual(parseLocation("CM2 6XL"), { label: "CM2 6XL", area: "Essex" });
  assert.deepEqual(parseLocation("e4 7ab"), { label: "E4 7AB", area: "London" });
  assert.deepEqual(parseLocation("theydon bois"), { label: "Theydon Bois", area: "Essex" });
  assert.deepEqual(parseLocation("Hertfordshire"), { label: "Hertfordshire", area: "Hertfordshire" });
  assert.deepEqual(parseLocation("Somewhere in Kent"), { label: "Somewhere In Kent", area: "Kent" });
  assert.deepEqual(parseLocation("Atlantis"), { label: "Atlantis", area: null });
  assert.equal(parseLocation("   "), null);
});

test("coverage matching is honest: regional vendors only where they say they go, nationwide everywhere", () => {
  const essexOnly = { travels: "regional", areas: ["Chelmsford", "Essex"], base: "Chelmsford" };
  const nationwide = { travels: "nationwide", areas: ["London", "Nationwide (UK)"], base: "London" };
  const londonLocal = { travels: "local", areas: ["London"], base: "London" };
  const essex = parseLocation("Brentwood")!;
  const norfolk = parseLocation("Norwich")!;
  assert.equal(covers(essexOnly, essex), true);
  assert.equal(covers(essexOnly, norfolk), false);
  assert.equal(covers(nationwide, norfolk), true);
  assert.equal(covers(londonLocal, essex), false);
  assert.equal(covers(londonLocal, parseLocation("SW1A 1AA")!), true);
  assert.equal(covers(null, essex), false);
});

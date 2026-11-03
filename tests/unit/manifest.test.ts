import { test } from "node:test";
import assert from "node:assert/strict";
import { contentFromManifestForm, manifestProblems, normaliseByManifest, STARTER_MANIFEST, type Manifest } from "../../src/lib/business/manifest.ts";

test("manifests are validated: keys, types, select options, no nested lists", () => {
  assert.deepEqual(manifestProblems(STARTER_MANIFEST), []);
  const bad = { version: 2, sections: [{ key: "Hero!", fields: [{ key: "x", type: "magic" }, { key: "s", type: "select" }, { key: "l", type: "list", fields: [{ key: "n", type: "list", fields: [{ key: "q", type: "text" }] }] }] }] };
  const p = manifestProblems(bad);
  assert.ok(p.some((x) => /version/.test(x)) && p.some((x) => /Section key/.test(x)) && p.some((x) => /unknown type/.test(x)) && p.some((x) => /needs options/.test(x)) && p.some((x) => /cannot contain lists/.test(x)));
});

test("content is cleaned against the manifest: unknown keys dropped, links checked, lists bounded", () => {
  const m: Manifest = { version: 1, sections: [{ key: "hero", fields: [{ key: "headline", type: "text", max: 10 }, { key: "image", type: "image" }, { key: "cta", type: "link" }, { key: "items", type: "list", max: 2, fields: [{ key: "t", type: "text" }] }] }] };
  const c = normaliseByManifest(m, { hero: { headline: "A very long headline", image: { src: "javascript:x", alt: "a" }, cta: { href: "https://ok.test", label: "Book" }, items: [{ t: "1" }, { t: "2" }, { t: "3" }], extra: "x" }, rogue: {} });
  assert.deepEqual(c, { hero: { headline: "A very lon", image: { src: "", alt: "" }, cta: { href: "https://ok.test", label: "Book" }, items: [{ t: "1" }, { t: "2" }] } });
});

test("editor forms rebuild nested content, including uploaded image paths", () => {
  const f = new FormData();
  f.append("hero.headline", "Hi");
  f.append("hero.image.alt", "Our bar");
  f.append("services.items.0.title", "Cocktails");
  f.append("services.items.1.title", "");
  f.append("services.items.2.title", "Dry hire");
  const c = contentFromManifestForm(STARTER_MANIFEST, f, { "hero.image": "https://cdn.test/a.jpg", "services.items.2.image": "https://cdn.test/b.jpg" });
  assert.equal((c.hero.image as { src: string; alt: string }).src, "https://cdn.test/a.jpg");
  assert.equal((c.hero.image as { alt: string }).alt, "Our bar");
  const items = c.services.items as { title: string; image: { src: string } }[];
  assert.deepEqual(items.map((i) => i.title), ["Cocktails", "Dry hire"]);
  assert.equal(items[1].image.src, "https://cdn.test/b.jpg");
});

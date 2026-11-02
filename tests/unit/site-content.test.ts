import { test } from "node:test";
import assert from "node:assert/strict";
import { contentFromForm, normaliseContent } from "../../src/lib/business/site-content.ts";

test("content is clamped and unsafe links are dropped", () => {
  const c = normaliseContent({
    headline: "x".repeat(500),
    heroImage: "javascript:alert(1)",
    accent: "hotpink",
    contact: { email: "not-an-email", bookingUrl: "http://insecure.example" },
    services: [{ title: "Bar", text: "Cocktails" }, { title: "" }],
    gallery: [{ src: "https://cdn.example/a.jpg", alt: "A" }, { src: "data:image/png;base64,xx" }],
  });
  assert.equal(c.headline.length, 120);
  assert.equal(c.heroImage, "");
  assert.equal(c.accent, "cyan");
  assert.deepEqual(c.contact, { email: "", phone: "", area: "", bookingUrl: "" });
  assert.equal(c.services.length, 1);
  assert.deepEqual(c.gallery, [{ src: "https://cdn.example/a.jpg", alt: "A" }]);
});

test("form fields build nested content; the remove checkbox drops a photo; extra fields are ignored", () => {
  const f = new FormData();
  f.append("headline", "Hello");
  f.append("expected_version", "3");
  f.append("services.0.title", "DJ");
  f.append("services.0.text", "All night");
  f.append("services.1.title", "");
  f.append("gallery.0.src", "https://cdn.example/a.jpg");
  f.append("gallery.0.alt", "Dance floor");
  f.append("gallery.1.src", "https://cdn.example/b.jpg");
  f.append("gallery.1.src", "");
  f.append("contact.email", "hello@example.com");
  const c = contentFromForm(f);
  assert.equal(c.headline, "Hello");
  assert.deepEqual(c.services, [{ title: "DJ", text: "All night" }]);
  assert.deepEqual(c.gallery, [{ src: "https://cdn.example/a.jpg", alt: "Dance floor" }]);
  assert.equal(c.contact.email, "hello@example.com");
  assert.equal("expected_version" in c, false);
});

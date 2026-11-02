// Clearly labelled demo used only when the AnyVendor database is not connected.
// It shows layout. It never shows performance numbers or claims anything was published.
import type { SiteContent } from "./site-content";

export const DEMO_BUSINESS = {
  id: "demo",
  name: "Demo Events Co.",
  slug: "demo-events",
  directory_slug: null as string | null,
  timezone: "Europe/London",
  role: "owner" as const,
};

export const DEMO_SITE: SiteContent = {
  headline: "Mobile bars for weddings and parties",
  intro: "This is a demo website showing what an AnyVendor-hosted site looks like. It is not a real business.",
  heroImage: "",
  about:
    "Every AnyVendor plan includes a website like this one, hosted for you. You edit the words and photos yourself, or send us a request and we make the change.",
  services: [
    { title: "Cocktail bars", text: "Sample service text for the demo." },
    { title: "Staffed bars", text: "Sample service text for the demo." },
    { title: "Dry hire", text: "Sample service text for the demo." },
  ],
  gallery: [],
  contact: { email: "", phone: "", area: "Essex and London (demo)", bookingUrl: "" },
  accent: "cyan",
};

export function demoRequests(now = Date.now()) {
  const h = 3600_000;
  const row = (ref: number, title: string, status: string, submittedHoursAgo: number, extra: Record<string, unknown> = {}) => ({
    id: `demo-${ref}`,
    ref,
    title,
    status,
    kind: "update",
    scope: "standard",
    submitted_at: new Date(now - submittedHoursAgo * h).toISOString(),
    due_at: new Date(now - submittedHoursAgo * h + 24 * h).toISOString(),
    completed_at: null as string | null,
    preview_url: null as string | null,
    ...extra,
  });
  return [
    row(3, "Add our winter cocktail menu", "in_progress", 3),
    row(2, "New photo for the homepage", "ready_to_review", 20, { preview_url: "https://example.com/preview" }),
    row(1, "Online deposit for bookings", "needs_information", 30, { kind: "feature", scope: "larger_feature" }),
  ];
}

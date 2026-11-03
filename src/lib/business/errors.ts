// Database error codes raised by the business functions, in plain English.
const MESSAGES: Record<string, string> = {
  not_member: "You don’t have access to that business.",
  not_authenticated: "Please sign in again.",
  plan_required: "That needs an active plan. Choose a plan in Billing.",
  version_conflict: "This was changed somewhere else. Reload to see the latest version.",
  transition_not_allowed: "That step isn’t available for this request right now.",
  preview_required: "Add a preview link before marking it ready to review.",
  completion_evidence_required: "Add what was done (a note or link) before completing.",
  note_required: "Please add a short note.",
  internal_notes_are_staff_only: "Internal notes are for the AnyVendor team.",
  empty_message: "Write a message first.",
  staff_only: "Only the AnyVendor team can do that.",
  invalid_path: "That file couldn’t be attached.",
  unsupported_type: "Attach images (JPG, PNG, WebP, GIF) or PDFs only.",
  schedule_in_future: "Pick a time at least a few minutes from now.",
  choose_an_account: "Choose at least one account to post to.",
  connection_needs_reconnect: "One of those accounts needs reconnecting first.",
  connection_not_found: "That account isn’t connected to this business.",
  post_locked: "This post is already publishing or published.",
  too_many_businesses: "You can own up to five businesses in this preview.",
  invalid_content: "That content couldn’t be saved.",
  revision_not_found: "That version no longer exists.",
  owner_only: "Only the business owner can change the plan or billing.",
  billing_not_configured: "Billing isn’t connected in this preview yet. No one can be charged.",
  already_subscribed: "You already have a plan. Change it in Manage billing.",
  no_billing_yet: "There’s no billing account yet. Choose a plan first.",
  checkout_failed: "Stripe couldn’t start checkout. Please try again.",
  connect_not_configured: "That connection isn’t set up in this preview yet.",
  connect_failed: "The connection didn’t complete. Please try again.",
  media_too_large: "Photos must be under 8 MB and videos under 100 MB.",
  validation: "Some accounts can’t take this post as it is.",
  site_not_available: "Choose one of your verified Search Console properties.",
  refresh_too_soon: "Search data was refreshed in the last hour. Google updates it daily.",
  seo_no_site: "Choose which Search Console property to report on.",
  seo_reconnect: "Search Console needs reconnecting.",
  seo_error: "Google didn’t return data just now. Try again later.",
  manifest_missing: "This site’s sections aren’t set up yet. Ask the AnyVendor team.",
};

export function friendlyError(raw: string | null | undefined): string | null {
  if (!raw) return null;
  for (const [code, text] of Object.entries(MESSAGES)) if (raw.includes(code)) return text;
  if (/duplicate key.*slug/i.test(raw)) return "That web address is taken. Try another.";
  if (/check constraint.*title/i.test(raw)) return "Give the request a short title (3–140 characters).";
  return "Something went wrong. Please try again.";
}

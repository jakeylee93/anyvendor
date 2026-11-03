// Which backend pieces are configured. Names only are ever logged or shown.

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function backendReady() {
  return supabaseConfig() !== null;
}

/** Public base URL for OAuth redirects and Stripe return URLs. Must be an exact, registered URL. */
export function appUrl(fallbackOrigin?: string) {
  return (process.env.APP_URL ?? fallbackOrigin ?? "").replace(/\/$/, "");
}

export const SETUP_ITEMS: { name: string; env: string[]; purpose: string }[] = [
  { name: "AnyVendor Supabase project", env: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"], purpose: "Accounts, businesses, requests, storage" },
  { name: "Stripe (test mode)", env: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"], purpose: "The five plans (£25 to £350 a month, inclusive of VAT) and the billing portal; prices are found by lookup key" },
  { name: "Security keys", env: ["TOKEN_ENCRYPTION_KEY", "OAUTH_STATE_SECRET", "CRON_SECRET", "APP_URL"], purpose: "Encrypting provider tokens, signing OAuth state, protecting the scheduler" },
  { name: "LinkedIn app", env: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"], purpose: "Businesses connect their own LinkedIn" },
  { name: "Instagram app", env: ["INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET"], purpose: "Businesses connect their own Instagram professional account" },
  { name: "Google OAuth client", env: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"], purpose: "Businesses connect their own Search Console" },
  { name: "Bespoke site revalidation", env: ["SITE_REVALIDATE_SECRET"], purpose: "Tells a vendor's bespoke site that a new revision is live (optional; sites can poll instead)" },
];

export function missingEnv(names: string[]) {
  return names.filter((n) => !process.env[n] && !(n === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
}

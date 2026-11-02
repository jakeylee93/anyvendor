# AnyVendor business backend — owner setup checklist

Everything below is configuration only. The code is built and tested; nothing here charges anyone or posts anything. Do the steps on the **Preview** environment first. Put values only in Vercel (Project anyvendor → Settings → Environment Variables), never in chat or commits. Variable names are listed in `.env.example`.

## 0. Stable preview address (needed by OAuth and Stripe)
- Assign a fixed alias to the review deployment (Vercel → Deployments → the preview → Assign domain, e.g. `anyvendor-review.vercel.app`) and set `APP_URL` to it (no trailing slash).
- Vercel → Settings → Deployment Protection → **Protection Bypass for Automation** → generate a secret. Stripe will call the webhook with `?x-vercel-protection-bypass=<secret>` because the preview is protected.

## 1. Database (needs Jake's spend approval: one more project in the Pro org)
1. Create Supabase project `anyvendor` (region London, eu-west-2) in "jakeylee93's Org". Do not reuse `anyos-platform`.
2. Apply, in order: `supabase/migrations/20261102120000_business_core.sql`, `…120100_storage.sql`, `…120200_connection_details.sql` (SQL editor or `supabase db push` linked to the new project only).
3. Auth → Providers → Email: enable magic links. Auth → URL configuration: Site URL = `APP_URL`; Redirect URL = `APP_URL/auth/callback`.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Preview).
5. After the first AnyVendor team member signs in once, make them staff (SQL editor): `insert into public.staff_members (user_id, note) values ('<their auth user id>', 'AnyVendor team');`

## 2. Security keys (Preview)
- `TOKEN_ENCRYPTION_KEY` = output of `openssl rand -base64 32`
- `OAUTH_STATE_SECRET` = output of `openssl rand -hex 32`
- `CRON_SECRET` = output of `openssl rand -hex 32`

## 3. Stripe (test mode, in the chosen existing account; coordinate with billing task 4056fc85)
1. Create three products with monthly GBP recurring prices: "AnyVendor Website" £50, "AnyVendor Website + SEO" £75, "AnyVendor Website + SEO + Social" £100. Add metadata `app=anyvendor`. VAT/tax behaviour, minimum terms and domain renewals are **not** decided in code; decide them in Stripe/terms before any live use.
2. Customer portal (test mode): allow payment-method updates, invoice history, cancellation, and switching between exactly these three prices.
3. Webhook endpoint (test mode): `APP_URL/api/stripe/webhook?x-vercel-protection-bypass=<bypass secret>` with events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`, `invoice.payment_action_required`.
4. Set `STRIPE_SECRET_KEY` (a `sk_test_` key), `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_WEBSITE`, `STRIPE_PRICE_SEO`, `STRIPE_PRICE_SOCIAL`.

## 4. LinkedIn (member posting; no review needed)
- developers.linkedin.com → Create app (owned by the AnyVendor company page). Products: "Sign In with LinkedIn using OpenID Connect" and "Share on LinkedIn".
- Authorised redirect URL: `APP_URL/api/connect/linkedin/callback`. Set `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.
- Tokens last 60 days with no refresh; the dashboard prompts businesses to reconnect. Posting to company pages needs a separate Community Management API app and LinkedIn vetting (not in this preview).

## 5. Instagram (needs Meta review before real customers)
- developers.facebook.com → Create app (Business) → add "Instagram API with Instagram Login". Redirect: `APP_URL/api/connect/instagram/callback`. Permissions: `instagram_business_basic`, `instagram_business_content_publish`. Set `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`.
- For testing, add the owner's own Instagram professional account as an Instagram tester. For real customers: App Review (Advanced Access) with a screencast, plus Meta Business Verification.

## 6. Google Search Console
- Google Cloud project → OAuth consent screen (External, "AnyVendor") with scope `https://www.googleapis.com/auth/webmasters.readonly` → OAuth client (Web) with redirect `APP_URL/api/connect/google_search_console/callback`. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Check on the Data Access page whether Google requires verification for this scope.

## 7. Scheduler
- `vercel.json` registers `/api/cron/social` (every minute) and `/api/cron/seo` (daily 06:30 UTC). **Vercel runs crons only on production deployments**, so previews never post on a schedule. Production release is a separate, explicit decision with its own release claim.

## 8. Test plan once configured (no real charges or posts)
1. Sign in by magic link → set up a business → plan prompt shows.
2. Checkout £50 with Stripe test card `4242 4242 4242 4242` → returns to "waiting for Stripe" → webhook makes the plan active (refresh). Check `stripe_events` shows `processed`.
3. Billing portal → switch to £100 → Social and SEO tabs appear. Use a declining test card to see the past-due banner; cancel → modules switch off, history stays.
4. Requests: submit with an attachment → staff queue shows it with the due time → staff: In progress → Needs information (customer answers) → Ready to review with preview link → customer approves → Completed with evidence.
5. Website: edit, save, publish, view `/site/<slug>`, restore an older version.
6. Connect the owner's own LinkedIn/Instagram/Search Console. Only schedule a post if you intend it to go out from a production deployment.

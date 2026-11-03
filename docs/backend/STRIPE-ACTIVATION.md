# Stripe for AnyVendor (The Bar People Limited account)

Evidence time: 3 Nov 2026, 19:50 UTC. Seller of record: The Bar People Limited. Prices: £50 / £75 / £100 a month, inclusive of VAT.

## What is built and tested (code, not live)

| Piece | Where | Test |
| --- | --- | --- |
| Checkout (owner only, customer mapped first, idempotency key per business+plan) | `src/app/business/billing-actions.ts` | unit |
| Customer portal | same | unit |
| Webhook: signature check, event ledger (`claim_stripe_event` / `finish_stripe_event`), fresh subscription re-read, metadata never trusted | `src/app/api/stripe/webhook/route.ts`, `src/lib/business/stripe-logic.ts` | `tests/unit/webhook.test.ts`, `tests/db/billing.test.ts` |
| Subscription lifecycle → plan access (`active`, `trialing`, `past_due` grant; others revoke), stale-event guard | `upsert_subscription`, `active_plan` | `tests/db/billing.test.ts` |
| Tenant scoping: a business only sees its own subscription; billing rows are service-role only | RLS in `business_core` | `tests/db/isolation.test.ts` |
| Prices by lookup key `anyvendor_website_monthly` / `anyvendor_seo_monthly` / `anyvendor_social_monthly`, tax behaviour inclusive, 20% GB VAT rate tagged `app=anyvendor` | `src/app/staff/billing/actions.ts` ("Create AnyVendor test prices", test mode only) | manual |
| Internal test plans are a separate table and are labelled in the UI; they never create or imitate a subscription | `internal_entitlements` | `tests/db/tenancy.test.ts` |

## What is configured today

Nothing in Vercel: the AnyVendor project has no `STRIPE_*` variables in any environment (checked with `vercel env ls` at the evidence time). No Stripe CLI on the Mac. No prices or webhook endpoints have been created in the Bar People account by this session.

## Test-mode activation (no charges)

1. In the Bar People Stripe dashboard, switch to **Test mode** and create a restricted or standard **test** secret key. Add it to the AnyVendor Vercel project as `STRIPE_SECRET_KEY` (Preview environment only, scoped to branch `claude/bookedevents-reconstruction` if you like).
2. Redeploy the preview, sign in as staff, open `/staff/billing` and press **Create AnyVendor test prices**. It creates the three products/prices with the lookup keys above and the inclusive VAT rate; it refuses to run with a live key.
3. Webhook endpoint. The preview is protected, so Stripe cannot reach it without a bypass. Use one of:
   - a dedicated **unprotected** AnyVendor deployment target for the webhook path (preferred when AnyVendor gets its own host), or
   - the Vercel "Protection Bypass for Automation" secret as a query parameter on the endpoint URL (`?x-vercel-protection-bypass=…`), accepted only for test mode and rotated before go-live.
   Endpoint: `/api/stripe/webhook`. Events: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`. Put the signing secret in Vercel as `STRIPE_WEBHOOK_SECRET`.
4. Also required for the webhook to write: `SUPABASE_SERVICE_ROLE_KEY` in the Preview environment (server only; never in a `NEXT_PUBLIC_` name).
5. Test flow: choose a plan on `/business/account` with card `4242 4242 4242 4242` → `checkout.session.completed` → subscription row appears → modules unlock → cancel in the portal → access ends at period end. Expected evidence: rows in `stripe_events` with `finished_at`, one `subscriptions` row per business, and no change for a second business.

## Live activation checklist (do not start without Jake's go-ahead)

- [ ] Live secret key in Production env only (`STRIPE_SECRET_KEY`), never in Preview.
- [ ] Live prices created with the same lookup keys (run the same button in live mode once it is allowed, or create them by hand with tax behaviour **inclusive**).
- [ ] Live webhook endpoint on the production host with its own `STRIPE_WEBHOOK_SECRET`.
- [ ] Customer portal configuration saved in live mode (cancel, update card, invoice history; no plan switching outside the three prices).
- [ ] Statement descriptor and receipt emails say The Bar People Limited; invoices show VAT inclusive pricing and the VAT number.
- [ ] One real £50 checkout by Jake, refunded, with the webhook ledger and subscription row inspected.
- [ ] `/staff/billing` shows the live mode notice and the test-price button is disabled.
- [ ] Production env has `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`, `CRON_SECRET`, `APP_URL`.

Missing key names at the evidence time: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`, `CRON_SECRET`, `APP_URL`, `SITE_REVALIDATE_SECRET`.

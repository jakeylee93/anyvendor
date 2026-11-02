# AnyVendor business backend — readiness checkpoint (2 Nov 2026)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b`, worktree `anyvendor-profiles` (claim `6bf2c244`), branch `claude/bookedevents-reconstruction` at `3adc5f0`. Mission Control task `939e7ccb` (linked billing task `4056fc85`).

## Provisioning reconciliation
- One Supabase `create_project` call (name `anyvendor`, eu-west-2, org `bnlmfbjrortqbxzdnbee`, plan Pro) was made to obtain a cost quote and was stopped while running. A read-only `list_projects` afterwards shows the same five projects as before (jakeylee93's Project, mistigo, anyos-platform, coach-atlas, age-of-tongues). **No project was created, no ID exists, no cost quote was returned.** No further provisioning until agreed.

## What exists today
| Item | State |
|---|---|
| Vercel project `anyos/anyvendor` | Protected previews work. **0 environment variables.** |
| Supabase for AnyVendor | **None.** `anyos-platform` exists and must not be used. Repo already depends on `@supabase/ssr` and `@supabase/supabase-js`. |
| Stripe | No AnyVendor keys, prices, webhook or portal configured anywhere visible. No Stripe CLI (not a blocker: SDK + signed-payload tests). |
| Google Search Console | No AnyVendor OAuth client. anyOS's client is hard-wired to the anyOS domain; not reused. |
| Instagram / LinkedIn | No AnyVendor developer apps. anyOS apps and its Buffer key are anyOS's; not reused. |
| Mac | Memory pressure WARNING, ~31 GiB free: no local `next build` or extra browser workers; cloud builds only, light `node --test`. |

## Decisions needing Jake/Codex
1. **Database hosting.** Recommended: a dedicated Supabase project `anyvendor` (London) in the existing Pro org. It adds a project's compute to the bill; Supabase's create flow shows the exact quote for confirmation, which I have not seen. Until agreed, code, migrations and isolation tests run against an in-process Postgres (PGlite) with Supabase's `auth.uid()` reproduced, so nothing waits.
2. **Stripe test account.** Which Stripe account is AnyVendor's (new account, or a test-mode product set inside an existing one)? Needed: test secret key, webhook signing secret, three recurring GBP prices, portal configuration.
3. **Scheduled jobs.** Vercel Cron per-minute needs the team on Pro; otherwise Supabase `pg_cron` calls the same signed endpoint. Either runs without this Mac.
4. **Webhooks to a protected preview.** Stripe must reach `/api/stripe/webhook`; that needs Vercel's Protection Bypass for Automation (owner setting) or an unprotected staging alias.

## Architecture (narrow reuse boundary)
- **Separate everything from anyOS:** own database, auth, storage, OAuth apps, Stripe account and webhooks. Reuse anyOS *patterns only* (read-only audit of origin/main `8fe664e`): signed-webhook + event ledger, claim-before-publish scheduler with stale recovery, optimistic-concurrency website saves with history, same-origin mutation guard, PKCE + encrypted refresh tokens. Not reused: single-role `profiles`, broad service-role routes, plain-text tokens, notes-as-storage.
- **Tenancy:** `businesses`, `memberships(user_id, business_id, role owner|editor)`, `staff_members` (explicit, never granted at signup). RLS on every table keyed on membership; service role only in webhook and cron routes.
- **Plans and entitlements (server-authoritative, fail-closed for paid modules):** £50 listing + website + hosting + unlimited update/feature requests; £75 adds SEO; £100 adds self-service social scheduler. Access derives only from webhook-written subscription rows; past_due keeps access with a payment banner while Stripe retries; unpaid/cancelled turns modules off but keeps history readable. No VAT, minimum term, domain renewal or fees invented: copy says "preview pricing, terms to be confirmed".
- **Website:** each business gets an AnyVendor-hosted site from structured content with draft → publish revisions, optimistic concurrency and restore. External sites (e.g. WordPress) get preview link + requests only.
- **Requests:** `submitted_at` and an immutable `due_at = submitted_at + 24h`; statuses Received / In progress / Needs information / Ready to review / Completed; customer-visible thread, private attachments, preview link; staff queue ordered by due time with overdue flag; Completed needs staff evidence (note + link). "Larger feature / external dependency" is an explicit staff flag that pauses nothing silently and is shown to the customer. No quota, no auto-completion.
- **Social:** provider adapter interface; Instagram (Instagram API with Instagram Login, business/creator accounts, two-step container publish) and LinkedIn (Posts API; member posting via Share on LinkedIn, organisation pages need Community Management API approval) first. Durable jobs per channel with idempotency key, claim/stale recovery, max 3 retries for retryable errors only, publish blocked if plan, ownership or connection is invalid. Tokens encrypted at rest. No posts published and no permissions granted in QA.
- **SEO:** Search Console OAuth (`webmasters.readonly`), encrypted refresh token, card states: not on plan / not connected / connected but no data yet / real data.

## Next milestones (proceeding now, no provisioning)
1. Schema + RLS migrations, entitlement and request-state logic, isolation tests on PGlite.
2. Auth, dashboard shell (phone first), request thread and staff queue, demo mode clearly labelled.
3. Stripe Checkout, portal and verified idempotent webhook with signed-payload tests.
4. Website editor with revisions; scheduler and provider adapters; Search Console connector.

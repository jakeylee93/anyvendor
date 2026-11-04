# Sign-in activation for The Bar People (4 Nov 2026)

Goal: jake@thebarpeople.co.uk signs in and lands in The Bar People workspace. No duplicates, no email-domain or name matching: the verified auth email must equal the trusted owner email held for the listing.

## What is implemented (source, commit `5abea4a`)
- `supabase/migrations/20261103090000_owner_claims.sql`: `pending_access` (trusted owner emails, no API access), `apply_pending_access(uid)` (grants only when `auth.users.email_confirmed_at` is set; exact lower/trimmed match), trigger on `auth.users` insert/verify, `claim_requests` + `request_listing_access()` (safe path, grants nothing). Tests: `tests/db/owner-claims.test.ts` (existing user, newly verified, unverified, near-miss emails, same email on two listings, cross-tenant denial, request path).
- `docs/backend/provision-bar-people-20261104.sql`: The Bar People business, its external site, the trusted email, and the immediate grant to the existing verified user `f91e23fc-3aa3-4fcb-a3cc-e2b1f59d14f1`. Idempotent; refuses if that verified user is missing. Dry-run passed twice in the emulator.
- Sign-in page: email → Supabase sends the magic email; the page then offers **code entry** (`verifyOtp` type `email`) so a link opened in another browser or device is not a dead end. Callback unchanged (`/auth/callback?code=…`).
- No-match path: `/business/new` explains the owner-email match and lets the signed-in user request access to a listing for staff review, or set up a new business.

## What is NOT done and why
1. **Live database:** `owner_claims` is not applied (the MCP migration call was denied by the session permission classifier after two earlier prompts expired). Apply, in order, as the project owner:
   1. `supabase/migrations/20261103090000_owner_claims.sql`
   2. `docs/backend/provision-bar-people-20261104.sql` (prints the Bar People row and Jake's membership at the end)
   Either via the Supabase dashboard SQL editor on project `rsqgsnfyusqhtgcwbddc`, or by allowing `mcp__claude_ai_Supabase__apply_migration` for this session so I can run it with the normal confirmation.
2. **Supabase Auth settings (dashboard → Authentication):** cannot be read or set from this session.
   - URL configuration: Site URL `https://anyvendor-git-claude-bookedevents-reconstruction-anyos.vercel.app`; Redirect URL `https://anyvendor-git-claude-bookedevents-reconstruction-anyos.vercel.app/auth/callback` (exact, no wildcard).
   - Email template "Magic Link": include the code, e.g. add a line `Your code: {{ .Token }}` next to `{{ .ConfirmationURL }}`, so the code-entry fallback works on any device.
   - Built-in SMTP only delivers to Supabase project team members. jake@thebarpeople.co.uk received emails on 2 Nov (two signup flows, email confirmed 20:59), so delivery to him works.
3. **Vercel protection:** the preview is behind Vercel Authentication. Phone-usable link with a 23-hour bypass cookie (expires 5 Nov 14:46 UTC): see the chat message; regenerate with the Vercel share-link tool when it expires.

## The sign-in test, once 1 and 2 are done
1. Open the share link on the phone, go to **Sign in or get started**, enter jake@thebarpeople.co.uk.
2. Either open the link in the same browser, or type the code from the email.
3. Expected: `/business` opens **The Bar People** (owner), not "Set up your business". The `memberships` row for Jake proves the match; `auth.users.last_sign_in_at` proves the session.
4. If "Set up your business" appears: the provisioning script was not run, or the signed-in email differs from the trusted one. Nothing is created automatically in that case.

## Held, unchanged
`20261103100000_tenancy_hardening.sql` (staff switching, audit, internal plans, bespoke manifests), `20261103200000_five_tiers.sql`, and provisioning for Floriography / Mr Tee's (no owner emails known). None are prerequisites for this login.

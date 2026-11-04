# Anyvendor — handoff

## Milestone 9: AnyVendor database live, new dock, VAT-inclusive Bar People billing (2 Nov 2026, evening)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session). Worktree `anyvendor-profiles` (claim `6bf2c244`), branch `claude/bookedevents-reconstruction` at `9420358` + fix commit + this handoff. Protected preview **https://anyvendor-6cu6o5flp-anyos.vercel.app** (Ready). Release claim `396ebc2a` released after this receipt.

Supabase (Jake approved ~$10/month): project `anyvendor` **`rsqgsnfyusqhtgcwbddc`**, London (eu-west-2), created once (a stalled create call was reconciled by read-only listing; the hidden blocker was a local Supabase MCP Accept/Decline prompt not shown on the phone, accepted by Codex, not a crash). Applied migrations: `business_core`, `storage`, `connection_details`, `profile_brand_dashboard` (= repo files 20261102120000, 120100, 120200, 190000+190100). Security advisor: remaining notices are intentional (service-role-only tables without policies; SECURITY DEFINER write functions that check membership; public_site for anon); search_path pinned on three helpers. Vercel Preview env set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `/business` now requires sign-in; `/business/demo` opens the labelled demo.

Jake's brief built:
- Dock: Home, My profile, Website, Marketing, Brand (settings icon for plan/billing/sign-out). `/business/social` redirects to `/business/marketing`.
- Home: editable widgets with an edit pen (show/hide, reorder, reset; saved per person per business): ticker of real stats, website preview, weekly marketing points (5 per post planned this week, 10 per provider-confirmed post, 20 bonus at 3 posts, streak, level), requests, upcoming posts, weather (Open-Meteo; commercial use needs their paid key via `OPEN_METEO_API_KEY`), tips and news (staff-written `insights`, empty until published), profile completeness, brand colours.
- Website: real site embedded in the framed box, Edit website (editor at `/business/website/edit`), SEO widget, requests widget and latest requests.
- My profile: directory profile editor, prefilled from the existing listing when linked; reviewed before it replaces the public listing (public directory still reads the curated profiles).
- Marketing: social scheduler plus this week's points.
- Brand: logos and documents (private bucket, signed download links), colours, fonts, company details with official Companies House links.
- Billing: prices shown "inc. VAT"; AnyVendor = trading name of The Bar People Limited (footer, plans); Stripe prices found by lookup keys `anyvendor_{website,seo,social}_monthly` (VAT-inclusive, GBP, monthly) in the Bar People account; checkout applies an inclusive 20% VAT tax rate; `/staff/billing` (staff only) shows readiness and creates the prices and VAT rate in TEST mode only.

Tests: `npm test` **74 passing**; tsc and eslint clean; cloud builds Ready. `vercel curl`: `/business` → 307 to sign-in, sign-in enabled, demo switch sets its cookie. Browser pass (390 px and 1280 px; memory pressure normal at the first run, turned to warning at the second short run): all five pages no horizontal overflow, 0 console errors after fixing the Home grid overflow and the demo site 404. Screenshots `docs/screenshots/dock-20261102/`.

Still needed from owner (no secrets in chat):
1. Supabase dashboard → Auth → URL configuration: Site URL = the preview URL; Redirect URLs add `https://anyvendor-*-anyos.vercel.app/**`. Without this the sign-in email link falls back to the Site URL.
2. Supabase → Project settings → API keys: copy the secret (service role) key into Vercel Preview as `SUPABASE_SERVICE_ROLE_KEY` (needed for Stripe webhooks, OAuth connections, scheduler, SEO refresh, billing customers).
3. Stripe (The Bar People account, test mode): put the test secret key in Vercel Preview as `STRIPE_SECRET_KEY`; open `/staff/billing` and press "Create AnyVendor test prices"; add the webhook endpoint (see SETUP-CHECKLIST, needs Vercel Protection Bypass) and set `STRIPE_WEBHOOK_SECRET`.
4. After Jake signs in once: `insert into public.staff_members (user_id, note) values ('<his auth user id>', 'AnyVendor team');` to open the staff queue and billing setup.
5. Security keys, `APP_URL`, LinkedIn/Meta/Google apps as before; insights articles from Jake's writers (insert into `public.insights` with `published_at`).

---

## Milestone 8: business backend review build (2 Nov 2026)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session, now Opus 5.5 at Jake's request). Worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (claim `6bf2c244`), branch `claude/bookedevents-reconstruction`: `b1e6c5e` (schema/RLS/tests), `45ee83b` (auth, dashboard, requests, staff, Stripe), `5b12e6f` (website, social, SEO), `82140a1` (phone fixes, checklist), plus this handoff. Protected preview **https://anyvendor-cud5s052f-anyos.vercel.app** (Ready). Release claim `9479a1bf` released after this receipt. Coordinator Codex `01a18dda`, Mission Control task `939e7ccb` (linked billing task `4056fc85`). `main`, production, domains, DNS, payments, anyOS and its database untouched. No Supabase project was created (one create call was stopped mid-run; a read-only listing afterwards showed the same five projects), no Stripe objects, no OAuth apps, no posts, no charges, no invitations.

Product (from Codex's brief): AnyVendor is the events-industry website/online-presence product. Plans £50 (listing, website, hosting, unlimited update and feature requests aimed at 24 hours), £75 (+SEO), £100 (+self-service social scheduler). Prices are preview copy; no VAT, term, domain-renewal or fee rules are invented.

Built:
- **Schema** `supabase/migrations/20261102120000_business_core.sql`, `…120100_storage.sql` (Supabase storage only), `…120200_connection_details.sql`: businesses, memberships (owner/editor), explicit staff, Stripe customers/subscriptions/event ledger, website draft/publish/restore revisions, update requests (immutable `due_at = submitted_at + 24h`, validated status moves, completion evidence, scope flags, customer-visible thread, internal staff notes, attachments), provider connections with service-role-only encrypted tokens, social posts/targets (claim once, bounded retries, unknown outcomes never re-posted), SEO snapshots. RLS read-only for members/staff; every write is a SECURITY DEFINER function re-checking membership, staff and plan.
- **App** (`/business`, phone-first, navy/white/cyan, AV mark): magic-link sign-in, business setup, dashboard (website card with Edit website / Request an update, requests incl. overdue, SEO and social cards only on the plan with honest empty states, listing and enquiries), request thread (approve / ask for changes / reopen / reply with attachments), website editor (save, publish, history, restore, image uploads, draft preview), hosted site `/site/[slug]`, social (connect own Instagram/LinkedIn, composer with per-account previews and checks, time-zone-aware scheduling, agenda, drafts, edit/cancel, explicit outcomes, reconnect prompts), SEO (Search Console connect, property choice, refresh, 28-day snapshot), account (plans, Stripe checkout and portal, owner-only). `/staff` due-ordered queue with overdue highlighting and per-request controls. Labelled demo whenever the database isn't configured (no numbers, no fake publishing).
- **Stripe**: SDK 23.1 (API `2026-10-28.endive`), owner-only checkout with customer mapped to the business first, one subscription per business, portal, signed webhook `/api/stripe/webhook` with ledger claim/finish, test/live mode check, fresh subscription re-read, metadata never trusted, past_due keeps access with a banner, unpaid/cancelled turn modules off but keep history.
- **Scheduler**: `/api/cron/social` (every minute) and `/api/cron/seo` (daily) in `vercel.json`, `CRON_SECRET` bearer auth, bounded to ~4 min. Vercel runs crons on production deployments only, so previews never post.
- Reuse boundary: patterns only from anyOS origin/main `8fe664e` (read-only audit); nothing shared. Provider facts: `docs/backend/PROVIDERS-20261102.md`. Readiness: `docs/backend/READINESS-20261102.md`. Owner steps: `docs/backend/SETUP-CHECKLIST.md`. Env names: `.env.example`.

Tests actually run: `npm test` → **63 passing** (node --test; PGlite runs the real migrations): isolation (other business ids refused, anon denied, staff explicit, tokens/ledger unreadable), entitlements per plan and Stripe status, ledger idempotency, event ordering, request 24-hour clock/immutability/transitions/evidence/internal notes/scope/attachments, website versions/publish gating/public site, scheduler claim-once/retry/stale/plan lapse/cancel/disconnect, Search Console site choice; unit tests for Stripe signatures (genuine, tampered, wrong secret, stale), webhook decisions, token sealing, OAuth state, time zones, provider adapters with fake fetch (LinkedIn headers/escaping/no ambiguous retry; Instagram single publish/known-published container), site content validation, SEO parsing. `tsc --noEmit` clean; eslint clean on new code. Cloud build Ready. `vercel curl`: all business pages 200 in demo, webhook 503 (not configured), cron 401 without secret, connect redirects back in demo. One short Playwright pass at 390 px and 1280 px (memory pressure normal at the time): no horizontal overflow, 0 console errors; found and fixed the phone tab bar being trapped by the header blur. Screenshots `docs/screenshots/business-20261102/`.

Not done / needs owner input (exact steps in SETUP-CHECKLIST):
1. Spend approval for a dedicated Supabase project, then apply the three migrations and add the first staff row.
2. Stripe test-mode products/prices, portal, webhook endpoint (needs Vercel Protection Bypass for Automation), env vars; coordinate with billing task `4056fc85`.
3. Stable `APP_URL` alias; security keys.
4. LinkedIn app (member posting works without review; 60-day tokens, no refresh), Meta app (Instagram needs App Review + Business Verification for real customers), Google OAuth client (check scope verification).
5. Policy decisions left open: whether hosting stops when a plan lapses (code currently serves the hosted site only while the plan is active), VAT/terms, enquiry inbox (not built), team invitations (not built), engagement analytics (not available from these APIs without extra permissions), LinkedIn company pages (needs Community Management API).

---

## Milestone 7: brand mark chosen, drawn as a vector, animated and applied (1 Nov 2026, evening)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session). Worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (claim `6bf2c244`). Branch `claude/bookedevents-reconstruction`: `31382df` (brand) plus this handoff. Protected preview **https://anyvendor-2kxcxlbsj-anyos.vercel.app** (Ready). Release claim `1a0e4b16` released after this receipt. `main`, production, domains, payments, enquiries untouched.

Logo exploration (OpenArt, GPT Image 2.5, project "Anyvendor concepts"): twelve sheets in `docs/brand-20261101/` (rounds 1–12, plus the touchpoint sheet). Jake's path: round-1 pill wordmark + gradient zigzag → distinct A/V → flat two-tone → tile → round-12 option 13: a heavy white A (with crossbar) and V sharing a stroke, cut from a navy rounded-square tile, with "anyvendor" in navy inside a cyan pill. Rounds 1–12 cost about 550 credits in total (balance 1,963 → 1,371 across the day, all accounted for by this session's generations).

Built from the pick:
- `src/components/site/BrandMark.tsx`: the mark as five polygons in a 96 × 64 box (A left leg, A right leg, crossbar, V left stroke overlapping the A's right leg, V right stroke); `AvTile` (navy tile, white mark) and `BrandLockup` (tile + cyan pill, stacked or row). The same points generate `public/brand/anyvendor-tile.svg`, `anyvendor-mark-navy.svg`, `anyvendor-mark-white.svg`, and the regenerated app icons in `public/icons/` (192, 512, maskable with the mark inside the safe zone, Apple touch full-bleed).
- Animation: CSS build-in on `.brand-anim` (tile pops with a small overshoot, A slides in from the left, V from the right, pill scales open, word rises), about 1.5 s, disabled under reduced motion. Plays once on the home hero; `/brand` has a replay button.
- Applied: header and footer logo (row lockup), home hero (stacked, animated), manifest and Apple icons. Tab bar icons unchanged.
- Exports: `public/brand/anyvendor-animation.mp4` (1080 × 1080, 3 s, 68 KB) and `.gif` (540 px, 99 KB), rendered from the vector by stepping the CSS animations frame by frame in Playwright (a standalone copy of the lockup served from localhost, because the CLI blocks file: URLs) and encoding with ffmpeg. Sent to Jake.
- Not done: a lockup SVG with the word outlined as paths (the pill uses the Lexend Deca webfont); a cap/tee mock-up with the final mark; gradient or two-tone colourways were explored but the chosen mark is flat navy/white/cyan.

Verification: tsc clean, eslint clean on the new files; cloud build Ready; `vercel curl`: `/` carries the animated lockup, `/brand` 200 with showcase and downloads, `/directory` header lockup present, tile SVG, MP4, GIF, icons and manifest all 200. Playwright screenshots of the header, hero and `/brand` in `docs/screenshots/brand-20261101/`.

---

## Milestone 6: swipe-to-shortlist, tailored enquiries, phone tab bar, single-column cards, brand sheets (1 Nov 2026, afternoon)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session). Worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (claim `6bf2c244`). Branch `claude/bookedevents-reconstruction`, one feature commit plus this handoff. Final protected preview **https://anyvendor-9e2sqssc7-anyos.vercel.app** (Ready); QA screenshots were taken on the first build of the same change (`flz1smnwu`) and the three layout fixes were verified on the final build by markup checks. Release claim `def5f817` released after this receipt. `main`, production, domains, payments, enquiries untouched. Nothing is sent from the site: every enquiry still leaves via the visitor's own email app or clipboard.

Jake's afternoon direction and what was built:
- Phone cards back to a single column everywhere (home, directory, plan, list-my-business); card type sizes restored to the full treatment on phones.
- `/swipe`: Tinder-style deck (`src/components/site/SwipeDeck.tsx`, `src/app/swipe/page.tsx`). Drag or swipe right saves to the plan, left skips; buttons and arrow keys do the same; Backspace undoes; live region announces each decision; reduced motion drops the fling. Only high-resolution own reels autoplay on the deck. Skips persist on the device, so coming back shows the undecided ones; when the deck is empty there is "Go through the N I skipped again". The deck follows the plan (`?needs=…&location=…&event=…`, interleaving the best pick per need) or shows everyone. Entry points: home ("swipe through vendors"), plan page ("Swipe through these"), phone tab bar.
- Phone tab bar (`BottomNav.tsx`): Plan, Swipe, Directory, My plan with a count badge; hidden from `lg` up and in print. The floating desktop plan bar now stays off `/swipe` and `/plan/my`.
- Tailored enquiries (`src/lib/enquiry.ts`, `EnquiryComposer.tsx` on `/plan/my`, `ProfileEnquiry.tsx` in every profile's Enquire section). One brief (name, the party in their words, place, date, guests) produces a message per vendor: their name, a line for what they do (by category), a cover check when they are based outside the visitor's county and do not travel UK-wide ("I can see you're based in Barnston; is London somewhere you cover?"), availability/size/price questions, sign-off. Editable, with "Back to the suggested message". Email button only where a contact email is authorised (The Bar People); otherwise Copy plus their website. Deterministic template, no AI calls; a model-written version can replace `composeEnquiry` later without changing the UI.
- `ShortlistProvider` now also stores `skipped[]` and `brief {name, message}` under the same `anyvendor.plan.v1` key, and exposes `ready`.
- Brand: `docs/brand-20261101/logo-sheet-10-options.png` (1–5 one-line "anyvendor" wordmarks, 6–10 AV monograms) and `touchpoints-av-monogram.png` (app icon, cap, tee, tote, lanyard, van) from GPT Image 2.5 via OpenArt, 90 credits (1,963 → 1,873). Option 5 reads as "any^endor"; the rest are usable starting points. Awaiting Jake's pick; a real vector logo still has to be drawn.

Verification: tsc clean; eslint 0 errors (img warnings only); cloud builds Ready. Playwright (phone 390 and desktop 1440, isolated session): drag right saved GRAPE & Fig ("1 in my plan", tab badge 1), ArrowLeft skipped Harry De Cruz, both persisted in localStorage; `/plan/my` composer wrote "Hi GRAPE & Fig … We'd love a grazing table for our guests"; with a planned event (40th, London, 20 Dec 2026, 80 guests) the messages carried the details, the cover check and subjects like "Birthday party in London, 20 December – Mobile Bars"; profile enquiry form present with mailto for The Bar People; home cards 358px single column, no horizontal overflow; desktop tab bar hidden; 0 console errors. Screenshots in `docs/screenshots/swipe-20261101/`.

Not built (decisions still needed): sending from Anyvendor with replies in one inbox and accounts (Supabase/Resend proposal), Google/Tripadvisor ratings via official APIs, the new homepage/border picks, the logo pick.

---

## Milestone 5: mock-up options, short-request fixes, The Farmhouse at Home (1 Nov 2026)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session). Worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (claim `6bf2c244`). Branch `claude/bookedevents-reconstruction`: `a66e2d7` (fixes), `7a9c4c3` (mock-ups), `ae54834` (Farmhouse), plus this handoff commit. Final protected preview **https://anyvendor-oztt4uoay-anyos.vercel.app** (Ready). Release claim `4e5bed27` released after this receipt. `main`, production, domains, payments, enquiries untouched.

Jake's 1 Nov asks and status:
- Mock-ups first, a few options: six GPT Image 2.5 concepts in `docs/concepts-20261101/` (home A one-box+carousel, B conversation-over-photo, C video-carousel hero; four card borders; simple profile; phone screens with 2-column grid, sign-up sheet, add-to-home-screen). Sent to Jake; awaiting his pick. Recommended: B's conversation box on A's page, border 1 (hairline glow).
- Short requests ("I'm having a party and need music") now work: everyday-word synonyms in `src/lib/smartSearch.ts`, "party" counts as an event, and `/plan` starts from the basics instead of asking for more.
- Only the best videos on cards: cards autoplay a reel only when `reelQuality` is "high" (no TikTok-sourced clips); Lucy Jane, TM Event Hire, Ozzy&Stix and Meat Stop cards show their photo. Profile heroes unchanged.
- Coverage: derived `coverage {base, travels local|regional|nationwide|international, areas}` per profile; card line with plane/car/globe icon.
- 2-column card grid on phones everywhere; compact card sizing.
- Add to home screen: `InstallButton` (native prompt on Chrome/Android, iPhone how-to sheet, hidden when installed) in the phone menu and footer.
- The Farmhouse at Home added (slug `the-farmhouse-caterers`): research (identity high: Essex Provisions Ltd t/a The Farmhouse at Home, HQ Hoddesdon), fact-checked copy with published prices verbatim, extra content, nine own photos, card, photo reel (their only video is a jump-cut edit), raster logo (trace not faithful), Google reviews link rendered as "See reviews on Google" (no rating scraped). Directory now 18.
- Not built (need Jake's decision and a backend): Google/Tripadvisor ratings (official APIs only), per-profile enquiry forms (email/store), sign-up prompt and accounts, the new homepage/border/profile layouts (await pick).

Verification on the final preview: tsc clean; cloud builds Ready; `vercel curl`: short requests map correctly ("party… music" → music + Private Parties; "food and booze… london" → food + bar; "my sons 18th" → basics fallback), `/businesses/the-farmhouse-caterers` 200, directory 18 of 18, Farmhouse is Best match for food in Hertfordshire, media files 200. Playwright screenshots in `docs/screenshots/farmhouse-20261101/`.

Theydon Bois research (30 Oct) is in `docs/leads/theydon-bois-20261030.md`.

OpenArt: this session's six mock-ups cost about 270 credits, but the balance fell 4,648 → 1,963 between 29 Oct and 1 Nov, so roughly 2,400 credits were used elsewhere; flagged to Jake.

---

## Milestone 4: AI planner homepage, plan and shortlist, video cards, marquee galleries, app install (29 Oct 2026)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session, now on Fable 5.1). Worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (claim `6bf2c244`). Branch `claude/bookedevents-reconstruction`: `163a69f` (feature), `35a0742` (lint), `00f9d2e` (need mapping), `a4e242a` (headings/posters/seals), plus this handoff commit. Final protected preview **https://anyvendor-knb8ymw0k-anyos.vercel.app** (Ready). Release claim `7621a5f9` released after this receipt. `main`, production, domains, payments and enquiries untouched.

Jake's 29 Oct feedback and what was done:
- Homepage: wordmark, one line, one big AI planner box (describe the party; tick what you need; location, date, guests; rotating example text). No video slider, no play button, no "Now showing". Pillars, Market and newsletter removed; Featured vendors come straight after the hero, then a scrolling category-icon strip. Hero background is a soft animated foil as a placeholder until the header image is chosen.
- Suggest, don't mass-message: `/plan` shows two or three vendors per need with reasons and a Best match (deterministic scoring in `src/lib/plan.ts`; no AI calls, nothing sent anywhere), with "See more" into the directory. Free-text requests map to needs (e.g. "photographer" → Photo & video).
- Guest shortlist: heart on every card, floating "My plan" bar, `/plan/my` is the plan document (event details, each vendor with category, place, from-price, website link, email where authorised, print/save as PDF). Kept on the device (localStorage) until accounts exist. Sending one enquiry to everyone is explicitly "coming next".
- Cards: showreel plays inside the card while on screen (IntersectionObserver, preload none, poster under reduced motion); circular logo seal for everyone (wide wordmarks get a larger seal but still read small, see gaps); category pill with icon on a frosted navy chip; slow foil drift plus category-coloured glow.
- Profiles: two-row marquee gallery, opposite directions, same height, click for full image, click anywhere or Escape to close.
- Nav: Directory, People, Venues, How it works, plus List my business and Plan my event. People and Venues are honest "opening soon" pages. Single sticky nav; utility bar and onboarding strip removed.
- Installable: `public/manifest.webmanifest`, icons, Apple web-app meta, theme colour.
- Concepts: `docs/concepts-20261029/` (GPT Image 2.5 via OpenArt, project "Anyvendor concepts"): 01 homepage planner, 02 plan suggestions, 03 People, 04 Venues, 05 vendor dashboard with promotions, 06 mobile app. Concept images contain invented names and some star ratings; they are layout ideas, not content.

Verification on the final preview (`knb8ymw0k`): tsc clean; eslint 0 errors in new files (two effect-state warnings fixed); cloud build Ready; `vercel curl`: `/`, `/plan` (free-text and ticked), `/plan/my`, `/people`, `/venues`, `/directory`, profiles, manifest and icons all 200. Playwright (one short session, memory pressure WARNING, disk ~7.6 GiB): home has no play button or "Now showing" and no overflow at 1440/390 with the Find button on the first phone screen; 16 card videos present, 8 playing in view, 16 circular seals; typing a request and submitting produced sections for bar, music, food, photo & video; hearts added two vendors; `/plan/my` showed 2 rows with "Birthday Parties · London · 20 Dec · 80 guests"; gallery rows 2 at equal 256px height; modal opens, closes on image click and Escape; 0 console errors. Screenshots in `docs/screenshots/planner-20261029/`.

Gaps and decisions:
1. Header image: placeholder foil until Jake picks a direction (concept 01 shows one option).
2. Wide wordmarks (Grape & Fig, Natalie & Max, CJ Sax, Meat Stop, Magpie, Tony Poole) read small inside a circle; each needs a proper circular mark from the business or a designed roundel.
3. Video quality: cards look sharp at card size, but the hero-size issue remains; YouTube/Vimeo sources still need a permission rule or supplied originals.
4. Accounts, enquiries inbox, vendor dashboard, promotions (£5/day, £20/week category top), analytics and payments need a backend (Supabase auth + Postgres, Stripe) and Jake's approval; the plan/shortlist is designed to plug into it.
5. People and Venues need real listings with permission; nothing invented.

---

## Milestone 3: premium cards, best photos, homepage, smart search, pricing (27 Oct 2026, evening)

Owner: `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same session). Worktree: `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles`, claim `6bf2c244`. Branch: `claude/bookedevents-reconstruction`.

Commits:
- `6874609`: photos and collectible cards.
- `81d0169`: homepage hero, smart search and pricing.
- `86494bb`: deeper profile content.
- `3ee51ba`: hero overlay.
- The handoff commit that adds this section.

Preview (protected): https://anyvendor-m4njg45ce-anyos.vercel.app was superseded by **https://anyvendor-qabb52ijb-anyos.vercel.app** (Ready). Release claim `d1f99f13` was released. `main`, production, domains, DNS, payments, enquiries and outbound messages are all untouched.

Jake's requests and what was done:
- **Best photos for every existing supplier.**
  - Candidates were downloaded at original resolution from two places: each business's own uploads on the old Booked Events / The Event People WordPress (read-only), and each business's own website.
  - Each business's current old-site card photo was identified from the live old homepage.
  - Photos were hand-picked from contact sheets. Picks are in `content/photo-picks.json` and alt text in `content/photo-alt.json`. Output comes from `scripts/media/apply_photos.py`: `card.webp` (4:3, up to 1200×900) and galleries up to 2000 px.
  - Excluded:
    - T&L's old card, a Mercedes at a terminal. Research found the listing's T&L gallery files are OpenArt AI renders, and this card has the same AI-render look.
    - The old site's `openart-image_*` placeholder galleries.
    - Images that are really other businesses' (related-listing carousel), including paella shots on Grape & Fig's page and Meat Stop's burger on Magpie's page.
    - The unrelated "Mensah" MC photo on Calleo.
    - Toot Sweet photos with private customer names.
    - CJ Sax celebrity and venue-watermarked shots.
  - Lucy Jane Cakes has nothing above 500 px publicly. T&L's only genuine photo is 1200×600 from a 2016 archive.
- **Pokémon-style premium cards** (`src/components/site/BusinessCard.tsx`, `HoloCard.tsx`, `.holo-card` CSS).
  - Category-tinted holographic foil frame, logo seal over the photo (pill-shaped for wide wordmarks), type pill, name, Est. year, categories in the type colour, place, and a price strip.
  - Mouse pointer: tilt, glare and shimmer. Static for touch and reduced motion.
- **Fuller profile text.**
  - Four research agents wrote `content/profiles-extra/*.json`: highlights, how it works, good to know, FAQs and extra service detail. Every item has a source on the business's own pages.
  - The coordinator removed the Jamie Roche O2/"Ed Sheeran" fan-video claim, Natalie & Max prices that appear only on an unlisted page, Toot Sweet's 2020 prices, and a "rave reviews" claim.
  - Profiles are now about 850–1,500 words. Jamie Roche, Lucy Jane and Toot Sweet stay about 400–500 because little is public.
  - The Bar People's package prices are quoted from thebarpeople.co.uk pages last updated May 2024, so Jake should confirm them.
- **OpenAI concept screens.**
  - Seven GPT Image 2.5 Sunburst images via the OpenArt account, project "Anyvendor concepts", in `docs/concepts-20261027/`: homepage hero with smart search, collectible cards, search results with multi-vendor enquiry, profile, inbox, pricing, and mobile.
  - Medium quality at 2K. Actual spend 310 credits (5,423 → 5,113). High quality would have cost 170 credits per image.
  - These are concepts only. The AI invented some logos, businesses, ratings and locations, so they are not content.
- **Homepage** (`src/components/site/HomeHero.tsx`).
  - Follows concept 01. Vendors' own showreels play full-bleed and cross-fade vendor to vendor, with a vendor rail and prev/pause/next controls.
  - Only the active video loads. Reduced motion shows posters only.
  - The original three pillars sit below the hero.
- **Smart search** (`src/lib/smartSearch.ts`).
  - Takes a plain-English "What are you looking for?" query and works out services, places (counties and towns), event types, guests, date and time.
  - It is deterministic, with no AI calls or data sharing. It shows what it understood, and explicit filters still refine.
  - Verified: "DJ for a wedding in Essex" → Tony Poole, Ozzy&Stix, CJ Sax; "magician for corporate event London" → Harry De Cruz; "wedding photographer hertfordshire" → Natalie & Max.
- **Pricing tiers** (`/list-my-business`).
  - Listing at £10/month or £100/year. Website+ at £50/month: a designed website, unlimited updates, hosting and directory access.
  - The monthly/yearly toggle works. Buttons are disabled with an honest "sign-ups and payments not open" note.

Verification:
- `tsc` passes.
- eslint: the new files have 0 errors (only deliberate `<img>` warnings).
- Vercel cloud builds are Ready. No local build was run: memory pressure was at WARNING and disk free about 11.5 GiB.
- Authenticated `vercel curl` on the final preview: `/`, `/directory`, `/directory?ask=…`, `/list-my-business` and profiles return 200; the unknown profile returns 404.
- Smart-search outputs, pricing text and the profile FAQ / How it works / Good to know sections were checked on preview `7ql3tlsas`.
- Limited browser checks (one short isolated Playwright session per preview because of the memory warning; the stale `avq` session from earlier was closed):
  - Directory cards at 1440 and 390: no overflow; mouse tilt active.
  - Homepage hero at 1440 and 390: the right reel plays (16:9 and 9:16), Next switches vendor, no overflow.
  - Magpie FAQs/Good to know render; 0 console errors.
- Screenshots are in `docs/screenshots/cards-20261027/`.

Decisions and gaps for Jake:
1. **Video resolution:** many reels come from 540–818p sources. Higher-resolution footage exists on the businesses' YouTube, Vimeo and Instagram, but downloading a newer yt-dlp release and fetching Vimeo's player feed were both blocked by this session's permission classifier. Jake can add a permission rule, or supply original files (or ask the vendors).
2. **Messaging and multi-vendor enquiries** (concepts 03 and 05) need a backend and outbound messages to real businesses, plus Jake's approval. They are not built.
3. **Payments and subscriptions** (£10 / £100 / £50) are not built. They need a Stripe decision and approval.
4. **Lucy Jane Cakes:** needs higher-resolution photos (vendor originals, or a labelled AI upscale at about 40 credits).
5. **Permission:** each business's permission is still needed before going public. Toot Sweet's trading status is unconfirmed.

---

## Milestone 2 — full business profiles (27 Oct 2026)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b` (same Claude session; Opus 5.5). Requested directly by Jake: "build each profile for the businesses on the website", with genuine logos (SVG), live-profile content and a showreel hero of about six 2–3 s clips each, taken from each business's own website or social media. This builds on Lippy LFG 2's brief for The Bar People.

- **Branch** `claude/bookedevents-reconstruction`, now checked out in the claimed worktree `/Users/margaritabot/.openclaw/workspace/anyvendor-profiles` (work claim `6bf2c244-7f11-4a59-bf27-fe80e52d2d8d`; original checkout claim `18846802` retained). The original checkout `/Users/margaritabot/.openclaw/workspace/anyvendor` was detached at `3eb5cce` (clean) so the branch could live in the worktree.
- **Commits** `a249c54` (profiles, media, logos), `74b31a2` (.vercelignore), `52230f5` (layout/card/copy fixes after preview QA), `b3a7785` (hero scrim), plus this handoff commit.
- **Testing preview, protected** (Vercel login required): https://anyvendor-m4njg45ce-anyos.vercel.app — target preview, Ready. Production `anyvendor.vercel.app`, `main`, domains, DNS, WordPress, payments and enquiries are all untouched. Release claim `1f2ac5aa-5150-4611-9804-5dad47dee91e` was released after this receipt.

### What each profile has
- Showreel hero: six segments crossfaded (0.6 s) into a seamless loop, muted with audio stripped, at 16:9 1280×720 for desktop and 9:16 720×1280 for phones (chosen by orientation). Real still poster, Pause/Play button, pauses when off screen, reversible scroll parallax on phones and desktop. With reduced motion it stays on the poster unless Play is pressed. T&L has only one genuine photo, so its hero is that still photo.
- Logo shown on the hero and on directory cards. No business publishes a genuine SVG, so 16 logos are vector traces of each business's own logo file. Each was visually checked against the original on light and dark, and each is labelled "vector redrawn from the business's own logo file". Jamie Roche has no genuine logo (only a headshot), so none is shown and none was invented.
- Copy written only from adversarially verified research and then independently fact-checked. This covers the intro, about, services, event types, areas, and the business-stated founding year, base and published price, each with a source link. No reviews, ratings or invented prices. Where a business publishes no price, the profile says "Quote on request" and shows the 2025 Booked Events listing price as history. Contact details appear only for The Bar People (jake@ and the phone number, as authorised). Everyone else gets their website and social links, plus an honest note that Anyvendor enquiries are not connected.
- Gallery of the business's own photos as WebP with a keyboard lightbox. A "Profile sources and media credits" panel lists every source URL and every clip's timecodes.
- Directory: cards use the real poster and logo, the business-stated year and place, and the published price where one exists. The Type of Event filter now matches the event types each business states itself; for example, Weddings matches 12 of 17.

| Business | Identity | Logo | Reel | Reel sources | Photos |
|---|---|---|---|---|---|
| Calleo | high | svg-traced | 3 video + 3 photo | images.squarespace-cdn.com, video.squarespace-cdn.com | 9 |
| CJ SAX LIVE | high | svg-traced | 5 video + 1 photo | cjsax.com, videos.files.wordpress.com | 8 |
| GRAPE & Fig | high | svg-traced | 6 video + 0 photo | grapeandfig.com | 9 |
| Harry De Cruz | high | svg-traced | 2 video + 4 photo | images.squarespace-cdn.com, video.squarespace-cdn.com | 9 |
| Jamie Roche Folk Artist | medium | none | 0 video + 6 photo | bookedevents.co.uk, i.ytimg.com | 8 |
| Lucy Jane Cakes | high | svg-traced | 6 video + 0 photo | www.tiktok.com | 9 |
| Magpie Catering | high | svg-traced | 0 video + 6 photo | www.magpiecatering.com | 9 |
| Meat Stop | high | svg-traced | 2 video + 4 photo | images.squarespace-cdn.com, video.squarespace-cdn.com, www.tiktok.com | 9 |
| Natalie & Max Photo and Films | high | svg-traced | 6 video + 0 photo | www-static.natalieandmax.co.uk | 9 |
| Ozzy&Stix | high | svg-traced | 5 video + 1 photo | images.squarespace-cdn.com, www.tiktok.com | 9 |
| Paint & Pour | high | svg-traced | 0 video + 6 photo | bookedevents.co.uk, cdn.evbuc.com | 6 |
| Ray Elton Johnson | high | svg-traced | 0 video + 6 photo | primary.jwwb.nl | 7 |
| The Bar People | high | svg-traced | 6 video + 0 photo | thebarpeople.co.uk | 9 |
| T&L Executive Cars | high | svg-traced | still photo hero | tlexecutivecars.co.uk | 1 |
| TM Event Hire | high | svg-traced | 6 video + 0 photo | www.tiktok.com | 9 |
| Tony Poole Discos | high | svg-traced | 0 video + 6 photo | tonypoolediscos.com | 9 |
| Toot Sweet Candy Cart | high | svg-traced | 0 video + 6 photo | bookedevents.co.uk, pbs.twimg.com | 7 |

Calleo replaces the "Mensah" title. Booked Events post 15223 at slug `calleo` was retitled but all its content is Calleo's, and the old card photo was not Calleo's work.

### Media rules applied
- Footage came only from: the business's own website files, public streams embedded on its own site (Squarespace), its own public TikTok posts (via the already-installed yt-dlp 2025.10.14), its own X images, and its own Booked Events uploads. Jamie Roche's stills are thumbnails of his own YouTube videos (images, not video).
- No login, cookies, spoofed headers, impersonation or newly downloaded tools were used. Downloading a newer yt-dlp release and fetching Vimeo's player config were both blocked by the permission classifier, so **YouTube and Vimeo footage was not used**. Instagram and Facebook are login-walled. For those businesses the reels were completed with their own photos, labelled as photos.
- Provenance: content/research/*.json (research plus verifier problem lists), content/profiles/*.json (fact-checked copy), content/reels/*.json (clip specs: source URL, start/end, focal points), public/media/*/reel.json (published per-clip provenance), content/provenance/*/ (download URL, SHA-256 and size), content/media-summary.json (per-business media agent reports).
- Tools: scripts/media/{fetch.py, reel.py, logo_trace.py, assemble.py, qa-profiles.sh}. reel.py forces BT.709 tags; one CJ Sax source was BT.2020/HLG and was decoded without tone mapping.
- Mac resources: free disk was 14–15 GiB, below the 20 GiB target, with memory normal. No local `next build` was run; builds ran on Vercel. Media work ran two businesses at a time, and each agent deleted its source downloads (about 1 GB in total) after encoding.

### Verification (actual, on the final preview `anyvendor-m4njg45ce`)
- `tsc --noEmit` clean. eslint: the new and changed files have 0 errors (7 deliberate `<img>` warnings for pre-optimised WebP). Remaining eslint errors are only in the untouched legacy routes. The Vercel cloud build is Ready.
- Authenticated `vercel curl` on the earlier preview `qmqbp9kiy`: all 17 profile pages returned 200; every mobile reel was 200 video/mp4; every logo was 200 image/svg+xml; `/businesses/nope` returned 404. Filters: Weddings 12, Festivals 2, Baby Showers 1, Entertainment 6, Food Services + Essex 4, "bar" 2.
- Playwright CLI 0.1.18, isolated session through a temporary Vercel share link (not recorded): **36/36 page checks passed**. That is 17 profiles at 390×844 and 1440×900, plus CJ Sax at 375 and 430. Each check confirmed the correct reel playing (T&L still hero), enquiry buttons within the first screen, Pause not overlapping buttons, no horizontal overflow and no broken images. Reduced motion: the reel stays paused on the poster with no parallax. On the earlier preview, Pause/Play toggled correctly, the parallax went 0 → 9.6% → 19.3% and back to 0, and the gallery lightbox opened, responded to arrow keys and closed with Escape. Home search (Food Services + Weddings) gave 2 of 17. 0 console errors; the warnings are prefetch preloads of directory logos.
- Screenshots: docs/screenshots/profiles-20261027/ (hero-390-*, hero-1440-*, heroes-phone-390-sheet.jpg, phone/desktop full pages, lightbox).

### Gaps and decisions for Jake
1. **Permission:** these clips, photos and logos belong to each business. They're fine on this protected testing preview; get each business's OK before anything goes public. CJ Sax celebrity photos and a venue-watermarked photo were left out pending permission.
2. **Better footage available if allowed:** YouTube/Vimeo own-channel videos exist for Tony Poole Discos (75), Natalie & Max (34), Ozzy&Stix, CJ Sax, Calleo, Ray Elton Johnson, TM Event Hire and Jamie Roche. Approving an up-to-date yt-dlp (with a JS runtime) would let photo or mixed reels become full footage. Unwatermarked masters from CJ Sax would allow his best clips.
3. T&L Executive Cars has only one genuine photo and no video, so it has no reel. Toot Sweet's latest public posts date from 2020, so whether it's still trading is unverified. Jamie Roche's identity is matched at medium confidence; he has no website or logo.
4. Legacy invented-data routes (/vendor/*, /login, /signup, /admin, /services, /favourites, /list-your-business) are still present and unlinked. Deletion still needs Jake's approval.
5. Some reels upscale lower-resolution sources (TBP site videos 818p, portrait product loops, TikTok 576–720p), so they're slightly soft on large screens.

---

Updated 25 Sep 2026 by `claude:bc7de487-2154-4284-84d6-ed39a461395b` (Claude Opus 5.5, standard speed).
Brief: `/Users/margaritabot/Mission-Control/ANYVENDOR-BRIEF-20260925.md`.
Work claim: `18846802-9078-4f3c-981f-16dba169612b` (this checkout).

## Milestone 1 — Booked Events reconstruction (testing preview)

Branch `claude/bookedevents-reconstruction`. The commit, preview URL and release result are recorded in the "Release receipt" section below.

### Reference evidence
- `bookedevents.co.uk` (92.205.165.201) refused TCP connections on ports 80 and 443 at 16:11 UTC on 25 Sep 2026, so no live screenshot or read was possible.
- The only usable source was a Wayback capture of the homepage from 2025-03-31 19:56 UTC. Raw copy: `docs/reference/bookedevents-home-wayback-20250331.html`; parsed cards: `docs/reference/bookedevents-cards-parsed-20250331.json`. The archive has no profile pages, CSS files or images: every image URL returned 404.
- Recovered from the archive: header/nav/onboarding copy, the three pillars (Directory / Market / Trade Services), the full Industry → Category taxonomy, 5 locations, 13 event types, vendor cards (name, year, card categories, address, price from/unit), Market products, and palette/fonts (navy #212235, deep #080030, cyan #33ccff, amber #FBB102, Lexend Deca + Caveat).

### What was built
- `/` — navy utility bar, white nav (Directory/Shop/Hire/Trade/Agency, cyan List My Business, amber Plan My Event), pale cyan onboarding strip, a rebuilt hero (the live site's blank hero bug is not reproduced), Directory search + card carousel, Market strip, "Are You An Event Supplier?", newsletter, footer.
- `/directory` — server-side filtering by `industry`, `category`, `location`, `event` and `q` query params. The search is a native GET form, so it works before hydration. Includes result count, Clear filters and an empty state.
- `/businesses/<slug>` — 17 profiles at the original Booked Events slugs; unknown slugs return 404. `/businesses` redirects to `/directory`.
- Holding pages for shop, hire, trade, agency, trending, how-it-works, contact, list-my-business, plan-my-event, my-account, wishlist, basket and the legal pages. Each says plainly that the section is not live.
- Data and provenance live in `src/lib/directory.ts`.

### Data honesty
- Published: the 17 vendors seen live on 25 Sep. Ratings, reviews and availability were removed and none were invented.
- Prices are copied verbatim from the March 2025 archive and are labelled historical. Magpie Catering's "£500 per head" is flagged as a possible data-entry error.
- When a card listed no category, the industry was inferred from the business name or original image filename and is shown as "(unconfirmed)". Industry is left blank for Harry De Cruz, Natalie & Max, Mensah/Calleo, TM Event Hire and Ozzy & Stix.
- The `calleo` slug: the archive calls it **Calleo**; the live site showed **Mensah**. The preview displays Mensah with a note. **Jake to confirm.**
- Audit-only, not published: Theydon Bois Balti House, Joe Blake's, Jocee, The John Pollock Marquee and Charday Events (archived but not seen live), and Vish Testing (test listing).
- Type of Event: per-vendor tags were not recoverable, so this filter always shows an explained empty state.
- Images: none were recoverable. Cards use coloured monograms labelled "original image not yet recovered".
- Enquire, Wishlist, Newsletter, Basket and Account are disabled or labelled as not connected. No payments, messages or data collection.

### Verification (local `next start`, port 3456)
- `tsc --noEmit` clean; `npm run build` clean (43 pages, no warnings); eslint clean on the new files.
- Route smoke test: `/`, `/directory`, the filters, `/businesses/the-bar-people` and `/businesses/calleo` return 200; `/businesses/nope` returns 404; `/businesses` returns 307.
- Filter counts: 17 total; Food Services 5; Hertfordshire 1; `q=sax` 1; any event type 0 with the explanation.
- Browser (Playwright CLI 0.1.18, isolated session): no horizontal overflow at 1440 or 390. Selecting Entertainment → DJs & Disco and pressing Search gives 1 result; clicking the card opens `/businesses/tony-poole-discos`. The only console error is the expected 404.
- Screenshots are in `docs/screenshots/`: desktop home, directory, filtered directory, empty state and profile; mobile home, directory, profile and 404.

### Left in place (not removed)
The legacy routes `/admin`, `/login`, `/signup`, `/favourites`, `/services`, `/list-your-business`, `/vendor/[slug]` and their `src/components/*`, `src/context/AuthContext.tsx` and `src/data/vendors.ts` still exist and still build. They contain the earlier invented ratings and review counts and stock images, but they are not linked from the new navigation. Deletion was blocked during this session. **Recommend Jake approve removing them.**

### Gaps / next
1. Recover the real logos and photos, from the vendors (with permission) or from a Booked Events backup or server export.
2. Get per-vendor industry and event-type tags from a WordPress DB export, if one exists.
3. Confirm the Calleo/Mensah name and whether the 5 archive-only vendors should return.
4. Re-check the live origin when it answers, for a real screenshot comparison. No profile pages were ever archived.
5. Enquiry, account and payments integrations: not started; need Jake's decisions.

Not touched: WordPress, DNS, production domain, customer messaging, payments.

### Release receipt (25 Sep 2026, ~16:23 UTC)
- Code commit `5dd9748` on branch `claude/bookedevents-reconstruction`. Deployed with `vercel deploy`: a preview, not production.
- Preview: https://anyvendor-cftaxp2t4-anyos.vercel.app (Ready; Vercel Deployment Protection is on, so viewers must be signed in to Vercel).
- Verified on the deployment through authenticated `vercel curl`: `/directory?industry=food-services` shows 5 of 17, and `/businesses/the-bar-people` loads with the title "The Bar People — Anyvendor".
- Production `anyvendor.vercel.app` is unchanged (the old 152-day-old deployment `anyvendor-h76nsvda5`). `main` is not merged. Release claim `538cefcb-6566-4503-baeb-c22432dcbe90` was released after this receipt.
- Next decision for Jake: approve the preview, then merge to main or promote to production.

## Milestone 10 — real tenancy, three businesses, bespoke-site content contract (3 Nov 2026, evening)

Owner `claude:bc7de487-2154-4284-84d6-ed39a461395b`; worktree `anyvendor-profiles`, branch `claude/bookedevents-reconstruction`, commit `316197a` (pushed). Claims: source `18846802`, `6bf2c244`; release `90fc121d` (held for this migration + preview).

**Built and tested (85 tests):**
- `supabase/migrations/20261103100000_tenancy_hardening.sql`: `audit_log`; `pending_access` keyed to the exact, *verified* email (trigger `av_grant_pending_access` on insert/verify of `auth.users`; `apply_pending_access(uuid)` reads the real row and refuses unverified); `is_privileged()` (staff, service role or direct session; never anon/ordinary users); listing named at sign-up is only `listing_claim_note`, staff `link_listing`, one business per listing; `provision_business` idempotent by slug; `staff_switch` logged; `internal_entitlements` + `grant_internal_plan` (labelled, separate from `subscriptions`); staff edits via `can_manage` are audited; `websites.kind='bespoke'`, `manifest`, `preview_token`, `revalidate_url`; `public_site_v1(slug)` / `site_draft_v1(slug, token)`.
- App: `/staff/businesses` (list, provision, open as staff) and `/staff/businesses/[id]` (link listing, people by exact email, internal plan, site kind/URLs, manifest, activity); staff banner in the dashboard when acting on a business they don't belong to; sign-up listing field is a free-text claim; account page shows internal plans as such; manifest-driven editor for bespoke sites with uploads, draft/publish and optional revalidate ping; `/api/sites/{slug}/content[?preview=]` and `/api/sites/{slug}/manifest`.
- Docs: `docs/backend/SITE-CONTENT-CONTRACT-v1.md`, `docs/backend/adapters/anyvendor-site.ts`, `docs/backend/STRIPE-ACTIVATION.md`, `docs/backend/provision-20261103.sql`.

**Live database:** migration NOT applied yet. Two `apply_migration` prompts expired unaccepted on the Mac (the first was cancelled by Codex for the verified-email fix, which is now in). Needs one accepted prompt named `tenancy_hardening`, then run `docs/backend/provision-20261103.sql` as a separate step (it stops if the verified Jake row is missing). Jake's verified auth user exists: `f91e23fc-3aa3-4fcb-a3cc-e2b1f59d14f1`, never signed in.

**Not done / gaps:** Supabase Auth redirect URL + Site URL (CLI not logged in; needs dashboard or an access token); Supabase email delivery unverified (default SMTP only reaches project team members); no `STRIPE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `TOKEN_ENCRYPTION_KEY`, `OAUTH_STATE_SECRET`, `CRON_SECRET`, `APP_URL`, `SITE_REVALIDATE_SECRET` in Vercel; vendor owner emails for Floriography and Mr Tee's unknown (pending, none invented); real browser sign-in not exercised (no magic link sent, by instruction).

## Milestone 11 — new homepage/pricing brief: design pass and five-tier source of truth (3 Nov 2026, late evening)

Owner unchanged. Commits `e651b6a` (.vercelignore fix: a bare `content` line was excluding `src/app/api/sites/[slug]/content/` from Vercel uploads; patterns are now root-anchored), `c21a5ba`, `0c4b58f` pushed. Project is git-connected: every push to `claude/bookedevents-reconstruction` auto-builds and updates `https://anyvendor-git-claude-bookedevents-reconstruction-anyos.vercel.app`. CLI deploys are unnecessary.

**Design (OpenArt, Jake's account, GPT Image 2.5 Sunburst; receipts in `docs/brand-20261103/RECEIPTS.md`, 648 credits total, balance 65,333):** `icons-sheet-01` (15 event icons, 5×3), `homepage-concept-01`, `pricing-concept-01`, `logo-comparison-01` (current + A–E). Reviewable, not approved. The "Willow & Bloom Events" card in the homepage concept is placeholder art, not a real vendor. Current logo unchanged.

**Five tiers (source of truth `src/lib/business/plans.ts`):** listing £25, website (Website Plus) £50, marketing (Marketing Plus) £100, social (Social Media Plus) £150, ai (AI Plus) £350 a month inc. VAT; annual = two months free, flagged as a PROPOSAL everywhere (`ANNUAL_PROPOSAL_NOTE`). Stripe lookup keys `anyvendor_<plan>_monthly|annual`; staff test-price button creates both intervals (annual metadata says proposal). `/pricing` page; `/list-my-business` shows Listing + Website Plus with a link to all five; `/business/start?plan=&interval=` carries the choice through `/business/login?next=` → `/business/new` → `/business/account?plan=&interval=` where the owner confirms (button disabled with a notice while Stripe is not connected; no dead CTA). Footer no longer says listing is free. Header has a Pricing link.

**Held migrations (tested in PGlite, NOT applied):** `20261103100000_tenancy_hardening.sql` and `20261103200000_five_tiers.sql` (renames enum `seo`→`marketing`, adds `listing` and `ai`, `plan_rank`/`has_module` with `agent`). Until both are applied the live DB still has the three old plan codes, so live subscriptions/entitlements cannot be created with the new codes; the preview is source/test-mode only for pricing. Apply order: tenancy_hardening, five_tiers, then `docs/backend/provision-20261103.sql`.

**Not built yet (await Jake's review of the concepts):** hero with floating icons and smaller lockup, custom category icons on "What are you looking for?", spotlight video carousel, featured-by-location with change-location control and demo fixtures, AI Plus usage/overage figures, Stripe test-mode run (still no `STRIPE_*` keys in Vercel).

## Milestone 12 — Jake's direct homepage direction built; icon style corrected; fonts self-hosted (3 Nov 2026, night)

Commits `cab2a9a` (flat monoline icon sheet, replacement direction after Jake rejected the rendered style), `8f9fab2`/`9b649c8` (self-hosted Lexend Deca + Caveat as latin woff2 subsets; three builds had failed on next/font/google fetches), `10138a1` (homepage build). All pushed; git integration deploys to the branch alias.

**Verified on the alias at 20:45 UTC (deployment keckkv4ov):** `/pricing` 200 with £25/£50/£100/£150/£350, VAT line and the annual proposal flag; `/business/start?plan=…&interval=…` redirects to sign-in carrying `next`; `/list-my-business` 200; content route present (404 JSON until the held migration); homepage no longer says listing is free.

**Homepage (commit `10138a1`, deployment pending at the time of writing):** `EventIcons.tsx` holds 15 hand-drawn monoline SVG pictograms (24 grid, 1.75 stroke) from the approved flat direction; `FloatingIcons` drifts them behind the hero (reduced motion: static); lockup shrunk; hero on white; `Planner` is now a search bar (Occasion | Where | When | Plan my event) with need chips and guests beneath, same `/plan` flow; `SpotlightCarousel` shows five cards at card size, centre plays its muted showreel (sound toggle), rotates every 6 s, pauses on hover/focus/off-screen/reduced motion/pause button, has arrows, dots, keyboard and swipe; featured vendors filter by the visitor's town/county/postcode (`/api/location` cookie `av_loc`, matcher in `src/lib/location.ts` with tests) with an honest fallback to UK-wide vendors and View all. Category chips use the SVG icons. Pricing page notes featured placement is a separate promotion with no price yet.

**Design assets:** `docs/brand-20261103/` — `rejected-icons-sheet-01-rendered-style.png` (rejected), `icons-sheet-02-flat-monoline.png` (direction Jake described), `icons-svg-set-v1.svg` (the real vectors), homepage/pricing/logo concept sheets (layout reference only; their icon style is superseded). OpenArt spend 798 credits total today; balance 65,183.

**Still held:** both migrations and provisioning (no approval yet). **Not verified in a browser yet:** the new homepage at 375/390/430 and desktop; do a Playwright pass when Mac memory allows.

### Milestone 12 addendum (3 Nov, 21:25 UTC)

- Icon artwork: Jake rejected the rendered sheet, the hand-drawn line SVGs, the hand-drawn tile SVGs and the first OpenArt tile sheet as clip art. Three design directions were generated and sent for his pick: `icons-sheet-06-direction-a-faceted.png` (built from the AV mark's angled strokes), `icons-sheet-07-direction-b-negative.png`, `icons-sheet-08-direction-c-duotone.png`. Recommendation given: A for originality, B for polish. **No direction chosen yet.** The site currently shows interim tiles sliced from `icons-sheet-05-refined-gpt.png` (`public/icons/events/*.webp`); replace once he picks. Recraft V4.1 vector mode works (`icons-sheet-04-recraft-vector.svg`) and is the route to real SVGs for the chosen direction.
- OpenArt spend today: 1,250 credits; balance 64,259. Receipts in `docs/brand-20261103/RECEIPTS.md`.
- Homepage verified in a headless browser on deployment `qr1nj8gc8` (share link, expires 4 Nov 20:18 UTC): small row lockup, search-bar planner, floating tiles at the edges, five-card spotlight auto-rotating with centre video, posters paint once in view (earlier blanks were screenshot timing). Commit `44a1d8c` pins the phone tiles to the corners.
- Vercel: the project is git-connected; pushes auto-build; three builds today failed on Google Fonts fetches until fonts were self-hosted (`9b649c8`). `.vercelignore` patterns are root-anchored.

### Milestone 12, icons resolved to designed vectors (3 Nov, 21:50 UTC)

Jake rejected every generated sheet as AI-looking and asked for proper icons. The site now uses the Phosphor icon library (MIT, studio-designed) set in the AV navy tile with the cyan duotone layer: `src/components/site/EventIcons.tsx` (`WEIGHT` switches fill/duotone/bold), CSS rule `.av-tile` in `globals.css`, packages `@phosphor-icons/react` and `@phosphor-icons/core`. Comparison sheet `docs/brand-20261103/icons-sheet-09-phosphor-tiles.png`. Verified on deployment `q026pmrrb` (commit `d34e42d`) at desktop and phone. Generated sheets stay in `docs/brand-20261103/` as history only; the raster tiles were removed from `public/`.

### 4 Nov: icon style approved (solid silhouettes)

Jake chose the solid black silhouette language from `docs/brand-20261103/marks-sheet-01-car-note.png` (his crops in `docs/brand-20261103/refs/`). The full set was generated with those two as references (`icons-sheet-15-solid-set.png`, receipt 17) and sliced to transparent black marks in `public/icons/events/*.webp` (512px masters in `docs/brand-20261103/solid-set-512/`). `EventIcon` renders them black, white (CSS invert, for navy surfaces) or navy-tinted; no tiles. Phosphor packages removed. Commit `f1cd88b`. Next: Jake's per-mark feedback, then vector tracing of the signed-off marks (Recraft image2image vector or manual) so they are true SVGs.

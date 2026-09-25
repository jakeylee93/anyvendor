# Anyvendor — handoff

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

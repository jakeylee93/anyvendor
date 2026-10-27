# Anyvendor — handoff

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

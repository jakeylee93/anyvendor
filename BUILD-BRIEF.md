# anyOS Presentation Website — Full Build Brief

## Overview
Convert the existing anyOS presentation (see PRESENTATION-REFERENCE.html) into a full-screen interactive slider website. This replaces the current anyos.co.uk homepage. The site should work as both a presentation (full-screen slides) AND a normal website.

## CRITICAL: Design Reference
The file `PRESENTATION-REFERENCE.html` contains the EXACT design to follow. Same fonts (Inter + Space Grotesk via Google Fonts), same colours per era, same layout structure, same SVG icons. Do NOT deviate from this design. Make it full-screen and interactive but keep the visual identity identical.

## Architecture
- Next.js (already set up, app directory at `/app/`)
- Tailwind CSS (already configured)
- Framer Motion (just installed)
- Swiper.js (just installed) — use for the full-screen slider

## The Slider (Main Feature)
- Full-screen horizontal slider (100vw × 100vh per slide)
- Swiper.js with mousewheel navigation, keyboard arrows, pagination dots
- Smooth transitions between slides
- Each slide = one presentation page, styled exactly like the PDF reference
- 10 slides total

## Slide Content (match PRESENTATION-REFERENCE.html exactly)

### Slide 1: Web 1.0 — The Read-Only Web (1990–2004)
- Colour: Amber (#b45309, #fef3c7, #fffbeb)
- Badge: "WHERE IT ALL STARTED"
- Giant "1.0" watermark
- 4 feature boxes: Static Pages, Read-Only, Dial-Up, Web Directories
- Tags: GeoCities, Yahoo!, AltaVista, Netscape, HTML, Dial-Up, FTP
- Key stat: "By 2000, ~17 million websites..."

### Slide 2: Web 2.0 — The Social Web (2004–2018)
- Colour: Blue (#1d4ed8, #dbeafe, #eff6ff)
- Badge: "WHERE WE GREW UP"
- 4 feature boxes: User-Generated Content, Social Networks, Mobile Revolution, Cloud & SaaS
- Tags: MySpace, Facebook, YouTube, WordPress, Twitter, Instagram, iPhone, Google Docs

### Slide 3: Web 3.0 — The Decentralised Web (2018–2023)
- Colour: Purple (#6d28d9, #ede9fe, #f5f3ff)
- Badge: "THE RECENT PAST"
- 4 feature boxes: Blockchain, Cryptocurrency, NFTs, Automated Trading & DeFi
- Tags: Bitcoin, Ethereum, OpenSea, MetaMask, Uniswap, Smart Contracts, Trading Bots

### Slide 4: Web 4.0 — The Agentic Web (2023–Present)
- Colour: Green (#047857, #d1fae5, #ecfdf5)
- Badge: "WHERE WE ARE NOW"
- 4 feature boxes: AI Agents, Natural Language Interface, Autonomous Automation, Total Integration
- Tags: ChatGPT, Claude, Gemini, anyOS, Copilot, Midjourney, AI Agents

### Slide 5: Web 5.0 — The Autonomous Web (Future)
- Colour: Gold/Amber (#b45309, #fef3c7, #fefce8)
- Badge: "WHAT COMES NEXT?"
- 4 feature boxes: Fully Autonomous Businesses, AI-to-AI Communication, Predictive Operations, Digital Twins

### Slide 6: The World Is Moving. Are You?
- Colour: Red (#dc2626, #fef2f2, #fecaca)
- Badge: "ACT NOW"
- Company stats table: Spotify 1,500 / Ocado 1,500 / Duolingo AI-first / Meta thousands / Google thousands / Amazon thousands / Total 100,000+
- 4 feature boxes: The Window Is Closing, The Cost of Waiting, Enhance Don't Replace, First-Mover Advantage
- MAKE COMPANY NAMES CLICKABLE — each should open a modal or expandable section with more detail about that company's AI story

### Slide 7: How I Got Here
- Colour: Indigo (#4338ca, #e0e7ff, #eef2ff)
- Badge: "MY JOURNEY"
- Timeline: 2005 → 2010 → 2014 → 2017 → 2020 → 2022 → 2023-24 → 2025
- Each year with description

### Slide 8: What I Built — anyOS
- Colour: Teal (#0f766e, #ccfbf1, #f0fdfa)
- Badge: "THE SYSTEM"
- 6 feature boxes: Hardware Delivered, Multiple AI Models, Memory System, Full Integration, Cost Control, Training Included
- Tags: Email Management, Website Builds, Client Comms, Reports, Scheduling, File Processing, Research, Quoting

### Slide 9: Let Me Show You (Live Demo)
- Colour: Cyan (#0891b2, #cffafe, #ecfeff)
- Badge: "WATCH THIS"
- 3 demo cards with numbers (01, 02, 03), each with prompt text and results

### Slide 10: What Just Happened
- Colour: Rose (#be123c, #ffe4e6, #fff1f2)
- Badge: "THE NUMBERS"
- Comparison table: Traditional vs anyOS (6 rows)
- 2 feature boxes: Time Saved, Money Saved

## Interactive Elements
- Company names on slide 6 should be clickable → show expanded detail (modal or dropdown)
- Tags on each slide could link to relevant Wikipedia/source pages (open in new tab)
- Feature boxes should have subtle hover animations (scale, shadow)
- Slide navigation: dots on the side, keyboard arrows, mouse wheel, swipe on mobile

## Below the Slider
After the last slide, the page continues with a scroll section:
- Brief "Powered by anyOS" section
- Simple CTA: "Ready to bring Web 4.0 to your business?" with contact button
- Footer with anyOS branding, jake@anyvendor.co.uk, anyos.co.uk

## Brand
- Logo: "anyOS" — "any" in dark, "OS" in #6366f1 (indigo)
- Fonts: Space Grotesk (headings, numbers), Inter (body)
- Load from Google Fonts

## Technical Notes
- The existing page.tsx and layout.tsx should be REPLACED with the new slider homepage
- Keep the existing app/api/ directory untouched
- Ensure responsive: works on desktop (presenting), tablet, and mobile
- Use `"use client"` for interactive components
- Images: none needed, all visuals are CSS/SVG

## After Building
```bash
cd /tmp/anyvendor
pnpm run build
git add -A
git commit -m "feat: full-screen presentation website — 10 interactive slides, Web 1-5 eras, demo, business case"
git push origin main
openclaw system event --text "Done: anyOS presentation website built — 10 slides, interactive, deployed" --mode now
```

#!/bin/bash
D=${D:?set D to the preview URL}
OUT=/Users/margaritabot/.openclaw/workspace/anyvendor-profiles/docs/screenshots/profiles-20261027
P() { playwright-cli -s=avf "$@" 2>&1 | grep -v -E '╔|║|╚|^$|Snapshot'; }
E() { P eval "$1" | awk '/^### Result/{getline; print; exit}'; }
CHECK='() => { const v=document.querySelector("video"); const hero=document.querySelector("main section"); const btns=[...hero.querySelectorAll("a")]; const pb=hero.querySelector("button[aria-label$=showreel]"); const r=pb&&pb.getBoundingClientRect(); const overlap=pb?btns.some(a=>{const b=a.getBoundingClientRect(); return !(r.right<b.left||r.left>b.right||r.bottom<b.top||r.top>b.bottom)}):false; const lastCta=btns.length?Math.max(...btns.map(a=>a.getBoundingClientRect().bottom)):0; return JSON.stringify({video:v?(v.currentSrc||"").split("/").pop():"none", playing:v?!v.paused&&v.currentTime>0:null, ctaBottom:Math.round(lastCta), vh:innerHeight, ctaVisible:lastCta<=innerHeight, pauseOverlap:overlap, overflow:document.documentElement.scrollWidth-innerWidth, broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length}) }'
P open "$D/?_vercel_share=$1"  # $1 = temporary share token from Vercel; never commit it >/dev/null
for W in "390 844" "1440 900"; do
  set -- $W
  P resize $1 $2 >/dev/null
  for s in the-bar-people grape-fig harry-de-cruz paint-and-pour natalie-max lucy-jane-cakes ray-johnson toot-sweet-candy-cart jamie-roche magpie-catering calleo tony-poole-discos tm-event-hire tl-executive-cars meatstop cj-sax ozzy-stix; do
    P goto "$D/businesses/$s" >/dev/null; sleep 3
    echo "$1 $s $(E "$CHECK")"
    P screenshot --filename "$OUT/hero-$1-$s.png" >/dev/null
  done
done
for W in 375 430; do P resize $W 812 >/dev/null; P goto "$D/businesses/cj-sax" >/dev/null; sleep 3; echo "$W cj-sax $(E "$CHECK")"; P screenshot --filename "$OUT/hero-$W-cj-sax.png" >/dev/null; done
P resize 390 844 >/dev/null
P run-code 'async page => { await page.emulateMedia({ reducedMotion: "reduce" }); }' >/dev/null
P goto "$D/businesses/grape-fig" >/dev/null; sleep 3
echo "reduced-motion grape-fig $(E '() => { const v=document.querySelector("video"); return JSON.stringify({paused:v.paused,t:v.currentTime,transform:document.querySelector("section[aria-label$=showreel] > div").style.transform}) }')"
P run-code 'async page => { await page.emulateMedia({ reducedMotion: "no-preference" }); }' >/dev/null
P goto "$D/" >/dev/null; sleep 2
P select 'select[name=industry]' food-services >/dev/null; P select 'select[name=event]' Weddings >/dev/null
P click 'form[role=search] button[type=submit]' >/dev/null; sleep 2
echo "home search -> $(E '() => location.search + " | " + document.querySelector("[aria-live] p").innerText')"
P console error | grep -E "Total|ERROR" | head -5
P close >/dev/null

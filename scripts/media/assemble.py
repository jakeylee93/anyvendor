#!/usr/bin/env python3
"""Merge content/profiles/*.json with media manifests into src/data/profiles.generated.json.

content/profiles/<slug>.json holds the verified, sourced editorial record:
  displayName, tagline, intro, about[], services[], eventTypes[], areasServed[],
  website, socials{}, contact (The Bar People only), identity{}, sources[], gaps[],
  logo {file, kind, sourceUrl, plate}, gallery [{file, alt, sourceUrl}]
public/media/<slug>/reel.json is written by reel.py (clip provenance + renditions).
"""
import glob
import json
import os
import re
import sys

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def dims(path):
    if path.endswith(".svg"):
        head = open(path).read(2000)
        vb = re.search(r'viewBox="[\d.\-]+ [\d.\-]+ ([\d.]+) ([\d.]+)"', head)
        if vb:
            w, h = float(vb.group(1)), float(vb.group(2))
            return 512, round(512 * h / w)
        return 512, 512
    with Image.open(path) as im:
        return im.size


def public_url(path):
    rel = os.path.relpath(os.path.join(ROOT, path), os.path.join(ROOT, "public"))
    if rel.startswith(".."):
        raise SystemExit(f"{path} is not under public/")
    return "/" + rel.replace(os.sep, "/")


def main():
    out = {}
    taxonomy = {}
    problems = []
    for f in sorted(glob.glob(os.path.join(ROOT, "content", "profiles", "*.json"))):
        c = json.load(open(f))
        slug = c["slug"]
        p = {
            "slug": slug,
            "displayName": c["displayName"],
            "tagline": c.get("tagline"),
            "intro": c["intro"],
            "about": c.get("about", []),
            "services": c.get("services", []),
            "eventTypes": c.get("eventTypes", []),
            "areasServed": c.get("areasServed", []),
            "website": c.get("website"),
            "socials": {k: v for k, v in (c.get("socials") or {}).items() if v},
            "contact": c.get("contact") if slug == "the-bar-people" else None,
            "identity": c.get("identity", {"confidence": "none", "note": None}),
            "sources": c.get("sources", []),
            "gaps": c.get("gaps", []),
            "established": c.get("established"),
            "basedIn": c.get("basedIn"),
            "price": c.get("price"),
            "cardPrice": c.get("cardPrice"),
            "logo": None,
            "gallery": [],
            "reel": None,
        }
        if c.get("taxonomy"):
            taxonomy[slug] = c["taxonomy"]
        media_path = os.path.join(ROOT, "public", "media", slug, "media.json")
        media = json.load(open(media_path)) if os.path.exists(media_path) else {}
        if "logo" not in c and media.get("logo"):
            c["logo"] = media["logo"]
        if "gallery" not in c and media.get("gallery"):
            c["gallery"] = media["gallery"]
        lg = c.get("logo")
        if lg:
            path = os.path.join(ROOT, lg["file"])
            if os.path.exists(path):
                w, h = dims(path)
                p["logo"] = {"src": public_url(lg["file"]), "kind": lg["kind"], "sourceUrl": lg["sourceUrl"], "plate": lg.get("plate", "light"), "width": w, "height": h}
            else:
                problems.append(f"{slug}: missing logo {lg['file']}")
        for g in c.get("gallery", []):
            path = os.path.join(ROOT, g["file"])
            if not os.path.exists(path):
                problems.append(f"{slug}: missing photo {g['file']}")
                continue
            w, h = dims(path)
            p["gallery"].append({"src": public_url(g["file"]), "width": w, "height": h, "alt": g["alt"], "sourceUrl": g["sourceUrl"]})
        reel = os.path.join(ROOT, "public", "media", slug, "reel.json")
        if os.path.exists(reel):
            r = json.load(open(reel))
            p["reel"] = {k: r[k] for k in ("fade", "audio", "segments", "outputs")}
        out[slug] = p
    dest = os.path.join(ROOT, "src", "data", "profiles.generated.json")
    with open(dest, "w") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    with open(os.path.join(ROOT, "src", "data", "taxonomy.generated.json"), "w") as fh:
        json.dump(taxonomy, fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print(f"wrote {len(out)} profiles to {os.path.relpath(dest, ROOT)}")
    for x in problems:
        print("PROBLEM", x)
    if problems:
        sys.exit(1)


if __name__ == "__main__":
    main()

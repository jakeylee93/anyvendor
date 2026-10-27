#!/usr/bin/env python3
"""Fetch one business's verified public media into .media-work/<slug>/ (git-ignored).

  fetch.py <verified-record.json>

Only direct, publicly fetchable files are downloaded (no logins, cookies or
hosted-player extraction). Each download is logged with URL, SHA-256 and size
in .media-work/<slug>/fetch-log.json, and every video gets a contact sheet.
Caps keep local disk use small: 300 MB per video, 700 MB per business.
"""
import hashlib
import json
import os
import subprocess
import sys
import urllib.parse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
VIDEO_CAP = 300 * 1024 * 1024
BUSINESS_CAP = 700 * 1024 * 1024


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def get(url, dest, cap):
    r = subprocess.run(
        ["curl", "-sS", "-L", "--fail", "-A", UA, "--max-filesize", str(cap), "--max-time", "600", "-o", dest, url],
        capture_output=True, text=True,
    )
    if r.returncode != 0:
        if os.path.exists(dest):
            os.remove(dest)
        return r.stderr.strip()[-200:] or f"curl exit {r.returncode}"
    return None


def name_for(url, prefix, n):
    base = os.path.basename(urllib.parse.urlparse(url).path) or f"{prefix}{n}"
    base = urllib.parse.unquote(base).replace(" ", "_")
    return f"{prefix}{n:02d}-{base}"[:120]


def main(path):
    rec = json.load(open(path))
    rec = rec.get("record", rec)
    slug = rec["slug"]
    work = os.path.join(ROOT, ".media-work", slug)
    os.makedirs(work, exist_ok=True)
    log = {"slug": slug, "files": [], "skipped": []}
    used = 0

    def take(kind, url, dest, cap):
        nonlocal used
        if used >= BUSINESS_CAP:
            log["skipped"].append({"url": url, "why": "business disk cap reached"})
            return None
        err = get(url, dest, min(cap, BUSINESS_CAP - used))
        if err:
            log["skipped"].append({"url": url, "why": err})
            return None
        size = os.path.getsize(dest)
        used += size
        entry = {"kind": kind, "url": url, "file": os.path.relpath(dest, ROOT), "bytes": size, "sha256": sha256(dest)}
        log["files"].append(entry)
        return entry

    for n, lg in enumerate(rec.get("logos", [])):
        take("logo", lg["url"], os.path.join(work, name_for(lg["url"], "logo", n)), 20 * 1024 * 1024)
    for n, im in enumerate(rec.get("images", [])):
        if im.get("stockRisk") == "likely-stock":
            continue
        take("image", im["url"], os.path.join(work, name_for(im["url"], "img", n)), 25 * 1024 * 1024)
    for n, v in enumerate(rec.get("videos", [])):
        if v["kind"] != "direct-file" or not v.get("publiclyFetchable"):
            log["skipped"].append({"url": v["url"], "why": f"{v['kind']} not a public direct file"})
            continue
        e = take("video", v["url"], os.path.join(work, name_for(v["url"], "vid", n)), VIDEO_CAP)
        if not e:
            continue
        try:
            out = subprocess.run(
                [sys.executable, os.path.join(ROOT, "scripts", "media", "reel.py"), "sheet", os.path.join(ROOT, e["file"]),
                 os.path.join(work, f"sheet-vid{n:02d}.jpg"), "--every", "0.5", "--width", "200"],
                capture_output=True, text=True, check=True,
            ).stdout
            e["probe"] = json.loads(out)
        except subprocess.CalledProcessError as ex:
            e["probeError"] = ex.stderr[-300:]
    log["totalBytes"] = used
    with open(os.path.join(work, "fetch-log.json"), "w") as f:
        json.dump(log, f, indent=2)
    print(json.dumps({"slug": slug, "files": len(log["files"]), "skipped": len(log["skipped"]), "MB": round(used / 1e6, 1)}))


if __name__ == "__main__":
    main(sys.argv[1])

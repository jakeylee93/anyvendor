#!/usr/bin/env python3
"""Showreel tooling for Anyvendor business profiles.

Real footage only: clips are cut from each business's own published media.
Audio is always stripped. Every segment's source URL and timecode is written
to public/media/<slug>/reel.json so provenance travels with the asset.

  reel.py probe <file>
  reel.py sheet <file> <out.jpg> [--every 0.5] [--width 240]
  reel.py build <spec.json>

Spec format:
{
  "slug": "the-bar-people",
  "fade": 0.6,
  "crf": 26,            (optional; raise to 28 for busy footage to keep files small)
  "segments": [
    {"file": ".media-work/the-bar-people/src1.mp4", "url": "https://...", "start": 3.2,
     "dur": 2.6, "fx": 0.5, "fy": 0.45, "mfx": 0.5, "mfy": 0.5},
    {"image": ".media-work/x/photo.jpg", "url": "https://...", "dur": 2.6}
  ]
}
fx/fy is the focal point (0-1) for the desktop 16:9 crop, mfx/mfy for the
phone 9:16 crop (defaults to fx/fy). The first segment is split so the loop
point is seamless: the reel starts `fade` seconds into segment 1 and ends by
cross-fading back into its opening.
"""
import json
import os
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FPS = 30
TARGETS = {"desktop": (1280, 720), "mobile": (720, 1280)}
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.stderr.write(p.stderr[-4000:])
        raise SystemExit(f"command failed: {' '.join(cmd[:6])}...")
    return p.stdout


def probe(path):
    out = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", path])
    d = json.loads(out)
    v = next(s for s in d["streams"] if s["codec_type"] == "video")
    w, h = int(v["width"]), int(v["height"])
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd:
            rot = int(sd["rotation"])
    if abs(rot) in (90, 270):
        w, h = h, w
    num, den = v.get("avg_frame_rate", "0/1").split("/")
    return {
        "width": w,
        "height": h,
        "duration": float(d["format"].get("duration", 0)),
        "fps": round(float(num) / float(den), 2) if float(den) else None,
        "codec": v.get("codec_name"),
        "hasAudio": any(s["codec_type"] == "audio" for s in d["streams"]),
        "bytes": int(d["format"].get("size", 0)),
    }


def sheet(path, out, every=0.5, width=240):
    info = probe(path)
    with tempfile.TemporaryDirectory() as tmp:
        run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=1/{every},scale={width}:-2", "-q:v", "4", f"{tmp}/f%05d.jpg"])
        frames = sorted(f for f in os.listdir(tmp) if f.endswith(".jpg"))
        if not frames:
            raise SystemExit("no frames")
        tiles = [Image.open(os.path.join(tmp, f)).convert("RGB") for f in frames]
        tw, th = tiles[0].size
        cols = 8
        rows = (len(tiles) + cols - 1) // cols
        font = ImageFont.truetype(FONT, 15)
        img = Image.new("RGB", (cols * tw, rows * (th + 20)), "white")
        d = ImageDraw.Draw(img)
        for i, t in enumerate(tiles):
            x, y = (i % cols) * tw, (i // cols) * (th + 20)
            img.paste(t, (x, y + 20))
            d.text((x + 4, y + 2), f"{i * every:.1f}s", fill="black", font=font)
        img.save(out, quality=82)
    return {"sheet": out, "frames": len(tiles), "every": every, **info}


def crop_expr(sw, sh, tw, th, fx, fy):
    ta = tw / th
    if sw / sh > ta:
        cw, ch = round(sh * ta), sh
    else:
        cw, ch = sw, round(sw / ta)
    cw -= cw % 2
    ch -= ch % 2
    x = min(max(round(fx * sw - cw / 2), 0), sw - cw)
    y = min(max(round(fy * sh - ch / 2), 0), sh - ch)
    return f"crop={cw}:{ch}:{x}:{y},scale={tw}:{th}:flags=lanczos"


def build(spec_path):
    spec = json.load(open(spec_path))
    slug, fade = spec["slug"], float(spec.get("fade", 0.6))
    segs = spec["segments"]
    outdir = os.path.join(ROOT, "public", "media", slug)
    os.makedirs(outdir, exist_ok=True)

    # Split segment 1 into head (after the fade) and tail (its opening), for a seamless loop.
    first = segs[0]
    parts = [dict(first, start=first.get("start", 0) + fade, dur=first["dur"] - fade)]
    parts += segs[1:]
    parts.append(dict(first, dur=fade))

    manifest = {"slug": slug, "fade": fade, "fps": FPS, "audio": "stripped", "segments": [], "outputs": {}}
    for s in segs:
        entry = {"sourceUrl": s["url"], "durationSec": s["dur"]}
        if "file" in s:
            entry.update(kind="video", startSec=round(s.get("start", 0), 2), endSec=round(s.get("start", 0) + s["dur"], 2))
        else:
            entry.update(kind="still")
        if s.get("note"):
            entry["note"] = s["note"]
        manifest["segments"].append(entry)

    for name, (tw, th) in TARGETS.items():
        cmd = ["ffmpeg", "-v", "error", "-y"]
        chains = []
        for i, p in enumerate(parts):
            fx, fy = p.get("fx", 0.5), p.get("fy", 0.5)
            if name == "mobile":
                fx, fy = p.get("mfx", fx), p.get("mfy", fy)
            if "file" in p:
                info = probe(p["file"])
                cmd += ["-ss", f"{p.get('start', 0):.3f}", "-t", f"{p['dur']:.3f}", "-i", p["file"]]
                sw, sh = info["width"], info["height"]
                pre = f"fps={FPS}"
            else:
                im = Image.open(p["image"])
                sw, sh = im.size
                sw -= sw % 2
                sh -= sh % 2
                frames = round(p["dur"] * FPS)
                cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{p['dur']:.3f}", "-i", p["image"]]
                # Gentle push-in on stills so a photo segment still reads as motion.
                pre = (
                    f"scale={sw}:{sh},zoompan=z='1+0.06*on/{frames}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
                    f":d=1:s={sw}x{sh}:fps={FPS}"
                )
            # Normalise every segment to SDR BT.709 tags so one HLG/BT.2020 source cannot retag the reel.
            chains.append(
                f"[{i}:v]{pre},{crop_expr(sw, sh, tw, th, fx, fy)},setsar=1,format=yuv420p,"
                f"setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv,settb=AVTB[v{i}]"
            )
        acc_label, acc_len = "v0", parts[0]["dur"]
        for i in range(1, len(parts)):
            out = f"x{i}"
            offset = acc_len - fade
            chains.append(f"[{acc_label}][v{i}]xfade=transition=fade:duration={fade}:offset={offset:.3f}[{out}]")
            acc_label, acc_len = out, offset + parts[i]["dur"]
        mp4 = os.path.join(outdir, f"reel-{name}.mp4")
        cmd += [
            "-filter_complex", ";".join(chains), "-map", f"[{acc_label}]", "-an",
            "-c:v", "libx264", "-preset", "slow", "-crf", str(spec.get("crf", 26)), "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
            "-movflags", "+faststart", mp4,
        ]
        run(cmd)
        poster = os.path.join(outdir, f"poster-{name}.jpg")
        run(["ffmpeg", "-v", "error", "-y", "-i", mp4, "-frames:v", "1", "-q:v", "3", poster])
        run(["cwebp", "-quiet", "-q", "80", poster, "-o", poster.replace(".jpg", ".webp")])
        manifest["outputs"][name] = {
            "video": f"/media/{slug}/reel-{name}.mp4",
            "poster": f"/media/{slug}/poster-{name}.jpg",
            "posterWebp": f"/media/{slug}/poster-{name}.webp",
            "width": tw,
            "height": th,
            "durationSec": round(acc_len, 2),
            "bytes": os.path.getsize(mp4),
        }
    with open(os.path.join(outdir, "reel.json"), "w") as f:
        json.dump(manifest, f, indent=2)
    return manifest


if __name__ == "__main__":
    a = sys.argv[1:]
    if not a:
        raise SystemExit(__doc__)
    if a[0] == "probe":
        print(json.dumps(probe(a[1]), indent=2))
    elif a[0] == "sheet":
        every = float(a[a.index("--every") + 1]) if "--every" in a else 0.5
        width = int(a[a.index("--width") + 1]) if "--width" in a else 240
        print(json.dumps(sheet(a[1], a[2], every, width), indent=2))
    elif a[0] == "build":
        print(json.dumps(build(a[1]), indent=2))
    else:
        raise SystemExit(__doc__)

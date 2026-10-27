#!/usr/bin/env python3
"""Vector reconstruction of a raster logo (used only when no genuine SVG exists).

  logo_trace.py <in.png|jpg|webp> <out.svg> [--colours N] [--keep-bg]

Each brand colour is traced separately with potrace and stacked, then the SVG
is rendered back with rsvg-convert and compared with the original so a poor
trace is caught (prints mean absolute difference, 0 = identical).
The output is a reconstruction: callers must record it as "traced" with the
source URL, never as the business's own vector file.
"""
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
from PIL import Image, ImageFilter


def load(path, min_w=1200):
    im = Image.open(path).convert("RGBA")
    box = im.getchannel("A").point(lambda v: 255 if v >= 16 else 0).getbbox()
    if box and box != (0, 0, im.width, im.height):
        pad = round(max(box[2] - box[0], box[3] - box[1]) * 0.02)
        box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, im.width), min(box[3] + pad, im.height))
        im = im.crop(box)
    if im.width < min_w:
        f = min_w / im.width
        im = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    return im


def background(arr):
    a = arr[..., 3]
    if (a < 16).mean() > 0.02:
        return None  # transparent background
    edge = np.concatenate([arr[0, :, :3], arr[-1, :, :3], arr[:, 0, :3], arr[:, -1, :3]])
    vals, counts = np.unique((edge // 8) * 8, axis=0, return_counts=True)
    return vals[counts.argmax()].astype(int)


def trace(src, out, colours=4, keep_bg=False):
    im = load(src)
    arr = np.array(im)
    h, w = arr.shape[:2]
    bg = background(arr)
    opaque = arr[..., 3] >= 128
    rgb = Image.fromarray(arr[..., :3])
    pal_img = rgb.quantize(colors=colours + (0 if bg is None else 1), method=Image.Quantize.MEDIANCUT)
    palette = np.array(pal_img.getpalette()[: 3 * 256]).reshape(-1, 3)
    idx = np.array(pal_img)
    layers = []
    solid = arr[..., 3] >= 250
    for k in np.unique(idx):
        mask = (idx == k) & opaque
        # Exact brand colour: the most common true pixel value in this cluster.
        px = arr[(idx == k) & solid][:, :3]
        if len(px):
            vals, counts = np.unique(px, axis=0, return_counts=True)
            col = vals[counts.argmax()]
        else:
            col = palette[k]
        if bg is not None and not keep_bg and np.abs(col - bg).sum() < 60:
            continue
        if mask.mean() < 0.0005:
            continue
        layers.append((mask.sum(), col, mask))
    layers.sort(key=lambda t: -t[0])

    paths = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, (_, col, mask) in enumerate(layers):
            m = Image.fromarray((~mask).astype(np.uint8) * 255).convert("L")
            m = m.filter(ImageFilter.MinFilter(3))  # 1px dilation of the ink, closes AA seams
            pbm = os.path.join(tmp, f"l{i}.pbm")
            m.convert("1").save(pbm)
            svg = os.path.join(tmp, f"l{i}.svg")
            subprocess.run(["potrace", "-s", "--turdsize", "12", "--alphamax", "1.0", "--opttolerance", "0.4", "-o", svg, pbm], check=True)
            body = open(svg).read()
            g = re.search(r"(<g transform=.*?</g>)", body, re.S).group(1)
            hexcol = "#%02x%02x%02x" % tuple(int(c) for c in col)
            g = re.sub(r'fill="#000000"', f'fill="{hexcol}"', g)
            paths.append(g)

    vb_w = 512
    vb_h = round(512 * h / w)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{vb_w}" height="{vb_h}">'
        + "".join(paths)
        + "</svg>\n"
    )
    open(out, "w").write(svg)

    # QA: render back and compare on white.
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, "r.png")
        subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), "-o", png, out], check=True)
        r = Image.open(png).convert("RGBA")
        white = Image.new("RGBA", (w, h), "white")
        a = np.asarray(Image.alpha_composite(white, im).convert("L"), dtype=float)
        b = np.asarray(Image.alpha_composite(white, r).convert("L"), dtype=float)
        diff = np.abs(a - b).mean()
    print(f"{out}: layers={len(layers)} bytes={os.path.getsize(out)} meanAbsDiff={diff:.2f}")
    return diff


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) < 2:
        raise SystemExit(__doc__)
    n = int(a[a.index("--colours") + 1]) if "--colours" in a else 4
    trace(a[0], a[1], n, "--keep-bg" in a)

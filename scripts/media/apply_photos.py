#!/usr/bin/env python3
"""Apply content/photo-picks.json: write card.webp (4:3) and gallery photo-NN.webp per business.

Candidates come from .media-work/photos/<slug>/candidates.json (original-resolution
downloads from the business's own website and its own uploads on the old
Booked Events / The Event People site, with source URLs and SHA-256).
"""
import json, os, glob, sys
from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
EXTRA_ALT = json.load(open(os.path.join(ROOT, 'content', 'photo-alt.json')))

def save_webp(im, path, q):
    im.save(path, 'WEBP', quality=q, method=6)

def main():
    picks = json.load(open(os.path.join(ROOT, 'content', 'photo-picks.json')))
    for slug, p in picks.items():
        items = {it['i']: it for it in json.load(open(os.path.join(ROOT, '.media-work', 'photos', slug, 'candidates.json')))}
        rec = json.load(open(os.path.join(ROOT, 'content', 'research', f'{slug}.json')))['record']
        desc = {im['url']: im['description'] for im in rec.get('images', [])}
        mpath = os.path.join(ROOT, 'public', 'media', slug, 'media.json')
        media = json.load(open(mpath))
        oldalt = {g['sourceUrl']: g['alt'] for g in media.get('gallery', [])}
        def alt(it):
            return EXTRA_ALT.get(f"{slug}#{it['i']}") or oldalt.get(it['url']) or desc.get(it['url'])
        outdir = os.path.join(ROOT, 'public', 'media', slug)
        for f in glob.glob(os.path.join(outdir, 'photo-*.webp')):
            os.remove(f)
        # Card: 4:3 crop around the focal point, up to 1200x900.
        ci, fx, fy = p['card']; it = items[ci]
        im = ImageOps.exif_transpose(Image.open(os.path.join(ROOT, it['file']))).convert('RGB')
        W, H = im.size
        cw, ch = (round(H * 4 / 3), H) if W / H > 4 / 3 else (W, round(W * 3 / 4))
        x = min(max(round(fx * W - cw / 2), 0), W - cw); y = min(max(round(fy * H - ch / 2), 0), H - ch)
        card = im.crop((x, y, x + cw, y + ch))
        tw = min(1200, cw); card = card.resize((tw, round(tw * 3 / 4)), Image.LANCZOS)
        save_webp(card, os.path.join(outdir, 'card.webp'), 84)
        media['card'] = {'file': f'public/media/{slug}/card.webp', 'sourceUrl': it['url'], 'alt': alt(it), 'sourceSize': [W, H], 'sha256': it['sha256']}
        gallery = []
        for n, gi in enumerate(p['gallery'], 1):
            it = items[gi]
            im = ImageOps.exif_transpose(Image.open(os.path.join(ROOT, it['file']))).convert('RGB')
            im.thumbnail((2000, 2000), Image.LANCZOS)
            f = f'public/media/{slug}/photo-{n:02d}.webp'
            save_webp(im, os.path.join(ROOT, f), 82)
            a = alt(it)
            if not a:
                sys.exit(f'missing alt for {slug}#{gi}')
            gallery.append({'file': f, 'alt': a, 'sourceUrl': it['url'], 'sha256': it['sha256']})
        media['gallery'] = gallery
        media.setdefault('notes', []).append('Oct 27 photo upgrade: card and gallery re-selected from original-resolution uploads on the business\'s own site and its own uploads on the old Booked Events site; AI renders, other businesses\' images, private names and celebrity/watermarked shots excluded.')
        json.dump(media, open(mpath, 'w'), indent=2, ensure_ascii=False)
        print(f'{slug:22} card {card.size} from {W}x{H}; gallery {len(gallery)}')

if __name__ == '__main__':
    main()

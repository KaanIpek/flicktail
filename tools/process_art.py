"""Asset pipeline for AI-generated art.

Two jobs:
  sprite   — white-background sticker art -> trimmed transparent PNG at game size.
             The white is removed by flood fill from the image border only, so
             white highlights INSIDE the drink survive. The boundary gets a
             1-2px alpha feather so edges don't look cut out.
  backdrop — full-bleed painting -> resized WebP for the game.

Usage:
  python tools/process_art.py sprite   assets/raw/tier01.png assets/drinks/tier01.png --size 320
  python tools/process_art.py backdrop assets/raw/santorini.png assets/backdrops/santorini.webp --w 810 --h 1440
"""
import argparse
import sys
from collections import deque

from PIL import Image


def flood_outside_white(img, threshold=238):
    """Mask of pixels connected to the border through near-white pixels."""
    w, h = img.size
    px = img.load()
    outside = bytearray(w * h)
    q = deque()

    def near_white(x, y):
        r, g, b = px[x, y][:3]
        return r >= threshold and g >= threshold and b >= threshold

    for x in range(w):
        for y in (0, h - 1):
            if not outside[y * w + x] and near_white(x, y):
                outside[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if not outside[y * w + x] and near_white(x, y):
                outside[y * w + x] = 1
                q.append((x, y))

    while q:
        x, y = q.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not outside[ny * w + nx] and near_white(nx, ny):
                outside[ny * w + nx] = 1
                q.append((nx, ny))
    return outside


def sprite(src, dst, size):
    img = Image.open(src).convert("RGBA")
    w, h = img.size
    outside = flood_outside_white(img)
    px = img.load()

    # Feather: an inside pixel adjacent to outside gets alpha scaled by how
    # white it is (anti-aliased rim pixels are part-white, part-ink).
    for y in range(h):
        row = y * w
        for x in range(w):
            if outside[row + x]:
                r, g, b, _ = px[x, y]
                px[x, y] = (r, g, b, 0)
    for y in range(h):
        for x in range(w):
            if outside[y * w + x]:
                continue
            edge = False
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and outside[ny * w + nx]:
                    edge = True
                    break
            if edge:
                r, g, b, a = px[x, y]
                whiteness = (min(r, g, b)) / 255.0
                px[x, y] = (r, g, b, int(a * (1.0 - 0.7 * whiteness)))

    bbox = img.getbbox()
    img = img.crop(bbox)
    # square-pad so every sprite scales uniformly in-game
    side = max(img.size)
    pad = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    pad.paste(img, ((side - img.size[0]) // 2, (side - img.size[1]) // 2))
    pad = pad.resize((size, size), Image.LANCZOS)
    pad.save(dst, optimize=True)
    print(f"sprite {src} -> {dst} ({size}x{size})")


def backdrop(src, dst, w, h, quality=82):
    img = Image.open(src).convert("RGB")
    # cover-crop to target aspect
    ta = w / h
    sw, sh = img.size
    sa = sw / sh
    if sa > ta:
        nw = int(sh * ta)
        img = img.crop(((sw - nw) // 2, 0, (sw + nw) // 2, sh))
    else:
        nh = int(sw / ta)
        img = img.crop((0, (sh - nh) // 2, sw, (sh + nh) // 2))
    img = img.resize((w, h), Image.LANCZOS)
    img.save(dst, "WEBP", quality=quality, method=6)
    print(f"backdrop {src} -> {dst} ({w}x{h})")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("mode", choices=["sprite", "backdrop"])
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--size", type=int, default=320)
    ap.add_argument("--w", type=int, default=810)
    ap.add_argument("--h", type=int, default=1440)
    ap.add_argument("--quality", type=int, default=82)
    a = ap.parse_args()
    if a.mode == "sprite":
        sprite(a.src, a.dst, a.size)
    else:
        backdrop(a.src, a.dst, a.w, a.h, a.quality)


if __name__ == "__main__":
    main()

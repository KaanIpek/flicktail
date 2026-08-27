"""App icon: Lagoon Rita sprite over a sunset gradient, rounded square."""
from PIL import Image, ImageDraw

SRC = r"D:\cowork\Flicktail\assets\drinks\tier04.png"


def make(size, out):
    img = Image.new("RGBA", (size, size))
    d = ImageDraw.Draw(img)
    # vertical sunset gradient
    top = (255, 158, 74)
    bot = (255, 61, 122)
    for y in range(size):
        t = y / size
        d.line([(0, y), (size, y)], fill=(
            int(top[0] + (bot[0] - top[0]) * t),
            int(top[1] + (bot[1] - top[1]) * t),
            int(top[2] + (bot[2] - top[2]) * t), 255))
    # sun disc
    sun_r = size * 0.30
    d.ellipse([size * 0.5 - sun_r, size * 0.16 - sun_r, size * 0.5 + sun_r, size * 0.16 + sun_r],
              fill=(255, 214, 120, 255))
    # drink
    spr = Image.open(SRC).convert("RGBA")
    w = int(size * 0.82)
    spr = spr.resize((w, w), Image.LANCZOS)
    img.alpha_composite(spr, ((size - w) // 2, int(size * 0.14)))
    # rounded corners
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size, size], radius=int(size * 0.22), fill=255)
    img.putalpha(mask)
    img.save(out)
    print(out)


make(192, r"D:\cowork\Flicktail\assets\icon-192.png")
make(512, r"D:\cowork\Flicktail\assets\icon-512.png")

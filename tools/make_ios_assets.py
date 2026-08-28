"""iOS build assets: a flattened 1024 app icon (no alpha — App Store Connect
rejects transparency) and a 2732 launch image that matches the game's boot
background so the launch reads as the app appearing.
"""
from PIL import Image, ImageDraw

BASE = r"D:\cowork\Flicktail"


def icon_1024():
    src = Image.open(BASE + r"\assets\icon-512.png").convert("RGBA")
    src = src.resize((1024, 1024), Image.LANCZOS)
    flat = Image.new("RGB", (1024, 1024), (255, 158, 74))
    # the icon has rounded transparent corners; refill with the gradient edges
    grad = Image.new("RGB", (1024, 1024))
    d = ImageDraw.Draw(grad)
    top, bot = (255, 158, 74), (255, 61, 122)
    for y in range(1024):
        t = y / 1024
        d.line([(0, y), (1024, y)], fill=(
            int(top[0] + (bot[0] - top[0]) * t),
            int(top[1] + (bot[1] - top[1]) * t),
            int(top[2] + (bot[2] - top[2]) * t)))
    grad.paste(src, (0, 0), src)
    grad.save(BASE + r"\assets\icon-1024-ios.png")
    print("icon-1024-ios.png (mode RGB, no alpha)")


def splash_2732():
    img = Image.new("RGB", (2732, 2732), (6, 18, 31))
    icon = Image.open(BASE + r"\assets\drinks\tier04.png").convert("RGBA")
    w = 560
    icon = icon.resize((w, w), Image.LANCZOS)
    img.paste(icon, ((2732 - w) // 2, (2732 - w) // 2 - 60), icon)
    img.save(BASE + r"\assets\splash-2732.png")
    print("splash-2732.png")


icon_1024()
splash_2732()

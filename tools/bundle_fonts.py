"""Self-host the Google Fonts: pick the LATIN subset woff2 for each
family+weight, download it, and emit a local @font-face CSS. Removes the
runtime dependency on Google (offline promise + no IP leak / GDPR).
"""
import os
import re
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, "assets", "fonts", "gf.css")
OUT_DIR = os.path.join(ROOT, "assets", "fonts")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

text = open(CSS, encoding="utf-8").read()

# split into @font-face blocks, keep only the ones whose unicode-range covers
# basic latin (U+0000-00FF) — i.e. the plain "latin" subset, not latin-ext etc.
blocks = re.findall(r"@font-face\s*\{[^}]+\}", text)
faces = []
for b in blocks:
    if "U+0000-00FF" not in b:
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", b).group(1)
    wght = re.search(r"font-weight:\s*(\d+)", b).group(1)
    url = re.search(r"url\((https://[^)]+\.woff2)\)", b).group(1)
    faces.append((fam, wght, url))

css_lines = []
for fam, wght, url in faces:
    slug = fam.lower().replace(" ", "") + "-" + wght
    fn = slug + ".woff2"
    path = os.path.join(OUT_DIR, fn)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    data = urllib.request.urlopen(req).read()
    with open(path, "wb") as f:
        f.write(data)
    print(f"{fam} {wght} -> {fn} ({len(data)} bytes)")
    css_lines.append(
        "@font-face{font-family:'%s';font-style:normal;font-weight:%s;"
        "font-display:swap;src:url(../fonts/%s) format('woff2');}"
        % (fam, wght, fn)
    )

with open(os.path.join(OUT_DIR, "fonts.css"), "w", encoding="utf-8") as f:
    f.write("\n".join(css_lines) + "\n")
print("wrote fonts.css with", len(css_lines), "faces")

# Inserts a band of BAND px at the top of each card frame, holding the planted line at the SKU's left edge and the
# SKU's former cap top; everything below moves down by BAND. Usage: python3 compose.py <src design dir> <dst design dir>
import sys, shutil, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
BAND = 30
frames = {764: (15, 17), 601: (15, 17), 486: (16, 17), 280: (23, 21)}  # SKU cap top, SKU left
for w, (top, left) in frames.items():
    im = Image.open(f"{src}/card-{w}/reference.png").convert("RGB")
    W, H = im.size
    blank = lambda y: all(sum(im.getpixel((x, y))) == 765 for x in range(3, W - 3))
    cut = next(y for y in range(top - 1, 0, -1) if blank(y))
    row = im.crop((0, cut, W, cut + 1))
    out = Image.new("RGB", (W, H + BAND))
    out.paste(im.crop((0, 0, W, cut)), (0, 0))
    for y in range(BAND): out.paste(row, (0, cut + y))
    out.paste(im.crop((0, cut, W, H)), (0, cut + BAND))
    line = Image.open(f"line-{w}.png").convert("RGB")
    lp = line.load()
    ink = [(x, y) for x in range(line.width) for y in range(line.height) if sum(lp[x, y]) < 600]
    ix, iy = min(x for x, _ in ink), min(y for _, y in ink)
    # Cap top of the planted line where the SKU's cap top was; its left ink edge on the SKU's.
    out.paste(line, (left - ix, top - iy))
    os.makedirs(f"{dst}/card-{w}", exist_ok=True)
    out.save(f"{dst}/card-{w}/reference.png")
    print(w, (W, H), "->", out.size)

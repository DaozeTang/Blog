#!/usr/bin/env python3
"""Generate the pixel-art icon assets used by the blog.

The prompt mark is a 16x16 bitmap (chevron + underscore) exported with
nearest-neighbour scaling so the favicon stays crisp at 32 and 160.

Usage:  python3 scripts/pixel-art.py
Needs:  Pillow  (pip install pillow)
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "src" / "assets"

INK = (21, 22, 29, 255)
PAPER = (255, 250, 238, 255)
GREEN = (47, 163, 107, 255)


def prompt_mark():
    grid = [["." for _ in range(16)] for _ in range(16)]

    def rect(x, y, w, h, key):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                if 0 <= xx < 16 and 0 <= yy < 16:
                    grid[yy][xx] = key

    rect(2, 3, 2, 2, "g")
    rect(4, 5, 2, 2, "g")
    rect(6, 7, 2, 2, "g")
    rect(4, 9, 2, 2, "g")
    rect(2, 11, 2, 2, "g")
    rect(9, 11, 5, 2, "p")

    colors = {".": INK, "g": GREEN, "p": PAPER}
    image = Image.new("RGBA", (16, 16), INK)
    pixels = image.load()
    for y in range(16):
        for x in range(16):
            pixels[x, y] = colors[grid[y][x]]
    image.resize((32, 32), Image.NEAREST).save(ASSETS / "favicon.png", optimize=True)
    image.resize((160, 160), Image.NEAREST).save(ASSETS / "apple-touch-icon.png", optimize=True)
    print("favicon.png 32x32, apple-touch-icon.png 160x160")


if __name__ == "__main__":
    prompt_mark()

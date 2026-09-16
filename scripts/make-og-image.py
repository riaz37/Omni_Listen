# -*- coding: utf-8 -*-
"""Generates public/og-image.png, the social share card.

Run manually, not as part of the build:

    python scripts/make-og-image.py

`output: 'export'` rules out next/og's ImageResponse, which needs a runtime, so
the card has to be a committed static asset. This script exists so it can be
regenerated from the brand tokens rather than being an opaque binary nobody can
reproduce.

Design follows DESIGN.md: true dark background (#0a0a0a, not dark grey), neon
green as the only accent, Instrument Serif for display, left-aligned rather
than centred, and a subtle grain overlay instead of decoration.

Fonts: Geist ships in node_modules. Instrument Serif does not, so point
--serif at a local copy of the Google Fonts file (OFL, the same face the site
already loads through next/font):
  https://github.com/google/fonts/raw/main/ofl/instrumentserif/InstrumentSerif-Regular.ttf
"""
import argparse
import os
import random

from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT = 1200, 630

BACKGROUND = (10, 10, 10)          # #0a0a0a
FOREGROUND = (250, 250, 250)       # #fafafa
PRIMARY = (18, 222, 120)           # #12DE78
MUTED = (148, 163, 184)            # #94a3b8

MARGIN = 80
GRAIN_OPACITY = 0.035              # dark-mode value from DESIGN.md
GRAIN_SCALE = 3                    # noise cell size in px, see add_grain

# From the marketing brief's approved short captions.
HEADLINE = ["Record the conversation.", "Walk out with the notes", "already written."]
KICKER = "AI MEETING NOTES  ·  ARABIC AND ENGLISH"
URL = "omnilisten.esap.ai"

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SANS = os.path.join(REPO_ROOT, "node_modules", "geist", "dist", "fonts", "geist-sans", "Geist-Medium.ttf")
DEFAULT_LOGO = os.path.join(REPO_ROOT, "public", "logo.png")
DEFAULT_OUT = os.path.join(REPO_ROOT, "public", "og-image.png")


def add_grain(image, opacity):
    """Monochrome noise at low opacity. Tactile, not decorative.

    Generated at 1/GRAIN_SCALE resolution and upscaled with NEAREST, so the
    noise lands in flat blocks. Per-pixel noise reads the same at this opacity
    but defeats PNG's row filters and quadruples the file size.
    """
    rng = random.Random(7)  # fixed seed so regenerating is byte-stable
    small = (WIDTH // GRAIN_SCALE + 1, HEIGHT // GRAIN_SCALE + 1)
    noise = Image.new("L", small)
    noise.putdata([rng.randint(0, 255) for _ in range(small[0] * small[1])])
    noise = noise.resize((WIDTH, HEIGHT), Image.NEAREST)
    grain = Image.merge("RGB", (noise, noise, noise))
    return Image.blend(image, grain, opacity)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--serif", required=True, help="path to InstrumentSerif-Regular.ttf")
    parser.add_argument("--sans", default=DEFAULT_SANS)
    parser.add_argument("--logo", default=DEFAULT_LOGO)
    parser.add_argument("--out", default=DEFAULT_OUT)
    args = parser.parse_args()

    for label, path in (("serif", args.serif), ("sans", args.sans), ("logo", args.logo)):
        if not os.path.isfile(path):
            raise SystemExit("missing %s file: %s" % (label, path))

    canvas = Image.new("RGB", (WIDTH, HEIGHT), BACKGROUND)
    canvas = add_grain(canvas, GRAIN_OPACITY)
    draw = ImageDraw.Draw(canvas)

    serif_display = ImageFont.truetype(args.serif, 60)
    sans_20 = ImageFont.truetype(args.sans, 21)
    sans_26 = ImageFont.truetype(args.sans, 26)

    # Logo, top left. The asset is 1236x323, so scale by width and keep ratio.
    logo = Image.open(args.logo).convert("RGBA")
    logo_w = 258
    logo_h = round(logo.height * logo_w / logo.width)
    logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
    canvas.paste(logo, (MARGIN, MARGIN), logo)

    # Kicker, letterspaced by hand since PIL has no tracking control.
    kicker_y = MARGIN + logo_h + 40
    x = MARGIN
    for char in KICKER:
        draw.text((x, kicker_y), char, font=sans_20, fill=PRIMARY)
        x += draw.textlength(char, font=sans_20) + 2.4

    # Headline. Left-aligned; DESIGN.md calls centring everything an anti-pattern.
    y = kicker_y + 52
    line_height = 72
    for i, line in enumerate(HEADLINE):
        draw.text((MARGIN, y + i * line_height), line, font=serif_display, fill=FOREGROUND)

    # Green rule above the footer, the single accent element.
    rule_y = HEIGHT - MARGIN - 34
    draw.rectangle([MARGIN, rule_y, MARGIN + 64, rule_y + 4], fill=PRIMARY)

    draw.text((MARGIN, rule_y + 22), URL, font=sans_26, fill=MUTED)

    # Four flat brand colours plus block grain, so a 64-colour palette is
    # visually lossless here and cuts the file by roughly 10x. Social
    # scrapers commonly cap the image they will fetch.
    canvas = canvas.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE)
    canvas.save(args.out, "PNG", optimize=True)
    print("wrote %s (%dx%d, %d bytes)" % (args.out, WIDTH, HEIGHT, os.path.getsize(args.out)))


if __name__ == "__main__":
    main()

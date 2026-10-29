"""Create 1200x630 social-sharing images (JPEG) in public/og from the site's real, approved photographs.
Each is a centre crop of an optimized copy in public/images; originals are never touched.
Run from the project root: python -I scripts/build-og-images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "images"
OUT = ROOT / "public" / "og"
W, H = 1200, 630

# og name -> (source photo, vertical focus 0=top .. 1=bottom)
JOBS = {
    "default": ("hero/resort-and-hill.webp", 0.45),
    "rooms": ("rooms/twin-balcony.webp", 0.5),
    "restaurant": ("events/restaurant-hall-evening.webp", 0.5),
    "events": ("events/stage-pavilion.webp", 0.5),
    "khandoli": ("khandoli/hill-sunset.webp", 0.5),
    "gallery": ("resort/aerial-dusk.webp", 0.5),
    "room-deluxe": ("rooms/deluxe-room.webp", 0.55),
    "room-twin": ("rooms/twin-room.webp", 0.5),
    "room-suite": ("rooms/suite-room.webp", 0.55),
}

OUT.mkdir(parents=True, exist_ok=True)
for name, (src, focus) in JOBS.items():
    im = Image.open(IMG / src).convert("RGB")
    target = W / H
    if im.width / im.height > target:  # too wide: crop sides
        new_w = round(im.height * target)
        left = (im.width - new_w) // 2
        box = (left, 0, left + new_w, im.height)
    else:  # too tall: crop top/bottom around the focus point
        new_h = round(im.width / target)
        top = round((im.height - new_h) * focus)
        box = (0, top, im.width, top + new_h)
    im.crop(box).resize((W, H), Image.LANCZOS).save(OUT / f"{name}.jpg", "JPEG", quality=82, optimize=True, progressive=True)
    print(f"{name}.jpg  {(OUT / f'{name}.jpg').stat().st_size // 1024} KB  from {src}")

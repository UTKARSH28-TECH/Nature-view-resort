"""Create web-optimized WebP copies of the supplied photos in public/images.
Originals are never modified. Images awaiting consent are deliberately NOT listed here:
  experiences/kitty party.png, experiences/winter -1.png
Run: python -I scripts/optimize-images.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "images"
MAX_W = 2000

MAP = {
    "hero/hero-1.png": "hero/resort-and-hill.webp",
    "hero/hero-2.png": "hero/suite-interior.webp",
    "hero/hero-3.png": "events/restaurant-hall-evening.webp",
    "hero/hero-4.png": "events/birthday-setup.webp",
    "resort/cover.png": "resort/aerial-dusk.webp",
    "experiences/party-1.png": "resort/aerial-night.webp",
    "food/outer restraunt.png": "resort/cottages-dusk.webp",
    "food/outer restraunt -1.png": "events/stage-pavilion.webp",
    "food/restraunt birthday.png": "events/long-table-hall.webp",
    "food/dosa.png": "food/dosa.webp",
    "food/gulab jamun.png": "food/gulab-jamun.webp",
    "food/kadhai paneer.png": "food/kadhai-paneer.webp",
    "food/noodles.png": "food/noodles.webp",
    "khandoli/khandoli1.png": "khandoli/hill-and-park.webp",
    "khandoli/khandoli2.png": "khandoli/hill-sunset.webp",
    "khandoli/khandoli boating.png": "khandoli/boating.webp",
    "khandoli/khandoli scenic views.png": "khandoli/lake-and-jetty.webp",
    "khandoli/khandoli birds.png": "khandoli/birds-on-water.webp",
    "rooms/deluxe room with lake view/bed delux room.png": "rooms/deluxe-bed.webp",
    "rooms/deluxe room with lake view/delux room photo.png": "rooms/deluxe-room.webp",
    "rooms/deluxe room with lake view/balconny2.png": "rooms/deluxe-balcony.webp",
    "rooms/deluxe room with lake view/delux bathroom.png": "rooms/deluxe-bathroom.webp",
    "rooms/deluxe twin room with balcony hill and lake view/twin room.png": "rooms/twin-room.webp",
    "rooms/deluxe twin room with balcony hill and lake view/twin room balcony.png": "rooms/twin-balcony.webp",
    "rooms/deluxe twin room with balcony hill and lake view/toilet wide.png": "rooms/twin-bathroom.webp",
    "rooms/executive suite with private balcony/suite room .png": "rooms/suite-room.webp",
    "rooms/executive suite with private balcony/suite room balcony.png": "rooms/suite-balcony.webp",
    "rooms/executive suite with private balcony/suite room tv.png": "rooms/suite-tv-wall.webp",
    "rooms/executive suite with private balcony/suite room bathroom.png": "rooms/suite-bathroom.webp",
}

for src, dst in MAP.items():
    im = Image.open(ROOT / src).convert("RGB")
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    target = OUT / dst
    target.parent.mkdir(parents=True, exist_ok=True)
    im.save(target, "WEBP", quality=80, method=6)
    print(f"{dst:45s} {im.width}x{im.height} {target.stat().st_size//1024} KB")

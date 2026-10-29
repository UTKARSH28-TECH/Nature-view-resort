"""Render the printed menu pages for the website and build a public menu PDF.

Pages are rendered from the PDFs exactly as displayed (not from the embedded raster, which holds an older
version of the menu). The UPI payment page and the cover page (Menu Card 2, page 1) are NOT included.
Originals in food/ are never modified.
Run from the project root: python -I scripts/build-menu-assets.py
"""
import io
from pathlib import Path

import pymupdf
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FOOD = ROOT / "food"
IMG_OUT = ROOT / "public" / "images" / "menu"
PDF_OUT = ROOT / "public" / "downloads" / "nature-view-menu.pdf"
DPI = 170

# (file, page index, half) in printed order. Menu Card 2 page index 0 (QR + cover) is deliberately skipped.
PAGES = [
    ("NATURE VIEW MENU CARD.pdf", 0, "L"),
    ("NATURE VIEW MENU CARD.pdf", 0, "R"),
    ("NATURE VIEW MENU CARD.pdf", 1, "L"),
    ("NATURE VIEW MENU CARD.pdf", 1, "R"),
    ("NATURE VIEW MENU CARD 2.pdf", 1, "L"),
    ("NATURE VIEW MENU CARD 2.pdf", 1, "R"),
]


def main():
    IMG_OUT.mkdir(parents=True, exist_ok=True)
    PDF_OUT.parent.mkdir(parents=True, exist_ok=True)
    out_pdf = pymupdf.open()
    docs = {}
    for n, (name, pidx, half) in enumerate(PAGES, start=1):
        doc = docs.setdefault(name, pymupdf.open(FOOD / name))
        page = doc[pidx]
        w, h = page.rect.width, page.rect.height
        clip = pymupdf.Rect(0, 0, w / 2, h) if half == "L" else pymupdf.Rect(w / 2, 0, w, h)
        pix = page.get_pixmap(dpi=DPI, clip=clip)
        im = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        im.save(IMG_OUT / f"page-{n}.webp", "WEBP", quality=82, method=6)
        jpg = io.BytesIO()
        im.save(jpg, "JPEG", quality=85)
        pg = out_pdf.new_page(width=w / 2, height=h)
        pg.insert_image(pg.rect, stream=jpg.getvalue())
        print(f"page-{n}.webp {im.width}x{im.height} {(IMG_OUT / f'page-{n}.webp').stat().st_size // 1024} KB")
    out_pdf.set_metadata({"title": "Nature View Resort & Family Restaurant - Menu"})
    out_pdf.save(PDF_OUT, deflate=True)
    print(f"{PDF_OUT.name}: {PDF_OUT.stat().st_size // 1024} KB, {len(out_pdf)} pages")


if __name__ == "__main__":
    main()

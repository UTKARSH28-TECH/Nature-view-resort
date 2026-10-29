# Menu: source inventory and items to confirm

## Source files (originals in `food/`, never modified)

| File | Pages | Used for |
|---|---|---|
| `NATURE VIEW MENU CARD.pdf` | 1 spread (1296x864 pt) = printed pages 1-2, spread 2 = pages 3-4 | Digital menu + printed pages 1-4 |
| `NATURE VIEW MENU CARD 2.pdf` | spread 1 = **UPI QR page + cover**, spread 2 = printed pages 5-6 | Digital menu + printed pages 5-6 |

The UPI QR page and the cover are **not** used anywhere (not in the site, the viewer or the downloadable PDF).

## How the data was produced

- **240 dishes in 18 sections** are in `src/data/menu.json`. Prices were read from the PDF text layer and checked against the rendered pages; `scripts/build-menu-data.py` fails if a section's dish count differs from its price count.
- Dish names are not in the PDF text layer, so they were transcribed by eye from the rendered pages (spelling kept exactly as printed).
- Printed-page images (`public/images/menu/page-1..6.webp`) and `public/downloads/nature-view-menu.pdf` come from `scripts/build-menu-assets.py`, which renders the pages as displayed.

## Problem found in the supplied PDFs

Each menu PDF page embeds an **older full-page raster with outdated prices** (e.g. Chicken Cutlet 225 vs 275 on the card, Chicken Tandoor "H/f"), which is covered on screen by the current text. The site uses only the rendered, current pages. The PDF text layer also holds a few stray hidden numbers (e.g. "250", "360/-") that were ignored. If you share the original PDFs elsewhere, consider re-exporting them from the design file.

## To confirm with the resort

1. **"F/H"** (Dal Tadka, Chicken Tandoor, Chicken Dehati, Handi Mutton, Fish Curry, Fish Fry): shown as "F" and "H" exactly as printed. Presumably Full/Half; please confirm and say what the "(6pcs/3pc)" and "(4pcs/2pc)" refer to.
2. **Kulcha (Plain/ Butter) 110**: only one price is printed although the name lists two variants.
3. **Spelling as printed** (shown unchanged on the site until you approve corrections):
   Lolipop, Chiness Bhel, Chupsuey, Choupsuuey, Chousuey, "Mix Chowmein (nnon- Veg)", Peeper (x2), "Classes Mushroom",
   Manchaska, "Panner" (x4), Hydrabadi, Lawabdar, Fraizi (x2), "Veg Keema Cury", Vegitable, Mehti, Pappar, "F. rice",
   Miniral Water, "Veg Noddles Soup", "Veg Sweets Corn Soup", "Break Fast", "Main Course Vegeterain / Non Vegeterian",
   "Tantoor Veg Starter", "Egg Pouch" (Poach?), "Chicken Dahi".
4. **"Chicken Murg Masalam (Full)" 900** and **"Chicken Stuffed Tandoori" 649** are the highest prices; confirm they are not typos.
5. **Dietary labels**: only the section titles say Veg / Non Veg, so the site has no veg/non-veg filter. Noodles, Soup, Rice, Egg, Fish etc. are not labelled on the card.
6. **Photos**: `kadhai-paneer` and `noodles` are shown as illustrative photographs only; confirm whether they show dishes cooked at the resort. No other dish photos are used. `dosa` and `gulab jamun` are not on the menu card and are not used on the restaurant page.
7. **Opening hours, table booking and any minimum order**: not on the card, so not shown.

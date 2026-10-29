"""One-off extraction of the printed menu into src/data/menu.json.

Prices come from the PDF text layer (exact numbers). Dish names are not in the text layer, so they were
transcribed by eye from the *rendered* PDF pages (the PDFs also embed an older raster with outdated prices;
it is covered on screen and must not be used). The script asserts that the number of names in each section
equals the number of prices found in that page half, so a missed or extra line fails loudly.

Spellings are kept exactly as printed. Edit src/data/menu.json directly afterwards.
Run from the project root: python -I scripts/build-menu-data.py
"""
import json
import re
import sys
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent.parent
FOOD = ROOT / "food"
PRICE_LINE = re.compile(r"^\d+(\s*/\s*\d+)*\s+/-$")  # genuine prices always have a space before "/-"

M1 = "NATURE VIEW MENU CARD.pdf"
M2 = "NATURE VIEW MENU CARD 2.pdf"

# (pdf, page index, half, printed page number, [(category title, [dish names as printed])])
SPREADS = [
    (M1, 0, "L", 1, [
        ("NON VEG STARTER", [
            "Chicken Cutlet", "Chicken Pakora (Bone/Boneless)", "Chicken Lolipop ( 6pcs)", "Chicken 65 (8pcs)",
            "Chicken Spring Roll", "Chicken Drumsticks (6pcs)", "Chicken Chatpata", "Egg Pakora (8 pcs)",
            "Chicken Chilli (8pc) (Dry/Gravy)"]),
        ("TANDOOR NON VEG", [
            "Chicken Tikka (6pcs)", "Chicken Malai Tikka", "Chicken Hariyali Tikka", "Chicken Leg Kabab",
            "Chicken Bharwa Kabab", "Chicken Resmi Kabab", "Chicken Stuffed Tandoori", "Chicken Afgani Kabab",
            "Chicken Seek Kabab", "Chicken Tandoor (F/H)", "Lemon Chicken", "Tandoori Pomfret(1pc)"]),
    ]),
    (M1, 0, "R", 2, [
        ("NOODLES & CHOPSUEY", [
            "Vegetable Chowmein", "Veg Hakka Chowmein", "Veg Mix Chowmein", "Paneer Chowmein", "Mushroom Chowmein",
            "Veg Chilli Garlic Noodles", "Veg Schezwan Noodles", "Veg Gravy Chowmein", "Chiness Bhel",
            "Veg American Chopsuey", "Veg Chinese Chupsuey", "Egg Chowmein", "Chicken Chowmein",
            "Mix Chowmein (nnon- Veg)", "Chicken Gravy Noodles", "Chicken Schezwan Noodles",
            "Chicken Singapuri Noodles", "Chicken American Choupsuuey", "Chicken Chinese Chousuey"]),
        ("VEG STARTERS", [
            "American Corn Salt & Peeper", "American Corn Saute", "American Corn Honey Chilli", "Cheese Ball",
            "Cheese Pakora", "Cheese Chilli", "Veg Manchurian", "Mushroom Salt & Peeper", "Classes Mushroom",
            "Veg Hara Bhara Kabab", "Vegetable Cutlet", "Vegetable Pakora", "Veg Lolipop", "Veg Spring Roll",
            "Paneer Drumstick", "Paneer Manchaska", "Paneer Cutlet", "Paneer Pakora", "Junglee Paneer",
            "Chitta Pakora", "Chana Kurkure", "Onion Pakora", "French Fries", "Peanut Masala", "Paneer 65",
            "Paneer Chilli Dry/gravy", "Crispy Chilli Baby Corn", "Crispy Chilli Chana", "Crispy Chili Mushroom"]),
    ]),
    (M1, 1, "L", 3, [
        ("ROTI NAAN KULCHA", [
            "Tandoori Roti (Plain/Butter)", "Tawa Roti (Plain/Butter)", "Naan (Plain/ Butter)",
            "Naan ( Masala/garlic/ Shahi)", "Cheese Naan", "Kulcha (Plain/ Butter)", "Onion Kulcha",
            "Lachha Paratha"]),
        ("DAL", ["Plain Dal", "Dal Tadka (F/H)", "Yellow Dal Fry", "Egg Dal Tadka", "Dal Makhani"]),
        ("MAIN COURSE VEGETERAIN", [
            "Paneer Butter Masala", "Paneer Masala", "Paneer Tika Butter Masala", "Panner Do Pyaza",
            "Paneer Jhal Fraizi", "Shahi Paneer", "Paneer Kolhapuri", "Paneer Hydrabadi",
            "Paneer Mushroom Kolhapuri", "Matar Paneer", "Paneer Bhurji", "Paneer Lawabdar",
            "Paneer Mushroom Masala", "Paneer Keema Curry", "Paneer Kadhai", "Paneer Shimla", "Chana Paneer",
            "Palak Paneer", "Palak Cream", "Palak Matar", "Aloo Palak", "Corn Palak", "Paneer Malai Kofta",
            "Paneer Angori Kofta", "Veg Kofta", "Veg Angori Kofta", "Veg Keema Cury", "Green Peas Curry",
            "Green Peas Masala", "Mix Vegitable", "Veg Jhal Fraizi", "Veg Navratan Korma", "Mehti Malai Matar",
            "Mushroom Masala", "Mushroom Do Pyaza", "Mushroom Matar", "Babycorn Masala", "Aloo Masala",
            "Aloo Matar", "Aloo Dum", "Aloo Do Pyaza", "Aloo (Gobhi/patal)", "Aloo Bhujiya", "Bhindi Bhujiya"]),
    ]),
    (M1, 1, "R", 4, [
        ("TANTOOR VEG STARTER", [
            "Paneer Tikka", "Paneer Malai Tikka", "Paneer Haryali tikka", "Panner achari Tikka", "Mushroom Tikka",
            "Potato Tikka", "Vegetable seek Kabab", "Panner seek kabab"]),
        ("RICE, PULAO & BIRYANI", [
            "Steam Rice", "Veg Pulao", "Paneer Pulao", "Peas pulao", "Shahi Pulao", "Veg Biryani", "Veg Fried Rice",
            "Mix Veg Fried Rice", "Jeera Fried Rice", "Chilli Garlic Fried Rice", "Ginger Shimla Fried Rice",
            "Garlic Red Pappar Rice", "Schezwan Fried Rice", "Corn Panner Fried Rice", "Veg chow Chow Rice",
            "Chicken Schezwan F. rice", "Mix Fried Rice ( Non-Veg)", "Chicken Biryani", "Mutton Biryani",
            "Egg Biryani", "Egg Fried Rice"]),
    ]),
    (M2, 1, "L", 5, [
        ("BEVERAGE", [
            "Tea", "Coffee", "Cold Drinks", "Masala Cold Drinks", "Fresh Lemon Soda (salt/sugar)", "Miniral Water",
            "Milk", "Lassi", "Chaach", "Blue Lagoon / Mojito", "Cold Coffee"]),
        ("SALAD & RAITA", [
            "Green Salad", "Cucumber Salad", "Julienne Salad", "Onion Salad", "Fruit Salad", "Mix Raita",
            "Onion Raita", "Bundi Raita", "Pineapple Raita", "Curd"]),
        ("BREAK FAST", [
            "Toast Butter (4pcs)", "Vegetable Sandwich", "Paneer Sandwich", "Cheese Sandwich", "Chhola Bhatura",
            "Extra Bhatura", "Paratha (aloo/sattu/ Gobhi)", "Puri Sabji"]),
        ("SOUP", [
            "Vegetable Soup", "Veg Clear Soup", "Tomato Soup", "Veg Sweets Corn Soup", "Veg Manchow Soup",
            "Veg Hot N Sour Soup", "Veg Noddles Soup", "Mushroom Soup", "Chicken Cream Soup",
            "Chicken Mushroom Soup", "Chicken Clear Soup", "Chicken Sweets Corn Soup", "Chicken Hot N Sour Soup",
            "Chicken Manchow Soup", "Chicken Noodles Soup", "Tomato Egg Drop Soup"]),
        ("PAPAD", ["Papad", "Papad Fried", "Masala Papad"]),
    ]),
    (M2, 1, "R", 6, [
        ("MAIN COURSE NON VEGETERIAN", [
            "Chicken Curry (4pc)", "Chicken Kassa", "Chicken Korma (4pc)", "Chicken Dehati (F/H)",
            "Chicken Murg Masalam (Full)", "Chicken Masala (4 pc)", "Chicken Butter Masala (4pc)",
            "Chicken Kadhai", "Chicken Dahi", "Chicken Bharta", "Chicken Muglai (4pc)", "Chicken Do Pyaza",
            "Chicken Barrah Kabab B. Masala", "Chicken Reshmi Kabab B. Masala", "Chicken Tikka Butter Masala",
            "Chicken Leg Kabab B. Masala", "Chicken Lawabdar"]),
        ("MUTTON", [
            "Mutton Curry (4pc)", "Mutton Masala", "Mutton Bhuna (4pc)", "Handi Mutton (6pcs/3pc) (F/H)"]),
        ("EGG", [
            "Egg Curry", "Omelette Curry", "Egg Masala", "Egg Do Pyaza", "Egg Bhurji", "Omelette",
            "Cheese Omelette", "Masala Omelette", "Boiled Egg (4pc)", "Egg Pouch"]),
        ("FISH", [
            "Fish Curry (4pcs/2pc) (F/H)", "Fish Masala (4pc)", "Fish Dahi (4pc)", "Fish Butter Masala (4pc)",
            "Fish Do Pyaza", "Fish Fry (4pcs/2pc) (F/H)"]),
    ]),
]


def price_lines(page, half):
    """Genuine price lines in one half of a spread, top to bottom."""
    found = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"]).strip()
            x0, y0 = line["bbox"][0], line["bbox"][1]
            on_half = x0 < 648 if half == "L" else x0 >= 648
            if on_half and PRICE_LINE.match(text):
                found.append((y0, [int(n) for n in re.findall(r"\d+", text)]))
    return [p for _, p in sorted(found, key=lambda t: t[0])]


def variants_for(name, n):
    if n == 1:
        return None
    if "Plain/" in name:
        labels = ["Plain", "Butter"]
    elif "(F/H)" in name:
        labels = ["F", "H"]
    else:
        raise SystemExit(f"Cannot label {n} prices for {name!r}")
    if len(labels) != n:
        raise SystemExit(f"Label/price mismatch for {name!r}")
    return labels


def slug(title):
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def main():
    docs = {}
    categories = []
    for pdf, pidx, half, printed_page, cats in SPREADS:
        doc = docs.setdefault(pdf, pymupdf.open(FOOD / pdf))
        prices = price_lines(doc[pidx], half)
        names = [n for _, ns in cats for n in ns]
        if len(prices) != len(names):
            sys.exit(f"{pdf} p{pidx + 1}{half}: {len(names)} names but {len(prices)} prices")
        cursor = 0
        for title, ns in cats:
            items = []
            for n in ns:
                p = prices[cursor]
                cursor += 1
                item = {"name": n, "prices": p}
                v = variants_for(n, len(p))
                if v:
                    item["variants"] = v
                items.append(item)
            categories.append({"id": slug(title), "title": title, "page": printed_page, "items": items})

    out = ROOT / "src" / "data" / "menu.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"categories": categories}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    total = sum(len(c["items"]) for c in categories)
    print(f"{len(categories)} categories, {total} items written to {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

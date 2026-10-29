import menuJson from "./menu.json";

/**
 * Digital menu, transcribed from the printed menu card (see scripts/build-menu-data.py and
 * docs/MENU-TO-CONFIRM.md). Names and prices live in menu.json exactly as printed; this module only
 * adds types and small display helpers. Do not add dishes, prices or dietary labels that are not on the card.
 */

export type MenuItem = {
  name: string;
  /** Rupees, in printed order. One entry unless the card prints two portions/variants. */
  prices: number[];
  /** Labels exactly as printed next to the prices, e.g. ["F", "H"] or ["Plain", "Butter"]. */
  variants?: string[];
};

export type MenuCategory = {
  id: string;
  title: string;
  /** Page of the printed menu (1-6) in /images/menu/page-N.webp. */
  page: number;
  items: MenuItem[];
};

export const MENU: MenuCategory[] = menuJson.categories as MenuCategory[];

export const MENU_PAGE_COUNT = 6;
export const MENU_PAGE_IMAGE = (n: number) => `/images/menu/page-${n}.webp`;
export const MENU_PDF = "/downloads/nature-view-menu.pdf";

export const MENU_ITEM_COUNT = MENU.reduce((n, c) => n + c.items.length, 0);

/** "NON VEG STARTER" -> "Non Veg Starter". Spelling is left as printed. */
export function titleCase(s: string): string {
  return s.toLowerCase().replace(/(^|[\s(/])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());
}

/** Whitespace tidy only ("( 6pcs)" -> "(6pcs)"); never changes wording. */
export function tidyName(s: string): string {
  return s.replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim();
}

export function findItem(name: string): MenuItem | undefined {
  for (const c of MENU) {
    const hit = c.items.find((i) => i.name === name);
    if (hit) return hit;
  }
  return undefined;
}

export function categoryById(id: string): MenuCategory | undefined {
  return MENU.find((c) => c.id === id);
}

export function lowestPrice(category: MenuCategory): number {
  return Math.min(...category.items.flatMap((i) => i.prices));
}

export const rupees = (n: number) => `₹${n}`;

/** Pages of the printed menu with the sections printed on them, for the viewer captions. */
export const MENU_PAGES = Array.from({ length: MENU_PAGE_COUNT }, (_, i) => {
  const page = i + 1;
  return { page, src: MENU_PAGE_IMAGE(page), sections: MENU.filter((c) => c.page === page).map((c) => titleCase(c.title)) };
});

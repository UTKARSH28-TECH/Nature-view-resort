import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { generateMetadata as roomMetadata } from "@/app/rooms/[slug]/page";
import { metadata as bookMeta } from "@/app/book/page";
import { metadata as contactMeta } from "@/app/contact/page";
import { metadata as eventsMeta } from "@/app/events/page";
import { metadata as enquiryMeta } from "@/app/events/enquiry/page";
import { metadata as galleryMeta } from "@/app/gallery/page";
import { metadata as homeMeta } from "@/app/page";
import { metadata as khandoliMeta } from "@/app/khandoli/page";
import { metadata as privacyMeta } from "@/app/privacy/page";
import { metadata as restaurantMeta } from "@/app/restaurant/page";
import { metadata as roomsMeta } from "@/app/rooms/page";
import { ROOM_LIST } from "@/lib/rooms";
import {
  OG_IMAGES,
  breadcrumbJsonLd,
  getSiteUrl,
  indexingEnabled,
  jsonLdString,
  pageMetadata,
  resortJsonLd,
  restaurantJsonLd,
  siteOrigin,
} from "@/lib/seo";

const ROOT = path.resolve(__dirname, "..");
const ENV = { NEXT_PUBLIC_SITE_URL: "https://www.example.test" };

const titleOf = (m: { title?: unknown }) => {
  const t = m.title as string | { absolute?: string } | undefined;
  return typeof t === "string" ? t : (t?.absolute ?? "");
};

async function allMetadata() {
  const rooms = await Promise.all(ROOM_LIST.map((r) => roomMetadata({ params: Promise.resolve({ slug: r.slug }) })));
  return [
    ["/", homeMeta], ["/rooms", roomsMeta], ["/restaurant", restaurantMeta], ["/events", eventsMeta],
    ["/events/enquiry", enquiryMeta], ["/khandoli", khandoliMeta], ["/gallery", galleryMeta], ["/book", bookMeta],
    ["/contact", contactMeta], ["/privacy", privacyMeta],
    ...ROOM_LIST.map((r, i) => [`/rooms/${r.slug}`, rooms[i]] as const),
  ] as const;
}

describe("site URL and indexing switch", () => {
  it("accepts only a real http(s) origin", () => {
    expect(getSiteUrl(ENV)).toBe("https://www.example.test");
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://www.example.test/some/path?x=1" })).toBe("https://www.example.test");
    expect(getSiteUrl({})).toBeNull();
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "not a url" })).toBeNull();
    expect(getSiteUrl({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" })).toBeNull();
    expect(siteOrigin({})).toBe("http://localhost:3000");
  });

  it("blocks indexing without a site URL and on preview deployments", () => {
    expect(indexingEnabled({})).toBe(false);
    expect(indexingEnabled(ENV)).toBe(true);
    expect(indexingEnabled({ ...ENV, VERCEL_ENV: "production" })).toBe(true);
    expect(indexingEnabled({ ...ENV, VERCEL_ENV: "preview" })).toBe(false);
  });
});

describe("robots.txt and sitemap.xml", () => {
  it("disallows everything when no public URL is configured (default test environment)", () => {
    expect(process.env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("lists every public page exactly once and nothing private", () => {
    const paths = sitemap().map((e) => new URL(e.url).pathname);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toEqual(
      expect.arrayContaining(["/", "/rooms", "/restaurant", "/events", "/events/enquiry", "/khandoli", "/gallery", "/book", "/contact", "/privacy", ...ROOM_LIST.map((r) => `/rooms/${r.slug}`)]),
    );
    expect(paths.some((p) => p.startsWith("/api") || p.includes("experiences") || p.includes("__"))).toBe(false);
    expect(sitemap().every((e) => !("lastModified" in e))).toBe(true); // no invented dates
  });
});

describe("page metadata", () => {
  it("every public page has a unique title and description of sensible length, a canonical, Open Graph and a Twitter card", async () => {
    const all = await allMetadata();
    const titles = new Set<string>();
    const descs = new Set<string>();
    for (const [route, m] of all) {
      const title = titleOf(m);
      const desc = String(m.description ?? "");
      expect(title.length, `${route} title`).toBeGreaterThan(8);
      expect(title.length, `${route} title`).toBeLessThanOrEqual(72);
      expect(desc.length, `${route} description`).toBeGreaterThanOrEqual(70);
      expect(desc.length, `${route} description`).toBeLessThanOrEqual(175);
      expect(titles.has(title), `${route} duplicate title`).toBe(false);
      expect(descs.has(desc), `${route} duplicate description`).toBe(false);
      titles.add(title);
      descs.add(desc);
      expect(m.alternates?.canonical, `${route} canonical`).toBe(route);
      const og = m.openGraph as { images?: { url: string }[]; title?: string } | undefined;
      expect(og?.images?.[0]?.url, `${route} og image`).toMatch(/^\/og\/.+\.jpg$/);
      expect(og?.title, `${route} og title`).toBeTruthy();
      expect((m.twitter as { card?: string } | undefined)?.card).toBe("summary_large_image");
    }
  });

  it("uses a real photo for every social image and the files exist", () => {
    for (const url of Object.values(OG_IMAGES)) {
      const file = path.join(ROOT, "public", url);
      expect(statSync(file).size, url).toBeGreaterThan(20_000);
    }
  });

  it("mentions the location where natural, without claiming anything unverified", async () => {
    const all = await allMetadata();
    const text = all.map(([, m]) => `${titleOf(m)} ${m.description}`).join(" ");
    expect(text).toMatch(/Khandoli/);
    expect(text).toMatch(/Giridih/);
    expect(text).not.toMatch(/award|rated|\d(\.\d)? ?stars?|best |#1|luxury|cheapest|\bfrom (Rs|INR|₹)/i);
  });

  it("pageMetadata builds absolute-title and noindex variants", () => {
    const m = pageMetadata({ title: "X", description: "d".repeat(80), path: "/x", absoluteTitle: true, noindex: true });
    expect(m.title).toEqual({ absolute: "X" });
    expect(m.robots).toEqual({ index: false, follow: true });
  });
});

describe("structured data", () => {
  const forbidden = ["aggregateRating", "review", "priceRange", "openingHours", "openingHoursSpecification", "geo", "amenityFeature", "sameAs", "starRating", "acceptsReservations", "servesCuisine"];

  it("contains only verified business facts", () => {
    for (const data of [resortJsonLd(ENV), restaurantJsonLd(ENV)]) {
      for (const key of forbidden) expect(data, key).not.toHaveProperty(key);
      expect(data.telephone).toBe("+918789905694");
      expect(data.address).toMatchObject({ addressLocality: "Giridih", addressRegion: "Jharkhand", postalCode: "815302", addressCountry: "IN" });
      expect(JSON.stringify(data)).toContain("https://www.example.test/");
    }
    expect(resortJsonLd(ENV)["@type"]).toBe("Resort");
    expect(restaurantJsonLd(ENV)["@type"]).toBe("Restaurant");
  });

  it("breadcrumbs are numbered and absolute", () => {
    const b = breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Rooms", path: "/rooms" }], ENV);
    expect(b.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(b.itemListElement[1].item).toBe("https://www.example.test/rooms");
  });

  it("serialises safely inside a script tag", () => {
    const s = jsonLdString({ name: "</script><script>alert(1)</script> & <!--" });
    expect(s).not.toContain("<");
    expect(s).not.toContain(">");
    expect(JSON.parse(s).name).toBe("</script><script>alert(1)</script> & <!--");
  });
});

describe("source hygiene", () => {
  const files: string[] = [];
  (function walk(d: string) {
    for (const n of readdirSync(d)) {
      const p = path.join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx$/.test(p)) files.push(p);
    }
  })(path.join(ROOT, "src"));

  it("has no raw <img> tags (all photos go through next/image for sizing and lazy loading)", async () => {
    const { readFileSync } = await import("node:fs");
    for (const f of files) expect(readFileSync(f, "utf8"), path.relative(ROOT, f)).not.toMatch(/<img[\s>]/);
  });
});

import type { Metadata } from "next";
import { LINKS, SITE } from "./site";

/**
 * SEO helpers: site URL, indexing switch, per-page metadata and structured data.
 * Server-side only. Everything here comes from confirmed business details in site.ts; nothing is invented
 * (no ratings, prices, opening hours, amenities, coordinates or social profiles).
 */

/** The public address of the site, from NEXT_PUBLIC_SITE_URL (e.g. https://www.example.com). Null if not configured. */
export function getSiteUrl(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/** Used for metadataBase so relative URLs resolve. Falls back to localhost, which is why indexing is off without a real URL. */
export const siteOrigin = (env?: Record<string, string | undefined>) => getSiteUrl(env) ?? "http://localhost:3000";

/**
 * Search engines may index the site only when a real public URL is configured and this is not a preview deployment.
 * This stops preview URLs and an unconfigured site from being indexed by accident.
 */
export function indexingEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return getSiteUrl(env) !== null && env.VERCEL_ENV !== "preview";
}

export const absoluteUrl = (path: string, env?: Record<string, string | undefined>) => new URL(path, siteOrigin(env)).toString();

export const OG_IMAGES = {
  default: "/og/default.jpg",
  rooms: "/og/rooms.jpg",
  restaurant: "/og/restaurant.jpg",
  events: "/og/events.jpg",
  khandoli: "/og/khandoli.jpg",
  gallery: "/og/gallery.jpg",
  "deluxe-room-with-lake-view": "/og/room-deluxe.jpg",
  "deluxe-twin-room-with-balcony-hill-and-lake-view": "/og/room-twin.jpg",
  "executive-suite-with-private-balcony": "/og/room-suite.jpg",
} as const;

export type OgKey = keyof typeof OG_IMAGES;

/** Standard page metadata: title, description, canonical URL, Open Graph and Twitter card with a real photo. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: OgKey;
  /** Use the title exactly as given instead of appending " | Nature View Resort". */
  absoluteTitle?: boolean;
  noindex?: boolean;
}): Metadata {
  const image = OG_IMAGES[opts.image ?? "default"];
  const fullTitle = opts.absoluteTitle ? opts.title : `${opts.title} | ${SITE.name}`;
  return {
    title: opts.absoluteTitle ? { absolute: opts.title } : opts.title,
    description: opts.description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_IN",
      title: fullTitle,
      description: opts.description,
      url: opts.path,
      images: [{ url: image, width: 1200, height: 630, alt: `${SITE.name}, Khandoli, Giridih` }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: opts.description, images: [image] },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ---- structured data (schema.org JSON-LD), limited to verified facts ----

const address = {
  "@type": "PostalAddress",
  streetAddress: SITE.address.lines.slice(0, 2).join(", "),
  addressLocality: "Giridih",
  addressRegion: "Jharkhand",
  postalCode: SITE.address.postalCode,
  addressCountry: "IN",
};

export function resortJsonLd(env?: Record<string, string | undefined>) {
  return {
    "@context": "https://schema.org",
    "@type": "Resort",
    "@id": absoluteUrl("/#resort", env),
    name: SITE.name,
    description: "Resort and family restaurant near Khandoli Dam, Giridih, Jharkhand, with rooms, a restaurant and spaces for celebrations.",
    url: absoluteUrl("/", env),
    image: absoluteUrl(OG_IMAGES.default, env),
    telephone: SITE.phoneTel,
    email: SITE.email,
    address,
    hasMap: LINKS.directions,
  };
}

export function restaurantJsonLd(env?: Record<string, string | undefined>) {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Nature View Family Restaurant",
    url: absoluteUrl("/restaurant", env),
    image: absoluteUrl(OG_IMAGES.restaurant, env),
    telephone: SITE.phoneTel,
    address,
    hasMenu: absoluteUrl("/restaurant#menu", env),
    parentOrganization: { "@id": absoluteUrl("/#resort", env) },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], env?: Record<string, string | undefined>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path, env),
    })),
  };
}

/** Serialises JSON-LD safely for a <script> tag (prevents "</script>" or HTML comments breaking out). */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

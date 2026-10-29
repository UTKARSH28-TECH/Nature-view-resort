import type { MetadataRoute } from "next";
import { ROOM_LIST } from "@/lib/rooms";
import { ROUTES } from "@/lib/site";
import { absoluteUrl } from "@/lib/seo";

/** Every public page. No lastModified dates are given because we do not track real edit dates; none are invented. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths: { path: string; priority: number }[] = [
    { path: ROUTES.home, priority: 1 },
    { path: ROUTES.rooms, priority: 0.9 },
    ...ROOM_LIST.map((r) => ({ path: `${ROUTES.rooms}/${r.slug}`, priority: 0.8 })),
    { path: ROUTES.restaurant, priority: 0.8 },
    { path: ROUTES.events, priority: 0.8 },
    { path: ROUTES.khandoli, priority: 0.7 },
    { path: ROUTES.gallery, priority: 0.6 },
    { path: ROUTES.book, priority: 0.6 },
    { path: ROUTES.eventEnquiry, priority: 0.5 },
    { path: ROUTES.contact, priority: 0.6 },
    { path: ROUTES.privacy, priority: 0.2 },
  ];
  return paths.map(({ path, priority }) => ({ url: absoluteUrl(path), priority }));
}

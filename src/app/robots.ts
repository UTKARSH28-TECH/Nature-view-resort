import type { MetadataRoute } from "next";
import { getSiteUrl, indexingEnabled } from "@/lib/seo";

/**
 * Crawling is allowed only when NEXT_PUBLIC_SITE_URL is set and this is not a preview deployment.
 * Otherwise everything is disallowed so unfinished or preview copies are not indexed by accident.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
    host: getSiteUrl() ?? undefined,
  };
}

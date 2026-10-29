import type { NextConfig } from "next";
import path from "node:path";

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Non-script directives only: they block framing, plugin content and cross-site form posts without
  // needing a script nonce. A full script CSP is a recommended follow-up (see docs/SECURITY.md).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  // A stray lockfile exists in the user's home folder; pin the root to this project.
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  async redirects() {
    // The old "Experiences" link is covered by the resort photo group in the gallery.
    return [{ source: "/experiences", destination: "/gallery#resort", permanent: false }];
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // Photos and social images keep their file names, so cache for a week (not "immutable") to allow updates.
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/og/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
  // Source photos are at most ~2000px wide; never generate larger variants.
  images: {
    // WebP only: AVIF encoding on first request was slow enough to leave tiles blank for seconds.
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 192, 384],
    // Optimised copies may be reused for two weeks before re-checking the source file.
    minimumCacheTTL: 60 * 60 * 24 * 14,
  },
};

export default nextConfig;

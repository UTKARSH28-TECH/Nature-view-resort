import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // A stray lockfile exists in the user's home folder; pin the root to this project.
  outputFileTracingRoot: path.join(__dirname),
  async redirects() {
    // The old "Experiences" link is covered by the resort photo group in the gallery.
    return [{ source: "/experiences", destination: "/gallery#resort", permanent: false }];
  },
  // Source photos are at most ~2000px wide; never generate larger variants.
  images: {
    // WebP only: AVIF encoding on first request was slow enough to leave tiles blank for seconds.
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 1920],
    imageSizes: [96, 192, 384],
  },
};

export default nextConfig;

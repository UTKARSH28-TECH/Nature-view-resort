import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/site";
import { SITE } from "@/lib/site";
import { OG_IMAGES, indexingEnabled, siteOrigin } from "@/lib/seo";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  // 700 was never used; headings render at 500 and the wordmark at 600.
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: HOME_TITLE, template: `%s | ${SITE.name}` },
  description: HOME_DESCRIPTION,
  applicationName: SITE.name,
  // Indexing is off until NEXT_PUBLIC_SITE_URL is set and the deployment is not a preview (see lib/seo.ts).
  robots: indexingEnabled() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: SITE.name, locale: "en_IN", images: [{ url: OG_IMAGES.default, width: 1200, height: 630, alt: `${SITE.name}, Khandoli, Giridih` }] },
  twitter: { card: "summary_large_image", images: [OG_IMAGES.default] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:text-forest-950"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

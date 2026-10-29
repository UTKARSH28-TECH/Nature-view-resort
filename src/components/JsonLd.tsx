import { jsonLdString } from "@/lib/seo";

/** Renders one schema.org JSON-LD block. Only pass data built from verified facts (see lib/seo.ts). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}

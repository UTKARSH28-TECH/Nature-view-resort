// Checks every public route of a RUNNING site for SEO, structure and security basics.
//   npm run build && npm run start          (in one terminal)
//   node scripts/check-pages.mjs http://localhost:3000
// Exit code is 1 if any check fails. Read-only: it only issues GET requests.
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  "/", "/rooms",
  "/rooms/deluxe-room-with-lake-view",
  "/rooms/deluxe-twin-room-with-balcony-hill-and-lake-view",
  "/rooms/executive-suite-with-private-balcony",
  "/restaurant", "/events", "/events/enquiry", "/khandoli", "/gallery", "/book", "/contact", "/privacy",
];

const failures = [];
const fail = (route, msg) => failures.push(`${route}: ${msg}`);
const titles = new Map();
const descs = new Map();
const internal = new Set();

const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta[^>]+${attr}="${name}"[^>]*content="([^"]*)"`, "i")) ?? html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]*${attr}="${name}"`, "i"));
  return m?.[1];
};
const decode = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

for (const route of ROUTES) {
  const res = await fetch(base + route, { redirect: "manual" });
  const html = await res.text();
  if (res.status !== 200) { fail(route, `HTTP ${res.status}`); continue; }

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1]);
  const desc = decode(meta(html, "name", "description"));
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const ogTitle = meta(html, "property", "og:title");
  const ogDesc = meta(html, "property", "og:description");
  const ogImage = meta(html, "property", "og:image");
  const ogUrl = meta(html, "property", "og:url");
  const twitter = meta(html, "name", "twitter:card");
  const robots = meta(html, "name", "robots");
  const h1s = (html.match(/<h1[\s>]/g) ?? []).length;
  const imgsNoAlt = (html.match(/<img\b[^>]*>/g) ?? []).filter((t) => !/\balt=/.test(t)).length;
  const cookies = res.headers.get("set-cookie");

  if (!title) fail(route, "missing <title>");
  else if (title.length > 75) fail(route, `title too long (${title.length}): ${title}`);
  if (!desc) fail(route, "missing meta description");
  else if (desc.length < 70 || desc.length > 175) fail(route, `description length ${desc.length}`);
  if (!canonical) fail(route, "missing canonical");
  if (!ogTitle || !ogDesc || !ogImage || !ogUrl) fail(route, "incomplete Open Graph tags");
  if (twitter !== "summary_large_image") fail(route, "missing twitter card");
  if (h1s !== 1) fail(route, `expected exactly 1 <h1>, found ${h1s}`);
  if (imgsNoAlt) fail(route, `${imgsNoAlt} <img> without alt attribute`);
  if (cookies) fail(route, "sets a cookie (privacy notice says none are used)");
  for (const [k, v] of [["title", title], ["description", desc]]) {
    const store = k === "title" ? titles : descs;
    if (store.has(v)) fail(route, `duplicate ${k} with ${store.get(v)}`);
    store.set(v, route);
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1].replace(/\\u003c/g, "<"));
      const bad = ["aggregateRating", "review", "priceRange", "openingHours", "openingHoursSpecification", "geo", "amenityFeature", "sameAs"];
      for (const key of bad) if (key in j) fail(route, `JSON-LD contains unverified property "${key}"`);
    } catch {
      fail(route, "JSON-LD does not parse");
    }
  }
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) internal.add(m[1]);

  console.log(
    `${route.padEnd(58)} ${String(title?.length).padStart(3)}t ${String(desc?.length).padStart(3)}d  h1:${h1s}  ld:${(html.match(/application\/ld\+json/g) ?? []).length}  robots:${robots ?? "-"}  canon:${canonical?.replace(base, "") ?? "-"}  og:${ogImage?.split("/").pop()}`,
  );
}

// Link targets referenced by the pages
for (const path of [...internal].filter((p) => !p.startsWith("/_next") && !p.includes("."))) {
  const r = await fetch(base + path, { redirect: "manual" });
  if (r.status >= 400) fail(path, `linked page returns HTTP ${r.status}`);
}

// 404 page
const nf = await fetch(base + "/this-page-does-not-exist");
const nfHtml = await nf.text();
if (nf.status !== 404) fail("404", `unknown path returned ${nf.status}`);
if ((nfHtml.match(/<h1[\s>]/g) ?? []).length !== 1) fail("404", "404 page must have one h1");
if (!/noindex/.test(nfHtml)) fail("404", "404 page should be noindex");

// robots.txt and sitemap.xml
const robots = await (await fetch(base + "/robots.txt")).text();
const sitemapRes = await fetch(base + "/sitemap.xml");
const sitemap = await sitemapRes.text();
console.log("\nrobots.txt:\n" + robots.trim().split("\n").map((l) => "  " + l).join("\n"));
const urls = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
console.log(`sitemap.xml: ${urls.length} URLs (status ${sitemapRes.status})`);
for (const r of ROUTES) if (!urls.some((u) => new URL(u).pathname === r)) fail("sitemap", `missing ${r}`);
if (urls.some((u) => /api|\?/.test(u))) fail("sitemap", "contains API or query URLs");

// Social images
for (const f of ["default", "rooms", "restaurant", "events", "khandoli", "gallery", "room-deluxe", "room-twin", "room-suite"]) {
  const r = await fetch(`${base}/og/${f}.jpg`);
  const size = (await r.arrayBuffer()).byteLength;
  if (r.status !== 200 || !/image\/jpeg/.test(r.headers.get("content-type") ?? "") || size > 400_000) fail(`/og/${f}.jpg`, `status ${r.status}, ${size} bytes`);
}

// Security headers on a page
const h = (await fetch(base + "/")).headers;
for (const k of ["x-content-type-options", "x-frame-options", "referrer-policy", "permissions-policy", "content-security-policy"])
  if (!h.get(k)) fail("headers", `missing ${k}`);
if (h.get("x-powered-by")) fail("headers", "X-Powered-By is exposed");

console.log(failures.length ? `\n${failures.length} PROBLEM(S):\n - ${failures.join("\n - ")}` : "\nAll checks passed.");
process.exit(failures.length ? 1 : 0);

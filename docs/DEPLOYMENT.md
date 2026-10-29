# Deployment guide (Vercel + Neon + Resend)

**Nothing has been deployed.** No live database was connected, no real email was sent and no DNS was changed. This is the list of steps **you** must complete, in order. Detailed Neon and Resend steps are in `SETUP-GUIDE.md`; this page adds Vercel and the launch checks.

## What is ready in the code

- **Vercel compatibility:** Next.js 15 App Router, no custom server. The enquiry endpoint is a Node.js route (`runtime = "nodejs"`, `dynamic = "force-dynamic"`). `package.json` sets `engines.node >= 22.9`. `vercel.json` is not needed. Builds succeed with **no** environment variables (the site then shows honest "not set up" messages and tells search engines not to index it).
- **Database:** `postgres` driver over a pooled connection string (works with Neon). Migrations are plain SQL in `db/migrations`, applied with `npm run db:migrate`.
- **Errors:** custom 404 page (`noindex`), a runtime error page (`error.tsx`, no technical details shown), friendly form errors, API errors that never expose secrets or stack traces.
- **SEO:** unique titles/descriptions, canonical URLs, Open Graph/Twitter images (real photos, `public/og`), `sitemap.xml`, `robots.txt`, JSON-LD (Resort, Restaurant, breadcrumbs) limited to confirmed facts. `scripts/check-pages.mjs` verifies all of this against a running site.
- **Security headers and caching** in `next.config.ts`.

## Steps you must complete

### A. Accounts and secrets (once)
1. **Neon:** create the project and copy the pooled connection string (`SETUP-GUIDE.md` §2).
2. **Resend:** create the account, verify a sending domain (adds DNS records at your registrar; **this is the only DNS change needed**, and it is for email, not for the website), create an API key (`SETUP-GUIDE.md` §1).
3. **GitHub (or GitLab/Bitbucket):** push this project (code only; the original photo folders are not needed on the server). Vercel deploys from the repository.

### B. Vercel project
1. Vercel dashboard -> **Add New... -> Project** -> import the repository. Framework: Next.js (auto-detected). Build command and output are the defaults.
2. **Environment Variables** (Settings -> Environment Variables). Add for **Production**:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | The final public address, e.g. `https://www.yourdomain.example`. Required for search indexing, canonical links and social previews. |
   | `RESEND_API_KEY` | From Resend (mark **Sensitive**) |
   | `ENQUIRY_FROM_EMAIL` | e.g. `Nature View Resort <enquiries@yourdomain.example>` |
   | `ENQUIRY_TO_EMAIL` | optional, default `natureviewresort1@gmail.com` |
   | `DATABASE_URL` | Neon pooled connection string (mark **Sensitive**) |
   | optional limits | see `.env.example` |

   For **Preview** deployments either leave email and database variables **unset** (forms then show "not set up", nothing is sent or stored) or use a separate Resend key and a separate Neon branch/database. Never point previews at the production database. Previews are automatically `noindex` (Vercel sets `VERCEL_ENV=preview`).
3. **Create the table in the production database** (once), from your computer:
   ```bash
   cp .env.example .env.local     # put the production DATABASE_URL in .env.local
   npm install
   npm run db:migrate             # expect: applied 0001_create_enquiries.sql
   ```
4. **Deploy.** First deploy gives a `*.vercel.app` address. Because `NEXT_PUBLIC_SITE_URL` is baked in at build time, set it to the final address **before** the deployment you intend to launch (or redeploy after changing it).

### C. Test on the first deployment (before announcing)
1. Open the site on a phone and a laptop; click through every page in the navigation.
2. Send a test room enquiry and a test event enquiry with your own details. Check: success page with a reference, the email in the Gmail inbox (also spam), the row in the database (`npm run enquiries`). Delete the test rows afterwards (`SETUP-GUIDE.md` §4).
3. Run the page checker against the live address: `node scripts/check-pages.mjs https://your-address` (expects "All checks passed").
4. Run Google PageSpeed Insights / Lighthouse on the live home, rooms, restaurant and gallery pages and note the real mobile scores (they could not be measured from this development environment).
5. After the final domain is attached, check `https://your-address/robots.txt` allows crawling and lists the sitemap, then submit `sitemap.xml` in Google Search Console.

### D. Custom domain (your decision, not done)
Add the domain in Vercel (Settings -> Domains) and follow Vercel's DNS instructions at your registrar. This changes where the website address points, so do it only when you are ready for the site to go public. Then set `NEXT_PUBLIC_SITE_URL` to it and redeploy.

### E. Management decisions before launch
- **Privacy notice:** complete the six "to be confirmed" points (`PRIVACY-TO-CONFIRM.md`).
- **Content to confirm:** `docs/ROOMS-TO-CONFIRM.md`, `MENU-TO-CONFIRM.md`, `EVENTS-TO-CONFIRM.md`, `KHANDOLI-SOURCES.md`.
- **Photo permissions:** the photographs of people (`kitty party`, `winter -1`) stay excluded until consent is confirmed; confirm usage permission for the other photographs.
- **Logo and favicon:** the header uses a typographic wordmark and the favicon is a simple placeholder "N" (`src/app/icon.svg`); replace with the official logo files.

## Rolling back
Vercel keeps every deployment: use *Deployments -> ... -> Promote to Production* on an earlier one. The git tag `phase-7-approved` marks the approved code before Phase 8.

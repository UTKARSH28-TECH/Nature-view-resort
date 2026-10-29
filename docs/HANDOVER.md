# Launch handover checklist

Status: code complete and approved. **Nothing has been deployed.** No DNS change, live database, real email or Next.js major upgrade has been done. Do nothing below until you decide to go live.

Rollback point for the code: git tag `phase-7-approved` (before Phase 8). Phase 8 is uncommitted in the working folder; commit it before pushing.

## 1. Files and commands for deployment

**Files that matter** (all in the project folder; the original photo/menu folders `experiences`, `food`, `hero`, `khandoli`, `resort`, `rooms` are not needed on the server):

| File | Purpose |
|---|---|
| `package.json`, `package-lock.json` | Dependencies and scripts (Node >= 22.9) |
| `next.config.ts` | Security headers, caching, image settings, `/experiences` redirect |
| `.env.example` | List of every variable, with no values |
| `db/migrations/0001_create_enquiries.sql` | Creates the enquiries table |
| `scripts/migrate.mjs` | Applies migrations (`npm run db:migrate`) |
| `scripts/enquiries-admin.mjs` | Private staff tool (`npm run enquiries`) |
| `scripts/check-pages.mjs` | Post-deploy page checker |
| `public/images`, `public/og`, `public/downloads` | Optimised photos, social images, menu PDF |
| `docs/DEPLOYMENT.md`, `SETUP-GUIDE.md`, `SECURITY.md`, `PRIVACY-TO-CONFIRM.md`, `DEPENDENCY-AUDIT.md` | Detailed guides |

**Commands, in order:**

```bash
# 0. One-off: commit Phase 8 and push to GitHub/GitLab (code only), then import the repo in Vercel
git add -A -- . ':!experiences' ':!food' ':!hero' ':!khandoli' ':!resort' ':!rooms'
git commit -m "Phase 8: SEO, privacy, security headers, accessibility"

# 1. On your computer, create the table in the production database (after creating Neon and putting DATABASE_URL in .env.local)
cp .env.example .env.local        # fill in DATABASE_URL only for this step
npm install
npm run db:migrate                # expect: applied 0001_create_enquiries.sql
npm run db:migrate -- --status    # optional: shows applied/pending

# 2. Optional local rehearsal before deploying
npm test                          # 121 tests
npm run build && npm run start    # http://localhost:3000

# 3. After the first Vercel deployment
node scripts/check-pages.mjs https://YOUR-ADDRESS     # expect: All checks passed.
```

Order of accounts: Neon (database) -> Resend (verify sending domain, API key) -> Vercel (import repo, add variables, deploy) -> test -> custom domain. Full steps: `docs/DEPLOYMENT.md` and `docs/SETUP-GUIDE.md`.

## 2. Environment variables

Set these in Vercel (Settings -> Environment Variables), **Production**. Locally they go in `.env.local`, which is git-ignored.

| Variable | Required | Secret? |
|---|---|---|
| `RESEND_API_KEY` | for email | **SECRET. Never expose.** |
| `DATABASE_URL` | for storage | **SECRET. Never expose.** (contains the database password) |
| `ENQUIRY_FROM_EMAIL` | for email | Server-only; keep private (no default; must be on a Resend-verified domain) |
| `ENQUIRY_TO_EMAIL` | optional | Server-only (defaults to `natureviewresort1@gmail.com`) |
| `NEXT_PUBLIC_SITE_URL` | for search indexing | Public by design (the website address); baked in at build time, so redeploy after changing |
| `ENQUIRY_RATE_LIMIT_MAX`, `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES`, `ENQUIRY_DUPLICATE_WINDOW_MINUTES` | optional | Server-only, not sensitive |
| `NEXT_PUBLIC_ENQUIRY_MAX_ADULTS`, `_MAX_CHILDREN`, `_MAX_TOTAL_GUESTS`, `_MAX_NIGHTS`, `_MAX_DAYS_AHEAD`, `_MAX_EVENT_GUESTS` | optional | Public limits, not secrets |
| `RESEND_API_URL` | **testing only** | Leave unset in production |

**Never put the key or database address in code, a commit, chat, an email or a screenshot, and never give a secret a `NEXT_PUBLIC_` name.** Without `NEXT_PUBLIC_SITE_URL` the site tells search engines not to index it (this is deliberate). Preview deployments: leave the email and database variables unset, or use separate test credentials; never point previews at the production database.

## 3. Outstanding privacy and management decisions

Privacy notice (`/privacy`, details in `docs/PRIVACY-TO-CONFIRM.md`), marked "To be confirmed by the resort" on the page. After deciding, edit `src/app/privacy/page.tsx` and remove the "Draft" banner:
1. Legal name of the responsible business and a named privacy contact.
2. Whether enquiry details are used for anything else (for example marketing).
3. Final provider list and their regions (Resend, database host, Vercel).
4. **Retention period** (until decided, enquiries are kept until deleted; also decide for the Gmail inbox and Resend logs). Tool: `npm run enquiries -- purge --older-than-months N` (dry run unless `--yes`).
5. Who handles requests to see/correct/delete data, and how fast.
6. Review date for the notice.

Other decisions (no information has been invented; each list is in `docs/`):
- Business limits (guests, nights, booking window): defaults are technical, not policy; set real rules if wanted.
- Room details (`ROOMS-TO-CONFIRM.md`), menu spellings/prices/F-H meaning (`MENU-TO-CONFIRM.md`), event spaces, capacities, packages (`EVENTS-TO-CONFIRM.md`), Khandoli facts and photo origins (`KHANDOLI-SOURCES.md`).
- Photo permission: `kitty party` and `winter -1` stay excluded until consent; confirm permission for all other photos.
- Logo and favicon (current: text wordmark and a placeholder "N").
- Decide the production domain and who administers Neon, Resend and Vercel (2-step verification on all, plus Gmail).

## 4. Remaining dependency findings and verification

`npm audit` today: **2 findings (1 moderate, 1 high)**, both the PostCSS copy bundled inside `next@15.5.28` (latest 15.x). It concerns untrusted CSS at build time; the site does not process visitor CSS, so exposure is very low. Fix = Next 16.4.3 (major), not done. The earlier critical Vitest/tinypool issue (dev-only) is fixed (Vitest 4.1.12).

Verification before launch:
1. `npm audit` (expect only the two above) and `npm audit --omit=dev`.
2. `npm run lint && npm run typecheck && npm test && npm run build` (all must pass).
3. `npm ci --dry-run` succeeds (lockfile consistent).
4. Later, as a separate approved task: Next 16 upgrade on a branch, then repeat 1-3, `check-pages`, and a click-through on a Vercel preview (plan in `docs/DEPENDENCY-AUDIT.md`).
5. Enable Dependabot/Renovate security alerts on the repository.

## 5. Routes and states still needing manual visual review

I verified structure, accessibility (axe) and overflow by script and DOM measurement, and looked at many screens, but **you should review by eye on a real phone and a laptop** (the preview here could not show 1280-1440px reliably and no tablet visual pass was done):

- **Routes (13):** `/`, `/rooms`, `/rooms/deluxe-room-with-lake-view`, `/rooms/deluxe-twin-room-with-balcony-hill-and-lake-view`, `/rooms/executive-suite-with-private-balcony`, `/restaurant`, `/events`, `/events/enquiry`, `/khandoli`, `/gallery`, `/book`, `/contact`, `/privacy`, plus a 404 (for example `/nope`).
- **Widths:** 390 (phone), 768 (tablet), 1280-1440 (desktop).
- **States to open and look at:** mobile menu; room photo viewer (thumbnails); restaurant search, section chips and empty search; printed-menu viewer (fit and zoomed, both phone and desktop); gallery filters and photo viewer (swipe on phone); room and event forms with validation errors; the result panels (sent, saved-but-not-emailed, not sent, "not set up"); hero text over photos; footer and privacy page; Khandoli photo labels.
- **Also check:** fonts and photo sharpness, any text over photos that is hard to read, and the social preview (paste the live address into WhatsApp or a link-preview tool).
- **Performance:** run PageSpeed Insights on `/`, `/rooms`, `/restaurant`, `/gallery` after deploying (real paint timings were not measurable here).

## 6. Verify real enquiries after credentials are set, and remove test records

Use **your own** name, phone and email, and a clearly fake note such as "TEST - please ignore".

1. Open `/book` on the live site. Choose a room, future dates, submit.
   Expect: "Your enquiry has been sent" plus "a copy has been saved", a reference like `NVR-YYMMDD-XXXXX`, and the sentence that it is an enquiry, not a confirmed booking.
2. Check the Gmail inbox (and spam): subject starts with the reference; body shows all fields and "This is an enquiry, not a confirmed reservation"; Reply-To is your email.
3. Open `/events/enquiry`, submit an event enquiry (use "My date is not fixed yet" for the second variation if you like). Check the same three things.
4. Confirm storage from your computer (needs `DATABASE_URL` in `.env.local`):
   ```bash
   npm run enquiries                       # both test rows listed, email:sent
   npm run enquiries -- show NVR-YYMMDD-XXXXX
   ```
5. Optional failure check: temporarily remove `RESEND_API_KEY` in a **Preview** environment and submit; expect "Saved, but we couldn't notify the resort" and `npm run enquiries -- unsent` listing it. Do not do this in Production.
6. **Remove the test records safely:**
   - In the Neon SQL editor, first confirm exactly what will be removed:
     ```sql
     SELECT reference, guest_name, kind, created_at FROM enquiries WHERE reference IN ('NVR-YYMMDD-AAAAA', 'NVR-YYMMDD-BBBBB');
     ```
   - Then delete only those rows (use the exact references; never run `DELETE` without a `WHERE`):
     ```sql
     DELETE FROM enquiries WHERE reference IN ('NVR-YYMMDD-AAAAA', 'NVR-YYMMDD-BBBBB');
     ```
   - Re-run `npm run enquiries` to confirm only real enquiries remain.
   - Delete the two notification emails from the Gmail inbox (and trash), and note they also appear in Resend's sending log until it expires.
   - If the database is test-only and you want to clear it entirely before launch: `npm run enquiries -- purge --older-than-months 1` shows a dry-run count; add `--yes` only if every row is a test.
7. Run `node scripts/check-pages.mjs https://YOUR-ADDRESS` and confirm "All checks passed", then check `/robots.txt` allows crawling and submit `/sitemap.xml` in Google Search Console.

## Go-live gate

Do not launch until: privacy points 1-6 are decided, the real test enquiries (section 6) worked end to end and were cleaned up, the manual visual review (section 5) is done, `NEXT_PUBLIC_SITE_URL` is set to the final address, and you have decided about the domain change. **I will wait for your explicit approval before any live action.**

# Dependency audit and upgrade plan

State at the end of Phase 8. **Next.js was not upgraded across major versions.**

## Current `npm audit`

| Package | Severity | Runs | Status |
|---|---|---|---|
| `postcss` copy bundled **inside `next@15.5.28`** (8.4.31) | high / moderate | Build time only | **Open.** Fix exists only in Next 16.4.3 (major). 15.5.28 is the latest 15.x. |
| `next` | moderate | Production dependency (via the postcss above) | **Open**, same cause. |

`npm audit` total: **2 vulnerabilities (1 moderate, 1 high)**, both from the Next.js-bundled PostCSS. `npm audit --omit=dev` shows the same two.

### Is the live site exposed?
Very unlikely. The advisories concern processing **untrusted CSS or source maps** (a `sourceMappingURL` comment in attacker-supplied CSS, or `</style>` in PostCSS's own CSS output). This site's CSS is our own Tailwind output compiled at build time on a trusted machine; visitors never supply CSS and the build tooling does not run when pages are served. It should still be fixed by the planned Next 16 upgrade.

## Fixed in Phase 8: Vitest critical (dev-only)

**Before:** `vitest@3.2.7` pulled `tinypool@1.1.1` (critical: prototype-pollution gadget leading to code execution in worker options) and `@vitest/mocker` (moderate: path traversal / code injection through mock registration). Dev-only: the test runner is not part of the deployed site.

**Investigation:**
- `npm audit` offered `vitest@5.0.5` (a major).
- Vitest 4.x drops `tinypool` entirely, and **4.1.12 is the first release whose `@vitest/mocker` is outside the vulnerable range** (`< 4.1.12`). It supports Node `^22` (we run 22.18) and Vite 6/7/8.
- 4.1.12 is therefore the smallest version that clears every finding; 5.0.5 would need Node 22.12+ and has no extra benefit for us.

**Change:** `vitest` 3.2.7 -> **4.1.12** (dev dependency only; pulls Vite 8.3.5 for the test runner). Required one config adjustment: the config moved to `vitest.config.mts` (ESM) and enables the automatic JSX runtime so tests can import page modules.

**Verification:** the full suite (121 tests, including the in-memory PostgreSQL tests, driver/script tests and secret-exposure checks) passes on 4.1.12; `npm audit` no longer lists vitest, tinypool or @vitest/mocker; `npm ci --dry-run` succeeds (lockfile consistent); lint, type-check and production build pass.

**Install note:** with this dependency set, npm 10.x's resolver crashed (`Cannot read properties of null (reading 'edgesOut')`) while adding Vitest 4.1.12; it installed with `--legacy-peer-deps`, then a plain `npm install` completed the tree. The committed lockfile is consistent under the normal `npm install`/`npm ci`, so no flag is needed afterwards. If a future `npm install <package>` hits the same crash, repeat that two-step approach.

## Recommended plan: Next.js 15 -> 16 (not done; needs your approval)

1. Do it on a branch, not on `main`.
2. Read the Next 16 upgrade guide; upgrade `next` and `eslint-config-next`; check the React/React DOM versions it requires.
3. Check what this project relies on: `searchParams`/`params` as Promises (already used), `next/image` configuration (`formats`, `deviceSizes`, `minimumCacheTTL`), `redirects()`/`headers()` in `next.config.ts`, route handlers with `runtime = "nodejs"`, `next/font/google`, the Tailwind 4 PostCSS plugin, `app/robots.ts` / `sitemap.ts` / `icon.svg`, and the flat ESLint config.
4. Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `node scripts/check-pages.mjs`, then click through every page and both forms on a Vercel preview deployment before merging.
5. Stop-gap if the upgrade must wait: an `overrides` entry for Next's PostCSS can be tried but Next pins that copy deliberately; treat it as temporary and verify the CSS output.
6. Turn on Dependabot or Renovate security updates and run `npm audit` before each deployment.

## Other notes
- `npm audit` does not cover server-level or Vercel platform issues; keep the Node version on Vercel on a supported release.
- New packages added in Phases 7-8 and why: `postgres` (database driver), dev-only `vitest`, `@electric-sql/pglite` and `@electric-sql/pglite-socket` (in-memory PostgreSQL for tests), `axe-core` was used temporarily for the accessibility scan and removed.

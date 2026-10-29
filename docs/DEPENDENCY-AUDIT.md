# Dependency audit and safe upgrade plan

Audited with `npm audit` (state at the end of Phase 7). **Nothing was upgraded.** Next.js was not moved across major versions.

## Findings

| Package | Severity | Where it runs | Issue | Fix offered by npm |
|---|---|---|---|---|
| `postcss` bundled **inside `next@15.5.28`** (8.4.31) | high (and moderate) | Build time only | Source-map path handling and `</style>` stringify issues when processing **untrusted CSS** | Only by upgrading to Next 16.4.3 (major) |
| `next` | moderate | Production dependency (via the postcss above) | Same | Next 16.4.3 (major) |
| `vitest` 3.2.7 | critical | **Dev only** (test runner) | Via `tinypool` (prototype pollution -> code execution in worker options) and `@vitest/mocker` (mock redirect path traversal) | vitest 5.0.5 (major, dev only) |
| `tinypool`, `@vitest/mocker` | critical / moderate | Dev only | As above | as above |

Production-only totals (`npm audit --omit=dev`): 1 high, 1 moderate, both the bundled postcss.

## Is the live site exposed?

Unlikely in practice, but it should be fixed:
- The postcss issues apply when a build processes **attacker-controlled CSS** or source maps. This site's CSS is our own Tailwind output compiled at build time on a trusted machine, and visitors never supply CSS. The vulnerable copy is not used to serve requests.
- Vitest/tinypool issues need an attacker to run malicious tests or mocks in the developer's environment. Vitest is not part of the deployed site.
- 15.5.28 is the **latest 15.x release**, so there is no patched 15.x to move to; its bundled postcss stays at 8.4.31.

## Recommended plan (separate from Phase 7; do after approval)

1. **Test tooling first (low risk, dev only):** upgrade `vitest` to 5.x on a branch, run `npm test`, adjust config if needed. Removes the critical findings without touching production code. (Our tests use only basic Vitest features, so breakage is unlikely.)
2. **Next.js 15 -> 16 in a branch, not on main:**
   - Read the Next 16 upgrade guide; upgrade `next`, `eslint-config-next`, then check React/React DOM versions it requires.
   - Check items this project relies on: App Router `searchParams`/`params` as Promises (already used), `next/image` config (`formats`, `deviceSizes`), `redirects()`, route handlers (`runtime = "nodejs"`), `next/font/google`, Tailwind 4 PostCSS plugin compatibility, and the ESLint flat config.
   - Run `npm run lint`, `npm run typecheck`, `npm test` (includes the built-bundle secret scan after `npm run build`), then click through every page and both forms on a preview deployment before merging.
3. **If the upgrade must wait:** an `overrides` entry forcing `next`'s postcss to `^8.5.32` can be tried, but Next pins its postcss deliberately, so treat it only as a stop-gap and verify the build and CSS output. The real fix is step 2.
4. **Keep it from drifting:** enable Dependabot or Renovate for security updates, and re-run `npm audit` before each deployment.

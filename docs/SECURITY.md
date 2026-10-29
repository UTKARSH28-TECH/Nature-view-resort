# Security overview and data access

## Who can see guest enquiries

Guest enquiries (names, phones, emails, requests) are visible to **only** these, and only by logging in or holding a credential:

| Place | Who has access | How to protect it |
|---|---|---|
| **Resort Gmail inbox** (natureviewresort1@gmail.com) | Whoever knows the password | Turn on Google 2-step verification; share access only with staff who answer enquiries; remove access when someone leaves. |
| **Database (Neon or other)** | People with the database login or the Neon account | Neon accounts with 2-step verification; invite staff individually (no shared logins); use the **pooled** connection string only on the server; rotate the password when staff leave. |
| **Resend dashboard** | People on the Resend account | Resend logs show sent emails, which contain the enquiry text; use 2-step verification; limit members. |
| **Vercel project** | People on the Vercel team | Environment variables (the secrets) are readable by team members with access; use 2-step verification and least privilege roles. |
| **Staff CLI** (`npm run enquiries`) | Anyone who has the repository **and** `DATABASE_URL` on their computer | Keep `DATABASE_URL` only in `.env.local` (git-ignored) on machines that need it; never email or chat it. |

There is **no** public admin page and **no** public endpoint that lists or returns enquiries (`GET /api/enquiries` returns 405). The site never returns other guests' details in any response.

### Credentials: rules

1. Secrets live only in the host's environment settings (and `.env.local` for local work). Never in code, commits, chat, screenshots or `NEXT_PUBLIC_` variables. Automated tests check the repository and the built browser bundle for this.
2. Use separate keys per environment: a Resend key and database for production; separate (or no) ones for previews.
3. Rotate immediately if a secret is exposed: Resend (create new key, update Vercel, delete old), Neon (reset role password, update `DATABASE_URL`).
4. Review who has access every few months and when staff change.

## Protections in the code

See `docs/ENQUIRIES.md` for the full list: server-side validation, honeypot, rate limiting, same-origin/JSON/size checks, duplicate protection, header-injection and HTML escaping, safe error messages, logs without personal data, parameterised SQL.

**Security headers** (all pages): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` (camera, microphone, geolocation, payment off), and a `Content-Security-Policy` limited to `frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`. `X-Powered-By` is removed. Static photos are cached for a week.

**Not done (recommended follow-up):** a full script/style CSP needs per-request nonces with Next.js and testing against every page; add it after launch if desired. HSTS is applied by Vercel on its HTTPS domains.

## Rate limiting: limits and the production fix

The limiter (`src/lib/rate-limit.ts`) keeps counts **in the memory of one server process**:

- On Vercel (serverless) many instances can run and each starts empty, and instances are recycled, so a determined attacker can exceed the intended limit, and the count resets on cold starts. It still blocks casual double-clicks and simple scripts.
- The client IP comes from `x-forwarded-for`, which is trustworthy only behind the host's own proxy (it is on Vercel).
- **Durable duplicate protection already exists in the database** (unique form id and an identical-enquiry check), so repeated identical submissions never create repeated records or emails, regardless of instance.

**Recommended production solution:** a shared counter, for example **Upstash Redis** (free tier, HTTP API, designed for serverless) with a sliding-window limit keyed by IP. It plugs into the existing `RateLimiter` interface (`hit(key)`); only `route.ts` changes. For stronger protection add a CAPTCHA/Turnstile check (Cloudflare Turnstile is free) if spam appears; the honeypot only stops simple bots. Neither needs doing before launch unless abuse is seen; Resend and Neon each also have their own account limits.

## Dependencies

See `docs/DEPENDENCY-AUDIT.md`.

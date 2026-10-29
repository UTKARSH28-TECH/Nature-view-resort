# Room and event enquiries: how it works

For the owner's step-by-step setup see **`docs/SETUP-GUIDE.md`**. This file explains the design.

## Flow

1. `/book` (room) and `/events/enquiry` (event) validate in the browser for quick feedback, then `POST /api/enquiries` (JSON).
2. `src/lib/enquiry-service.ts` runs: abuse checks -> server-side validation -> duplicate lookup -> **save to PostgreSQL** (if `DATABASE_URL`) -> **email the resort via Resend** (if configured) -> record the email result on the saved row.
3. The guest sees a truthful result (table in the setup guide). "Sent" means the email provider accepted the notification; "saved" means a database row exists. Neither ever means a booking or event is confirmed.

There is no guest confirmation email: only the resort is notified (Reply-To is the guest's address).

## Email: Resend

Plain HTTPS to Resend (no SDK). Sender must be on a domain verified in Resend (no default; a Gmail address cannot be the sender). Recipient defaults to `natureviewresort1@gmail.com`. Variables: `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_TO_EMAIL` (optional), `RESEND_API_URL` (testing only).

## Storage: PostgreSQL

**Recommendation: Neon** (serverless PostgreSQL, free tier, works with Vercel and any host). The code uses the `postgres` driver and plain SQL, so **any PostgreSQL** works by changing `DATABASE_URL`. Why not something heavier: one table, a few queries and no ORM keep the project simple and the moving parts few.

- Schema: `db/migrations/0001_create_enquiries.sql` (table `enquiries`). Applied with `npm run db:migrate` (`scripts/migrate.mjs`), which records applied files in `schema_migrations` and is safe to re-run. Add future changes as `0002_...sql`.
- Columns: `reference` (unique), `submission_id` (unique), `fingerprint`, `kind` (`room`/`event`), `status` (`new`/`contacted`/`closed`; deliberately no "confirmed"), contact fields, `payload` (jsonb with every validated field), and the email result (`email_status`, `email_provider_id`, `email_failure`, `email_attempted_at`).
- Access: `src/lib/db.ts` reads `DATABASE_URL` (the only file that does) and connects lazily, so builds and runs without a database. Queries are parameterised (tested against SQL-injection text).
- **No database configured = no storage**, and the site says so. A row is reported as saved only after the insert really succeeded. If the database is down but email works the guest is told it was *sent* (never "saved"). If the email fails but the row exists the guest is told it is *saved but the resort was not notified* and is asked to also call or WhatsApp.
- Staff access: `npm run enquiries` (private CLI using the database credentials). There is no public admin page and no public endpoint returns enquiries.

## Duplicate and spam protection

- Server-side validation of every field; honeypot (`website` field gets a harmless response, nothing is stored or sent).
- **Duplicates, durable (database):** a unique `submission_id` per form (a repeated send of the same form never makes a second row or email, even across server instances), plus a `fingerprint` of the key details (kind, email, phone, dates/event, guests): an identical enquiry within `ENQUIRY_DUPLICATE_WINDOW_MINUTES` (30) returns the existing reference. A failed email for a saved enquiry is retried on the same row.
- **Duplicates, in-process:** the button disables while sending and simultaneous requests for the same form are coalesced.
- **Rate limit:** `ENQUIRY_RATE_LIMIT_MAX` per `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES` per client IP (default 6 / 10 min), in memory. On serverless or several instances each instance counts separately, so it only slows abuse; for a hard limit use a shared store such as Upstash Redis behind `createRateLimiter`'s interface. The IP comes from `x-forwarded-for`/`x-real-ip`, trustworthy only behind the host's own proxy.
- JSON only, same-origin only (`Origin` must match the host), 16 KB maximum body.

## Other security

- **Email-header injection:** guest values never become headers except Reply-To (a strictly validated address); subjects are one line with control and line-separator characters removed; sender and recipient addresses are validated.
- **Safe rendering:** guest text is HTML-escaped in the email (a text part is sent too).
- **No leakage:** public errors are fixed strings; provider and database errors are never echoed; logs hold outcomes only (no names, phones, emails or message text); responses are `no-store`.
- **Secrets:** `RESEND_API_KEY`/`ENQUIRY_*` are read only in `src/lib/mailer.ts`, `DATABASE_URL` only in `src/lib/db.ts`. Automated tests check no client file imports server modules, and the built browser bundle contains no credential names; a build with marker secrets found them in no output file.

## Limits (configurable, not policy)

All in `src/config/enquiry-limits.ts`, overridable by environment variables (table in the setup guide). They are technical sanity limits to catch typos and abuse, **not** resort policy: the resort has not confirmed occupancy, minimum stay or booking windows, so none of those are enforced or shown.

## Testing

`npm test` (Vitest, 107 tests, ~7 s). No real email is sent and no real customer record is created:
- validation for room and event enquiries (dates, unknown slugs, injection, limits);
- the service with a mock mailer: success, honeypot, origin, size, content type, rate limit, escaping, header injection, missing credentials, provider rejection/timeout/network error, exceptions, no personal data in logs, duplicate handling;
- **the real migration SQL and store queries on an in-memory PostgreSQL (PGlite)**, plus the real `postgres` driver and the migrate and staff scripts against an in-memory PostgreSQL server;
- saved/emailed combinations (saved+sent, saved+email failed, email only, nothing configured, database down, both down), duplicates across instances, retries, reference collisions, nothing written for invalid/honeypot/cross-origin requests;
- route handler with and without environment variables, including an unreachable `DATABASE_URL`;
- secret-exposure checks.

To try the whole flow without sending real mail, run a local mock that accepts `POST /emails` and start the site with `RESEND_API_KEY=test ENQUIRY_FROM_EMAIL=enquiries@example.test RESEND_API_URL=http://127.0.0.1:<port>/emails`.

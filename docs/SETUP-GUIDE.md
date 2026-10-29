# Setup guide: email and enquiry storage

> Deploying to Vercel? Read **`DEPLOYMENT.md`** too: it lists the exact order of steps, the environment variables (including `NEXT_PUBLIC_SITE_URL`) and the launch checks. Data access and security: `SECURITY.md`. Privacy decisions: `PRIVACY-TO-CONFIRM.md`.

Everything below is done **by you (the owner or whoever manages the accounts)**. None of it can be done from the code. Until it is done the website still builds and runs, but:

| Feature | Before setup | After setup |
|---|---|---|
| Room and event forms | Work and validate. Guests are told, truthfully, that nothing was sent or saved and are offered WhatsApp, email and call. | Enquiries are saved and emailed. |
| Email to natureviewresort1@gmail.com | **Not sent.** | Sent through Resend. |
| Stored enquiries | **Not stored.** | Stored permanently in PostgreSQL. |

You will use two services, both with free tiers: **Resend** (email) and **Neon** (PostgreSQL database). You can set up either one first; each works on its own. You also need to be able to add DNS records to a domain you own.

---

## 1. Resend (email)

Why this is needed: websites cannot send email "as Gmail". Resend sends the notification from an address on **your own domain**, and Gmail receives it.

1. **Domain.** Decide which domain the sender address will use (for example `yourdomain.example`). If the resort has no domain yet, buy one first (any registrar). Using a subdomain such as `mail.yourdomain.example` is fine and keeps it separate from other email.
2. **Create a Resend account** at <https://resend.com>.
3. **Add the domain:** Resend dashboard → *Domains* → *Add Domain* → enter the domain.
4. **Add the DNS records** Resend shows you (usually an SPF record and DKIM records) at your domain registrar's DNS settings. Wait until Resend shows the domain as **Verified** (minutes to a few hours).
5. **Create an API key:** *API Keys* → *Create API Key* → permission **Sending access** → copy it once (it starts with `re_`). Treat it like a password.
6. **Choose the sender address**, for example `Nature View Resort <enquiries@yourdomain.example>`. It must be on the verified domain. The address does not need a real mailbox, but replies go to the guest (the notification's Reply-To is the guest's email), not to the sender.
7. **Set these on the server** (section 3): `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`. `ENQUIRY_TO_EMAIL` is optional and defaults to `natureviewresort1@gmail.com`.

Until the domain is verified Resend only allows test emails to the account owner's own address, so enquiries to the resort inbox would fail.

## 2. Neon (PostgreSQL database)

1. **Create an account** at <https://neon.tech> and create a **project** (choose the region nearest your visitors, for example Singapore).
2. In the project, open **Connect** and copy the **connection string** (it looks like `postgresql://user:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`). Use the **pooled** one if offered.
3. **Set it on the server** as `DATABASE_URL` (section 3). Keep it secret: it contains the password.
4. **Create the table** (once). On your computer, in the project folder:
   ```bash
   cp .env.example .env.local        # then put DATABASE_URL=... in .env.local
   npm run db:migrate
   ```
   You should see `applied 0001_create_enquiries.sql`. Running it again is safe (`already applied`). Check without changing anything with `npm run db:migrate -- --status`. Needs Node 22.9 or newer.
5. **Backups.** Neon keeps a short history on the free plan and longer on paid plans. Decide with whoever manages the account how long you need.

Other PostgreSQL hosts (Supabase, Vercel Postgres, a self-hosted server) work the same way: just supply their connection string.

## 3. Put the settings on the host (never in the code)

On your hosting provider (for example Vercel: *Project → Settings → Environment Variables*), add the variables below for **Production** (and **Preview** if you want to test before going live). Mark them as secret/sensitive. **Never** commit them to the repository, paste them in chat, or prefix them with `NEXT_PUBLIC_`. After adding or changing variables, redeploy.

| Variable | Required | Value |
|---|---|---|
| `RESEND_API_KEY` | for email | The `re_...` key from step 1.5 |
| `ENQUIRY_FROM_EMAIL` | for email | e.g. `Nature View Resort <enquiries@yourdomain.example>` (verified domain; no default) |
| `ENQUIRY_TO_EMAIL` | no | Recipient; defaults to `natureviewresort1@gmail.com` |
| `DATABASE_URL` | for storage | Neon connection string from step 2.2 |
| `ENQUIRY_RATE_LIMIT_MAX` | no | Default 6 requests per window per visitor IP |
| `ENQUIRY_RATE_LIMIT_WINDOW_MINUTES` | no | Default 10 |
| `ENQUIRY_DUPLICATE_WINDOW_MINUTES` | no | Default 30: an identical enquiry within this time is treated as a duplicate |
| `NEXT_PUBLIC_ENQUIRY_MAX_ADULTS` / `_MAX_CHILDREN` / `_MAX_TOTAL_GUESTS` / `_MAX_NIGHTS` / `_MAX_DAYS_AHEAD` / `_MAX_EVENT_GUESTS` | no | Form limits (see below). Public, baked in at build time: change, then rebuild/redeploy. |
| `RESEND_API_URL` | no | **Testing only.** Leave unset in production. |

`.env.example` lists them all with no values. For local work, copy it to `.env.local` (git-ignored).

## 4. Check that it works (before announcing it)

1. Deploy with the variables set. Open `/book` and submit a test enquiry with your own name and phone.
2. The page should say **"Your enquiry has been sent"** with a reference such as `NVR-YYMMDD-XXXXX`. Check the Gmail inbox (and spam) for the notification. It should show the reference, the details and "This is an enquiry, not a confirmed reservation".
3. Confirm it was stored: `npm run enquiries` (needs `DATABASE_URL` in `.env.local`) lists recent enquiries with `email:sent`.
4. Delete your test record so it does not look like a real guest:
   ```sql
   DELETE FROM enquiries WHERE reference = 'NVR-YYMMDD-XXXXX';
   ```
   (run it in the Neon SQL editor).
5. Try the same for `/events/enquiry`.

What the guest sees depends on what is configured and what succeeds:

| Situation | Guest sees |
|---|---|
| Saved and emailed | "Your enquiry has been sent" (and "a copy has been saved") + reference |
| Emailed, database unavailable | "Your enquiry has been sent" (no claim about saving) |
| Saved, email failed or not configured | "Your enquiry is saved, but we couldn't notify the resort": asks the guest to also use WhatsApp or call; Retry button |
| Neither worked | "We couldn't send your enquiry" / "Online sending isn't set up yet"; WhatsApp, email, call options |

None of these ever says a booking is confirmed.

## 5. Day-to-day use (staff)

There is deliberately **no public admin page**. Enquiries are visible to people who hold the database credentials:

- `npm run enquiries`: latest 20; `npm run enquiries -- list --status new --limit 50`.
- `npm run enquiries -- unsent`: saved enquiries whose notification email did not go out (follow these up by phone).
- `npm run enquiries -- show NVR-...`: full details.
- `npm run enquiries -- mark NVR-... contacted` (statuses: `new`, `contacted`, `closed`; there is no "confirmed", bookings are confirmed by the resort outside this site).
- Or use Neon's SQL editor / table view directly.

These enquiries contain personal data (names, phones, emails). Restrict who has the database login, rotate the password and the Resend key if a person with access leaves, and agree a retention period (for example delete closed enquiries after 12 months). A privacy notice on the site is a Phase 8 item.

## 6. Limits you can change

These are **technical sanity limits, not resort policy**. The resort has not confirmed occupancy per room, a minimum stay or a booking window, so none of those are enforced. If management wants a real rule, tell us, or set the variables above.

| Limit | Default | Variable |
|---|---|---|
| Adults per room enquiry | 1-20 | `NEXT_PUBLIC_ENQUIRY_MAX_ADULTS` |
| Children | 0-20 | `NEXT_PUBLIC_ENQUIRY_MAX_CHILDREN` |
| Total guests | 30 | `NEXT_PUBLIC_ENQUIRY_MAX_TOTAL_GUESTS` |
| Longest stay (nights) | 90 | `NEXT_PUBLIC_ENQUIRY_MAX_NIGHTS` |
| Furthest check-in (days ahead) | 730 | `NEXT_PUBLIC_ENQUIRY_MAX_DAYS_AHEAD` |
| Event guests | 5000 | `NEXT_PUBLIC_ENQUIRY_MAX_EVENT_GUESTS` |
| Free text (requests, requirements) | 1500 characters | fixed (`src/config/enquiry-limits.ts`) |

Invalid values are ignored and the default is used. Check-in cannot be in the past and check-out must be after check-in; those are not configurable because they are never valid.

## 7. Troubleshooting

- *"Online sending isn't set up yet" on the live site:* neither `RESEND_API_KEY`+`ENQUIRY_FROM_EMAIL` nor `DATABASE_URL` is set on the host, or the site was not redeployed after setting them.
- *"Saved, but we couldn't notify the resort":* the database works but Resend rejected the email. Usual causes: the domain is not verified yet, the sender address is not on the verified domain, or the API key is wrong. The server log shows only `providerStatus` (for example 403 or 422), never the key.
- *Enquiries sent but not stored:* `DATABASE_URL` is missing or wrong, or `npm run db:migrate` was never run.
- *Migration says "DATABASE_URL is not set":* put it in `.env.local` or export it in the shell.

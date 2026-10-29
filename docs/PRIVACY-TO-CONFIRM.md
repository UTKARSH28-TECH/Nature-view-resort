# Privacy: decisions the resort must make

The public notice is at `/privacy`. Everything it states is something the website actually does. Each point that is a **management decision** is shown on the page as "To be confirmed by the resort". Nothing below has been decided or invented; the page makes no legal-compliance claim.

After you decide, edit `src/app/privacy/page.tsx` (replace the `<ToConfirm>` boxes with the final wording) and delete the "Draft" banner.

| # | Decision | Where it shows | Notes |
|---|---|---|---|
| 1 | **Legal name** of the business responsible for the data, and a named contact for privacy requests | "Who is responsible" | Needed for a complete notice. |
| 2 | **Other uses** of enquiry details (for example marketing messages) and how to opt out | "Why we collect it" | The website itself sends no marketing and sells nothing; this asks about what staff do afterwards. |
| 3 | **Providers and regions**: confirm Resend (email), the database host (Neon or other) and Vercel, and which countries their servers are in | "Who handles it" | Providers can change; update the list when they do. |
| 4 | **Retention period**: how long enquiries are kept (for example months after closing) | "How long we keep it" | Until decided, enquiries stay until someone deletes them. A tool exists: `npm run enquiries -- purge --older-than-months N [--status closed]` (dry run by default, `--yes` to delete). Nothing runs automatically. The enquiry emails in the Gmail inbox and in Resend's logs also need a policy. |
| 5 | **Requests to see, correct or delete data**: who handles them and how fast | "Your choices" | Staff can look up with `npm run enquiries -- show <reference>` and delete in the database. |
| 6 | **Review date** and how "last updated" is shown | "Changes" | |

## What the site collects (for your records)

- Room enquiry: name, phone, email, preferred room, check-in/out, adults, children, special requests.
- Event enquiry: name, phone, email, event type, date (or not fixed), guests, space, requirements.
- Technical: the visitor's IP address is held briefly in server memory for rate limiting and is **not** stored with the enquiry. The host (Vercel) may keep standard request logs. The site sets **no cookies** and uses **no analytics or advertising scripts** (the page checker in `scripts/check-pages.mjs` fails the build check if a cookie is ever set). If you add analytics later, update the notice and consider a cookie notice.

## Data minimisation review

- Forms ask only for what is needed to reply. Email **and** phone are both required today so staff can reply either way; if management prefers, one could be made optional (a small code change).
- The forms tell guests not to enter payment card, ID or health details in free text.
- Contact details are stored once (own columns), not duplicated in the JSON details.
- No IP address, browser details or tracking identifiers are stored with enquiries.
- Notification emails contain the full enquiry (the resort needs it). Emails stay in the Gmail inbox and Resend's sending log until deleted.

# Planned routes

Phase 2 built only `/`; Phase 3 added the rooms pages. Homepage links point to the routes below so the navigation
structure is final; they show the friendly not-found page until their phase is built.

| Route | Phase |
|---|---|
| `/rooms`, `/rooms/<room-slug>` (built in Phase 3) | 3 |
| `/restaurant` (built in Phase 4) | 4 |
| `/events`, `/events/enquiry` (built in Phase 5) | 5 |
| `/experiences` redirects to `/gallery#resort` (Phase 6); the nav item is now "Gallery" | 6 |
| `/khandoli`, `/gallery` (built in Phase 6) | 6 |
| `/book` (accepts `?room=<slug>`), `/contact` (built in Phase 7) | 7 |

Contact details, nav and room names live in `src/lib/site.ts`.
Photos awaiting consent (not copied to `public/`): `experiences/kitty party.png`, `experiences/winter -1.png`.
The UPI QR menu page must never be published.

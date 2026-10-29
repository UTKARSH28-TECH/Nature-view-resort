# Events: what is shown and what still needs confirming

## Shown on the site (from the photos and the printed menu card only)

- The menu card lists **Birthday Party, Kitty Party, Anniversary Party and Marriage Party** (and "AC room available").
- Photographs show an **open red-roofed pavilion with a raised stage**, a **covered dining hall** (long table, drapes, string lights; also decorated for a party), a **lawn** with red-roofed pavilions, and a **decorated birthday setup**.
- Meetings, conferences and engagements are mentioned as occasions the resort will discuss; no facility is claimed.

## Photos used (all from `public/images`, converted from supplied files)

| Photo | Used for |
|---|---|
| `events/stage-pavilion` | Events hero, weddings & receptions, "Open pavilion with stage" |
| `resort/aerial-night` | Weddings & receptions (grounds at night) |
| `events/birthday-setup` | Birthdays & anniversaries |
| `events/restaurant-hall-evening` | Birthdays (hall decorated), "Covered dining hall" |
| `events/long-table-hall` | Family celebrations |
| `resort/cottages-dusk` | Family celebrations (lawn), "Lawn and grounds" |

Not used: `kitty party` and `winter -1` (awaiting consent). There are **no photographs of a conference or meeting room**, so that section is text only.

## To confirm with the resort (nothing below is shown on the site)

1. **Official names** of the pavilion, hall and lawn (the site uses descriptive names).
2. **Capacity** of each space (seated and standing), and any minimum or maximum guest numbers.
3. **Rates, packages and booking/deposit terms**; whether rates are "on enquiry".
4. **Catering**: in-house only or outside caterers allowed; menus for events; the restaurant card is the a-la-carte menu only.
5. **Decoration**: is decoration offered, by whom, or can clients bring their own decorators?
6. **Sound, lighting, stage and AV equipment**, power backup, and noise or timing restrictions.
7. **Rooms for guests** and any event + room packages.
8. **Meetings and conferences**: is there a meeting room or hall, its capacity, equipment (projector, screen, Wi-Fi) and photographs.
9. **Engagements and kitty parties**: any specific arrangements or minimums.
10. **Availability and booking process** (advance notice, how dates are confirmed).
11. **Photos**: are the pavilion and hall photos from real events at the resort? Can the hall and pavilion be described as wedding venues specifically?
12. **Consent** for the `kitty party` and `winter -1` photographs, if they should be used.

## Enquiry form data (ready for Phase 7)

`src/lib/enquiries.ts` defines the `EventEnquiry` type, validation and message formatting (pure functions, reusable on the server).
Fields: name, phone (10-digit Indian mobile, normalised), email, event type, preferred date (or "not fixed yet"), approximate guests (1-5000),
preferred space, requirements (max 1500 characters), plus a hidden honeypot field.

The form currently **sends nothing**: after validation it shows "ready to send" with WhatsApp, email-app and call options. Phase 7 replaces `submitEventEnquiry()` with a server route that validates again and sends the email.

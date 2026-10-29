import { eventTypeLabel, venueLabel, type EventEnquiry } from "./enquiries";
import { formatDisplayDate } from "./contact-validation";
import { roomName, type RoomEnquiry } from "./room-enquiry";
import { SITE } from "./site";

export type EnquiryPayload =
  | { kind: "room"; value: RoomEnquiry }
  | { kind: "event"; value: EventEnquiry };

const NOTE =
  "This is an ENQUIRY submitted through the website. It is not a confirmed reservation or a confirmed event booking. Availability has not been checked or promised; please contact the guest to discuss.";

const CONTROL_AND_SEPARATORS = new RegExp("[\u0000-\u001F\u007F\u2028\u2029]+", "g");

/** Collapses to one line without control characters, so guest text can never inject email headers. */
export function oneLine(s: string, max = 80): string {
  return s.replace(CONTROL_AND_SEPARATORS, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatTimestamp(d: Date): string {
  const ist = d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" });
  return `${ist} IST (${d.toISOString()})`;
}

type Row = [label: string, value: string];

function rowsFor(p: EnquiryPayload): { title: string; rows: Row[] } {
  if (p.kind === "room") {
    const e = p.value;
    return {
      title: "Room booking enquiry",
      rows: [
        ["Preferred room", e.room ? roomName(e.room) : "No preference"],
        ["Check-in", formatDisplayDate(e.checkIn)],
        ["Check-out", `${formatDisplayDate(e.checkOut)} (${e.nights} ${e.nights === 1 ? "night" : "nights"})`],
        ["Adults", String(e.adults)],
        ["Children", String(e.children)],
        ["Guest name", e.name],
        ["Phone", e.phone],
        ["Email", e.email],
        ["Special requests", e.requests || "None given"],
      ],
    };
  }
  const e = p.value;
  return {
    title: "Event enquiry",
    rows: [
      ["Event type", eventTypeLabel(e.eventType)],
      ["Preferred date", e.dateFlexible ? "Not fixed yet" : formatDisplayDate(e.eventDate)],
      ["Approximate guests", String(e.guests)],
      ["Preferred space", e.space ? venueLabel(e.space) : "No preference given"],
      ["Contact name", e.name],
      ["Phone", e.phone],
      ["Email", e.email],
      ["Requirements", e.requirements || "None given"],
    ],
  };
}

export function buildEnquiryEmail(p: EnquiryPayload, reference: string, at: Date) {
  const { title, rows } = rowsFor(p);
  const stamp = formatTimestamp(at);
  const who = oneLine(p.value.name, 60);
  const subject = oneLine(`[${reference}] New ${title.toLowerCase()} from ${who}`, 150);

  const text = [
    title.toUpperCase(),
    `Reference: ${reference}`,
    `Received: ${stamp}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    NOTE,
    "",
    `Reply to this email to answer the guest directly (reply-to is set to their address), or call ${SITE.phoneDisplay}.`,
  ].join("\n");

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="border-top:1px solid #e8dfcb;width:38%;vertical-align:top;color:#4a554e">${escapeHtml(k)}</td><td style="border-top:1px solid #e8dfcb;vertical-align:top">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4eee1;font-family:Arial,Helvetica,sans-serif;color:#1d2420">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:#1c3529;color:#ffffff;padding:20px 24px"><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase">${escapeHtml(SITE.name)}</div><div style="font-size:22px;margin-top:6px">${escapeHtml(title)}</div></td></tr>
<tr><td style="padding:20px 24px"><p style="margin:0 0 4px"><strong>Reference:</strong> ${escapeHtml(reference)}</p><p style="margin:0 0 16px"><strong>Received:</strong> ${escapeHtml(stamp)}</p>
<table role="presentation" width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
${tableRows}
</table>
<p style="margin:20px 0 0;padding:12px;background:#fbf8f1;border-left:4px solid #a8482c;font-size:14px"><strong>This is an enquiry, not a confirmed reservation or event booking.</strong> Availability has not been checked or promised. Please contact the guest to discuss.</p>
<p style="margin:16px 0 0;font-size:13px;color:#4a554e">Reply to this email to answer the guest directly, or call ${escapeHtml(SITE.phoneDisplay)}.</p>
</td></tr></table></td></tr></table></body></html>`;

  return { subject, text, html };
}

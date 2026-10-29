// Private staff tool for stored enquiries. Needs DATABASE_URL, so it only works for someone with server credentials.
// It prints guest details to YOUR terminal; there is intentionally no public admin page.
//
//   npm run enquiries                      latest 20 enquiries
//   npm run enquiries -- list --status new --limit 50
//   npm run enquiries -- unsent            saved enquiries whose notification email did not go out
//   npm run enquiries -- show NVR-261029-K7QD2
//   npm run enquiries -- mark NVR-261029-K7QD2 contacted    (new | contacted | closed)
import postgres from "postgres";

const url = process.env.DATABASE_URL?.trim();
if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
  console.error("DATABASE_URL is not set (or is not a postgres:// URL).");
  process.exit(1);
}

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "list";
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const sql = postgres(url, { max: 1, onnotice: () => {} });
const fmt = (d) => new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });

function line(r) {
  const p = r.payload;
  const what =
    r.kind === "room"
      ? `${p.room || "any room"} ${p.checkIn} → ${p.checkOut}, ${p.adults}A ${p.children}C`
      : `${p.eventType} ${p.dateFlexible ? "(date open)" : p.eventDate}, ~${p.guests} guests`;
  return `${r.reference}  ${fmt(r.created_at)}  [${r.status}] email:${r.email_status}\n    ${r.guest_name}  ${r.phone}  ${r.email}\n    ${r.kind}: ${what}`;
}

try {
  if (cmd === "list" || cmd === "unsent") {
    const limit = Math.min(Math.max(parseInt(flag("limit", "20"), 10) || 20, 1), 500);
    const status = flag("status", null);
    const rows = await sql`
      SELECT * FROM enquiries
      WHERE (${cmd === "unsent"} = false OR email_status <> 'sent')
        AND (${status}::text IS NULL OR status = ${status})
      ORDER BY created_at DESC LIMIT ${limit}`;
    if (rows.length === 0) console.log("No enquiries found.");
    for (const r of rows) console.log(line(r) + "\n");
  } else if (cmd === "show") {
    const [r] = await sql`SELECT * FROM enquiries WHERE reference = ${args[1] ?? ""}`;
    if (!r) console.log("Not found.");
    else console.log(line(r) + "\n" + JSON.stringify(r.payload, null, 2));
  } else if (cmd === "mark") {
    const [ref, status] = [args[1], args[2]];
    if (!ref || !["new", "contacted", "closed"].includes(status)) {
      console.error("Usage: mark <reference> <new|contacted|closed>");
      process.exitCode = 1;
    } else {
      const res = await sql`UPDATE enquiries SET status = ${status}, updated_at = now() WHERE reference = ${ref} RETURNING reference`;
      console.log(res.length ? `${ref} marked ${status}.` : "Not found.");
    }
  } else {
    console.error("Unknown command. Use: list | unsent | show <ref> | mark <ref> <status>");
    process.exitCode = 1;
  }
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : "unknown error");
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}

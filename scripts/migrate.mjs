// Applies the SQL files in db/migrations in order. Safe to run repeatedly: applied files are recorded in
// schema_migrations and skipped. Reads DATABASE_URL from the environment (or .env.local via the npm script).
//
//   npm run db:migrate            apply anything new
//   npm run db:migrate -- --status  show what is applied / pending, change nothing
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL?.trim();
if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
  console.error("DATABASE_URL is not set (or is not a postgres:// URL). Nothing was changed.");
  process.exit(1);
}

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
const statusOnly = process.argv.includes("--status");

const sql = postgres(url, { max: 1, onnotice: () => {} });
try {
  await sql`CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`;
  const done = new Set((await sql`SELECT name FROM schema_migrations`).map((r) => r.name));
  let applied = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`  already applied  ${file}`);
      continue;
    }
    if (statusOnly) {
      console.log(`  PENDING          ${file}`);
      continue;
    }
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(path.join(dir, file), "utf8"));
      await tx`INSERT INTO schema_migrations (name) VALUES (${file})`;
    });
    console.log(`  applied          ${file}`);
    applied++;
  }
  console.log(statusOnly ? "Status only: nothing changed." : `Done. ${applied} migration(s) applied.`);
} catch (err) {
  // Print the database's own message (it never contains the password) but not the connection string.
  console.error("Migration failed:", err instanceof Error ? err.message : "unknown error");
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}

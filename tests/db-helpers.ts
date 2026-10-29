import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import type { Db } from "@/lib/enquiry-store";

const MIGRATIONS = path.resolve(__dirname, "..", "db", "migrations");

/**
 * An in-memory PostgreSQL (PGlite) with the real migration files applied.
 * Tests run the production SQL against it; no external database and no real customer data are involved.
 */
export async function createTestDb() {
  const pg = new PGlite();
  for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
    await pg.exec(readFileSync(path.join(MIGRATIONS, file), "utf8"));
  }
  const db: Db = {
    async query(text, params = []) {
      const r = await pg.query(text, params);
      return { rows: r.rows as Record<string, unknown>[] };
    },
  };
  return {
    db,
    pg,
    async rows() {
      return (await pg.query("SELECT * FROM enquiries ORDER BY created_at")).rows as Record<string, unknown>[];
    },
    async reset() {
      await pg.exec("TRUNCATE enquiries");
    },
  };
}

/** A database that always fails, to prove the site degrades honestly. */
export const brokenDb: Db = {
  async query() {
    throw new Error("connection refused (test)");
  },
};

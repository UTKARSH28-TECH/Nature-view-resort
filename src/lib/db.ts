import postgres from "postgres";
import { createEnquiryStore, type Db, type EnquiryStore } from "./enquiry-store";

/**
 * Connects to PostgreSQL using DATABASE_URL (server-side environment variable only).
 * Works with any Postgres: Neon, Supabase, Vercel Postgres or self-hosted. The connection is created lazily on first
 * use, so building the site and running without a database are both fine; `getStoreFromEnv()` just returns null.
 */

let cached: { url: string; store: EnquiryStore } | null = null;

function createDb(url: string): Db {
  // max: 1 and prepare: false suit serverless functions and pooled (pgbouncer) connection strings.
  const sql = postgres(url, { max: 1, prepare: false, idle_timeout: 20, connect_timeout: 10 });
  return {
    async query(text, params = []) {
      const rows = await sql.unsafe(text, params as never[]);
      return { rows: rows as unknown as Record<string, unknown>[] };
    },
  };
}

export function getStoreFromEnv(env: Record<string, string | undefined> = process.env): EnquiryStore | null {
  const url = env.DATABASE_URL?.trim();
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) return null;
  if (!cached || cached.url !== url) cached = { url, store: createEnquiryStore(createDb(url)) };
  return cached.store;
}

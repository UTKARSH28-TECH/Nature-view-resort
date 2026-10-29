import { createHash } from "node:crypto";
import type { EnquiryPayload } from "./email-templates";

/**
 * Persistent storage for enquiries in PostgreSQL.
 *
 * The store talks to the database through a tiny `Db` interface, so the same SQL runs against a real server
 * (postgres.js in production) and an in-memory Postgres in tests. Nothing here is imported by client code.
 * DATABASE_URL is read only in `getStoreFromEnv`; when it is missing there is simply no store and the site says
 * that persistent storage is not active. No code claims an enquiry was saved unless `insert` really succeeded.
 */

export type Db = {
  query(text: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
};

export type EmailStatus = "pending" | "sent" | "failed" | "not-configured";

export type StoredEnquiry = { reference: string; emailStatus: EmailStatus; createdAt: Date };

export type NewEnquiry = {
  reference: string;
  submissionId: string | null;
  fingerprint: string;
  payload: EnquiryPayload;
};

export type InsertResult = { ok: true } | { ok: false; reason: "conflict" | "error" };

export type EnquiryStore = {
  findBySubmissionId(id: string): Promise<StoredEnquiry | null>;
  findRecentByFingerprint(fingerprint: string, windowMinutes: number): Promise<StoredEnquiry | null>;
  insert(e: NewEnquiry): Promise<InsertResult>;
  markEmail(reference: string, r: { status: Exclude<EmailStatus, "pending">; providerId?: string; failure?: string }): Promise<boolean>;
};

/** Stable hash of the fields that make two enquiries "the same", used to catch refreshes and double submits. */
export function fingerprintOf(p: EnquiryPayload): string {
  const v = p.value;
  const key =
    p.kind === "room"
      ? [p.kind, v.email.toLowerCase(), v.phone, p.value.room, p.value.checkIn, p.value.checkOut, p.value.adults, p.value.children]
      : [p.kind, v.email.toLowerCase(), v.phone, p.value.eventType, p.value.eventDate, p.value.dateFlexible, p.value.guests, p.value.space];
  return createHash("sha256").update(JSON.stringify(key)).digest("hex");
}

function toStored(row: Record<string, unknown>): StoredEnquiry {
  return {
    reference: String(row.reference),
    emailStatus: row.email_status as EmailStatus,
    createdAt: new Date(String(row.created_at)),
  };
}

export function createEnquiryStore(db: Db): EnquiryStore {
  return {
    async findBySubmissionId(id) {
      const r = await db.query("SELECT reference, email_status, created_at FROM enquiries WHERE submission_id = $1", [id]);
      return r.rows[0] ? toStored(r.rows[0]) : null;
    },

    async findRecentByFingerprint(fingerprint, windowMinutes) {
      const r = await db.query(
        `SELECT reference, email_status, created_at FROM enquiries
          WHERE fingerprint = $1 AND created_at > now() - ($2::int * interval '1 minute')
          ORDER BY created_at DESC LIMIT 1`,
        [fingerprint, windowMinutes],
      );
      return r.rows[0] ? toStored(r.rows[0]) : null;
    },

    async insert(e) {
      const v = e.payload.value;
      try {
        const r = await db.query(
          `INSERT INTO enquiries (reference, submission_id, fingerprint, kind, guest_name, phone, email, payload)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
           ON CONFLICT DO NOTHING
           RETURNING reference`,
          [e.reference, e.submissionId, e.fingerprint, e.payload.kind, v.name, v.phone, v.email, JSON.stringify(v)],
        );
        return r.rows.length === 1 ? { ok: true } : { ok: false, reason: "conflict" };
      } catch {
        return { ok: false, reason: "error" };
      }
    },

    async markEmail(reference, r) {
      try {
        const res = await db.query(
          `UPDATE enquiries
              SET email_status = $2, email_provider_id = $3, email_failure = $4,
                  email_attempted_at = now(), updated_at = now()
            WHERE reference = $1
            RETURNING reference`,
          [reference, r.status, r.providerId ?? null, r.failure ?? null],
        );
        return res.rows.length === 1;
      } catch {
        return false;
      }
    },
  };
}

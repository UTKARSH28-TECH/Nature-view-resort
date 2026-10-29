import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getStoreFromEnv } from "@/lib/db";
import { fingerprintOf } from "@/lib/enquiry-store";
import { validateRoomEnquiry } from "@/lib/room-enquiry";
import { TODAY, validRoom } from "./helpers";

const run = promisify(execFile);
const ROOT = path.resolve(__dirname, "..");
const PORT = 54329;
const URL = `postgres://postgres:postgres@127.0.0.1:${PORT}/postgres`;

let pg: PGlite;
let server: PGLiteSocketServer;

beforeAll(async () => {
  pg = new PGlite();
  server = new PGLiteSocketServer({ db: pg, port: PORT, host: "127.0.0.1" });
  await server.start();
});
afterAll(async () => {
  await server?.stop();
  await pg?.close();
});

const script = (name: string, ...args: string[]) =>
  run(process.execPath, [path.join(ROOT, "scripts", name), ...args], { env: { ...process.env, DATABASE_URL: URL }, cwd: ROOT });

describe("real postgres.js driver and scripts against an in-memory Postgres server", () => {
  it("migrate script refuses to run without DATABASE_URL", async () => {
    const env = { ...process.env };
    delete env.DATABASE_URL;
    await expect(run(process.execPath, [path.join(ROOT, "scripts", "migrate.mjs")], { env, cwd: ROOT })).rejects.toMatchObject({
      stderr: expect.stringContaining("DATABASE_URL is not set"),
    });
  });

  it("applies migrations once and is safe to run twice", async () => {
    const first = await script("migrate.mjs");
    expect(first.stdout).toContain("applied          0001_create_enquiries.sql");
    expect(first.stdout).toContain("1 migration(s) applied");
    const second = await script("migrate.mjs");
    expect(second.stdout).toContain("already applied  0001_create_enquiries.sql");
    expect(second.stdout).toContain("0 migration(s) applied");
    const status = await script("migrate.mjs", "--status");
    expect(status.stdout).toContain("Status only");
  });

  it("staff script reports an empty table", async () => {
    const out = await script("enquiries-admin.mjs", "list");
    expect(out.stdout).toContain("No enquiries found.");
  });

  it("staff purge is a dry run by default and only deletes with --yes", async () => {
    const insert = (ref: string, status: string, age: string) =>
      pg.exec(
        `INSERT INTO enquiries (reference, fingerprint, kind, status, guest_name, phone, email, payload, created_at)
         VALUES ('${ref}', 'fp-${ref}', 'room', '${status}', 'Old Guest', '9876500000', 'old@example.com', '{}', now() - interval '${age}')`,
      );
    await insert("OLD-CLOSED", "closed", "14 months");
    await insert("OLD-NEW", "new", "14 months");
    await insert("RECENT", "closed", "2 days");
    const count = async () => Number(((await pg.query("SELECT count(*)::int AS n FROM enquiries")).rows[0] as { n: number }).n);

    expect(await count()).toBe(3);
    const dry = await script("enquiries-admin.mjs", "purge", "--older-than-months", "12", "--status", "closed");
    expect(dry.stdout).toContain("Dry run: 1 enquiry(ies)");
    expect(await count()).toBe(3); // nothing deleted without --yes

    const bad = await script("enquiries-admin.mjs", "purge").catch((e) => e);
    expect(bad.stderr).toContain("Usage: purge");
    expect(await count()).toBe(3);

    const real = await script("enquiries-admin.mjs", "purge", "--older-than-months", "12", "--status", "closed", "--yes");
    expect(real.stdout).toContain("Deleted 1 enquiry(ies)");
    const left = (await pg.query("SELECT reference FROM enquiries ORDER BY reference")).rows.map((r) => (r as { reference: string }).reference);
    expect(left).toEqual(["OLD-NEW", "RECENT"]);
    await pg.exec("TRUNCATE enquiries");
  });

  it("the production store works through the real driver (getStoreFromEnv)", async () => {
    const store = getStoreFromEnv({ DATABASE_URL: URL });
    expect(store).not.toBeNull();
    const r = validateRoomEnquiry(validRoom, TODAY);
    if (!r.ok || !store) throw new Error("setup failed");
    const payload = { kind: "room" as const, value: r.value };

    expect(await store.insert({ reference: "NVR-261029-DRVR1", submissionId: "driver-test-1234", fingerprint: fingerprintOf(payload), payload })).toEqual({ ok: true });
    expect(await store.insert({ reference: "NVR-261029-DRVR2", submissionId: "driver-test-1234", fingerprint: "x", payload })).toEqual({ ok: false, reason: "conflict" });
    expect(await store.findBySubmissionId("driver-test-1234")).toMatchObject({ reference: "NVR-261029-DRVR1", emailStatus: "pending" });
    expect((await store.findRecentByFingerprint(fingerprintOf(payload), 30))?.reference).toBe("NVR-261029-DRVR1");
    expect(await store.markEmail("NVR-261029-DRVR1", { status: "failed", failure: "timeout" })).toBe(true);
    expect(await store.findBySubmissionId("driver-test-1234")).toMatchObject({ emailStatus: "failed" });
  });
});

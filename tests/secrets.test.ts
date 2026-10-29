import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const SERVER_ONLY = ["lib/mailer", "lib/enquiry-service", "lib/email-templates", "lib/rate-limit", "lib/db", "lib/enquiry-store"];
const sourceFiles = walk(path.join(ROOT, "src")).filter((f) => /\.(ts|tsx)$/.test(f));
const clientFiles = sourceFiles.filter((f) => /^\s*["']use client["']/.test(readFileSync(f, "utf8")));

describe("secrets stay on the server", () => {
  it("only server code reads the provider credentials", () => {
    const readers = sourceFiles.filter((f) => /RESEND_API_KEY|ENQUIRY_FROM_EMAIL|ENQUIRY_TO_EMAIL/.test(readFileSync(f, "utf8")));
    const rel = readers.map((f) => path.relative(ROOT, f).replace(/\\/g, "/"));
    expect(rel.sort()).toEqual(["src/lib/mailer.ts"]);
  });

  it("no client component imports server-only modules or reads process.env", () => {
    expect(clientFiles.length).toBeGreaterThan(3);
    for (const f of clientFiles) {
      const src = readFileSync(f, "utf8");
      expect(src, path.relative(ROOT, f)).not.toMatch(/process\.env/);
      for (const mod of SERVER_ONLY) expect(src, `${path.relative(ROOT, f)} imports ${mod}`).not.toContain(mod);
      expect(src).not.toMatch(/node:crypto/);
    }
  });

  it("no secret is exposed through NEXT_PUBLIC_ variables", () => {
    for (const f of [...sourceFiles, path.join(ROOT, ".env.example")].filter(existsSync)) {
      const src = readFileSync(f, "utf8");
      expect(src, path.relative(ROOT, f)).not.toMatch(/NEXT_PUBLIC_[A-Z_]*(KEY|SECRET|TOKEN|PASSWORD)/);
    }
  });

  it(".env.example holds placeholders only and real env files are git-ignored", () => {
    const example = readFileSync(path.join(ROOT, ".env.example"), "utf8");
    expect(example).not.toMatch(/re_[A-Za-z0-9]{10,}/); // no real-looking Resend key
    expect(example).toMatch(/^RESEND_API_KEY=\s*$/m);
    expect(example).toMatch(/^DATABASE_URL=\s*$/m);
    const ignore = readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    expect(ignore).toMatch(/\.env\*\.local/);
  });

  it("the production browser bundle (if built) contains no credential names or provider endpoint", () => {
    const staticDir = path.join(ROOT, ".next", "static");
    if (!existsSync(staticDir)) return; // run `npm run build` first for this check
    const bad = [/RESEND_API_KEY/, /ENQUIRY_FROM_EMAIL/, /DATABASE_URL/, /api\.resend\.com/, /re_[A-Za-z0-9]{20,}/, /postgres(ql)?:\/\/[^"\s]+@/];
    for (const f of walk(staticDir).filter((p) => /\.(js|css|html)$/.test(p))) {
      const text = readFileSync(f, "utf8");
      for (const re of bad) expect(text, `${path.relative(ROOT, f)} matches ${re}`).not.toMatch(re);
    }
  });
});

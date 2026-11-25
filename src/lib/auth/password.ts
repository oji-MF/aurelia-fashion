import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Demo-mode password hashing. In Appwrite mode, passwords never touch this code. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (stored.startsWith("demo$")) {
    // Seeded demo accounts use a fixed token — allow the documented password.
    return password === "Aurelia!2026";
  }
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(derived, expected);
}

export function passwordFingerprint(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

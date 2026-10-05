import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "enc:v1:";

function key(): Buffer {
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  const buf = raw ? Buffer.from(raw, "base64") : Buffer.alloc(0);
  if (buf.length !== 32) throw new Error("SETTINGS_ENCRYPTION_KEY must be 32 bytes, base64 encoded");
  return buf;
}

/** AES-256-GCM. Output: enc:v1:<iv>.<tag>.<ciphertext> (all base64url). */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + [iv, tag, data].map((b) => b.toString("base64url")).join(".");
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith(PREFIX)) throw new Error("Not an encrypted value");
  const [iv, tag, data] = stored.slice(PREFIX.length).split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export const isEncrypted = (value: unknown): value is string => typeof value === "string" && value.startsWith(PREFIX);

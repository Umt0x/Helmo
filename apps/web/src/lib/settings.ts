import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { guildSettings } from "@/db/schema";
import { pages } from "@/content";
import { COMMAND_DEFAULTS, sanitizeCommands } from "@/content/commands";
import { GUARD_DEFAULTS, sanitizeGuard } from "@/content/guard";
import type { Row } from "@/content/types";
import { MASK, defaultsFor, sanitizeRows } from "@/content/validate";
import { encryptSecret, isEncrypted } from "./crypto";

export const GUARD_PAGE = "guard/overview";
export const COMMANDS_PAGE = "commands/list";

/** Every page that can be saved, so unknown page names are rejected. */
export function isKnownPage(page: string) {
  return page === GUARD_PAGE || page === COMMANDS_PAGE || page in pages;
}

const rowsOf = (page: string): Row[] => pages[page]?.sections.flatMap((s) => s.rows ?? []) ?? [];

async function readRaw(guildId: string, page: string): Promise<Record<string, unknown> | null> {
  const [row] = await db
    .select({ data: guildSettings.data })
    .from(guildSettings)
    .where(and(eq(guildSettings.guildId, guildId), eq(guildSettings.page, page)))
    .limit(1);
  return row?.data ?? null;
}

/** Saved values for a page, merged over its defaults and safe to send to the browser. */
export async function loadSettings(guildId: string, page: string): Promise<Record<string, unknown>> {
  const stored = await readRaw(guildId, page);

  if (page === GUARD_PAGE) return sanitizeGuard(stored ?? GUARD_DEFAULTS);
  if (page === COMMANDS_PAGE) return sanitizeCommands(stored ?? COMMAND_DEFAULTS);

  const rows = rowsOf(page);
  const values = { ...defaultsFor(rows), ...sanitizeRows(rows, stored) };
  // Secrets never leave the server: show a mask when one is stored.
  for (const r of rows) if (r.type === "secret") values[r.id] = isEncrypted(stored?.[r.id]) ? MASK : "";
  return values;
}

/** Validates, encrypts secrets and stores the page. Returns what the browser should now show. */
export async function saveSettings(
  guildId: string,
  userId: string,
  page: string,
  input: unknown,
): Promise<Record<string, unknown>> {
  let data: Record<string, unknown>;
  let shown: Record<string, unknown>;

  if (page === GUARD_PAGE) {
    data = shown = sanitizeGuard(input);
  } else if (page === COMMANDS_PAGE) {
    data = shown = sanitizeCommands(input);
  } else {
    const rows = rowsOf(page);
    const clean = sanitizeRows(rows, input);
    const stored = await readRaw(guildId, page);
    data = { ...clean };
    shown = { ...clean };
    for (const r of rows) {
      if (r.type !== "secret") continue;
      const value = clean[r.id] as string;
      if (value === MASK) {
        // Untouched: keep what is already stored.
        data[r.id] = isEncrypted(stored?.[r.id]) ? stored![r.id] : "";
        shown[r.id] = isEncrypted(stored?.[r.id]) ? MASK : "";
      } else if (value === "") {
        data[r.id] = "";
        shown[r.id] = "";
      } else {
        data[r.id] = encryptSecret(value);
        shown[r.id] = MASK;
      }
    }
  }

  await db
    .insert(guildSettings)
    .values({ guildId, page, data, updatedBy: userId })
    .onConflictDoUpdate({
      target: [guildSettings.guildId, guildSettings.page],
      set: { data, updatedBy: userId, updatedAt: new Date() },
    });
  return shown;
}

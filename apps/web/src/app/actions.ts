"use server";

import { getCurrentGuild, getUser } from "@/lib/session";
import { isKnownPage, saveSettings } from "@/lib/settings";

export type SaveResult = { ok: true; data: Record<string, unknown> } | { ok: false; error: "auth" | "page" | "failed" };

/** Saves one settings page for the server the user is currently managing. */
export async function savePage(page: string, input: unknown): Promise<SaveResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  // The server comes from the session cookie, never from the browser's request body.
  const guild = await getCurrentGuild(user.id);
  if (!guild) return { ok: false, error: "auth" };
  if (!isKnownPage(page)) return { ok: false, error: "page" };

  try {
    return { ok: true, data: await saveSettings(guild.guildId, user.id, page, input) };
  } catch (err) {
    console.error("Saving settings failed:", err);
    return { ok: false, error: "failed" };
  }
}

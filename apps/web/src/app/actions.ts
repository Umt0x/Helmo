"use server";

import { revalidatePath } from "next/cache";
import { connectBot, removeBot } from "@/lib/bots";
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

export type BotActionResult =
  | { ok: true }
  | { ok: false; error: string; limit?: number };

/** Connects a bot to the logged-in account. Plan limits are checked on the server. */
export async function connectBotAction(type: string, token: string): Promise<BotActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  try {
    const res = await connectBot(user.id, type, token);
    if (!res.ok) return { ok: false, error: res.error, limit: res.limit };
    revalidatePath("/dashboard/bot-settings/bots");
    return { ok: true };
  } catch (err) {
    console.error("Connecting bot failed:", err);
    return { ok: false, error: "failed" };
  }
}

export async function removeBotAction(botId: string): Promise<BotActionResult> {
  const user = await getUser();
  if (!user) return { ok: false, error: "auth" };
  const removed = await removeBot(user.id, botId);
  if (!removed) return { ok: false, error: "failed" };
  revalidatePath("/dashboard/bot-settings/bots");
  return { ok: true };
}

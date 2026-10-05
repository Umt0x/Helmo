import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { botHeartbeats, bots, users, type Bot } from "@/db/schema";
import { isBotType } from "./bot-types";
import { encryptSecret } from "./crypto";
import { checkAddBot, planUsage, splitActive } from "./limits";
import { isPlanKey, type PlanKey } from "./plans";

export type BotIdentity = { id: string; name: string };

/** Asks Discord who a token belongs to. Returns null if the token is not a working bot token. */
export async function resolveDiscordBot(token: string): Promise<BotIdentity | null> {
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bot ${token}` },
    signal: AbortSignal.timeout(8000),
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Discord answered ${res.status}`);
  const me = (await res.json()) as { id: string; username: string; bot?: boolean };
  return me.bot ? { id: me.id, name: me.username } : null;
}

export type ConnectResult =
  | { ok: true; bot: Bot }
  | { ok: false; error: "unknown_type" | "total" | "type" | "invalid_token" | "duplicate" | "unreachable"; limit?: number };

const planOf = (value: string): PlanKey => (isPlanKey(value) ? value : "basic");

/**
 * Connects a bot to an account: plan limits, token check, encryption, insert.
 * `resolve` is injectable so tests do not need the network.
 */
export async function connectBot(
  ownerId: string,
  type: string,
  token: string,
  resolve: (token: string) => Promise<BotIdentity | null> = resolveDiscordBot,
): Promise<ConnectResult> {
  if (!isBotType(type)) return { ok: false, error: "unknown_type" };
  const cleanToken = token.trim();
  if (cleanToken.length < 20 || cleanToken.length > 300) return { ok: false, error: "invalid_token" };

  const [owner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, ownerId)).limit(1);
  if (!owner) return { ok: false, error: "invalid_token" };

  // Cheap check first, so a full account never costs a Discord call.
  const early = checkAddBot(planOf(owner.plan), await listBots(ownerId), type);
  if (!early.ok) return early.reason === "unknown_type" ? { ok: false, error: "unknown_type" } : { ok: false, error: early.reason, limit: early.limit };

  let identity: BotIdentity | null;
  try {
    identity = await resolve(cleanToken);
  } catch {
    return { ok: false, error: "unreachable" };
  }
  if (!identity) return { ok: false, error: "invalid_token" };

  return db.transaction(async (tx): Promise<ConnectResult> => {
    // Lock the account row so two requests at once cannot both slip under the limit.
    const [locked] = await tx.select({ plan: users.plan }).from(users).where(eq(users.id, ownerId)).for("update");
    const existing = await tx.select().from(bots).where(eq(bots.ownerId, ownerId));
    const check = checkAddBot(planOf(locked.plan), existing, type);
    if (!check.ok) return check.reason === "unknown_type" ? { ok: false, error: "unknown_type" } : { ok: false, error: check.reason, limit: check.limit };

    const [dupe] = await tx.select({ id: bots.id }).from(bots).where(eq(bots.discordBotId, identity.id)).limit(1);
    if (dupe) return { ok: false, error: "duplicate" };

    const [bot] = await tx
      .insert(bots)
      .values({ ownerId, type, name: identity.name, discordBotId: identity.id, tokenEnc: encryptSecret(cleanToken) })
      .returning();
    return { ok: true, bot };
  });
}

export async function listBots(ownerId: string): Promise<Bot[]> {
  return db.select().from(bots).where(eq(bots.ownerId, ownerId)).orderBy(asc(bots.createdAt));
}

/** Deletes a bot, but only if it belongs to `ownerId`. */
export async function removeBot(ownerId: string, botId: string): Promise<boolean> {
  const rows = await db.delete(bots).where(and(eq(bots.id, botId), eq(bots.ownerId, ownerId))).returning({ id: bots.id });
  return rows.length > 0;
}

/** Everything the "Bots" page needs: the plan, usage numbers, and which bots may run. */
export { HEARTBEAT_STALE_MS, effectiveStatus } from "./status";
import { effectiveStatus } from "./status";

export async function botOverview(ownerId: string) {
  const [owner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, ownerId)).limit(1);
  const plan = planOf(owner?.plan ?? "basic");
  const list = await listBots(ownerId);
  const beats = await db
    .select({ botId: botHeartbeats.botId, seenAt: botHeartbeats.seenAt })
    .from(botHeartbeats)
    .innerJoin(bots, eq(bots.id, botHeartbeats.botId))
    .where(eq(bots.ownerId, ownerId));
  const seen = new Map(beats.map((b) => [b.botId, b.seenAt]));
  const { paused } = splitActive(plan, list);
  const pausedIds = new Set(paused.map((b) => b.id));
  return {
    plan,
    usage: planUsage(plan, list),
    bots: list.map((b) => ({
      id: b.id,
      type: b.type,
      name: b.name,
      status: effectiveStatus(b.status, seen.get(b.id) ?? null),
      error: b.status === "error" ? b.lastError : null,
      paused: pausedIds.has(b.id),
    })),
  };
}

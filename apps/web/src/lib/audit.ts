import "server-only";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { modActions } from "@/db/schema";

export const MOD_ACTIONS = ["ban", "kick", "mute", "warn", "clear"] as const;
export type ModActionKey = (typeof MOD_ACTIONS)[number];

export type ModerationEntry = {
  id: number;
  caseNo: number | null;
  at: string;
  action: string;
  moderator: string;
  target: string | null;
  reason: string | null;
  durationMin: number | null;
  auto: boolean;
};

export type ModerationLog = {
  entries: ModerationEntry[];
  /** Actions in the last 7 days, per type. */
  last7: Record<ModActionKey, number>;
};

/** The latest moderation actions of one server and a 7-day count per type. Always scoped to that server. */
export async function moderationLog(guildId: string, limit = 50): Promise<ModerationLog> {
  const rows = await db
    .select()
    .from(modActions)
    .where(eq(modActions.guildId, guildId))
    .orderBy(desc(modActions.at), desc(modActions.id))
    .limit(limit);

  const counts = await db
    .select({ action: modActions.action, n: sql<number>`count(*)::int` })
    .from(modActions)
    .where(and(eq(modActions.guildId, guildId), gt(modActions.at, sql`now() - interval '7 days'`)))
    .groupBy(modActions.action);

  const last7 = Object.fromEntries(MOD_ACTIONS.map((a) => [a, 0])) as Record<ModActionKey, number>;
  for (const c of counts) if (c.action in last7) last7[c.action as ModActionKey] = c.n;

  return {
    entries: rows.map((r) => ({
      id: r.id,
      caseNo: r.caseNo,
      at: r.at.toISOString(),
      action: r.action,
      moderator: r.moderatorName ?? r.moderatorId,
      target: r.targetName ?? r.targetId,
      reason: r.reason,
      durationMin: r.durationMin,
      auto: r.auto,
    })),
    last7,
  };
}

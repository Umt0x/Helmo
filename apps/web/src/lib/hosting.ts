import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { botHeartbeats, bots, commandEvents, users } from "@/db/schema";
import { listBots } from "./bots";
import { summarizeHosting, type HostingBotRow, type HostingData } from "./hosting-summary";
import { splitActive } from "./limits";
import { isPlanKey } from "./plans";

/** Everything on the Hosting page, read from what the bot runtime reports. Only the owner's own bots. */
export async function hostingOverview(ownerId: string): Promise<HostingData> {
  const [owner] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, ownerId)).limit(1);
  const plan = isPlanKey(owner?.plan) ? owner.plan : "basic";

  const list = await listBots(ownerId);
  const paused = new Set(splitActive(plan, list).paused.map((b) => b.id));

  const beats = await db
    .select({
      botId: botHeartbeats.botId,
      seenAt: botHeartbeats.seenAt,
      pingMs: botHeartbeats.pingMs,
      guildCount: botHeartbeats.guildCount,
      workerId: botHeartbeats.workerId,
      rssMb: botHeartbeats.rssMb,
      upSince: botHeartbeats.upSince,
      loopLagMs: botHeartbeats.loopLagMs,
    })
    .from(botHeartbeats)
    .innerJoin(bots, eq(bots.id, botHeartbeats.botId))
    .where(eq(bots.ownerId, ownerId));
  const beatOf = new Map(beats.map((b) => [b.botId, b]));

  const rows: HostingBotRow[] = list.map((b) => {
    const beat = beatOf.get(b.id);
    return {
      id: b.id,
      name: b.name,
      type: b.type,
      status: b.status,
      paused: paused.has(b.id),
      seenAt: beat?.seenAt ?? null,
      pingMs: beat?.pingMs ?? null,
      guildCount: beat?.guildCount ?? null,
      workerId: beat?.workerId ?? null,
      rssMb: beat?.rssMb ?? null,
      upSince: beat?.upSince ?? null,
      loopLagMs: beat?.loopLagMs ?? null,
    };
  });

  const [totals] = await db
    .select({
      total: sql<number>`count(*)::int`,
      ok: sql<number>`(count(*) filter (where ${commandEvents.outcome} = 'ok'))::int`,
      avg: sql<string | null>`avg(${commandEvents.durationMs})`,
    })
    .from(commandEvents)
    .innerJoin(bots, eq(bots.id, commandEvents.botId))
    .where(and(eq(bots.ownerId, ownerId), gt(commandEvents.at, sql`now() - interval '24 hours'`)));

  return summarizeHosting(rows, { total: totals.total, ok: totals.ok, avgMs: totals.avg === null ? null : Number(totals.avg) });
}

import { effectiveStatus } from "./status";

export type HostingBotRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  paused: boolean;
  seenAt: Date | null;
  pingMs: number | null;
  guildCount: number | null;
  workerId: string | null;
  rssMb: number | null;
  upSince: Date | null;
  loopLagMs: number | null;
};

export type CommandTotals = { total: number; ok: number; avgMs: number | null };

export type HostingBot = {
  id: string;
  name: string;
  type: string;
  status: string;
  paused: boolean;
  pingMs: number | null;
  guilds: number;
  worker: string | null;
  /** Seconds since the last heartbeat, or null if the bot never reported. */
  seenAgoSec: number | null;
};

export type HostingData = {
  bots: HostingBot[];
  summary: {
    online: number;
    total: number;
    avgPingMs: number | null;
    servers: number;
    memoryMb: number;
    longestUptimeSec: number | null;
    maxLoopLagMs: number | null;
  };
  commands: { total: number; successRate: number | null; avgMs: number | null };
};

/** Turns raw bot and heartbeat rows into the numbers on the Hosting page. Only bots that are really online count. */
export function summarizeHosting(rows: HostingBotRow[], commands: CommandTotals, now = Date.now()): HostingData {
  const bots: HostingBot[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    status: effectiveStatus(r.status, r.seenAt, now),
    paused: r.paused,
    pingMs: r.pingMs,
    guilds: r.guildCount ?? 0,
    worker: r.workerId,
    seenAgoSec: r.seenAt ? Math.max(0, Math.round((now - r.seenAt.getTime()) / 1000)) : null,
  }));

  const onlineIds = new Set(bots.filter((b) => b.status === "online").map((b) => b.id));
  const online = rows.filter((r) => onlineIds.has(r.id));

  const pings = online.map((r) => r.pingMs).filter((p): p is number => p !== null);
  // The memory figure is per worker process, and one worker hosts many bots: count each worker once.
  const memoryByWorker = new Map<string, number>();
  for (const r of online) if (r.workerId && r.rssMb !== null) memoryByWorker.set(r.workerId, r.rssMb);
  const uptimes = online.filter((r) => r.upSince).map((r) => Math.round((now - r.upSince!.getTime()) / 1000));
  const lags = online.map((r) => r.loopLagMs).filter((l): l is number => l !== null);

  return {
    bots,
    summary: {
      online: onlineIds.size,
      total: rows.length,
      avgPingMs: pings.length ? Math.round(pings.reduce((a, b) => a + b, 0) / pings.length) : null,
      servers: online.reduce((sum, r) => sum + (r.guildCount ?? 0), 0),
      memoryMb: [...memoryByWorker.values()].reduce((a, b) => a + b, 0),
      longestUptimeSec: uptimes.length ? Math.max(...uptimes) : null,
      maxLoopLagMs: lags.length ? Math.max(...lags) : null,
    },
    commands: {
      total: commands.total,
      successRate: commands.total ? Math.round((commands.ok / commands.total) * 100) : null,
      avgMs: commands.avgMs === null ? null : Math.round(commands.avgMs),
    },
  };
}

export function formatDuration(totalSec: number): string {
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${totalSec}s`;
}

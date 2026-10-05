import { describe, expect, it } from "vitest";
import { formatDuration, summarizeHosting, type HostingBotRow } from "@/lib/hosting-summary";

const NOW = Date.UTC(2026, 9, 5, 12, 0, 0);
const ago = (sec: number) => new Date(NOW - sec * 1000);

const row = (over: Partial<HostingBotRow>): HostingBotRow => ({
  id: "b1",
  name: "Bot",
  type: "main",
  status: "online",
  paused: false,
  seenAt: ago(5),
  pingMs: 100,
  guildCount: 2,
  workerId: "w1",
  rssMb: 80,
  upSince: ago(3600),
  loopLagMs: 3,
  ...over,
});

const noCommands = { total: 0, ok: 0, avgMs: null };

describe("hosting summary", () => {
  it("averages ping, sums servers and finds the longest uptime over online bots", () => {
    const data = summarizeHosting(
      [row({ id: "a", pingMs: 100, guildCount: 2, upSince: ago(3600) }), row({ id: "b", pingMs: 200, guildCount: 3, upSince: ago(7200), workerId: "w2", rssMb: 60 })],
      noCommands,
      NOW,
    );
    expect(data.summary).toMatchObject({ online: 2, total: 2, avgPingMs: 150, servers: 5, longestUptimeSec: 7200 });
  });

  it("counts a worker's memory once even when it hosts several bots", () => {
    const data = summarizeHosting([row({ id: "a", workerId: "w1", rssMb: 90 }), row({ id: "b", workerId: "w1", rssMb: 90 }), row({ id: "c", workerId: "w2", rssMb: 50 })], noCommands, NOW);
    expect(data.summary.memoryMb).toBe(140);
  });

  it("ignores bots that are offline, stale or have never reported", () => {
    const data = summarizeHosting(
      [
        row({ id: "ok", pingMs: 100, guildCount: 1 }),
        row({ id: "stale", seenAt: ago(120), pingMs: 999, guildCount: 50 }),
        row({ id: "off", status: "offline", pingMs: 999, guildCount: 50 }),
        row({ id: "never", seenAt: null, status: "online", pingMs: 999, guildCount: 50 }),
      ],
      noCommands,
      NOW,
    );
    expect(data.summary).toMatchObject({ online: 1, total: 4, avgPingMs: 100, servers: 1 });
    expect(data.bots.map((b) => b.status)).toEqual(["online", "offline", "offline", "offline"]);
  });

  it("returns empty values, not zeros or NaN, when nothing is online", () => {
    const data = summarizeHosting([row({ status: "offline" })], noCommands, NOW);
    expect(data.summary).toMatchObject({ online: 0, avgPingMs: null, longestUptimeSec: null, maxLoopLagMs: null, memoryMb: 0, servers: 0 });
    expect(summarizeHosting([], noCommands, NOW).summary.total).toBe(0);
  });

  it("skips an unmeasured ping instead of counting it as zero", () => {
    const data = summarizeHosting([row({ id: "a", pingMs: null }), row({ id: "b", pingMs: 80 })], noCommands, NOW);
    expect(data.summary.avgPingMs).toBe(80);
  });

  it("works out the command success rate and average time", () => {
    const data = summarizeHosting([], { total: 200, ok: 190, avgMs: 123.4 }, NOW);
    expect(data.commands).toEqual({ total: 200, successRate: 95, avgMs: 123 });
    expect(summarizeHosting([], noCommands, NOW).commands).toEqual({ total: 0, successRate: null, avgMs: null });
  });

  it("reports how long ago each bot last reported", () => {
    const data = summarizeHosting([row({ seenAt: ago(12) }), row({ id: "x", seenAt: null })], noCommands, NOW);
    expect(data.bots.map((b) => b.seenAgoSec)).toEqual([12, null]);
  });
});

describe("formatDuration", () => {
  it("picks a readable unit", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(600)).toBe("10m");
    expect(formatDuration(3 * 3600 + 12 * 60)).toBe("3h 12m");
    expect(formatDuration(14 * 86400 + 6 * 3600)).toBe("14d 6h");
  });
});

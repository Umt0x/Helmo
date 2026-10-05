import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { modActions } from "@/db/schema";
import { moderationLog } from "@/lib/audit";

const G1 = "test-audit-guild-1";
const G2 = "test-audit-guild-2";
const clean = () => db.delete(modActions).where(inArray(modActions.guildId, [G1, G2]));

beforeAll(async () => {
  await clean();
  const day = 86_400_000;
  await db.insert(modActions).values([
    { guildId: G1, action: "ban", targetId: "t1", targetName: "spammer", moderatorId: "m1", moderatorName: "umt", reason: "spam" },
    { guildId: G1, action: "warn", targetId: "t2", moderatorId: "m1", reason: "rude" },
    { guildId: G1, action: "warn", targetId: "t2", moderatorId: "m1", reason: "rude again", at: new Date(Date.now() - 2 * day) },
    { guildId: G1, action: "mute", targetId: "t2", moderatorId: "bot", durationMin: 30, auto: true, at: new Date(Date.now() - 1 * day) },
    { guildId: G1, action: "kick", targetId: "t3", moderatorId: "m1", at: new Date(Date.now() - 20 * day) }, // older than 7 days
    { guildId: G2, action: "ban", targetId: "other", moderatorId: "m9", reason: "someone else's server" },
  ]);
});

afterAll(async () => {
  await clean();
  await db.$client.end();
});

describe("moderation log", () => {
  it("shows only the asked server's actions, newest first", async () => {
    const log = await moderationLog(G1);
    expect(log.entries).toHaveLength(5);
    expect(log.entries.every((e) => e.reason !== "someone else's server")).toBe(true);
    const times = log.entries.map((e) => new Date(e.at).getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("counts the last 7 days per type and ignores older actions", async () => {
    const { last7 } = await moderationLog(G1);
    expect(last7).toEqual({ ban: 1, kick: 0, mute: 1, warn: 2, clear: 0 });
    expect((await moderationLog(G2)).last7.ban).toBe(1);
  });

  it("prefers names, falls back to ids, and marks automatic actions", async () => {
    const { entries } = await moderationLog(G1);
    const ban = entries.find((e) => e.action === "ban")!;
    expect(ban).toMatchObject({ moderator: "umt", target: "spammer", reason: "spam", auto: false });
    const mute = entries.find((e) => e.action === "mute")!;
    expect(mute).toMatchObject({ moderator: "bot", target: "t2", durationMin: 30, auto: true });
  });

  it("returns an empty log for a server with no actions", async () => {
    const log = await moderationLog("test-audit-guild-none");
    expect(log.entries).toEqual([]);
    expect(log.last7).toEqual({ ban: 0, kick: 0, mute: 0, warn: 0, clear: 0 });
  });
});

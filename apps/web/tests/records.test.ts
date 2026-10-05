import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { modActions } from "@/db/schema";
import { lookupRecords } from "@/lib/records";

const G1 = "test-records-guild-1";
const G2 = "test-records-guild-2";
const clean = () => db.delete(modActions).where(inArray(modActions.guildId, [G1, G2]));

beforeAll(async () => {
  await clean();
  const at = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000);
  await db.insert(modActions).values([
    { guildId: G1, caseNo: 1, action: "warn", targetId: "100000000000000100", targetName: "Joker", moderatorId: "m1", moderatorName: "umt", reason: "Spam", at: at(50) },
    { guildId: G1, caseNo: 2, action: "mute", targetId: "100000000000000100", targetName: "Joker", moderatorId: "m1", moderatorName: "umt", reason: "More spam", durationMin: 60, at: at(40) },
    { guildId: G1, caseNo: 3, action: "ban", targetId: "200000000000000200", targetName: "Troll_99", moderatorId: "m2", moderatorName: "aylin", reason: "Harassment", at: at(30) },
    { guildId: G1, action: "clear", moderatorId: "m1", reason: "40 messages", at: at(20) }, // no case number: not part of the record
    { guildId: G2, caseNo: 1, action: "kick", targetId: "100000000000000100", targetName: "Joker", moderatorId: "m9", reason: "Another server's case #1", at: at(10) },
  ]);
});

afterAll(async () => {
  await clean();
  await db.$client.end();
});

describe("record lookup (sicil)", () => {
  it("finds a case by its number, with or without #, and lists the member's other cases", async () => {
    for (const q of ["2", "#2", " 2 "]) {
      const r = await lookupRecords(G1, q);
      expect(r.mode).toBe("case");
      expect(r.selected).toMatchObject({ caseNo: 2, action: "mute", target: "Joker", moderator: "umt", reason: "More spam", durationMin: 60 });
      expect(r.entries.map((e) => e.caseNo)).toEqual([2, 1]);
    }
  });

  it("never mixes servers: the same number in another server is a different case", async () => {
    expect((await lookupRecords(G1, "1")).selected?.reason).toBe("Spam");
    expect((await lookupRecords(G2, "1")).selected?.reason).toBe("Another server's case #1");
    expect((await lookupRecords(G2, "3")).selected).toBeNull();
  });

  it("reports a missing case plainly", async () => {
    const r = await lookupRecords(G1, "999");
    expect(r).toMatchObject({ mode: "case", selected: null, entries: [] });
  });

  it("finds members by id or part of a name, ignoring case", async () => {
    expect((await lookupRecords(G1, "100000000000000100")).entries.map((e) => e.caseNo)).toEqual([2, 1]);
    expect((await lookupRecords(G1, "joke")).entries.map((e) => e.caseNo)).toEqual([2, 1]);
    expect((await lookupRecords(G1, "TROLL")).entries.map((e) => e.caseNo)).toEqual([3]);
    expect((await lookupRecords(G1, "nobody-like-this")).entries).toEqual([]);
  });

  it("treats % and _ as plain characters, not wildcards", async () => {
    expect((await lookupRecords(G1, "%")).entries).toEqual([]);
    expect((await lookupRecords(G1, "Troll_99")).entries.map((e) => e.caseNo)).toEqual([3]);
    expect((await lookupRecords(G1, "Troll_9_")).entries).toEqual([]);
  });

  it("shows the latest cases when nothing is asked, without actions that have no number", async () => {
    const r = await lookupRecords(G1, "");
    expect(r.mode).toBe("recent");
    expect(r.entries.map((e) => e.caseNo)).toEqual([3, 2, 1]);
  });
});

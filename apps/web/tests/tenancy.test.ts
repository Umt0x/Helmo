import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { bots, guildSettings, users } from "@/db/schema";
import { botOverview, connectBot, listBots, removeBot, type BotIdentity } from "@/lib/bots";
import { loadSettings, saveSettings, GUARD_PAGE } from "@/lib/settings";
import type { GuardSettings } from "@/content/guard";

// Two made-up customers. Ids are prefixed so cleanup can never touch real data.
const UMUT = "test-umut-0001";
const BELINAY = "test-belinay-0002";
const UMUT_GUILD = "test-guild-umut";
const BELINAY_GUILD = "test-guild-belinay";

let counter = 0;
/** Pretends Discord accepted the token. Each call is a brand new bot. */
const fakeDiscord = async (): Promise<BotIdentity> => ({ id: `test-bot-${Date.now()}-${++counter}`, name: `bot${counter}` });
const token = (label: string) => `${label}.fake-token-for-tests-0123456789`;

async function cleanup() {
  await db.delete(bots).where(inArray(bots.ownerId, [UMUT, BELINAY]));
  await db.delete(guildSettings).where(inArray(guildSettings.guildId, [UMUT_GUILD, BELINAY_GUILD]));
  await db.delete(users).where(inArray(users.id, [UMUT, BELINAY]));
}

beforeAll(async () => {
  await cleanup();
  await db.insert(users).values([
    { id: UMUT, username: "umut", plan: "pro" },
    { id: BELINAY, username: "belinay", plan: "basic" },
  ]);
});

afterAll(async () => {
  await cleanup();
  await db.$client.end();
});

describe("Umut and Belinay do not affect each other", () => {
  it("keeps server settings apart", async () => {
    const umutGuard = (await loadSettings(UMUT_GUILD, GUARD_PAGE)) as GuardSettings;
    await saveSettings(UMUT_GUILD, UMUT, GUARD_PAGE, { ...umutGuard, antiLink: { enabled: true, threshold: null, action: "ban" } });
    await saveSettings(BELINAY_GUILD, BELINAY, GUARD_PAGE, { ...umutGuard, antiLink: { enabled: false, threshold: null, action: "mute" }, antiRaid: { enabled: false, threshold: 4, action: "kick" } });

    const u = (await loadSettings(UMUT_GUILD, GUARD_PAGE)) as GuardSettings;
    const b = (await loadSettings(BELINAY_GUILD, GUARD_PAGE)) as GuardSettings;

    expect(u.antiLink).toEqual({ enabled: true, threshold: null, action: "ban" });
    expect(b.antiLink).toEqual({ enabled: false, threshold: null, action: "mute" });
    expect(u.antiRaid.enabled).toBe(true);
    expect(b.antiRaid).toEqual({ enabled: false, threshold: 4, action: "kick" });
  });

  it("counts bot limits per account", async () => {
    // Umut (Pro) connects main + 2 guard + support + voice = 5 bots.
    for (const type of ["main", "guard", "guard", "support", "voice"]) {
      expect((await connectBot(UMUT, type, token(type), fakeDiscord)).ok).toBe(true);
    }
    expect((await botOverview(UMUT)).usage.total).toEqual({ used: 5, max: 12 });

    // Belinay (Basic) is not affected by Umut's 5 bots: she still gets her own 3.
    for (const type of ["main", "guard", "voice"]) {
      expect((await connectBot(BELINAY, type, token(type), fakeDiscord)).ok).toBe(true);
    }
    expect(await connectBot(BELINAY, "guard", token("x"), fakeDiscord)).toEqual({ ok: false, error: "total", limit: 3 });
    expect((await botOverview(BELINAY)).usage.total).toEqual({ used: 3, max: 3 });
    expect((await botOverview(UMUT)).usage.total.used).toBe(5);
  });

  it("only lets an owner see and remove their own bots", async () => {
    const umutBots = await listBots(UMUT);
    expect(umutBots.every((x) => x.ownerId === UMUT)).toBe(true);

    expect(await removeBot(BELINAY, umutBots[0].id)).toBe(false);
    expect(await listBots(UMUT)).toHaveLength(5);
  });
});

describe("connecting bots", () => {
  it("refuses a second main bot and an unknown type", async () => {
    expect(await connectBot(UMUT, "main", token("m2"), fakeDiscord)).toEqual({ ok: false, error: "type", limit: 1 });
    expect(await connectBot(UMUT, "hacker", token("h"), fakeDiscord)).toEqual({ ok: false, error: "unknown_type" });
  });

  it("refuses a token Discord rejects", async () => {
    expect(await connectBot(UMUT, "guard", token("bad"), async () => null)).toEqual({ ok: false, error: "invalid_token" });
    expect(await connectBot(UMUT, "guard", "short", fakeDiscord)).toEqual({ ok: false, error: "invalid_token" });
  });

  it("refuses the same bot twice, even from another account", async () => {
    const same = async (): Promise<BotIdentity> => ({ id: "test-bot-shared", name: "shared" });
    expect((await connectBot(UMUT, "guard", token("s1"), same)).ok).toBe(true);
    expect(await connectBot(UMUT, "guard", token("s2"), same)).toEqual({ ok: false, error: "duplicate" });
    await removeBot(UMUT, (await listBots(UMUT)).find((b) => b.discordBotId === "test-bot-shared")!.id);
  });

  it("stores the token encrypted", async () => {
    const [row] = await db.select().from(bots).where(eq(bots.ownerId, UMUT)).limit(1);
    expect(row.tokenEnc.startsWith("enc:v1:")).toBe(true);
    expect(row.tokenEnc).not.toContain("fake-token-for-tests");
  });

  it("does not let parallel requests slip past the limit", async () => {
    // Several rounds: with no lock, timing luck alone could hide a race in one round.
    for (let round = 0; round < 6; round++) {
      // Bring Umut to 11 bots, then race 10 requests for the single free slot.
      while ((await listBots(UMUT)).length < 11) await connectBot(UMUT, "guard", token("fill"), fakeDiscord);
      const extra = (await listBots(UMUT)).slice(11);
      for (const b of extra) await removeBot(UMUT, b.id);

      const results = await Promise.all(Array.from({ length: 10 }, (_, i) => connectBot(UMUT, "guard", token(`race${round}-${i}`), fakeDiscord)));
      expect(results.filter((r) => r.ok), `round ${round}`).toHaveLength(1);
      expect((await listBots(UMUT)).length).toBe(12);
      // Free one slot again for the next round.
      await removeBot(UMUT, (await listBots(UMUT)).at(-1)!.id);
    }
    while ((await listBots(UMUT)).length < 12) await connectBot(UMUT, "guard", token("refill"), fakeDiscord);
  });
});

describe("changing plan", () => {
  it("pauses extra bots on a downgrade and resumes them on upgrade", async () => {
    await db.update(users).set({ plan: "basic" }).where(eq(users.id, UMUT));
    const down = await botOverview(UMUT);
    expect(down.bots.filter((b) => !b.paused)).toHaveLength(3);
    expect(down.bots.filter((b) => b.paused)).toHaveLength(9);
    // Nothing was deleted.
    expect(await listBots(UMUT)).toHaveLength(12);

    await db.update(users).set({ plan: "pro" }).where(eq(users.id, UMUT));
    expect((await botOverview(UMUT)).bots.filter((b) => b.paused)).toHaveLength(0);
  });
});

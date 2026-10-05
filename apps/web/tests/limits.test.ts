import { describe, expect, it } from "vitest";
import { checkAddBot, planUsage, splitActive, type BotLike } from "@/lib/limits";
import type { PlanKey } from "@/lib/plans";

let n = 0;
/** Bots are created one minute apart so "oldest first" is well defined. */
function bots(...types: string[]): BotLike[] {
  return types.map((type) => ({ id: `bot-${++n}`, type, createdAt: new Date(2026, 0, 1, 0, n) }));
}
const rep = (type: string, count: number) => Array<string>(count).fill(type);

describe("plan limits", () => {
  it("Basic allows 3 bots in total", () => {
    const three = bots("guard", "guard", "support");
    expect(checkAddBot("basic", three.slice(0, 2), "guard")).toEqual({ ok: true });
    expect(checkAddBot("basic", three, "guard")).toEqual({ ok: false, reason: "total", limit: 3 });
  });

  it("Plus allows 6 and Pro allows 12 in total", () => {
    expect(checkAddBot("plus", bots(...rep("guard", 5)), "guard").ok).toBe(true);
    expect(checkAddBot("plus", bots(...rep("guard", 6)), "guard")).toEqual({ ok: false, reason: "total", limit: 6 });
    expect(checkAddBot("pro", bots(...rep("guard", 11)), "guard").ok).toBe(true);
    expect(checkAddBot("pro", bots(...rep("guard", 12)), "guard")).toEqual({ ok: false, reason: "total", limit: 12 });
  });

  it("caps voice bots at 3 / 5 / 7, inside the total", () => {
    // Basic: 3 total, so 3 voice bots fit, a 4th does not (total wins).
    expect(checkAddBot("basic", bots(...rep("voice", 2)), "voice").ok).toBe(true);
    // Plus: 6 total but only 5 voice. The 6th voice bot is refused for the type cap, not the total.
    const plusFiveVoice = bots(...rep("voice", 5));
    expect(checkAddBot("plus", plusFiveVoice, "voice")).toEqual({ ok: false, reason: "type", type: "voice", limit: 5 });
    expect(checkAddBot("plus", plusFiveVoice, "guard").ok).toBe(true);
    // Pro: 7 voice max.
    const proSevenVoice = bots(...rep("voice", 7));
    expect(checkAddBot("pro", proSevenVoice, "voice")).toEqual({ ok: false, reason: "type", type: "voice", limit: 7 });
    expect(checkAddBot("pro", proSevenVoice, "guard").ok).toBe(true);
  });

  it("allows only one main bot, on every plan", () => {
    for (const plan of ["basic", "plus", "pro"] as PlanKey[]) {
      expect(checkAddBot(plan, bots("main"), "main")).toEqual({ ok: false, reason: "type", type: "main", limit: 1 });
    }
  });

  it("does not cap guard or support beyond the total", () => {
    expect(checkAddBot("pro", bots("main", ...rep("guard", 6), "support"), "guard").ok).toBe(true);
    expect(checkAddBot("pro", bots("main", ...rep("guard", 6), "support"), "support").ok).toBe(true);
  });

  it("rejects unknown bot types", () => {
    expect(checkAddBot("pro", [], "hacker")).toEqual({ ok: false, reason: "unknown_type" });
  });
});

describe("Umut on Pro", () => {
  // main + 2 guard + support + voice = 5 bots, as in the example.
  const umut = bots("main", "guard", "guard", "support", "voice");

  it("sits at 5 / 12 bots and 1 / 7 voice", () => {
    const u = planUsage("pro", umut);
    expect(u.total).toEqual({ used: 5, max: 12 });
    expect(u.perType.voice).toEqual({ used: 1, max: 7 });
    expect(u.perType.main).toEqual({ used: 1, max: 1 });
  });

  it("can grow to 3 voice bots, up to the 7 voice cap, and is then refused", () => {
    let current = [...umut, ...bots("voice", "voice")];
    expect(planUsage("pro", current).perType.voice).toEqual({ used: 3, max: 7 });
    for (let i = 0; i < 4; i++) {
      expect(checkAddBot("pro", current, "voice").ok).toBe(true);
      current = [...current, ...bots("voice")];
    }
    expect(current).toHaveLength(11);
    expect(checkAddBot("pro", current, "voice")).toEqual({ ok: false, reason: "type", type: "voice", limit: 7 });
  });
});

describe("downgrading a plan", () => {
  it("pauses the newest bots, never deletes, and brings them back on upgrade", () => {
    const all = bots("main", "guard", "guard", "guard", "support", "voice", "voice", "voice", "voice", "guard", "guard", "support");
    expect(all).toHaveLength(12);

    const basic = splitActive("basic", all);
    expect(basic.active.map((b) => b.id)).toEqual(all.slice(0, 3).map((b) => b.id));
    expect(basic.paused).toHaveLength(9);

    const pro = splitActive("pro", all);
    expect(pro.active).toHaveLength(12);
    expect(pro.paused).toHaveLength(0);
  });

  it("keeps type caps while choosing which bots stay active", () => {
    // Basic keeps 3 bots total; voice cap on Basic is 3, main cap is 1.
    const all = bots("main", "main", "voice", "voice", "voice");
    const { active, paused } = splitActive("basic", all);
    expect(active.map((b) => b.type)).toEqual(["main", "voice", "voice"]);
    expect(paused.map((b) => b.type)).toEqual(["main", "voice"]);
  });

  it("counts paused bots against the total, so a downgraded account cannot add more", () => {
    const twelve = bots(...rep("guard", 12));
    expect(checkAddBot("basic", twelve, "guard")).toEqual({ ok: false, reason: "total", limit: 3 });
  });
});

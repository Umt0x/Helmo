import { BOT_TYPE_KEYS, isBotType, type BotType } from "./bot-types";
import { PLANS, type PlanKey } from "./plans";

/** The only bot fields the limit rules need. */
export type BotLike = { id: string; type: string; createdAt: Date };

export type AddCheck =
  | { ok: true }
  | { ok: false; reason: "unknown_type" }
  | { ok: false; reason: "total"; limit: number }
  | { ok: false; reason: "type"; type: BotType; limit: number };

/** Can this account connect one more bot of `type` on `plan`? Counts every bot it already has. */
export function checkAddBot(plan: PlanKey, bots: BotLike[], type: string): AddCheck {
  if (!isBotType(type)) return { ok: false, reason: "unknown_type" };
  const p = PLANS[plan];

  if (bots.length >= p.maxBots) return { ok: false, reason: "total", limit: p.maxBots };

  const typeLimit = p.maxPerType[type];
  if (typeLimit !== undefined && bots.filter((b) => b.type === type).length >= typeLimit) {
    return { ok: false, reason: "type", type, limit: typeLimit };
  }
  return { ok: true };
}

export type Usage = {
  total: { used: number; max: number };
  perType: Partial<Record<BotType, { used: number; max: number | null }>>;
};

/** Numbers for the usage bars in the panel. */
export function planUsage(plan: PlanKey, bots: BotLike[]): Usage {
  const p = PLANS[plan];
  const perType: Usage["perType"] = {};
  for (const t of BOT_TYPE_KEYS) {
    perType[t] = { used: bots.filter((b) => b.type === t).length, max: p.maxPerType[t] ?? null };
  }
  return { total: { used: bots.length, max: p.maxBots }, perType };
}

/**
 * Which bots may run on `plan`. Oldest bots win. A bot that does not fit the
 * total or its type cap is paused, never deleted, so upgrading brings it back.
 */
export function splitActive<T extends BotLike>(plan: PlanKey, bots: T[]): { active: T[]; paused: T[] } {
  const p = PLANS[plan];
  const active: T[] = [];
  const paused: T[] = [];
  const perType = new Map<string, number>();

  const oldestFirst = [...bots].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id.localeCompare(b.id));
  for (const bot of oldestFirst) {
    const typeLimit = isBotType(bot.type) ? p.maxPerType[bot.type] : 0;
    const used = perType.get(bot.type) ?? 0;
    const fits = active.length < p.maxBots && (typeLimit === undefined || used < typeLimit);
    if (fits) {
      active.push(bot);
      perType.set(bot.type, used + 1);
    } else {
      paused.push(bot);
    }
  }
  return { active, paused };
}

import type { BotType } from "./bot-types";

export type PlanKey = "basic" | "plus" | "pro";

export type Plan = {
  label: { en: string; tr: string };
  /** Bots (tokens) an account may connect in total. */
  maxBots: number;
  /** Extra caps per type. They sit inside maxBots; a type without an entry is only limited by the total. */
  maxPerType: Partial<Record<BotType, number>>;
};

/** The single place plans are defined. Change a limit here and everything follows. */
export const PLANS: Record<PlanKey, Plan> = {
  basic: { label: { en: "Basic", tr: "Temel" }, maxBots: 3, maxPerType: { main: 1, voice: 3 } },
  plus: { label: { en: "Plus", tr: "Plus" }, maxBots: 6, maxPerType: { main: 1, voice: 5 } },
  pro: { label: { en: "Pro", tr: "Pro" }, maxBots: 12, maxPerType: { main: 1, voice: 7 } },
};

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export const isPlanKey = (v: unknown): v is PlanKey => typeof v === "string" && v in PLANS;

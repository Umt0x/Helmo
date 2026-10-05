/**
 * Bot types. The core types are fixed; the others are extra types that grow
 * over time. To add one, add a line here (and later its module in the bot
 * runtime) — nothing else in the plan or limit code has to change.
 */
export const BOT_TYPES = {
  main: { core: true, label: { en: "Main", tr: "Ana" } },
  guard: { core: true, label: { en: "Guard", tr: "Guard" } },
  voice: { core: true, label: { en: "Voice", tr: "Ses" } },
  support: { core: false, label: { en: "Support", tr: "Destek" } },
} as const;

export type BotType = keyof typeof BOT_TYPES;

export const BOT_TYPE_KEYS = Object.keys(BOT_TYPES) as BotType[];

export const isBotType = (v: unknown): v is BotType => typeof v === "string" && v in BOT_TYPES;

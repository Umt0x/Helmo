export const GUARD_KEYS = ["antiRaid", "antiNuke", "antiSpam", "antiLink", "antiBot", "antiMention"] as const;
export const GUARD_ACTIONS = ["ban", "kick", "mute", "strip"] as const;

export type GuardKey = (typeof GUARD_KEYS)[number];
export type GuardAction = (typeof GUARD_ACTIONS)[number];
export type GuardModule = { enabled: boolean; threshold: number | null; action: GuardAction };
export type GuardSettings = Record<GuardKey, GuardModule>;

export const GUARD_DEFAULTS: GuardSettings = {
  antiRaid: { enabled: true, threshold: 10, action: "kick" },
  antiNuke: { enabled: true, threshold: 3, action: "strip" },
  antiSpam: { enabled: true, threshold: 8, action: "mute" },
  antiLink: { enabled: false, threshold: null, action: "mute" },
  antiBot: { enabled: true, threshold: null, action: "kick" },
  antiMention: { enabled: false, threshold: 5, action: "mute" },
};

/** Rebuilds the settings from untrusted input; anything invalid falls back to the default. */
export function sanitizeGuard(input: unknown): GuardSettings {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const out = {} as GuardSettings;
  for (const key of GUARD_KEYS) {
    const def = GUARD_DEFAULTS[key];
    const raw = source[key];
    const m = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    out[key] = {
      enabled: typeof m.enabled === "boolean" ? m.enabled : def.enabled,
      // Modules without a threshold stay without one.
      threshold:
        def.threshold === null
          ? null
          : typeof m.threshold === "number" && Number.isFinite(m.threshold)
            ? Math.min(30, Math.max(1, Math.round(m.threshold)))
            : def.threshold,
      action: GUARD_ACTIONS.includes(m.action as GuardAction) ? (m.action as GuardAction) : def.action,
    };
  }
  return out;
}

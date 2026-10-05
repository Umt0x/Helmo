export type Category = "moderation" | "utility" | "fun" | "economy";
export type CommandMeta = { name: string; category: Category; cooldown: number; enabled: boolean };

/** Built-in commands. `enabled` is the default; the saved map overrides it. */
export const COMMANDS: CommandMeta[] = [
  { name: "ban", category: "moderation", cooldown: 3, enabled: true },
  { name: "kick", category: "moderation", cooldown: 3, enabled: true },
  { name: "mute", category: "moderation", cooldown: 3, enabled: true },
  { name: "warn", category: "moderation", cooldown: 2, enabled: true },
  { name: "clear", category: "moderation", cooldown: 5, enabled: false },
  { name: "userinfo", category: "utility", cooldown: 5, enabled: true },
  { name: "serverinfo", category: "utility", cooldown: 5, enabled: true },
  { name: "avatar", category: "utility", cooldown: 3, enabled: true },
  { name: "8ball", category: "fun", cooldown: 4, enabled: true },
  { name: "meme", category: "fun", cooldown: 10, enabled: false },
  { name: "balance", category: "economy", cooldown: 3, enabled: true },
  { name: "daily", category: "economy", cooldown: 86400, enabled: true },
];

export type CommandSettings = Record<string, boolean>;

export const COMMAND_DEFAULTS: CommandSettings = Object.fromEntries(COMMANDS.map((c) => [c.name, c.enabled]));

export function sanitizeCommands(input: unknown): CommandSettings {
  const source = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  return Object.fromEntries(
    COMMANDS.map((c) => [c.name, typeof source[c.name] === "boolean" ? (source[c.name] as boolean) : c.enabled]),
  );
}

import { bigserial, boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/** A Helmo account. The id is the user's Discord id. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  email: text("email"),
  /** basic | plus | pro. Limits live in src/lib/plans.ts. */
  plan: text("plan").notNull().default("basic"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Login sessions. `id` is the SHA-256 of the cookie token, never the token itself. */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Discord servers a user can manage. Refreshed every time they log in. */
export const userGuilds = pgTable(
  "user_guilds",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    guildId: text("guild_id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    isOwner: boolean("is_owner").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.userId, t.guildId] })],
);

export type User = typeof users.$inferSelect;
export type UserGuild = typeof userGuilds.$inferSelect;

/** One row per server and settings page. `data` is validated before it is stored. */
export const guildSettings = pgTable(
  "guild_settings",
  {
    guildId: text("guild_id").notNull(),
    page: text("page").notNull(),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.page] })],
);

/** A Discord bot (token) an account has connected. Which types and how many is decided by the plan. */
export const bots = pgTable(
  "bots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** A key of BOT_TYPES in src/lib/bot-types.ts. Text, so new types need no migration. */
    type: text("type").notNull(),
    name: text("name").notNull(),
    /** The bot's own Discord user id, read from the token. One token can only be connected once. */
    discordBotId: text("discord_bot_id").notNull(),
    tokenEnc: text("token_enc").notNull(),
    /** offline | online | error. Written by the bot runtime. */
    status: text("status").notNull().default("offline"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("bots_discord_bot_id_idx").on(t.discordBotId)],
);

/** Which bot handles which module in a server. One bot per module per server, so two bots never act twice. */
export const guildModules = pgTable(
  "guild_modules",
  {
    guildId: text("guild_id").notNull(),
    module: text("module").notNull(),
    botId: uuid("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.module] })],
);

export type Bot = typeof bots.$inferSelect;

/** Latest "I am alive" signal per bot, written by the bot runtime. Drives the Hosting page. */
export const botHeartbeats = pgTable("bot_heartbeats", {
  botId: uuid("bot_id")
    .primaryKey()
    .references(() => bots.id, { onDelete: "cascade" }),
  seenAt: timestamp("seen_at", { withTimezone: true }).notNull().defaultNow(),
  pingMs: integer("ping_ms"),
  guildCount: integer("guild_count").notNull().default(0),
  workerId: text("worker_id"),
  rssMb: integer("rss_mb"),
  /** When the bot last came online, so the panel can show uptime. */
  upSince: timestamp("up_since", { withTimezone: true }),
  /** How late the worker's event loop runs; a rising number means the worker is overloaded. */
  loopLagMs: integer("loop_lag_ms"),
});

/** One row per command a bot handled. Feeds "commands today", success rate and response time. */
export const commandEvents = pgTable(
  "command_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    botId: uuid("bot_id")
      .notNull()
      .references(() => bots.id, { onDelete: "cascade" }),
    guildId: text("guild_id"),
    command: text("command").notNull(),
    /** ok | failed | unavailable | busy | locked | disabled */
    outcome: text("outcome").notNull(),
    durationMs: integer("duration_ms"),
    errorId: text("error_id"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("command_events_bot_at_idx").on(t.botId, t.at)],
);

/** Every moderation action the bot takes: warn, ban, kick, mute, clear. Feeds warn counts and the Audit Log pages. */
export const modActions = pgTable(
  "mod_actions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    guildId: text("guild_id").notNull(),
    action: text("action").notNull(),
    targetId: text("target_id"),
    /** Names as they were at the time, so the Audit Log reads well without asking Discord. */
    targetName: text("target_name"),
    /** The member who ran the command, or the bot's own id for automatic actions. */
    moderatorId: text("moderator_id").notNull(),
    moderatorName: text("moderator_name"),
    reason: text("reason"),
    durationMin: integer("duration_min"),
    /** True when the warn system punished someone automatically. */
    auto: boolean("auto").notNull().default(false),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("mod_actions_guild_target_idx").on(t.guildId, t.targetId, t.action, t.at)],
);

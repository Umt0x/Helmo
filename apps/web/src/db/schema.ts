import { boolean, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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

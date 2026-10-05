import { boolean, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

/** A Helmo account. The id is the user's Discord id. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  email: text("email"),
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

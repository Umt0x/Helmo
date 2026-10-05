import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, userGuilds, users, type User, type UserGuild } from "@/db/schema";

export const SESSION_COOKIE = "helmo_session";
export const GUILD_COOKIE = "helmo_guild";
const SESSION_DAYS = 30;

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  expires,
});

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ id: hash(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hash(token)));
  jar.delete(SESSION_COOKIE);
  jar.delete(GUILD_COOKIE);
}

/** The logged-in user, or null. Cached per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hash(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return row?.user ?? null;
});

export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export const getUserGuilds = cache(async (userId: string): Promise<UserGuild[]> =>
  db.select().from(userGuilds).where(eq(userGuilds.userId, userId)).orderBy(userGuilds.name),
);

/** The server currently being managed, or null if none is picked yet. */
export async function getCurrentGuild(userId: string): Promise<UserGuild | null> {
  const id = (await cookies()).get(GUILD_COOKIE)?.value;
  if (!id) return null;
  return (await getUserGuilds(userId)).find((g) => g.guildId === id) ?? null;
}

export async function selectGuildCookie(guildId: string) {
  (await cookies()).set(GUILD_COOKIE, guildId, cookieOptions(new Date(Date.now() + SESSION_DAYS * 86_400_000)));
}

/** Upserts the user and replaces their server list in one go. */
export async function saveLogin(
  user: { id: string; username: string; displayName: string | null; avatar: string | null; email: string | null },
  guilds: { guildId: string; name: string; icon: string | null; isOwner: boolean }[],
) {
  await db.transaction(async (tx) => {
    await tx
      .insert(users)
      .values(user)
      .onConflictDoUpdate({
        target: users.id,
        set: { username: user.username, displayName: user.displayName, avatar: user.avatar, email: user.email },
      });
    await tx.delete(userGuilds).where(eq(userGuilds.userId, user.id));
    if (guilds.length) await tx.insert(userGuilds).values(guilds.map((g) => ({ ...g, userId: user.id })));
  });
}

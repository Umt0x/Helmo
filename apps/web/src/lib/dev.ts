import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { botGuilds, bots, userGuilds } from "@/db/schema";

export const DEV_USER = "000000000000000001";

/** The servers the test user's bots are really in, as reported by the bot runtime. */
export async function realDevGuilds() {
  return db
    .selectDistinct({ guildId: botGuilds.guildId, name: botGuilds.name, icon: botGuilds.icon })
    .from(botGuilds)
    .innerJoin(bots, eq(bots.id, botGuilds.botId))
    .where(eq(bots.ownerId, DEV_USER));
}

/**
 * Development only: keep the test user's server list in step with where their
 * bots really are, so a new server shows up without logging out and in again.
 * Real Discord login does this properly; this just saves time while testing.
 */
export async function refreshDevGuilds(userId: string): Promise<void> {
  if (process.env.NODE_ENV === "production" || userId !== DEV_USER) return;
  const real = await realDevGuilds();
  if (real.length === 0) return;
  await db.transaction(async (tx) => {
    await tx.delete(userGuilds).where(eq(userGuilds.userId, userId));
    await tx.insert(userGuilds).values(real.map((g) => ({ ...g, userId, isOwner: true })));
  });
}

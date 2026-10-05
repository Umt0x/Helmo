import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { guildChannels, guildRoles } from "@/db/schema";
import type { Choices } from "@/content/types";

/** The roles and channels the bot has reported for one server, highest role and first channel first. */
export async function guildChoices(guildId: string): Promise<Choices> {
  const [roles, channels] = await Promise.all([
    db
      .select({ id: guildRoles.roleId, name: guildRoles.name, color: guildRoles.color, managed: guildRoles.managed, position: guildRoles.position })
      .from(guildRoles)
      .where(eq(guildRoles.guildId, guildId))
      .orderBy(guildRoles.position),
    db
      .select({ id: guildChannels.channelId, name: guildChannels.name, type: guildChannels.type })
      .from(guildChannels)
      .where(eq(guildChannels.guildId, guildId))
      .orderBy(asc(guildChannels.position)),
  ]);
  return {
    roles: roles.reverse().map((r) => ({ id: r.id, name: r.name, color: r.color, managed: r.managed })),
    channels,
  };
}

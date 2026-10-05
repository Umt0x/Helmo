import { ModerationLogView } from "@/components/moderation-log";
import { moderationLog } from "@/lib/audit";
import { requirePanelGuild } from "@/lib/session";

export default async function ModerationAuditPage() {
  // The server comes from the session, so a member of one server can never read another server's log.
  const { guild } = await requirePanelGuild();
  return <ModerationLogView log={await moderationLog(guild.guildId)} />;
}

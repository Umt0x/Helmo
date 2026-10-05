import { GuardPage } from "@/components/guard-page";
import { loadSettings, GUARD_PAGE } from "@/lib/settings";
import { requirePanelGuild } from "@/lib/session";
import type { GuardSettings } from "@/content/guard";

export default async function Page() {
  const { guild } = await requirePanelGuild();
  return <GuardPage initial={(await loadSettings(guild.guildId, GUARD_PAGE)) as GuardSettings} />;
}

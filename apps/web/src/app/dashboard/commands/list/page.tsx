import { CommandsPage } from "@/components/commands-page";
import { loadSettings, COMMANDS_PAGE } from "@/lib/settings";
import { requirePanelGuild } from "@/lib/session";
import type { CommandSettings } from "@/content/commands";

export default async function Page() {
  const { guild } = await requirePanelGuild();
  return <CommandsPage initial={(await loadSettings(guild.guildId, COMMANDS_PAGE)) as CommandSettings} />;
}

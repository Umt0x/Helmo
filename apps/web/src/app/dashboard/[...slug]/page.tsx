import { ComingSoon } from "@/components/coming-soon";
import { ConfigPage } from "@/components/config-page";
import { pages } from "@/content";
import type { Value } from "@/content/validate";
import { guildChoices } from "@/lib/choices";
import { requirePanelGuild } from "@/lib/session";
import { loadSettings } from "@/lib/settings";

export default async function DashboardPage({ params }: PageProps<"/dashboard/[...slug]">) {
  const { slug } = await params;
  const key = slug.join("/");
  const page = pages[key];
  if (!page) return <ComingSoon />;

  const { guild } = await requirePanelGuild();
  const initial = (await loadSettings(guild.guildId, key)) as Record<string, Value>;
  // Real roles and channels are only needed (and only read) when the page has pickers.
  const needsChoices = page.sections.some((s) => s.rows?.some((r) => r.type === "role" || r.type === "channel"));
  const choices = needsChoices ? await guildChoices(guild.guildId) : undefined;
  return <ConfigPage key={key} page={page} pageKey={key} initial={initial} choices={choices} />;
}

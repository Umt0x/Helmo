import { ComingSoon } from "@/components/coming-soon";
import { ConfigPage } from "@/components/config-page";
import { pages } from "@/content";
import type { Value } from "@/content/validate";
import { requirePanelGuild } from "@/lib/session";
import { loadSettings } from "@/lib/settings";

export default async function DashboardPage({ params }: PageProps<"/dashboard/[...slug]">) {
  const { slug } = await params;
  const key = slug.join("/");
  const page = pages[key];
  if (!page) return <ComingSoon />;

  const { guild } = await requirePanelGuild();
  const initial = (await loadSettings(guild.guildId, key)) as Record<string, Value>;
  return <ConfigPage key={key} page={page} pageKey={key} initial={initial} />;
}

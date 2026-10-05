import { BotsPage } from "@/components/bots-page";
import { botOverview } from "@/lib/bots";
import { requirePanelGuild } from "@/lib/session";

export default async function Page() {
  const { user } = await requirePanelGuild();
  return <BotsPage overview={await botOverview(user.id)} />;
}

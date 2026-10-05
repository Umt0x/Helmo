import { HostingStats } from "@/components/hosting-stats";
import { hostingOverview } from "@/lib/hosting";
import { requirePanelGuild } from "@/lib/session";

export default async function HostingStatsPage() {
  const { user } = await requirePanelGuild();
  return <HostingStats data={await hostingOverview(user.id)} />;
}

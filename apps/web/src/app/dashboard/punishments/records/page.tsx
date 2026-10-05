import { RecordsView } from "@/components/records-view";
import { lookupRecords } from "@/lib/records";
import { requirePanelGuild } from "@/lib/session";

export default async function RecordsPage({ searchParams }: PageProps<"/dashboard/punishments/records">) {
  // The server comes from the session, so one server can never read another's records.
  const { guild } = await requirePanelGuild();
  const { q } = await searchParams;
  return <RecordsView result={await lookupRecords(guild.guildId, typeof q === "string" ? q : "")} />;
}

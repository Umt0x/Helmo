import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { avatarUrl, guildIconUrl } from "@/lib/discord";
import { getCurrentGuild, requireUser } from "@/lib/session";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const guild = await getCurrentGuild(user.id);
  if (!guild) redirect("/servers");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        guild={{ name: guild.name, icon: guildIconUrl(guild), isOwner: guild.isOwner }}
        user={{ name: user.displayName ?? user.username, email: user.email, avatar: avatarUrl(user) }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-10 pb-10 pt-4">
          <div className="mx-auto flex max-w-[1680px] flex-col gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

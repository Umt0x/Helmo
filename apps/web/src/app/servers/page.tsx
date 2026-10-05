import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/server";
import { guildIconUrl } from "@/lib/discord";
import { getUserGuilds, requireUser } from "@/lib/session";

export default async function ServersPage() {
  const user = await requireUser();
  const guilds = await getUserGuilds(user.id);
  const t = getDictionary(await getLocale());

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{t.auth.chooseTitle}</h1>
      <p className="mt-1 text-sm text-muted">{t.auth.chooseSubtitle}</p>

      <div className="card mt-6">
        {guilds.length === 0 && <p className="p-8 text-center text-sm text-muted">{t.auth.noServers}</p>}
        {guilds.map((g) => {
          const icon = guildIconUrl(g);
          return (
            <Link
              key={g.guildId}
              href={`/api/guild/select?id=${g.guildId}`}
              className="flex items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-white/[0.03]"
            >
              {icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icon} alt="" className="size-10 rounded-xl" />
              ) : (
                <div className="grid size-10 place-items-center rounded-xl bg-tab text-sm font-bold">
                  {g.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{g.name}</p>
                <p className="text-xs text-muted">{g.isOwner ? t.auth.owner : t.auth.manager}</p>
              </div>
              <ChevronRight className="size-4 text-muted-2" />
            </Link>
          );
        })}
      </div>

      <form action="/api/auth/logout" method="post" className="mt-6">
        <button className="btn btn-secondary">
          <LogOut className="size-4" />
          {t.auth.logout}
        </button>
      </form>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronsUpDown, LogOut } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { coreNav, serverNav, type NavItem } from "@/lib/nav";

type SidebarProps = {
  guild: { name: string; icon: string | null; isOwner: boolean };
  user: { name: string; email: string | null; avatar: string | null };
};

export function Sidebar({ guild, user }: SidebarProps) {
  const { t } = useI18n();

  return (
    <aside className="flex w-[268px] shrink-0 flex-col border-r border-border bg-[#0e0f11]">
      <div className="flex items-center gap-2.5 px-5 pb-3 pt-5">
        <div className="grid size-8 place-items-center rounded-[10px] bg-foreground text-sm font-black text-background">
          H
        </div>
        <span className="text-lg font-semibold tracking-tight">{t.brand.name}</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-medium text-muted">
          <span className="size-1.5 rounded-full bg-ok" />
          {t.brand.plan}
        </span>
      </div>

      <Link href="/servers" title={t.auth.switchServer} className="card glow-green mx-3 mb-1 flex items-center gap-3 px-3 py-2.5 text-left">
        {guild.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guild.icon} alt="" className="size-8 rounded-lg" />
        ) : (
          <div className="grid size-8 place-items-center rounded-lg bg-tab text-xs font-bold">
            {guild.name.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{guild.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-ok" />
            {guild.isOwner ? t.auth.owner : t.auth.manager}
          </p>
        </div>
        <ChevronsUpDown className="size-4 text-muted" />
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <Group title={t.nav.core} items={coreNav} />
        <Group title={t.nav.serverSettings} items={serverNav} />
      </nav>

      <div className="flex items-center gap-3 border-t border-border px-4 py-3">
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt="" className="size-8 rounded-full" />
        ) : (
          <div className="size-8 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-800" />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted">{user.email ?? ""}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="rounded-lg p-2 text-muted hover:bg-white/[0.07] hover:text-foreground" title={t.auth.logout} aria-label={t.auth.logout}>
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </aside>
  );
}

function Group({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mt-5">
      <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-2">{title}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavEntry key={item.key} item={item} />
        ))}
      </ul>
    </div>
  );
}

function NavEntry({ item }: { item: NavItem }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const href = `/dashboard/${item.href}`;
  const active = pathname === href || pathname.startsWith(`${href}/`);
  const [open, setOpen] = useState(active);
  const Icon = item.icon;

  const row = clsx(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-white/[0.05]",
    active ? "bg-white/[0.07] text-foreground" : "text-[#b4b8bf]",
  );

  if (!item.children) {
    return (
      <li>
        <Link href={href} className={row}>
          <Icon className="size-4" />
          <span className="flex-1 truncate">{t.nav[item.key]}</span>
        </Link>
      </li>
    );
  }

  return (
    <li>
      <button onClick={() => setOpen(!open)} className={row} aria-expanded={open}>
        <Icon className="size-4" />
        <span className="flex-1 truncate text-left">{t.nav[item.key]}</span>
        <ChevronDown className={clsx("size-4 text-muted-2 transition-transform duration-200", !open && "-rotate-90")} />
      </button>
      <div
        className={clsx(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <ul className="ml-[22px] flex flex-col gap-0.5 overflow-hidden border-l border-border pl-3">
          {item.children.map((c) => {
            const cHref = `/dashboard/${c.href}`;
            const on = pathname === cHref;
            return (
              <li key={c.key}>
                <Link
                  href={cHref}
                  tabIndex={open ? 0 : -1}
                  className={clsx(
                    "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:text-foreground",
                    on ? "text-foreground" : "text-muted",
                  )}
                >
                  <span className={clsx("size-1.5 rounded-full", on ? "bg-ok" : "bg-transparent")} />
                  {t.nav[c.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}

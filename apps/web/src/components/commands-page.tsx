"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { Toggle } from "./toggle";

type Category = "moderation" | "utility" | "fun" | "economy";
type Command = { name: string; category: Category; cooldown: number; enabled: boolean };

const INITIAL: Command[] = [
  { name: "ban", category: "moderation", cooldown: 3, enabled: true },
  { name: "kick", category: "moderation", cooldown: 3, enabled: true },
  { name: "mute", category: "moderation", cooldown: 3, enabled: true },
  { name: "warn", category: "moderation", cooldown: 2, enabled: true },
  { name: "clear", category: "moderation", cooldown: 5, enabled: false },
  { name: "userinfo", category: "utility", cooldown: 5, enabled: true },
  { name: "serverinfo", category: "utility", cooldown: 5, enabled: true },
  { name: "avatar", category: "utility", cooldown: 3, enabled: true },
  { name: "8ball", category: "fun", cooldown: 4, enabled: true },
  { name: "meme", category: "fun", cooldown: 10, enabled: false },
  { name: "balance", category: "economy", cooldown: 3, enabled: true },
  { name: "daily", category: "economy", cooldown: 86400, enabled: true },
];

const CATEGORIES: Category[] = ["moderation", "utility", "fun", "economy"];

function formatCooldown(seconds: number) {
  return seconds >= 3600 ? `${Math.round(seconds / 3600)}h` : `${seconds}s`;
}

export function CommandsPage() {
  const { t } = useI18n();
  const c = t.commands;
  const [commands, setCommands] = useState(INITIAL);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        (category === "all" || cmd.category === category) &&
        (cmd.name.includes(q) || (c.descriptions[cmd.name] ?? "").toLowerCase().includes(q)),
    );
  }, [commands, query, category, c.descriptions]);

  const toggle = (name: string, enabled: boolean) =>
    setCommands((prev) => prev.map((cmd) => (cmd.name === name ? { ...cmd, enabled } : cmd)));

  const chip = (active: boolean) =>
    clsx(
      "rounded-full px-3.5 py-1.5 text-sm transition-colors",
      active ? "bg-foreground text-background" : "bg-white/[0.06] text-muted hover:text-foreground",
    );

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.search}
            className="field w-full pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={chip(category === "all")} onClick={() => setCategory("all")}>
            {c.all}
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} className={chip(category === cat)} onClick={() => setCategory(cat)}>
              {c.categories[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        {visible.length === 0 && <p className="p-8 text-center text-sm text-muted">{c.noResults}</p>}
        {visible.map((cmd) => (
          <div key={cmd.name} className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0">
            <span className={clsx("size-2 shrink-0 rounded-full", cmd.enabled ? "bg-ok" : "bg-white/20")} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <code className="rounded-lg bg-tab px-2 py-0.5 font-mono text-sm">/{cmd.name}</code>
                <span className="text-xs text-muted-2">{c.categories[cmd.category]}</span>
              </p>
              <p className="mt-1 truncate text-sm text-muted">{c.descriptions[cmd.name]}</p>
            </div>
            <span className="hidden text-xs text-muted sm:block">
              {c.cooldown}: {formatCooldown(cmd.cooldown)}
            </span>
            <Toggle checked={cmd.enabled} onChange={(v) => toggle(cmd.name, v)} label={`${c.enabled}: ${cmd.name}`} />
          </div>
        ))}
      </div>
    </>
  );
}

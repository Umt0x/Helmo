"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { COMMANDS, type Category, type CommandSettings } from "@/content/commands";
import { SaveBar } from "./save-bar";
import { Toggle } from "./toggle";
import { useSaved } from "./use-saved";

const CATEGORIES: Category[] = ["moderation", "utility", "fun", "economy"];

function formatCooldown(seconds: number) {
  return seconds >= 3600 ? `${Math.round(seconds / 3600)}h` : `${seconds}s`;
}

export function CommandsPage({ initial }: { initial: CommandSettings }) {
  const { t } = useI18n();
  const c = t.commands;
  const form = useSaved("commands/list", initial);
  const commands = useMemo(
    () => COMMANDS.map((cmd) => ({ ...cmd, enabled: form.values[cmd.name] ?? cmd.enabled })),
    [form.values],
  );
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

  const toggle = (name: string, enabled: boolean) => form.change((prev) => ({ ...prev, [name]: enabled }));

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
      <SaveBar
        dirty={form.dirty}
        saving={form.saving}
        justSaved={form.justSaved}
        error={form.error}
        onSave={form.save}
        onReset={form.reset}
      />
    </>
  );
}

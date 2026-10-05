"use client";

import type { CSSProperties } from "react";
import { Ban, Link2, Bot, MessageSquareWarning, ShieldAlert, Swords, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { type GuardAction, type GuardKey, type GuardModule, type GuardSettings } from "@/content/guard";
import { SaveBar } from "./save-bar";
import { Toggle } from "./toggle";
import { useSaved } from "./use-saved";

const META: { key: GuardKey; icon: LucideIcon }[] = [
  { key: "antiRaid", icon: Swords },
  { key: "antiNuke", icon: ShieldAlert },
  { key: "antiSpam", icon: MessageSquareWarning },
  { key: "antiLink", icon: Link2 },
  { key: "antiBot", icon: Bot },
  { key: "antiMention", icon: Ban },
];

export function GuardPage({ initial }: { initial: GuardSettings }) {
  const { t } = useI18n();
  const g = t.guard;
  const form = useSaved("guard/overview", initial);
  const state = form.values;

  const patch = (key: GuardKey, change: Partial<GuardModule>) =>
    form.change((prev) => ({ ...prev, [key]: { ...prev[key], ...change } }));

  return (
    <>
    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {META.map(({ key, icon: Icon }) => {
        const m = state[key];
        const text = g.modules[key];
        return (
          <section key={key} className={clsx("card p-5", m.enabled && "glow-green")}>
            <div className="flex items-start gap-3">
              <div
                className={clsx(
                  "grid size-10 shrink-0 place-items-center rounded-2xl",
                  m.enabled ? "bg-ok/15 text-ok" : "bg-white/[0.06] text-muted",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{text.name}</h2>
                <p className="mt-0.5 text-sm text-muted">{text.desc}</p>
              </div>
              <Toggle checked={m.enabled} onChange={(v) => patch(key, { enabled: v })} label={text.name} />
            </div>

            <div className={clsx("mt-5 grid gap-3 transition-opacity", !m.enabled && "pointer-events-none opacity-40")}>
              {m.threshold !== null && (
                <label className="grid gap-1.5 text-sm">
                  <span className="flex justify-between text-muted">
                    {g.threshold}
                    <span className="text-foreground">
                      {m.threshold} {g.perMinute}
                    </span>
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={m.threshold}
                    onChange={(e) => patch(key, { threshold: Number(e.target.value) })}
                    className="slider"
                    style={{ "--fill": `${((m.threshold - 1) / 29) * 100}%` } as CSSProperties}
                  />
                </label>
              )}
              <label className="grid gap-1.5 text-sm">
                <span className="text-muted">{g.action}</span>
                <select
                  value={m.action}
                  onChange={(e) => patch(key, { action: e.target.value as GuardAction })}
                  className="field"
                >
                  {(Object.keys(g.actions) as GuardAction[]).map((a) => (
                    <option key={a} value={a}>
                      {g.actions[a]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        );
      })}
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

"use client";

import { useState, type CSSProperties } from "react";
import { Ban, Link2, Bot, MessageSquareWarning, ShieldAlert, Swords, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { Toggle } from "./toggle";

type ModuleKey = "antiRaid" | "antiNuke" | "antiSpam" | "antiLink" | "antiBot" | "antiMention";
type ActionKey = "ban" | "kick" | "mute" | "strip";
type ModuleState = { enabled: boolean; threshold: number | null; action: ActionKey };

const META: { key: ModuleKey; icon: LucideIcon }[] = [
  { key: "antiRaid", icon: Swords },
  { key: "antiNuke", icon: ShieldAlert },
  { key: "antiSpam", icon: MessageSquareWarning },
  { key: "antiLink", icon: Link2 },
  { key: "antiBot", icon: Bot },
  { key: "antiMention", icon: Ban },
];

const INITIAL: Record<ModuleKey, ModuleState> = {
  antiRaid: { enabled: true, threshold: 10, action: "kick" },
  antiNuke: { enabled: true, threshold: 3, action: "strip" },
  antiSpam: { enabled: true, threshold: 8, action: "mute" },
  antiLink: { enabled: false, threshold: null, action: "mute" },
  antiBot: { enabled: true, threshold: null, action: "kick" },
  antiMention: { enabled: false, threshold: 5, action: "mute" },
};

export function GuardPage() {
  const { t } = useI18n();
  const g = t.guard;
  const [state, setState] = useState(INITIAL);

  const patch = (key: ModuleKey, change: Partial<ModuleState>) =>
    setState((prev) => ({ ...prev, [key]: { ...prev[key], ...change } }));

  return (
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
                  onChange={(e) => patch(key, { action: e.target.value as ActionKey })}
                  className="field"
                >
                  {(Object.keys(g.actions) as ActionKey[]).map((a) => (
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
  );
}

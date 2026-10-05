"use client";

import { useState, useTransition } from "react";
import { Bot, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { BOT_TYPES, BOT_TYPE_KEYS, type BotType } from "@/lib/bot-types";
import { PLANS, type PlanKey } from "@/lib/plans";
import type { Usage } from "@/lib/limits";
import { connectBotAction, removeBotAction } from "@/app/actions";

export type BotsOverview = {
  plan: PlanKey;
  usage: Usage;
  bots: { id: string; type: string; name: string; status: string; paused: boolean }[];
};

const TYPE_LABEL = (type: string, locale: "en" | "tr") =>
  type in BOT_TYPES ? BOT_TYPES[type as BotType].label[locale] : type;

function Meter({ label, used, max }: { label: string; used: number; max: number }) {
  const full = used >= max;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className={clsx("tabular-nums", full && "text-warn")}>
          {used} / {max}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={clsx("h-full rounded-full transition-all", full ? "bg-warn" : "bg-ok")}
          style={{ width: `${Math.min(100, (used / max) * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function BotsPage({ overview }: { overview: BotsOverview }) {
  const { t, locale } = useI18n();
  const b = t.bots;
  const { plan, usage, bots } = overview;

  const [type, setType] = useState<BotType>("guard");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const totalFull = usage.total.used >= usage.total.max;
  const typeFull = (k: BotType) => {
    const u = usage.perType[k];
    return !!u && u.max !== null && u.used >= u.max;
  };
  const canAdd = !totalFull && !typeFull(type);

  const message = (code: string, limit?: number) =>
    (b.errors[code] ?? b.errors.failed).replace("{limit}", String(limit ?? ""));

  function connect() {
    setError(null);
    start(async () => {
      const res = await connectBotAction(type, token);
      if (res.ok) setToken("");
      else setError(message(res.error, res.limit));
    });
  }

  function remove(id: string) {
    setConfirming(null);
    start(async () => {
      const res = await removeBotAction(id);
      if (!res.ok) setError(message(res.error));
    });
  }

  return (
    <>
      <section className="card glow-green p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{b.usage}</h2>
          <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-medium">
            {b.plan}: {PLANS[plan].label[locale]}
          </span>
        </div>
        <div className="mt-5 grid gap-6 sm:grid-cols-3">
          <Meter label={b.totalBots} used={usage.total.used} max={usage.total.max} />
          {usage.perType.voice?.max != null && (
            <Meter label={b.voiceBots} used={usage.perType.voice.used} max={usage.perType.voice.max} />
          )}
          {usage.perType.main?.max != null && (
            <Meter label={b.mainBots} used={usage.perType.main.used} max={usage.perType.main.max} />
          )}
        </div>
      </section>

      <section className="card">
        <header className="border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold">{b.yourBots}</h2>
        </header>
        {bots.length === 0 && <p className="px-6 py-8 text-center text-sm text-muted">{b.empty}</p>}
        {bots.map((bot) => (
          <div key={bot.id} className="flex flex-wrap items-center gap-4 border-b border-border px-6 py-4 last:border-b-0">
            <div className="grid size-10 place-items-center rounded-xl bg-tab">
              <Bot className="size-5 text-muted" />
            </div>
            <div className="min-w-0 flex-1 basis-48">
              <p className="flex items-center gap-2">
                <span className="truncate font-medium">{bot.name}</span>
                <span className="rounded-full bg-white/[0.07] px-2 py-0.5 text-xs text-muted">{TYPE_LABEL(bot.type, locale)}</span>
              </p>
              {bot.paused && <p className="mt-0.5 text-xs text-warn">{b.pausedHint}</p>}
            </div>
            {bot.paused ? (
              <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-xs font-medium text-warn">{b.paused}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-muted">
                <span className={clsx("size-1.5 rounded-full", bot.status === "online" ? "bg-ok" : bot.status === "error" ? "bg-bad" : "bg-white/30")} />
                {b.statuses[bot.status] ?? bot.status}
              </span>
            )}
            {confirming === bot.id ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted">{b.confirmRemove}</span>
                <button className="btn btn-secondary text-bad" onClick={() => remove(bot.id)} disabled={pending}>
                  {b.yes}
                </button>
                <button className="btn btn-secondary" onClick={() => setConfirming(null)}>
                  {b.cancel}
                </button>
              </div>
            ) : (
              <button
                className="rounded-lg p-2 text-muted hover:bg-white/[0.07] hover:text-bad"
                onClick={() => setConfirming(bot.id)}
                aria-label={b.remove}
                title={b.remove}
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </section>

      <section className="card">
        <header className="border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold">{b.add}</h2>
          <p className="mt-0.5 text-sm text-muted">{b.addDesc}</p>
        </header>
        <div className="grid gap-4 px-6 py-5">
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{b.type}</span>
            <select className="field max-w-xs" value={type} onChange={(e) => setType(e.target.value as BotType)}>
              {BOT_TYPE_KEYS.map((k) => (
                <option key={k} value={k} disabled={typeFull(k)}>
                  {TYPE_LABEL(k, locale)}
                  {typeFull(k) ? ` (${b.full})` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="text-muted">{b.token}</span>
            <input
              type="password"
              autoComplete="off"
              className="field max-w-xl font-mono"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <span className="text-xs text-muted-2">{b.tokenHint}</span>
          </label>

          {error && <p className="rounded-xl bg-bad/15 px-4 py-3 text-sm text-bad">{error}</p>}
          {!canAdd && <p className="text-sm text-warn">{b.upgrade}</p>}

          <div>
            <button className="btn btn-primary disabled:opacity-50" onClick={connect} disabled={!canAdd || token.trim().length < 20 || pending}>
              <Plus className="size-4" />
              {pending ? b.connecting : b.connect}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { Activity, Clock, Cpu, MemoryStick, Server, Terminal, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import { BOT_TYPES, type BotType } from "@/lib/bot-types";
import { formatDuration, type HostingData } from "@/lib/hosting-summary";

type Glow = "glow-green" | "glow-cyan" | "glow-amber" | "glow-red";

export function HostingStats({ data }: { data: HostingData }) {
  const { t, locale } = useI18n();
  const h = t.hosting;
  const { summary: s, commands: c, bots } = data;
  const dash = "—";

  const allUp = s.total > 0 && s.online === s.total;
  const cards: { icon: LucideIcon; label: string; value: string; sub: string; glow: Glow }[] = [
    { icon: Activity, label: h.botsOnline, value: `${s.online} / ${s.total}`, sub: allUp ? h.allHealthy : s.online === 0 ? h.noneOnline : h.someDown, glow: allUp ? "glow-green" : s.online === 0 ? "glow-red" : "glow-amber" },
    { icon: Activity, label: h.ping, value: s.avgPingMs === null ? dash : `${s.avgPingMs} ms`, sub: "WebSocket", glow: "glow-cyan" },
    { icon: Clock, label: h.uptime, value: s.longestUptimeSec === null ? dash : formatDuration(s.longestUptimeSec), sub: h.sinceLastStart, glow: "glow-green" },
    { icon: Server, label: h.servers, value: String(s.servers), sub: h.acrossBots, glow: "glow-cyan" },
    { icon: MemoryStick, label: h.memory, value: s.memoryMb ? `${s.memoryMb} MB` : dash, sub: s.maxLoopLagMs === null ? h.workers : `${h.lag}: ${s.maxLoopLagMs} ms`, glow: "glow-amber" },
    {
      icon: Terminal,
      label: h.commands24h,
      value: c.total.toLocaleString(locale),
      sub: c.successRate === null ? h.noCommands : `${c.successRate}% ${h.success} · ${c.avgMs} ms ${h.avg}`,
      glow: c.successRate !== null && c.successRate < 95 ? "glow-amber" : "glow-green",
    },
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ icon: Icon, label, value, sub, glow }) => (
          <div key={label} className={`card ${glow} p-5`}>
            <div className="flex items-center justify-between text-muted">
              <p className="text-sm">{label}</p>
              <Icon className="size-4" />
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-3 text-sm text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <header className="border-b border-border px-6 py-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <Cpu className="size-4 text-muted" />
            {h.perBot}
          </h2>
        </header>

        {bots.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted">
            <p>{h.noBots}</p>
            <Link href="/dashboard/bot-settings/bots" className="btn btn-primary mt-4 inline-flex">
              {h.addBot}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-2">
                  {[h.table.bot, h.table.type, h.table.status, h.table.ping, h.table.servers, h.table.worker, h.table.signal].map((col) => (
                    <th key={col} className="px-6 py-3 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bots.map((b) => (
                  <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 font-medium">{b.name}</td>
                    <td className="px-6 py-3.5 text-muted">{b.type in BOT_TYPES ? BOT_TYPES[b.type as BotType].label[locale] : b.type}</td>
                    <td className="px-6 py-3.5">
                      {b.paused ? (
                        <span className="rounded-full bg-warn/15 px-2.5 py-0.5 text-xs font-medium text-warn">{t.bots.paused}</span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className={clsx("size-1.5 rounded-full", b.status === "online" ? "bg-ok" : b.status === "error" ? "bg-bad" : "bg-white/30")} />
                          {t.bots.statuses[b.status] ?? b.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-muted tabular-nums">{b.status === "online" && b.pingMs !== null ? `${b.pingMs} ms` : dash}</td>
                    <td className="px-6 py-3.5 text-muted tabular-nums">{b.status === "online" ? b.guilds : dash}</td>
                    <td className="px-6 py-3.5 text-muted">{b.worker ?? dash}</td>
                    <td className="px-6 py-3.5 text-muted">{b.seenAgoSec === null ? dash : `${formatDuration(b.seenAgoSec)} ${h.ago}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Activity, Clock, Cpu, MemoryStick, Server, Terminal, type LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/provider";
import { buildResources } from "@/lib/mock-data";

type Glow = "glow-green" | "glow-cyan" | "glow-amber";

export function HostingStats() {
  const { t } = useI18n();
  const h = t.hosting;
  const data = useMemo(() => buildResources(24, 3), []);

  const cards: { icon: LucideIcon; label: string; value: string; sub: string; glow: Glow }[] = [
    { icon: Activity, label: h.ping, value: "42 ms", sub: "WebSocket", glow: "glow-green" },
    { icon: Clock, label: h.uptime, value: "14d 6h", sub: "99.98%", glow: "glow-green" },
    { icon: Cpu, label: h.cpu, value: "27%", sub: `${h.limit}: 100%`, glow: "glow-cyan" },
    { icon: MemoryStick, label: h.ram, value: "412 MB", sub: `${h.limit}: 1 GB`, glow: "glow-amber" },
    { icon: Server, label: h.guilds, value: "3 / 10", sub: `${h.node}: eu-1`, glow: "glow-cyan" },
    { icon: Terminal, label: h.commandsToday, value: "8,421", sub: "+6.2%", glow: "glow-green" },
  ];

  return (
    <>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">{h.title}</h2>
        <span className="flex items-center gap-1.5 rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-medium text-ok">
          <span className="size-1.5 rounded-full bg-ok" />
          {h.online}
        </span>
      </div>

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

      <section className="card glow-cyan p-6">
        <div className="flex items-center gap-5">
          <h2 className="text-[15px] font-semibold">{h.resourceTraffic}</h2>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-info" />
              CPU
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-warn" />
              RAM
            </span>
          </div>
        </div>
        <div className="mt-6 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f5a524" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#f5a524" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#9398a1", fontSize: 12 }} minTickGap={32} tickMargin={12} />
              <Tooltip
                contentStyle={{ background: "#1d1f23", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
                formatter={(v, name) => [`${v}%`, name === "cpu" ? "CPU" : "RAM"]}
              />
              <Area type="monotone" dataKey="cpu" stroke="#22d3ee" strokeWidth={1.5} fill="url(#cpu)" />
              <Area type="monotone" dataKey="ram" stroke="#f5a524" strokeWidth={1.5} fill="url(#ram)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}

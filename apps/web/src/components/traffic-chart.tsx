"use client";

import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useI18n } from "@/i18n/provider";
import { buildTraffic } from "@/lib/mock-data";
import clsx from "clsx";

type RangeKey = "d7" | "m1" | "m3";
const rangeDays: Record<RangeKey, number> = { d7: 7, m1: 30, m3: 90 };

export function TrafficChart({
  title,
  seed,
  defaultRange,
}: {
  title: string;
  seed: number;
  defaultRange: RangeKey;
}) {
  const { t } = useI18n();
  const uid = useId().replace(/:/g, "");
  const [range, setRange] = useState<RangeKey>(defaultRange);
  const data = useMemo(() => buildTraffic(rangeDays[range], seed, t.months), [range, seed, t.months]);

  return (
    <section className="card glow-green p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <div className="hidden items-center gap-4 text-xs text-muted sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-ok" />
              {t.stats.joins}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-info" />
              {t.stats.leaves}
            </span>
          </div>
        </div>
        <div className="flex gap-1 rounded-full bg-white/[0.05] p-1">
          {(Object.keys(rangeDays) as RangeKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setRange(k)}
              className={clsx(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                range === k ? "bg-foreground text-background" : "text-muted hover:text-foreground",
              )}
            >
              {t.stats.range[k]}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9398a1", fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={32}
              tickMargin={12}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.15)" }}
              contentStyle={{
                background: "#1d1f23",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#f5f6f8", marginBottom: 4 }}
              formatter={(v, name) => [v, name === "joins" ? t.stats.joins : t.stats.leaves]}
            />
            <Area type="monotone" dataKey="joins" stroke="#22c55e" strokeWidth={1.5} fill={`url(#${uid}-g)`} />
            <Area type="monotone" dataKey="leaves" stroke="#22d3ee" strokeWidth={1.5} fill={`url(#${uid}-b)`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import clsx from "clsx";

type Props = {
  title: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  headline: string;
  caption: string;
  spark: number[];
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / (max - min || 1)) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-24" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function StatCard({ title, value, delta, trend, headline, caption, spark }: Props) {
  const up = trend === "up";
  const Arrow = up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={clsx("card p-5", up ? "glow-green" : "glow-red")}>
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-4xl font-semibold tracking-tight">{value}</p>
        <Sparkline values={spark} color={up ? "#22c55e" : "#ef4444"} />
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm">
        <span
          className={clsx(
            "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
            up ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad",
          )}
        >
          <Arrow className="size-3" />
          {delta}
        </span>
        <span className="truncate font-medium">{headline}</span>
      </div>
      <p className="mt-1.5 text-xs text-muted">{caption}</p>
    </div>
  );
}

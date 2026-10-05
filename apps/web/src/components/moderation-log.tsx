"use client";

import Link from "next/link";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import type { ModActionKey, ModerationLog } from "@/lib/audit";

const TONE: Record<string, string> = {
  ban: "bg-bad/15 text-bad",
  kick: "bg-warn/15 text-warn",
  mute: "bg-warn/15 text-warn",
  warn: "bg-info/15 text-info",
  clear: "bg-ok/15 text-ok",
};

const STATS: { key: ModActionKey; glow: string }[] = [
  { key: "ban", glow: "glow-red" },
  { key: "kick", glow: "glow-amber" },
  { key: "mute", glow: "glow-amber" },
  { key: "warn", glow: "glow-cyan" },
];

function formatMinutes(m: number) {
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const min = m % 60;
  return [d && `${d}d`, h && `${h}h`, min && `${min}m`].filter(Boolean).join(" ") || "0m";
}

export function ModerationLogView({ log }: { log: ModerationLog }) {
  const { t, locale } = useI18n();
  const a = t.audit;
  const dash = "—";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ key, glow }) => (
          <div key={key} className={`card ${glow} p-5`}>
            <p className="text-sm text-muted">
              {a.actions[key]} ({a.sevenDays})
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{log.last7[key]}</p>
          </div>
        ))}
      </div>

      <section className="card">
        <header className="border-b border-border px-6 py-4">
          <h2 className="text-[15px] font-semibold">{a.title}</h2>
        </header>

        {log.entries.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted">{a.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-2">
                  {[a.cols.case, a.cols.time, a.cols.moderator, a.cols.action, a.cols.member, a.cols.reason].map((c) => (
                    <th key={c} className="px-6 py-3 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.entries.map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-b-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 text-muted">
                      {e.caseNo ? (
                        <Link href={`/dashboard/punishments/records?q=${e.caseNo}`} className="font-medium text-foreground hover:underline">
                          #{e.caseNo}
                        </Link>
                      ) : (
                        dash
                      )}
                    </td>
                    {/* Formatted in the browser's time zone, so the server's clock must not decide the text. */}
                    <td className="whitespace-nowrap px-6 py-3.5 font-medium" suppressHydrationWarning>
                      {new Date(e.at).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-3.5 text-muted">
                      {e.moderator}
                      {e.auto && <span className="ml-2 rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px]">{a.auto}</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[e.action] ?? "bg-white/[0.07]")}>
                        {(a.actions as Record<string, string>)[e.action] ?? e.action}
                        {e.durationMin ? ` · ${formatMinutes(e.durationMin)}` : ""}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted">{e.target ?? dash}</td>
                    <td className="max-w-xs truncate px-6 py-3.5 text-muted" title={e.reason ?? undefined}>
                      {e.reason ?? dash}
                    </td>
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

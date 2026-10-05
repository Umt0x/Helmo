"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import type { CaseEntry, RecordSearch } from "@/lib/records";

const TONE: Record<string, string> = {
  ban: "bg-bad/15 text-bad",
  kick: "bg-warn/15 text-warn",
  mute: "bg-warn/15 text-warn",
  warn: "bg-info/15 text-info",
};
const ICON: Record<string, string> = { warn: "⚠️", mute: "🔇", kick: "👢", ban: "🔨" };

function formatMinutes(m: number) {
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const min = m % 60;
  return [d && `${d}d`, h && `${h}h`, min && `${min}m`].filter(Boolean).join(" ") || "0m";
}

export function RecordsView({ result }: { result: RecordSearch }) {
  const { t, locale } = useI18n();
  const r = t.records;
  const [query, setQuery] = useState(result.query);
  const action = (key: string) => (t.audit.actions as Record<string, string>)[key] ?? key;
  const when = (iso: string, long = false) =>
    new Date(iso).toLocaleString(locale, long ? { dateStyle: "long", timeStyle: "short" } : { dateStyle: "short", timeStyle: "short" });

  const badge = (e: CaseEntry) => (
    <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[e.action] ?? "bg-white/[0.07]")}>
      {ICON[e.action] ?? ""} {action(e.action)}
      {e.durationMin ? ` · ${formatMinutes(e.durationMin)}` : ""}
    </span>
  );

  const counts = new Map<string, number>();
  for (const e of result.mode === "recent" ? [] : result.entries) counts.set(e.action, (counts.get(e.action) ?? 0) + 1);

  return (
    <>
      {/* A plain GET form: the search lives in the address, so a case link can be shared or bookmarked. */}
      <form method="get" className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-2" />
          <input name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={r.searchPlaceholder} className="field w-full pl-10" autoComplete="off" />
        </div>
        <button className="btn btn-primary">{r.search}</button>
        {result.query && (
          <Link href="/dashboard/punishments/records" className="btn btn-secondary">
            <X className="size-4" />
            {r.clear}
          </Link>
        )}
      </form>

      {result.mode === "case" && !result.selected && (
        <div className="card glow-amber p-8 text-center text-sm text-muted">{r.caseNotFound}</div>
      )}

      {result.selected && (
        <section className={clsx("card p-6", result.selected.action === "ban" ? "glow-red" : "glow-amber")}>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold">
              {r.caseTitle} #{result.selected.caseNo}
            </h2>
            {badge(result.selected)}
            {result.selected.auto && <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs text-muted">{r.auto}</span>}
          </div>
          <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">{r.fields.member}</dt>
              <dd className="mt-1 font-medium">
                {result.selected.target}
                {result.selected.targetId && <span className="ml-2 text-xs text-muted-2">{result.selected.targetId}</span>}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{r.fields.moderator}</dt>
              <dd className="mt-1 font-medium">{result.selected.moderator}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">{r.fields.reason}</dt>
              <dd className="mt-1 font-medium">{result.selected.reason ?? r.noReason}</dd>
            </div>
            {result.selected.durationMin && (
              <div>
                <dt className="text-muted">{r.fields.duration}</dt>
                <dd className="mt-1 font-medium">{formatMinutes(result.selected.durationMin)}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted">{r.fields.date}</dt>
              <dd className="mt-1 font-medium" suppressHydrationWarning>
                {when(result.selected.at, true)}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {(result.entries.length > 0 || result.mode !== "case") && (
        <section className="card">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
            <h2 className="text-[15px] font-semibold">
              {result.mode === "case" ? r.otherCases : result.mode === "member" ? `${r.memberResults} “${result.query}”` : r.recent}
            </h2>
            {counts.size > 0 && (
              <p className="text-xs text-muted">
                {r.totals}: {[...counts].map(([a, n]) => `${n} ${action(a).toLowerCase()}`).join(" · ")}
              </p>
            )}
          </header>

          {result.entries.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted">{result.mode === "recent" ? t.audit.empty : r.notFound}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-2">
                    {[r.cols.case, r.cols.type, r.cols.member, r.cols.moderator, r.cols.reason, r.cols.time].map((c) => (
                      <th key={c} className="px-6 py-3 font-medium">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.entries.map((e) => (
                    <tr key={e.id} className={clsx("border-b border-border last:border-b-0 hover:bg-white/[0.02]", e.caseNo === result.selected?.caseNo && "bg-white/[0.04]")}>
                      <td className="px-6 py-3.5">
                        <Link href={`/dashboard/punishments/records?q=${e.caseNo}`} className="font-medium hover:underline">
                          #{e.caseNo}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5">{badge(e)}</td>
                      <td className="px-6 py-3.5 text-muted">{e.target}</td>
                      <td className="px-6 py-3.5 text-muted">
                        {e.moderator}
                        {e.auto && <span className="ml-2 rounded-full bg-white/[0.07] px-2 py-0.5 text-[11px]">{r.auto}</span>}
                      </td>
                      <td className="max-w-xs truncate px-6 py-3.5 text-muted" title={e.reason ?? undefined}>
                        {e.reason ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-muted" suppressHydrationWarning>
                        {when(e.at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </>
  );
}

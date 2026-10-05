"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Check, Copy, Eye, EyeOff, Plus, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { useI18n } from "@/i18n/provider";
import type { Locale } from "@/i18n/config";
import type { Cell, Glow, PageDef, Row, Section, Stat, Table, Tone, Txt } from "@/content/types";
import { Toggle } from "./toggle";

type Value = boolean | number | string | number[];

const tx = (v: Txt, locale: Locale) => (typeof v === "string" ? v : v[locale]);

const TONE: Record<Tone, string> = {
  ok: "bg-ok/15 text-ok",
  bad: "bg-bad/15 text-bad",
  warn: "bg-warn/15 text-warn",
  info: "bg-info/15 text-info",
};

function glowClass(g?: Glow) {
  return g ? `glow-${g}` : "";
}

export function ConfigPage({ page }: { page: PageDef }) {
  const { locale, t } = useI18n();
  const initial = useMemo(() => {
    const map: Record<string, Value> = {};
    for (const s of page.sections) for (const r of s.rows ?? []) map[r.id] = r.def;
    return map;
  }, [page]);

  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [justSaved, setJustSaved] = useState(false);
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const set = (id: string, v: Value) => {
    setJustSaved(false);
    setValues((p) => ({ ...p, [id]: v }));
  };

  return (
    <>
      {page.actions && (
        <div className="flex flex-wrap gap-2">
          {page.actions.map((a, i) => (
            <button key={i} className={clsx("btn", i === 0 ? "btn-primary" : "btn-secondary")}>
              {i === 0 && <Plus className="size-4" />}
              {tx(a, locale)}
            </button>
          ))}
        </div>
      )}

      {page.stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {page.stats.map((s, i) => (
            <StatTile key={i} stat={s} locale={locale} />
          ))}
        </div>
      )}

      {page.sections.map((s, i) => (
        <SectionCard key={i} section={s} values={values} set={set} locale={locale} />
      ))}

      {(dirty || justSaved) && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-tab px-3 py-2 pl-5 shadow-2xl">
          {justSaved ? (
            <span className="flex items-center gap-2 text-sm text-ok">
              <Check className="size-4" />
              {t.common.saved}
            </span>
          ) : (
            <>
              <span className="text-sm text-muted">{t.common.unsaved}</span>
              <button className="btn btn-secondary" onClick={() => setValues(saved)}>
                <RotateCcw className="size-3.5" />
                {t.common.reset}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSaved(values);
                  setJustSaved(true);
                  setTimeout(() => setJustSaved(false), 2200);
                }}
              >
                {t.common.save}
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function StatTile({ stat, locale }: { stat: Stat; locale: Locale }) {
  return (
    <div className={clsx("card p-5", glowClass(stat.glow))}>
      <p className="text-sm text-muted">{tx(stat.label, locale)}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
      {stat.sub && <p className="mt-2 text-xs text-muted">{tx(stat.sub, locale)}</p>}
    </div>
  );
}

function SectionCard({
  section,
  values,
  set,
  locale,
}: {
  section: Section;
  values: Record<string, Value>;
  set: (id: string, v: Value) => void;
  locale: Locale;
}) {
  return (
    <section className={clsx("card", glowClass(section.glow))}>
      {(section.title || section.desc) && (
        <header className="border-b border-border px-6 py-4">
          {section.title && <h2 className="text-[15px] font-semibold">{tx(section.title, locale)}</h2>}
          {section.desc && <p className="mt-0.5 text-sm text-muted">{tx(section.desc, locale)}</p>}
        </header>
      )}
      {section.rows?.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4 last:border-b-0">
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-sm font-medium">{tx(r.label, locale)}</p>
            {r.desc && <p className="mt-0.5 text-sm text-muted">{tx(r.desc, locale)}</p>}
          </div>
          <Control row={r} value={values[r.id]} onChange={(v) => set(r.id, v)} locale={locale} />
        </div>
      ))}
      {section.table && <DataTable table={section.table} locale={locale} />}
    </section>
  );
}

function Control({
  row,
  value,
  onChange,
  locale,
}: {
  row: Row;
  value: Value;
  onChange: (v: Value) => void;
  locale: Locale;
}) {
  const label = tx(row.label, locale);
  switch (row.type) {
    case "toggle":
      return <Toggle checked={value as boolean} onChange={onChange} label={label} />;
    case "select":
      return (
        <select className="field min-w-44" value={value as number} onChange={(e) => onChange(Number(e.target.value))}>
          {row.options.map((o, i) => (
            <option key={i} value={i}>
              {tx(o, locale)}
            </option>
          ))}
        </select>
      );
    case "number":
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="field w-24 text-center"
            min={row.min}
            max={row.max}
            value={value as number}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {row.unit && <span className="text-sm text-muted">{tx(row.unit, locale)}</span>}
        </div>
      );
    case "text":
      return (
        <input
          className="field w-64"
          value={value as string}
          placeholder={row.placeholder ? tx(row.placeholder, locale) : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "slider": {
      const v = value as number;
      return (
        <div className="flex w-64 items-center gap-3">
          <input
            type="range"
            className="slider flex-1"
            min={row.min}
            max={row.max}
            value={v}
            style={{ "--fill": `${((v - row.min) / (row.max - row.min)) * 100}%` } as CSSProperties}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <span className="w-16 text-right text-sm tabular-nums">
            {v}
            {row.unit ? ` ${tx(row.unit, locale)}` : ""}
          </span>
        </div>
      );
    }
    case "chips": {
      const picked = value as number[];
      return (
        <div className="flex max-w-md flex-wrap justify-end gap-1.5">
          {row.options.map((o, i) => {
            const on = picked.includes(i);
            return (
              <button
                key={i}
                onClick={() => onChange(on ? picked.filter((x) => x !== i) : [...picked, i])}
                className={clsx(
                  "rounded-full px-3 py-1 text-xs transition-colors",
                  on ? "bg-foreground text-background" : "bg-white/[0.07] text-muted hover:text-foreground",
                )}
              >
                {tx(o, locale)}
              </button>
            );
          })}
        </div>
      );
    }
    case "secret":
      return <SecretField value={value as string} onChange={onChange} />;
  }
}

function SecretField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <input
        type={show ? "text" : "password"}
        className="field w-72 font-mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="btn btn-secondary px-2.5" onClick={() => setShow(!show)} aria-label="toggle visibility">
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
      <button
        className="btn btn-secondary px-2.5"
        aria-label="copy"
        onClick={() => {
          navigator.clipboard?.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function CellView({ cell, locale }: { cell: Cell; locale: Locale }) {
  if (typeof cell === "string") return <>{cell}</>;
  if ("badge" in cell)
    return <span className={clsx("rounded-full px-2.5 py-0.5 text-xs font-medium", TONE[cell.tone])}>{tx(cell.badge, locale)}</span>;
  if ("code" in cell) return <code className="rounded-lg bg-tab px-2 py-0.5 font-mono text-[13px]">{cell.code}</code>;
  return <>{cell[locale]}</>;
}

function DataTable({ table, locale }: { table: Table; locale: Locale }) {
  return (
    <div>
      {table.action && (
        <div className="flex justify-end border-b border-border px-6 py-3">
          <button className="btn btn-primary">
            <Plus className="size-4" />
            {tx(table.action, locale)}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-2">
              {table.cols.map((c, i) => (
                <th key={i} className="px-6 py-3 font-medium">
                  {tx(c, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-b-0 hover:bg-white/[0.02]">
                {row.map((cell, j) => (
                  <td key={j} className={clsx("px-6 py-3.5", j > 0 && "text-muted", j === 0 && "font-medium")}>
                    <CellView cell={cell} locale={locale} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

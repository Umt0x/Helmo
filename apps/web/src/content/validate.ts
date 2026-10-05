import type { Row } from "./types";

export type Value = boolean | number | string | number[];

/** Shown instead of a stored secret. The real value never leaves the server. */
export const MASK = "••••••••••••";

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function sanitizeRow(row: Row, input: unknown): Value {
  switch (row.type) {
    case "toggle":
      return typeof input === "boolean" ? input : row.def;
    case "select":
      return Number.isInteger(input) && (input as number) >= 0 && (input as number) < row.options.length
        ? (input as number)
        : row.def;
    case "number":
    case "slider": {
      if (typeof input !== "number" || !Number.isFinite(input)) return row.def;
      const min = row.min ?? 0;
      const max = row.max ?? (row.type === "number" ? 1_000_000 : 100);
      return clamp(Math.round(input), min, max);
    }
    case "text":
      return typeof input === "string" ? input.trim().slice(0, 500) : row.def;
    case "secret":
      return typeof input === "string" ? input.trim().slice(0, 300) : "";
    case "role":
    case "channel":
      // Discord ids are plain numbers. Whether the id really belongs to this server is checked when saving.
      return typeof input === "string" && /^\d{1,25}$/.test(input) ? input : "";
    case "textarea":
      return typeof input === "string" ? input.trim().slice(0, 1500) : row.def;
    case "chips": {
      if (!Array.isArray(input)) return row.def;
      const ok = input.filter((i): i is number => Number.isInteger(i) && i >= 0 && i < row.options.length);
      return [...new Set(ok)].sort((a, b) => a - b);
    }
  }
}

/** Keeps only the rows the page defines and forces each value to its row's type. */
export function sanitizeRows(rows: Row[], input: unknown): Record<string, Value> {
  const source = isObject(input) ? input : {};
  return Object.fromEntries(rows.map((r) => [r.id, sanitizeRow(r, source[r.id])]));
}

export function defaultsFor(rows: Row[]): Record<string, Value> {
  return Object.fromEntries(rows.map((r) => [r.id, r.type === "secret" ? "" : r.def]));
}

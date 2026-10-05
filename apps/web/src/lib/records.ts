import "server-only";
import { and, desc, eq, ilike, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { modActions } from "@/db/schema";

export type CaseEntry = {
  id: number;
  caseNo: number;
  at: string;
  action: string;
  moderator: string;
  target: string;
  targetId: string | null;
  reason: string | null;
  durationMin: number | null;
  auto: boolean;
};

export type RecordSearch = {
  mode: "case" | "member" | "recent";
  query: string;
  /** The case that was asked for by number. */
  selected: CaseEntry | null;
  /** That member's other cases, or the matches of a name search, or the latest cases. */
  entries: CaseEntry[];
};

function toEntry(r: typeof modActions.$inferSelect): CaseEntry {
  return {
    id: r.id,
    caseNo: r.caseNo ?? 0,
    at: r.at.toISOString(),
    action: r.action,
    moderator: r.moderatorName ?? r.moderatorId,
    target: r.targetName ?? r.targetId ?? "—",
    targetId: r.targetId,
    reason: r.reason,
    durationMin: r.durationMin,
    auto: r.auto,
  };
}

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * Looks up the record ("sicil") of one server. A number finds that case and the
 * member's other cases; any other text finds members by id or name; nothing
 * shows the latest cases. Every query is limited to the given server.
 */
export async function lookupRecords(guildId: string, rawQuery: string): Promise<RecordSearch> {
  const query = rawQuery.trim().slice(0, 100);
  const punished = and(eq(modActions.guildId, guildId), isNotNull(modActions.caseNo));

  const caseMatch = /^#?(\d{1,9})$/.exec(query);
  if (caseMatch) {
    const [row] = await db
      .select()
      .from(modActions)
      .where(and(punished, eq(modActions.caseNo, Number(caseMatch[1]))))
      .limit(1);
    if (!row) return { mode: "case", query, selected: null, entries: [] };
    const others = row.targetId
      ? await db
          .select()
          .from(modActions)
          .where(and(punished, eq(modActions.targetId, row.targetId)))
          .orderBy(desc(modActions.at), desc(modActions.id))
          .limit(50)
      : [];
    return { mode: "case", query, selected: toEntry(row), entries: others.map(toEntry) };
  }

  if (query) {
    const rows = await db
      .select()
      .from(modActions)
      .where(and(punished, or(eq(modActions.targetId, query), ilike(modActions.targetName, `%${escapeLike(query)}%`))))
      .orderBy(desc(modActions.at), desc(modActions.id))
      .limit(100);
    return { mode: "member", query, selected: null, entries: rows.map(toEntry) };
  }

  const recent = await db.select().from(modActions).where(punished).orderBy(desc(modActions.at), desc(modActions.id)).limit(30);
  return { mode: "recent", query, selected: null, entries: recent.map(toEntry) };
}

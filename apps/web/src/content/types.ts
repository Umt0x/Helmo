/** A string in both languages. Plain strings (names, numbers) are shown as-is. */
export type Txt = string | { en: string; tr: string };

export const t2 = (en: string, tr: string): Txt => ({ en, tr });

export type Tone = "ok" | "bad" | "warn" | "info";
export type Glow = "green" | "cyan" | "amber" | "red";

export type Cell = Txt | { badge: Txt; tone: Tone } | { code: string };

type RowBase = { id: string; label: Txt; desc?: Txt };

export type Row =
  | (RowBase & { type: "toggle"; def: boolean })
  | (RowBase & { type: "select"; options: Txt[]; def: number })
  | (RowBase & { type: "number"; def: number; unit?: Txt; min?: number; max?: number })
  | (RowBase & { type: "text"; def: string; placeholder?: Txt })
  | (RowBase & { type: "slider"; def: number; min: number; max: number; unit?: Txt })
  | (RowBase & { type: "chips"; options: Txt[]; def: number[] })
  | (RowBase & { type: "secret"; def: string })
  /** Pick one of the server's real roles. The value is the role id ("" = none). */
  | (RowBase & { type: "role"; def: string })
  /** Pick one of the server's real channels. The value is the channel id ("" = none). */
  | (RowBase & { type: "channel"; kind?: "text" | "voice"; def: string })
  | (RowBase & { type: "textarea"; def: string; placeholder?: Txt });

/** The server's real roles and channels, as reported by the bot. */
export type Choices = {
  roles: { id: string; name: string; color: number; managed: boolean }[];
  channels: { id: string; name: string; type: number }[];
};

export const TEXT_CHANNEL_TYPES = [0, 5];
export const VOICE_CHANNEL_TYPES = [2, 13];

export type Stat = { label: Txt; value: string; sub?: Txt; glow?: Glow };

export type Table = {
  cols: Txt[];
  rows: Cell[][];
  /** Header button, e.g. "New command". */
  action?: Txt;
  empty?: Txt;
};

export type Section = {
  title?: Txt;
  desc?: Txt;
  glow?: Glow;
  rows?: Row[];
  table?: Table;
};

export type PageDef = {
  /** Header buttons shown above the content. */
  actions?: Txt[];
  stats?: Stat[];
  sections: Section[];
};

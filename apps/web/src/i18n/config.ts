export const LOCALES = [
  { code: "tr", name: "Türkçe" },
  { code: "en", name: "English" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "helmo_lang";

export function findLocale(code: string | undefined | null): Locale | undefined {
  if (!code) return undefined;
  const lower = code.trim().toLowerCase();
  return LOCALES.find((l) => l.code === lower || l.code === lower.split("-")[0])?.code;
}

/** Picks the best supported language from an Accept-Language header. */
export function negotiateLocale(header: string | null | undefined): Locale | undefined {
  if (!header) return undefined;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag, q: q ? Number(q) || 0 : 1 };
    })
    .filter((e) => e.tag && e.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const found = findLocale(tag);
    if (found) return found;
  }
  return undefined;
}

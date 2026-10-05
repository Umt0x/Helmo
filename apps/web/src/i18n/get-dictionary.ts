import type { Locale } from "./config";
import { en, type Dictionary } from "./en";
import { tr } from "./tr";

const dictionaries: Record<Locale, Dictionary> = { en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

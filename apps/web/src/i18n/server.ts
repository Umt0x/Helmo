import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, findLocale, negotiateLocale, type Locale } from "./config";

/** Cookie first (the picker), then the browser's language, then the default. */
export async function getLocale(): Promise<Locale> {
  const saved = findLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  if (saved) return saved;
  return negotiateLocale((await headers()).get("accept-language")) ?? DEFAULT_LOCALE;
}

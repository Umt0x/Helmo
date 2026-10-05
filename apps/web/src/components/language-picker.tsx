"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function LanguagePicker() {
  const { locale, t } = useI18n();
  const router = useRouter();

  function change(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <label className="btn btn-secondary cursor-pointer">
      <Languages className="size-4 text-muted" />
      <span className="sr-only">{t.common.language}</span>
      <select
        value={locale}
        onChange={(e) => change(e.target.value as Locale)}
        className="cursor-pointer appearance-none bg-transparent outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-card">
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}

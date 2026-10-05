"use client";

import { usePathname } from "next/navigation";
import { useI18n } from "@/i18n/provider";
import { findNavKey } from "@/lib/nav";
import { LanguagePicker } from "./language-picker";

export function Topbar() {
  const { t } = useI18n();
  const pathname = usePathname();
  const key = findNavKey(pathname);
  const title = key ? t.nav[key] : (pathname.split("/").pop() ?? "").replace(/-/g, " ");
  const subtitle = key ? (t.subtitle as Record<string, string>)[key] : undefined;

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 px-10 pb-2 pt-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <LanguagePicker />
    </header>
  );
}

"use client";

import { Hammer } from "lucide-react";
import { useI18n } from "@/i18n/provider";

export function ComingSoon() {
  const { t } = useI18n();
  return (
    <div className="card glow-amber grid min-h-[55vh] place-items-center">
      <div className="max-w-sm text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/[0.06]">
          <Hammer className="size-5 text-muted" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">{t.placeholder.title}</h2>
        <p className="mt-2 text-sm text-muted">{t.placeholder.body}</p>
      </div>
    </div>
  );
}

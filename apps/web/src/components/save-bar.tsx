"use client";

import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { useI18n } from "@/i18n/provider";

type Props = {
  dirty: boolean;
  saving: boolean;
  justSaved: boolean;
  error: "auth" | "page" | "failed" | null;
  onSave: () => void;
  onReset: () => void;
};

export function SaveBar({ dirty, saving, justSaved, error, onSave, onReset }: Props) {
  const { t } = useI18n();
  if (!dirty && !justSaved && !error) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-tab px-3 py-2 pl-5 shadow-2xl">
      {justSaved && !dirty ? (
        <span className="flex items-center gap-2 text-sm text-ok">
          <Check className="size-4" />
          {t.common.saved}
        </span>
      ) : (
        <>
          {error ? (
            <span className="flex items-center gap-2 text-sm text-bad">
              <TriangleAlert className="size-4" />
              {error === "auth" ? t.common.sessionExpired : t.common.saveFailed}
            </span>
          ) : (
            <span className="text-sm text-muted">{t.common.unsaved}</span>
          )}
          <button className="btn btn-secondary" onClick={onReset} disabled={saving}>
            <RotateCcw className="size-3.5" />
            {t.common.reset}
          </button>
          <button className="btn btn-primary disabled:opacity-60" onClick={onSave} disabled={saving}>
            {saving ? t.common.saving : t.common.save}
          </button>
        </>
      )}
    </div>
  );
}

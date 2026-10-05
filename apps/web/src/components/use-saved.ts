"use client";

import { useRef, useState } from "react";
import { savePage } from "@/app/actions";

/** Editable copy of saved settings, with dirty tracking and a real save. */
export function useSaved<T>(page: string, initial: T) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<"auth" | "page" | "failed" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const change = (next: T | ((prev: T) => T)) => {
    setJustSaved(false);
    setError(null);
    setValues(next);
  };

  async function save() {
    setSaving(true);
    setError(null);
    const res = await savePage(page, values);
    setSaving(false);
    if (!res.ok) return setError(res.error);
    // The server returns what it actually stored (clamped, secrets masked).
    setSaved(res.data as T);
    setValues(res.data as T);
    setJustSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustSaved(false), 2200);
  }

  return {
    values,
    change,
    dirty,
    saving,
    justSaved,
    error,
    save,
    reset: () => {
      setError(null);
      setValues(saved);
    },
  };
}

"use client";

import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-ok" : "bg-white/15",
      )}
    >
      <span
        className={clsx(
          "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Icon from "@/presentation/components/ui/Icon";

/**
 * Date filter control. On apply, navigates to `?date=YYYY-MM-DD` (keeps the
 * current path). The selected date anchors every BI window on the page: KPIs
 * and hourly traffic show that exact day, while the monthly / 7-day / 30-day
 * widgets recompute their trailing windows ending at that date.
 */
export default function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("date") ?? "";
  const [value, setValue] = useState(current);

  const apply = () => {
    if (!value) return;
    router.replace(value === current ? window.location.pathname : `?date=${encodeURIComponent(value)}`);
  };

  const reset = () => {
    router.replace(window.location.pathname);
    setValue("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
      <div className="relative">
        <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
          calendar_month
        </span>
        <input
          type="date"
          value={value}
          max={current || undefined}
          onChange={(e) => setValue(e.target.value)}
          className="rounded border border-outline-variant bg-surface py-2 pl-9 pr-3 font-body-sm text-body-sm text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary"
          aria-label="Sélectionner une date"
        />
      </div>
      <button
        type="button"
        onClick={apply}
        disabled={!value}
        className="motion-hover flex items-center gap-1.5 rounded bg-primary px-4 py-2 font-body-sm text-body-sm font-medium text-on-primary shadow-sm transition-colors hover:bg-tertiary-container disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="filter_alt" className="text-[16px]" />
        Appliquer {current ? `(${current})` : ""}
      </button>
      {current && (
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded border border-outline-variant bg-surface-container px-4 py-2 font-body-sm text-body-sm font-medium text-on-surface transition-colors hover:bg-surface-variant"
        >
          <Icon name="close" className="text-[16px]" />
          Effacer
        </button>
      )}
    </div>
  );
}
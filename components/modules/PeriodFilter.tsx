"use client";

import React, { Suspense, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Loader2 } from "lucide-react";

function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "all";
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(() => {
      if (val === "all") {
        router.push("/finance");
      } else {
        router.push(`/finance?period=${val}`);
      }
    });
  };

  return (
    <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-full px-3 py-1.5 transition-colors focus-within:border-brand-primary">
      {isPending ? (
        <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
      ) : (
        <CalendarRange className="w-4 h-4 text-brand-muted" />
      )}
      <select
        value={currentPeriod}
        onChange={handleChange}
        disabled={isPending}
        className="bg-transparent text-sm font-medium text-brand-text focus:outline-none cursor-pointer appearance-none pr-4 disabled:opacity-50 transition-opacity"
      >
        <option value="all">Semua Waktu</option>
        <option value="this_month">Bulan Ini</option>
        <option value="this_year">Tahun Ini</option>
      </select>
    </div>
  );
}

export function PeriodFilter() {
  return (
    <Suspense fallback={<div className="w-32 h-8 bg-brand-surface/50 animate-pulse rounded-full border border-brand-border" />}>
      <FilterContent />
    </Suspense>
  );
}

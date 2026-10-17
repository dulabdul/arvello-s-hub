import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen pb-10 animate-pulse">
      {/* Topbar Skeleton */}
      <header className="h-20 bg-brand-surface border-b border-brand-border px-6 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
          <div className="h-3.5 w-64 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700/60 rounded-lg" />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-brand-surface p-6 rounded-xl border border-brand-border shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded" />
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-36 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
              <div className="h-3 w-28 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>

        {/* Content Section Skeleton */}
        <div className="bg-brand-surface rounded-xl border border-brand-border p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-brand-border">
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-3.5 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>

          {/* Table / List Rows Skeleton */}
          <div className="space-y-3.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-14 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800/80 flex items-center px-4 justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700/60 rounded" />
                    <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

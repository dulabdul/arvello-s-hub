"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun, Database, Bell } from "lucide-react";

export function Topbar({
  title = "Dashboard",
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 border-b border-brand-border bg-brand-bg/90 backdrop-blur-md sticky top-0 z-20 transition-colors flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0 pr-1">
        <h2 className="text-base sm:text-xl font-bold text-brand-text font-serif tracking-tight truncate leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-brand-muted truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Supabase connection indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-success/10 text-brand-success border border-brand-success/20 text-[11px] font-medium">
          <Database className="w-3 h-3" />
          <span>Supabase DB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
        </div>

        {actions && <div className="flex items-center gap-1.5 sm:gap-2">{actions}</div>}

        {/* Dark mode switch */}
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface active:scale-95 transition-all"
          title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
          aria-label="Toggle tema gelap/terang"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

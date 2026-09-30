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
    <header className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:h-16 sm:py-0 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md sticky top-0 z-20 transition-colors gap-3 sm:gap-0">
      <div className="flex items-center justify-between w-full sm:w-auto">
        <div>
          <h2 className="text-xl font-bold text-brand-text font-serif tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
        </div>

        {/* Mobile Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="sm:hidden p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
        {/* Supabase connection indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-success/10 text-brand-success border border-brand-success/20 text-[11px] font-medium">
          <Database className="w-3 h-3" />
          <span>Supabase DB</span>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
        </div>

        {/* Desktop Dark mode switch */}
        <button
          onClick={toggleDarkMode}
          className="hidden sm:block p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-colors"
          title={isDark ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {actions && <div className="flex items-center gap-2 sm:ml-2">{actions}</div>}
      </div>
    </header>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Menu
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Klien", href: "/clients", icon: Users },
  { label: "Proyek", href: "/projects", icon: Briefcase },
  { label: "Invoice", href: "/invoices", icon: Receipt },
  { label: "Lainnya", href: "/settings", icon: Menu }, // Fallback to settings or a drawer later
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center min-w-[60px] h-12 transition-all active:scale-95"
            >
              <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                <Icon
                  className={`w-6 h-6 mb-1 transition-colors ${
                    isActive ? "text-brand-primary" : "text-brand-muted"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* Text only visible if active, or always visible but different color */}
                <span 
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive ? "text-brand-primary opacity-100" : "text-brand-muted opacity-80"
                  }`}
                >
                  {item.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

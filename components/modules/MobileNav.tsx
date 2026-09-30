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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-brand-surface border-t border-brand-border px-2 py-1 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
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
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-lg transition-colors ${
              isActive
                ? "text-brand-primary"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-1 ${
                isActive ? "text-brand-primary" : "text-brand-muted"
              }`}
            />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

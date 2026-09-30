"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Wallet,
  FolderGit2,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Klien", href: "/clients", icon: Users },
  { label: "Proyek", href: "/projects", icon: Briefcase },
  { label: "Invoice", href: "/invoices", icon: Receipt },
  { label: "Keuangan", href: "/finance", icon: Wallet },
  { label: "Proposal", href: "/proposals", icon: FolderGit2 },
  { label: "Domain Cloudflare", href: "/domains", icon: Globe, },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-brand-surface border-r border-brand-border transition-all duration-300 ${collapsed ? "w-18" : "w-60"
        }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-border shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt="Arvello Logo"
                width={130}
                height={36}
                priority
                style={{ width: "auto", height: "auto" }}
                className="max-h-9 object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mx-auto">
            <Image
              src="/logo.png"
              alt="Arvello Logo"
              width={40}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
              className="object-cover object-left"
            />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors ${collapsed ? "mx-auto mt-2" : ""
            }`}
          title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative min-h-[44px] ${isActive
                  ? "bg-brand-primary/10 text-brand-primary-dark font-semibold border-l-4 border-brand-primary -ml-1 pl-3"
                  : "text-brand-muted hover:text-brand-text hover:bg-brand-bg/50"
                } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isActive ? "text-brand-primary" : "text-brand-muted group-hover:text-brand-text"
                  }`}
              />

              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-bg text-brand-muted font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile card */}
      <div className="p-3 border-t border-brand-border shrink-0 flex flex-col gap-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-lg bg-brand-bg/50 ${collapsed ? "justify-center p-1.5" : ""
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary font-bold text-xs flex items-center justify-center shrink-0">
            AD
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-brand-text truncate">
                Admin
              </p>
              <p className="text-[10px] text-brand-muted truncate">Admin User</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={async () => {
            if (confirm("Yakin ingin keluar?")) {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }
          }}
          className={`flex items-center gap-3 p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors w-full ${collapsed ? "justify-center" : ""}`}
          title="Logout"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-xs font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}

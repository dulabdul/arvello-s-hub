"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  Menu,
  Wallet,
  FolderGit2,
  Globe,
  Settings,
  LogOut,
  Plus
} from "lucide-react";
import { TransactionModal } from "./TransactionModal";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Proyek", href: "/projects", icon: Briefcase },
  { label: "", href: "#action", icon: Plus },
  { label: "Invoice", href: "/invoices", icon: Receipt },
  { label: "Lainnya", href: "#more", icon: Menu }, // Opens Bottom Sheet
];

const EXTRA_ITEMS = [
  { label: "Keuangan", href: "/finance", icon: Wallet },
  { label: "Proposal", href: "/proposals", icon: FolderGit2 },
  { label: "Domain Cloudflare", href: "/domains", icon: Globe },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.href === "#more") {
            return (
              <button
                key="more"
                onClick={() => setIsMoreOpen(true)}
                className="relative flex flex-col items-center justify-center min-w-[60px] h-12 transition-all active:scale-95"
              >
                <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isMoreOpen ? '-translate-y-1' : ''}`}>
                  <Icon
                    className={`w-6 h-6 mb-1 transition-colors ${
                      isMoreOpen ? "text-brand-primary" : "text-brand-muted"
                    }`}
                    strokeWidth={isMoreOpen ? 2.5 : 2}
                  />
                  <span 
                    className={`text-[10px] font-semibold transition-all duration-300 ${
                      isMoreOpen ? "text-brand-primary opacity-100" : "text-brand-muted opacity-80"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isMoreOpen && (
                    <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-primary" />
                  )}
                </div>
              </button>
            );
          }

          if (item.href === "#action") {
            return (
              <div key="action" className="relative flex flex-col items-center justify-center min-w-[60px] h-12 z-10">
                <TransactionModal 
                  customTrigger={
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/40 transition-transform active:scale-95 border-4 border-white dark:border-slate-900">
                      <Icon className="w-7 h-7" strokeWidth={2.5} />
                    </div>
                  }
                />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center min-w-[60px] h-12 transition-all active:scale-95"
              onClick={() => setIsMoreOpen(false)}
            >
              <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive && !isMoreOpen ? '-translate-y-1' : ''}`}>
                <Icon
                  className={`w-6 h-6 mb-1 transition-colors ${
                    isActive && !isMoreOpen ? "text-brand-primary" : "text-brand-muted"
                  }`}
                  strokeWidth={isActive && !isMoreOpen ? 2.5 : 2}
                />
                <span 
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    isActive && !isMoreOpen ? "text-brand-primary opacity-100" : "text-brand-muted opacity-80"
                  }`}
                >
                  {item.label}
                </span>
                
                {isActive && !isMoreOpen && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <Modal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="Menu Lainnya"
      >
        <div className="flex flex-col gap-2 pb-4">
          {EXTRA_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors active:scale-95 min-h-[52px] ${
                  isActive 
                    ? "bg-brand-primary/10 text-brand-primary-dark font-semibold" 
                    : "text-brand-text hover:bg-brand-bg/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? "bg-brand-primary/20" : "bg-brand-bg text-brand-muted"}`}>
                  <Icon className={`w-5 h-5 ${isActive ? "text-brand-primary" : ""}`} />
                </div>
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}

          <div className="h-px bg-brand-border my-2" />

          <button
            onClick={async () => {
              if (confirm("Yakin ingin keluar?")) {
                await fetch("/api/auth/logout", { method: "POST" });
                setIsMoreOpen(false);
                router.push("/login");
              }
            }}
            className="flex items-center gap-4 px-4 py-3 rounded-xl text-brand-danger hover:bg-brand-danger/10 transition-colors active:scale-95 min-h-[52px]"
          >
            <div className="w-10 h-10 rounded-full bg-brand-danger/10 flex items-center justify-center shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </Modal>
    </div>
  );
}

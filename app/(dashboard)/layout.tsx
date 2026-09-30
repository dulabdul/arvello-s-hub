import React from "react";
import { Sidebar } from "@/components/modules/Sidebar";
import { MobileNav } from "@/components/modules/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="md:pl-60 transition-all duration-300 flex-1 flex flex-col pb-[60px] md:pb-0">
        <main className="flex-1">{children}</main>
      </div>
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

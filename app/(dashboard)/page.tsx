"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/modules/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PROJECT_STATUS_MAP, INVOICE_STATUS_MAP } from "@/types/status";
import { formatCurrency } from "@/lib/services/invoice/calculator";
import { generateInvoicePDF } from "@/lib/services/invoice/pdf";
import { ProjectData, InvoiceData } from "@/lib/db/store";
import {
  Briefcase,
  Receipt,
  Users,
  TrendingUp,
  ArrowRight,
  Plus,
  FileDown,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface DashboardData {
  totalClients: number;
  activeProjectsCount: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  netProfitAmount: number;
  totalPipelineValue: number;
  recentProjects: ProjectData[];
  recentInvoices: InvoiceData[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Gagal memuat data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = (inv: InvoiceData) => {
    const doc = generateInvoicePDF({
      number: inv.number,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      clientEmail: inv.clientEmail,
      projectName: inv.projectName,
      date: inv.createdAt.split("T")[0],
      dueDate: inv.dueDate,
      items: inv.items,
      subtotal: inv.subtotal,
      tax: inv.tax,
      discount: inv.discount,
      total: inv.total,
      currency: inv.currency,
      status: INVOICE_STATUS_MAP[inv.status as keyof typeof INVOICE_STATUS_MAP]?.label || inv.status,
    });
    doc.save(`${inv.number}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Dashboard Utama"
        subtitle="Ringkasan performa dan pekerjaan aktif Anda"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button size="sm" variant="outline" icon={<Plus className="w-3.5 h-3.5" />}>
                Proyek
              </Button>
            </Link>
            <Link href="/invoices">
              <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />}>
                Invoice
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Metrics Cards (12-column grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Proyek Aktif */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Proyek Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">
                {loading ? "..." : data?.activeProjectsCount}
              </p>
              <p className="text-xs text-brand-muted mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-primary" />
                Dalam pengerjaan & negosiasi
              </p>
            </div>
          </Card>

          {/* Card 2: Invoice Tertunda */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Invoice Tertunda</span>
              <div className="w-8 h-8 rounded-lg bg-brand-warning/10 text-brand-warning flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">
                {loading ? "..." : formatCurrency(data?.unpaidInvoicesAmount || 0)}
              </p>
              <p className="text-xs text-brand-warning mt-1 font-medium">
                {data?.unpaidInvoicesCount} invoice menunggu pembayaran
              </p>
            </div>
          </Card>

          {/* Card 3: Profit Bersih */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Profit Bersih</span>
              <div className="w-8 h-8 rounded-lg bg-brand-success/10 text-brand-success flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-success">
                {loading ? "..." : formatCurrency(data?.netProfitAmount || 0)}
              </p>
              <p className="text-xs text-brand-muted mt-1">Pemasukan dikurangi pengeluaran</p>
            </div>
          </Card>

          {/* Card 4: Klien Aktif */}
          <Card className="flex flex-col justify-between">
            <div className="flex items-center justify-between text-brand-muted mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Klien</span>
              <div className="w-8 h-8 rounded-lg bg-brand-info/10 text-brand-info flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-text">
                {loading ? "..." : data?.totalClients}
              </p>
              <p className="text-xs text-brand-muted mt-1">Klien dengan proyek atau tagihan aktif</p>
            </div>
          </Card>
        </div>

        {/* 2-Column Section: Proyek Berjalan vs Invoice Terbaru */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Projects (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-text font-serif">
                  Proyek Terbaru
                </h3>
                <p className="text-xs text-brand-muted">Daftar proyek aktif dan perkembangannya</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 group"
              >
                Lihat Kanban
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-brand-border">
                {data?.recentProjects && data.recentProjects.length > 0 ? (
                  data.recentProjects.map((p) => {
                    const statusMeta = PROJECT_STATUS_MAP[p.status as keyof typeof PROJECT_STATUS_MAP];
                    return (
                      <div
                        key={p.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-brand-bg/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-brand-text truncate">
                              {p.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusMeta?.badgeClass}`}>
                              {statusMeta?.label || p.status}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted truncate">
                            {p.clientCompany || p.clientName} • Deadline: {p.deadline || "Belum ditentukan"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-brand-text">
                            {formatCurrency(p.value)}
                          </p>
                          <span className="text-[10px] text-brand-muted uppercase tracking-wider">
                            {p.contractType}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mb-3">
                      <Briefcase className="w-6 h-6 text-brand-muted" />
                    </div>
                    <p className="text-sm font-medium text-brand-text mb-1">Belum ada proyek</p>
                    <p className="text-xs text-brand-muted mb-4 max-w-xs">
                      Buat proyek pertama Anda untuk mulai melacak pekerjaan.
                    </p>
                    <Link href="/projects/new">
                      <Button size="sm" variant="primary">
                        + Proyek Baru
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Pending Invoices (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-brand-text font-serif">
                  Tagihan
                </h3>
                <p className="text-xs text-brand-muted">Invoice tertunda dan riwayat terbaru</p>
              </div>
              <Link
                href="/invoices"
                className="text-xs font-semibold text-brand-primary hover:text-brand-primary-dark flex items-center gap-1 group"
              >
                Semua Invoice
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-brand-border">
                {data?.recentInvoices && data.recentInvoices.length > 0 ? (
                  data.recentInvoices.map((inv) => {
                    const statusMeta = INVOICE_STATUS_MAP[inv.status as keyof typeof INVOICE_STATUS_MAP];
                    const isPaid = inv.status === "PAID";
                    return (
                      <div
                        key={inv.id}
                        className="p-4 flex items-center justify-between gap-3 hover:bg-brand-bg/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-brand-text">
                              {inv.number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta?.badgeClass}`}>
                              {statusMeta?.label}
                            </span>
                          </div>
                          <p className="text-xs text-brand-muted truncate">{inv.clientName}</p>
                          <p className="text-xs font-semibold text-brand-text mt-0.5">
                            {formatCurrency(inv.total, inv.currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                            title="Unduh PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>

                          {!isPaid && (
                            <button
                              onClick={() => handleMarkPaid(inv.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                              title="Tandai Lunas"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mb-3">
                      <Receipt className="w-6 h-6 text-brand-muted" />
                    </div>
                    <p className="text-sm font-medium text-brand-text mb-1">Tidak ada tagihan</p>
                    <p className="text-xs text-brand-muted mb-4 max-w-xs">
                      Saat ini tidak ada invoice yang harus dibayar oleh klien.
                    </p>
                    <Link href="/invoices/new">
                      <Button size="sm" variant="outline">
                        Buat Invoice
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Topbar } from "@/components/modules/Topbar";
import { Card } from "@/components/ui/Card";
import { Wallet, TrendingUp, TrendingDown, Download, Plus, Clock, Star } from "lucide-react";
import { getFinancialSummary } from "@/lib/services/finance/reports";
import { getTransactions } from "@/lib/services/finance/transactions";
import { FinancialChart } from "@/components/modules/FinancialChart";
import { CategoryChart } from "@/components/modules/CategoryChart";
import { TransactionModal } from "@/components/modules/TransactionModal";
import { ExportCSVButton } from "@/components/modules/ExportCSVButton";
import { PeriodFilter } from "@/components/modules/PeriodFilter";
import { DeleteTransactionButton } from "@/components/modules/DeleteTransactionButton";

export const dynamic = 'force-dynamic';

export default async function FinancePage(props: { searchParams: Promise<{ period?: string }> }) {
  const params = await props.searchParams;
  const period = params?.period || "all";
  
  let startDate: Date | undefined;
  let endDate: Date | undefined;
  
  const now = new Date();
  if (period === "this_month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (period === "this_year") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }

  const summary = await getFinancialSummary(startDate, endDate);
  const transactions = await getTransactions(10); // get last 10

  const chartData = summary.monthlyData;

  return (
    <div className="flex flex-col min-h-screen pb-10">
      <Topbar
        title="Keuangan & Arus Kas"
        subtitle="Pantau pemasukan, pengeluaran, dan profitabilitas Anda."
        actions={
          <div className="flex items-center gap-3">
            <PeriodFilter />
            <ExportCSVButton summary={summary} transactions={transactions} />
            <TransactionModal />
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-l-4 border-l-brand-success">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-brand-muted">Total Pemasukan</p>
                <h3 className="text-3xl font-bold text-brand-text mt-2">
                  Rp {summary.totalIncome.toLocaleString("id-ID")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-success/10 flex items-center justify-center text-brand-success">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-brand-danger">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-brand-muted">Total Pengeluaran</p>
                <h3 className="text-3xl font-bold text-brand-text mt-2">
                  Rp {summary.totalExpense.toLocaleString("id-ID")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-danger/10 flex items-center justify-center text-brand-danger">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-l-brand-primary">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-brand-muted">Net Profit</p>
                <h3 className="text-3xl font-bold text-brand-text mt-2">
                  Rp {summary.netProfit.toLocaleString("id-ID")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </Card>
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-brand-muted">Piutang Klien (Unpaid)</p>
                <h3 className="text-3xl font-bold text-brand-text mt-2">
                  Rp {summary.pendingReceivables.toLocaleString("id-ID")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-brand-text font-serif">Tren Arus Kas Bulanan</h3>
              <p className="text-sm text-brand-muted">Perbandingan pemasukan dan pengeluaran</p>
            </div>
            <FinancialChart data={chartData} />
          </Card>
          
          <Card className="p-6 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-brand-text font-serif">Sumber Pemasukan</h3>
              <p className="text-sm text-brand-muted">Berdasarkan kategori</p>
            </div>
            <CategoryChart data={summary.incomeByCategory} type="INCOME" />
          </Card>

          <Card className="p-6 lg:col-span-1">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-brand-text font-serif">Distribusi Pengeluaran</h3>
              <p className="text-sm text-brand-muted">Berdasarkan kategori</p>
            </div>
            <CategoryChart data={summary.expenseByCategory} type="EXPENSE" />
          </Card>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions Table */}
          <Card className="overflow-hidden lg:col-span-2">
          <div className="p-6 border-b border-brand-border">
            <h3 className="text-lg font-bold text-brand-text font-serif">Riwayat Transaksi</h3>
            <p className="text-sm text-brand-muted">10 transaksi terakhir Anda</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-brand-bg/50 text-brand-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Kategori</th>
                  <th className="px-6 py-4 font-medium">Keterangan</th>
                  <th className="px-6 py-4 font-medium">Tipe</th>
                  <th className="px-6 py-4 font-medium text-right">Nominal</th>
                  <th className="px-6 py-4 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                      <p className="mb-2">Anda belum mencatat transaksi apapun bulan ini.</p>
                      <p className="text-xs">Klik tombol "Tambah Transaksi" di kanan atas untuk mulai.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-brand-bg/30">
                      <td className="px-6 py-4">{new Date(trx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-surface border border-brand-border text-brand-text">
                          {trx.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={trx.description || "-"}>{trx.description || "-"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trx.type === "INCOME" 
                            ? "bg-brand-success/10 text-brand-success" 
                            : "bg-brand-danger/10 text-brand-danger"
                        }`}>
                          {trx.type === "INCOME" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {trx.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${trx.type === "INCOME" ? "text-brand-success" : "text-brand-danger"}`}>
                        {trx.type === "INCOME" ? "+" : "-"} Rp {trx.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteTransactionButton id={trx.id} isInvoice={!!trx.invoiceId} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Clients Section */}
        <Card className="overflow-hidden lg:col-span-1">
          <div className="p-6 border-b border-brand-border">
            <h3 className="text-lg font-bold text-brand-text font-serif flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Klien Terbaik
            </h3>
            <p className="text-sm text-brand-muted">Berdasarkan total pendapatan</p>
          </div>
          <div className="p-4">
            {summary.topClients.length === 0 ? (
              <div className="text-center p-6 text-brand-muted text-sm">
                Belum ada data klien dengan status Lunas.
              </div>
            ) : (
              <ul className="space-y-4">
                {summary.topClients.map((c: any, i: number) => (
                  <li key={c.id} className="flex justify-between items-center p-3 hover:bg-brand-bg/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-brand-text text-xs shadow-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-brand-text text-sm">{c.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-success text-sm">Rp {c.total.toLocaleString("id-ID")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}

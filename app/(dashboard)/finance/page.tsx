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
import { TransactionList } from "@/components/modules/TransactionList";

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
  const transactions = await getTransactions(undefined, startDate, endDate);

  const chartData = summary.monthlyData.map(d => ({
    ...d,
    netProfit: d.income - d.expense
  }));

  return (
    <div className="flex flex-col min-h-screen pb-10">
      <Topbar
        title="Keuangan & Arus Kas"
        subtitle="Pantau pemasukan, pengeluaran, dan profitabilitas Anda."
        actions={
          <div className="hidden sm:flex items-center gap-3">
            <PeriodFilter />
            <ExportCSVButton summary={summary} transactions={transactions} />
            <TransactionModal />
          </div>
        }
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Mobile Filter & Export Bar */}
        <div className="flex sm:hidden items-center justify-between gap-2 bg-brand-surface p-2 rounded-2xl border border-brand-border shadow-xs">
          <PeriodFilter />
          <ExportCSVButton summary={summary} transactions={transactions} />
        </div>

        {/* KPI Cards: 2-column on mobile, 4-column on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="p-3.5 sm:p-6 border-l-4 border-l-brand-success flex flex-col justify-between">
            <div className="flex justify-between items-start gap-1">
              <p className="text-xs sm:text-sm font-medium text-brand-muted">Total Pemasukan</p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-brand-success/10 flex items-center justify-center text-brand-success shrink-0">
                <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl lg:text-3xl font-bold font-serif text-brand-text mt-1.5 sm:mt-2 truncate">
              Rp {summary.totalIncome.toLocaleString("id-ID")}
            </h3>
          </Card>

          <Card className="p-3.5 sm:p-6 border-l-4 border-l-brand-danger flex flex-col justify-between">
            <div className="flex justify-between items-start gap-1">
              <p className="text-xs sm:text-sm font-medium text-brand-muted">Total Pengeluaran</p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-brand-danger/10 flex items-center justify-center text-brand-danger shrink-0">
                <TrendingDown className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl lg:text-3xl font-bold font-serif text-brand-text mt-1.5 sm:mt-2 truncate">
              Rp {summary.totalExpense.toLocaleString("id-ID")}
            </h3>
          </Card>

          <Card className="p-3.5 sm:p-6 border-l-4 border-l-brand-primary flex flex-col justify-between">
            <div className="flex justify-between items-start gap-1">
              <p className="text-xs sm:text-sm font-medium text-brand-muted">Net Profit</p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl lg:text-3xl font-bold font-serif text-brand-text mt-1.5 sm:mt-2 truncate">
              Rp {summary.netProfit.toLocaleString("id-ID")}
            </h3>
          </Card>

          <Card className="p-3.5 sm:p-6 border-l-4 border-l-amber-500 flex flex-col justify-between">
            <div className="flex justify-between items-start gap-1">
              <p className="text-xs sm:text-sm font-medium text-brand-muted truncate">Piutang (Unpaid)</p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <h3 className="text-sm sm:text-2xl lg:text-3xl font-bold font-serif text-brand-text mt-1.5 sm:mt-2 truncate">
              Rp {summary.pendingReceivables.toLocaleString("id-ID")}
            </h3>
          </Card>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-brand-text font-serif">Tren Arus Kas Bulanan</h3>
              <p className="text-sm text-brand-muted">Perbandingan pemasukan, pengeluaran, dan profit bersih</p>
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
          <Card className="overflow-hidden lg:col-span-2 flex flex-col">
            <TransactionList transactions={transactions} />
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

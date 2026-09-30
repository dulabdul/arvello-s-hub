"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Search, Filter, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { DeleteTransactionButton } from "./DeleteTransactionButton";
import { Input, Select } from "@/components/ui/Input";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date | string; // Dates from server components might be serialized
  invoiceId: string | null;
};

interface TransactionListProps {
  transactions: Transaction[];
}

type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

export function TransactionList({ transactions }: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  // Filter, Search, and Sort
  const filteredAndSorted = useMemo(() => {
    let result = [...transactions];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    // Filter by Category
    if (categoryFilter !== "ALL") {
      result = result.filter((t) => t.category === categoryFilter);
    }

    // Filter by Type
    if (typeFilter !== "ALL") {
      result = result.filter((t) => t.type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortField === "amount") {
        return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [transactions, search, categoryFilter, typeFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  // Handle Page change reset
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, typeFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      <div className="p-4 sm:p-6 border-b border-brand-border bg-white dark:bg-slate-900 rounded-t-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-brand-text font-serif">Riwayat Transaksi Lengkap</h3>
            <p className="text-sm text-brand-muted">Total {filteredAndSorted.length} transaksi ditemukan</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface placeholder:text-brand-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors border-brand-border"
              />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 px-3 w-full sm:w-36 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors border-brand-border"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-11 px-3 w-full sm:w-40 rounded-lg border text-base sm:text-sm text-brand-text bg-brand-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary transition-colors border-brand-border"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-brand-bg/50 text-brand-muted border-b border-brand-border">
            <tr>
              <th 
                className="px-6 py-4 font-medium cursor-pointer hover:text-brand-text transition-colors group"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Tanggal
                  <ArrowUpDown className={`w-3.5 h-3.5 opacity-50 group-hover:opacity-100 ${sortField === 'date' ? 'text-brand-primary opacity-100' : ''}`} />
                </div>
              </th>
              <th className="px-6 py-4 font-medium">Kategori</th>
              <th className="px-6 py-4 font-medium">Keterangan</th>
              <th className="px-6 py-4 font-medium">Tipe</th>
              <th 
                className="px-6 py-4 font-medium text-right cursor-pointer hover:text-brand-text transition-colors group"
                onClick={() => toggleSort("amount")}
              >
                <div className="flex items-center justify-end gap-1">
                  Nominal
                  <ArrowUpDown className={`w-3.5 h-3.5 opacity-50 group-hover:opacity-100 ${sortField === 'amount' ? 'text-brand-primary opacity-100' : ''}`} />
                </div>
              </th>
              <th className="px-6 py-4 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border text-brand-text bg-white dark:bg-slate-900">
            {currentData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                  <p className="mb-2">Tidak ada transaksi yang cocok dengan filter/pencarian Anda.</p>
                </td>
              </tr>
            ) : (
              currentData.map((trx) => (
                <tr key={trx.id} className="hover:bg-brand-bg/40 transition-colors group">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {new Date(trx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      {trx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-[200px] sm:max-w-xs truncate" title={trx.description || "-"}>
                    {trx.description || "-"}
                  </td>
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
                  <td className={`px-4 sm:px-6 py-4 text-right font-semibold whitespace-nowrap ${trx.type === "INCOME" ? "text-brand-success" : "text-brand-danger"}`}>
                    {trx.type === "INCOME" ? "+" : "-"} Rp {trx.amount.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <DeleteTransactionButton id={trx.id} isInvoice={!!trx.invoiceId} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden flex flex-col divide-y divide-brand-border bg-white dark:bg-slate-900 w-full">
        {currentData.length === 0 ? (
          <div className="px-6 py-12 text-center text-brand-muted">
            <p className="mb-2 text-sm">Tidak ada transaksi yang cocok.</p>
          </div>
        ) : (
          currentData.map((trx) => (
            <div key={trx.id} className="p-4 flex flex-col gap-3 hover:bg-brand-bg/40 transition-colors relative group">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-brand-text text-sm">
                    {trx.description || "Tanpa Keterangan"}
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-brand-muted">
                      {new Date(trx.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {trx.category}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`font-semibold text-sm whitespace-nowrap ${trx.type === "INCOME" ? "text-brand-success" : "text-brand-danger"}`}>
                    {trx.type === "INCOME" ? "+" : "-"} Rp {trx.amount.toLocaleString("id-ID")}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    trx.type === "INCOME" ? "bg-brand-success/10 text-brand-success" : "bg-brand-danger/10 text-brand-danger"
                  }`}>
                    {trx.type === "INCOME" ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {trx.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-1">
                 <DeleteTransactionButton id={trx.id} isInvoice={!!trx.invoiceId} />
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-t border-brand-border rounded-b-xl">
          <p className="text-sm text-brand-muted">
            Menampilkan <span className="font-medium text-brand-text">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium text-brand-text">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> dari <span className="font-medium text-brand-text">{filteredAndSorted.length}</span> hasil
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-brand-text px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-surface disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

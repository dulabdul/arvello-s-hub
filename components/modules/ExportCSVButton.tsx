"use client";

import React, { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface ExportCSVButtonProps {
  summary: any;
  transactions: any[];
}

export function ExportCSVButton({ summary, transactions }: ExportCSVButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      // Basic CSV Generation
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Header
      csvContent += "TANGGAL,KATEGORI,KETERANGAN,TIPE,NOMINAL\\n";
      
      // Data
      transactions.forEach(trx => {
        const date = new Date(trx.date).toISOString().split('T')[0];
        const amount = trx.type === "EXPENSE" ? `-${trx.amount}` : `${trx.amount}`;
        const desc = trx.description ? trx.description.replace(/,/g, " ") : "";
        csvContent += `${date},${trx.category},${desc},${trx.type},${amount}\\n`;
      });
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_Keuangan_Arvello_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  return (
    <button 
      onClick={handleExport}
      disabled={exporting}
      className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-brand-surface text-brand-text rounded-full font-medium text-xs sm:text-sm hover:bg-brand-bg/80 active:scale-95 transition-all border border-brand-border shadow-xs ${exporting ? 'opacity-50 cursor-wait' : ''}`}
    >
      {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />} 
      <span>{exporting ? "Mengekspor..." : "Export CSV"}</span>
    </button>
  );
}

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
      className={`flex items-center gap-2 px-4 py-2 bg-brand-bg/50 text-brand-text rounded-full font-medium text-sm hover:bg-brand-surface transition-colors border border-brand-border ${exporting ? 'opacity-50 cursor-wait' : ''}`}
    >
      {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
      {exporting ? "Mengekspor..." : "Export CSV"}
    </button>
  );
}

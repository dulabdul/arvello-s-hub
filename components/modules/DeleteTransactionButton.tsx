"use client";

import React, { useState } from "react";
import { Trash2, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteTransactionButton({ id, isInvoice }: { id: string, isInvoice: boolean }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  if (isInvoice) {
    return (
      <div 
        className="p-1.5 rounded-lg text-slate-400 bg-slate-50 cursor-not-allowed border border-slate-100" 
        title="Transaksi otomatis dari Invoice. Hapus invoice untuk menghapus pemasukan ini."
      >
        <Lock className="w-4 h-4" />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus transaksi ini? Aksi ini tidak dapat dibatalkan.")) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Gagal menghapus transaksi.");
        setDeleting(false);
      }
    } catch (e) {
      console.error(e);
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-danger hover:bg-brand-danger/10 transition-colors disabled:opacity-50 border border-transparent hover:border-brand-danger/20"
      title="Hapus transaksi"
    >
      {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}

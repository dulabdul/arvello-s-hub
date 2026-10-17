"use client";

import React, { useState } from "react";
import { Trash2, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function DeleteTransactionButton({ id, isInvoice }: { id: string, isInvoice: boolean }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Transaksi berhasil dihapus");
        setShowConfirm(false);
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Gagal menghapus transaksi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Terjadi kesalahan sistem saat menghapus transaksi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="p-1.5 rounded-lg text-brand-muted hover:text-brand-danger hover:bg-brand-danger/10 transition-colors disabled:opacity-50 border border-transparent hover:border-brand-danger/20"
        title="Hapus transaksi"
      >
        {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        description="Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Transaksi"
        variant="danger"
        loading={deleting}
      />
    </>
  );
}

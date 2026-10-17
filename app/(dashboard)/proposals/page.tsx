"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PROPOSAL_STATUS_MAP, ProposalStatus } from "@/types/status";
import { Plus, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/services/invoice/calculator";
import { toast } from "sonner";

interface ProposalData {
  id: string;
  token: string;
  title: string;
  clientId: string | null;
  client: { name: string; company: string | null } | null;
  prospectName: string | null;
  status: ProposalStatus;
  total: number;
  currency: string;
  createdAt: string;
  viewedAt: string | null;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [proposalToDelete, setProposalToDelete] = useState<ProposalData | null>(null);

  async function fetchProposals() {
    try {
      const res = await fetch("/api/proposals");
      const data = await res.json();
      setProposals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProposals();
  }, []);

  const confirmDeleteProposal = async () => {
    if (!proposalToDelete) return;
    setDeletingId(proposalToDelete.id);
    try {
      await fetch(`/api/proposals/${proposalToDelete.id}`, { method: "DELETE" });
      setProposals(proposals.filter((p) => p.id !== proposalToDelete.id));
      toast.success(`Proposal "${proposalToDelete.title}" berhasil dihapus`);
      setProposalToDelete(null);
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus proposal");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Proposals"
        subtitle="Kelola dan kirim proposal penawaran ke prospek atau klien."
        actions={
          <Link href="/proposals/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Buat Proposal Baru
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Memuat data...</div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Belum ada proposal</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Buat proposal pertama Anda untuk dikirimkan ke calon klien.
            </p>
            <div className="mt-6">
              <Link href="/proposals/new">
                <Button variant="primary">Buat Proposal</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Judul Proposal</th>
                    <th className="px-6 py-4">Klien / Prospek</th>
                    <th className="px-6 py-4">Total Nilai</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Dibuat</th>
                    <th className="px-6 py-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {proposals.map((prop) => (
                    <tr key={prop.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {prop.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {prop.client ? prop.client.name : prop.prospectName || "-"}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {formatCurrency(prop.total, prop.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PROPOSAL_STATUS_MAP[prop.status]?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                          {PROPOSAL_STATUS_MAP[prop.status]?.label || prop.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-500">
                        {new Date(prop.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`/proposal/${prop.token}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Buka Link Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => setProposalToDelete(prop)}
                            disabled={deletingId === prop.id}
                            className={`p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${deletingId === prop.id ? 'opacity-50 cursor-wait' : ''}`}
                            title="Hapus"
                          >
                            {deletingId === prop.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Native Card List View */}
            <div className="sm:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {proposals.map((prop) => (
                <div key={prop.id} className="p-4 flex flex-col gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                      {prop.title}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border shrink-0 ${PROPOSAL_STATUS_MAP[prop.status]?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      {PROPOSAL_STATUS_MAP[prop.status]?.label || prop.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">
                      {prop.client ? prop.client.name : prop.prospectName || "Prospek Umum"}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {formatCurrency(prop.total, prop.currency)}
                    </span>
                  </div>

                  {/* Actions with proper tap area */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <a
                      href={`/proposal/${prop.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors active:scale-95"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Buka Link Publik
                    </a>

                    <button
                      onClick={() => setProposalToDelete(prop)}
                      disabled={deletingId === prop.id}
                      className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 active:scale-95 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus Proposal"
                      aria-label="Hapus Proposal"
                    >
                      {deletingId === prop.id ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal Hapus Proposal */}
      <ConfirmModal
        isOpen={!!proposalToDelete}
        onClose={() => setProposalToDelete(null)}
        onConfirm={confirmDeleteProposal}
        title="Hapus Proposal"
        description={`Apakah Anda yakin ingin menghapus proposal "${proposalToDelete?.title}"? Tautan publik proposal ini tidak akan dapat diakses lagi.`}
        confirmText="Hapus Proposal"
        variant="danger"
        loading={!!deletingId}
      />
    </div>
  );
}

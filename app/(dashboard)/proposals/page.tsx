"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PROPOSAL_STATUS_MAP, ProposalStatus } from "@/types/status";
import { Plus, FileText, ExternalLink, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/services/invoice/calculator";

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



  const handleDelete = async (id: string) => {
    if (!confirm("Hapus proposal ini?")) return;
    try {
      await fetch(`/api/proposals/${id}`, { method: "DELETE" });
      setProposals(proposals.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
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
            <div className="overflow-x-auto">
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
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Buka Link Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(prop.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Loader2, Trash2, Globe, Server, Info } from "lucide-react";

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

interface DnsManagerModalProps {
  domainId: string;
  domainName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DnsManagerModal({ domainId, domainName, isOpen, onClose }: DnsManagerModalProps) {
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && domainId) {
      fetchRecords();
    }
  }, [isOpen, domainId]);

  const fetchRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/domains/${domainId}/dns`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat DNS");
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm("Yakin ingin menghapus DNS Record ini?")) return;
    setDeletingId(recordId);
    try {
      const res = await fetch(`/api/domains/${domainId}/dns?recordId=${recordId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menghapus");
      }
      setRecords(records.filter(r => r.id !== recordId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`DNS Manager - ${domainName}`}
      description="Kelola DNS record langsung dari Cloudflare"
      maxWidth="lg"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
            {error}
          </div>
        )}

        <div className="border border-brand-border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-brand-surface border-b border-brand-border text-brand-muted">
              <tr>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Content</th>
                <th className="px-4 py-2 font-medium">Proxy</th>
                <th className="px-4 py-2 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-brand-bg">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-brand-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
                    Mengambil data dari Cloudflare...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-brand-muted">
                    <Server className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada DNS Record.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-brand-surface">
                    <td className="px-4 py-3 font-semibold text-brand-primary">{record.type}</td>
                    <td className="px-4 py-3 font-medium text-brand-text truncate max-w-[150px]" title={record.name}>{record.name}</td>
                    <td className="px-4 py-3 text-brand-muted truncate max-w-[200px]" title={record.content}>{record.content}</td>
                    <td className="px-4 py-3">
                      {record.proxied ? (
                        <span className="text-amber-500 flex items-center gap-1 text-xs font-medium bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"><Globe className="w-3 h-3"/> Proxied</span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1 text-xs font-medium bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">DNS Only</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(record.id)}
                        disabled={deletingId === record.id}
                        className="p-1.5 rounded text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 disabled:opacity-50"
                      >
                        {deletingId === record.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-2 text-xs text-brand-muted bg-brand-surface p-2 rounded border border-brand-border">
          <Info className="w-4 h-4 shrink-0 text-brand-primary" />
          <span>Penambahan DNS Record untuk sementara diarahkan langsung via dashboard Cloudflare.</span>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="primary">Tutup</Button>
        </div>
      </div>
    </Modal>
  );
}

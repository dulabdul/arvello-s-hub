"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Globe, Plus, Loader2, CheckCircle2, Clock, Settings2, RefreshCcw, Search, ChevronLeft, ChevronRight, XCircle, Trash2 } from "lucide-react";
import { DnsManagerModal } from "@/components/modules/DnsManagerModal";

interface ProjectData {
  id: string;
  name: string;
  client?: { company: string | null; name: string };
  clientName?: string;
  clientCompany?: string;
}

interface DomainData {
  id: string;
  name: string;
  status: "PENDING" | "ACTIVE" | "FAILED" | "MOVED";
  createdAt: string;
  project?: ProjectData | null;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<{id: string, name: string} | null>(null);
  
  const [newDomain, setNewDomain] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [domRes, projRes] = await Promise.all([
        fetch("/api/domains"),
        fetch("/api/projects")
      ]);
      const domData = await domRes.json();
      const projData = await projRes.json();
      
      if (domRes.ok && Array.isArray(domData)) {
        setDomains(domData);
      } else {
        setDomains([]);
      }
      
      if (projRes.ok && Array.isArray(projData)) {
        setProjects(projData);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDomain, projectId: selectedProjectId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan domain");

      setIsModalOpen(false);
      setNewDomain("");
      setSelectedProjectId("");
      fetchData(); 
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/domains/sync", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message || "Sinkronisasi berhasil!");
      fetchData(); 
    } catch (err: any) {
      alert(err.message || "Gagal sinkronisasi");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteDomain = async (domainId: string, domainName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`PERINGATAN: Menghapus domain ini akan menghapusnya dari database DAN langsung dari Cloudflare!\n\nYakin ingin menghapus ${domainName}?`)) return;
    
    try {
      setDeletingDomainId(domainId);
      const res = await fetch(`/api/domains/${domainId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus domain");
    } finally {
      setDeletingDomainId(null);
    }
  };

  const openDnsManager = (domain: DomainData, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDomain({ id: domain.id, name: domain.name });
    setIsDnsModalOpen(true);
  };

  // Memoized Filtering & Pagination
  const filteredDomains = useMemo(() => {
    return domains.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [domains, search, statusFilter]);

  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage) || 1;
  
  // Ensure page is within bounds when filters or itemsPerPage change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [totalPages, currentPage, itemsPerPage]);

  const currentDomains = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDomains.slice(start, start + itemsPerPage);
  }, [filteredDomains, currentPage]);

  const stats = useMemo(() => {
    return {
      total: domains.length,
      active: domains.filter(d => d.status === "ACTIVE").length,
      pending: domains.filter(d => d.status === "PENDING").length,
      moved: domains.filter(d => d.status === "MOVED").length,
    };
  }, [domains]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Manajemen Domain"
        subtitle="Kelola domain klien dan DNS Record via integrasi Cloudflare."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              <RefreshCcw className={`w-4 h-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              Sinkronisasi
            </Button>
            <Button variant="primary" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4" /> Tambah Domain
            </Button>
          </div>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 flex flex-col justify-center">
            <p className="text-sm text-brand-muted">Total Domain</p>
            <p className="text-2xl font-bold font-serif">{stats.total}</p>
          </Card>
          <Card className="p-4 flex flex-col justify-center border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Aktif (Active)</p>
            <p className="text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300">{stats.active}</p>
          </Card>
          <Card className="p-4 flex flex-col justify-center border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
            <p className="text-sm text-amber-600 dark:text-amber-400">Menunggu (Pending)</p>
            <p className="text-2xl font-bold font-serif text-amber-700 dark:text-amber-300">{stats.pending}</p>
          </Card>
          <Card className="p-4 flex flex-col justify-center border-slate-500/20 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-sm text-slate-600 dark:text-slate-400">Dipindahkan (Moved)</p>
            <p className="text-2xl font-bold font-serif text-slate-700 dark:text-slate-300">{stats.moved}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-surface p-4 rounded-xl border border-brand-border">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input 
              type="text" 
              placeholder="Cari nama domain..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
            />
          </div>
          <div className="w-full sm:w-auto flex gap-2">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="MOVED">Moved</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-brand-surface border-b border-brand-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-brand-muted">Nama Domain</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Proyek Terkait</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Status</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Tgl Didaftarkan</th>
                  <th className="px-6 py-4 font-medium text-brand-muted text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-brand-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat daftar domain...
                    </td>
                  </tr>
                ) : currentDomains.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-brand-muted">
                      <Globe className="w-10 h-10 text-brand-border mx-auto mb-3" />
                      <p>Tidak ada domain yang ditemukan.</p>
                      {domains.length === 0 && <p className="text-xs mt-1">Klik Sinkronisasi untuk menarik dari Cloudflare.</p>}
                    </td>
                  </tr>
                ) : (
                  currentDomains.map((domain) => (
                    <tr key={domain.id} className="hover:bg-brand-surface transition-colors group cursor-pointer" onClick={(e) => openDnsManager(domain, e)}>
                      <td className="px-6 py-4 font-medium text-brand-text">
                        {domain.name}
                      </td>
                      <td className="px-6 py-4 text-brand-muted">
                        {domain.project ? (
                          <span className="flex items-center gap-1.5">
                            {domain.project.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada proyek</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {domain.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : domain.status === "PENDING" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            <Loader2 className="w-3 h-3 animate-spin" /> Pending
                          </span>
                        ) : domain.status === "MOVED" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Globe className="w-3 h-3" /> Moved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-brand-muted">
                        {new Date(domain.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => openDnsManager(domain, e)}>
                          Kelola DNS
                        </Button>
                        <button 
                          className="p-2 text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                          onClick={(e) => handleDeleteDomain(domain.id, domain.name, e)}
                          title="Hapus Domain"
                          disabled={deletingDomainId === domain.id}
                        >
                          {deletingDomainId === domain.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-danger" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && filteredDomains.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-brand-surface border-t border-brand-border gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-brand-muted">
                  Tampilkan
                </span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 bg-brand-bg border border-brand-border rounded text-sm focus:outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-brand-muted">
                  {`| ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredDomains.length)} dari ${filteredDomains.length} domain`}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-sm font-medium">
                  {currentPage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Domain Cloudflare">
        <form onSubmit={handleAddDomain} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
              {error}
            </div>
          )}
          
          <Select
            label="Pilih Proyek (Opsional)"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={[
              { value: "", label: "-- Tidak Ditugaskan --" },
              ...projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.client?.company || p.client?.name || p.clientCompany || p.clientName || 'No Client'})`
              }))
            ]}
          />
          
          <Input
            label="Nama Domain"
            placeholder="contoh: kientoko.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value.toLowerCase().trim())}
            required
          />

          <div className="pt-4 flex justify-end gap-2 border-t border-brand-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting || !newDomain}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mendaftarkan...
                </>
              ) : (
                "Daftarkan Zone ke Cloudflare"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DNS Manager Modal */}
      {activeDomain && (
        <DnsManagerModal
          domainId={activeDomain.id}
          domainName={activeDomain.name}
          isOpen={isDnsModalOpen}
          onClose={() => setIsDnsModalOpen(false)}
        />
      )}
    </div>
  );
}

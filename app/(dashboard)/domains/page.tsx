"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/Input";
import { 
  Globe, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Settings2, 
  RefreshCcw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  XCircle, 
  Trash2,
  Tag,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { DnsManagerModal } from "@/components/modules/DnsManagerModal";
import { RegistrarManagerModal } from "@/components/modules/RegistrarManagerModal";
import { RegistrarSelectBadge } from "@/components/modules/RegistrarSelectBadge";
import { RegistrarItem, DEFAULT_REGISTRARS } from "@/app/api/domains/registrars/route";
import { toast } from "sonner";

interface DomainData {
  id: string;
  name: string;
  status: "PENDING" | "ACTIVE" | "FAILED" | "MOVED";
  createdAt: string;
  registrar?: string | null;
  expiresAt?: string | null;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainData[]>([]);
  const [registrars, setRegistrars] = useState<RegistrarItem[]>(DEFAULT_REGISTRARS);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [registrarFilter, setRegistrarFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDnsModalOpen, setIsDnsModalOpen] = useState(false);
  const [isRegistrarModalOpen, setIsRegistrarModalOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState<{ id: string; name: string } | null>(null);
  
  const [newDomain, setNewDomain] = useState("");
  const [selectedRegistrar, setSelectedRegistrar] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<DomainData | null>(null);
  const [updatingRegistrarId, setUpdatingRegistrarId] = useState<string | null>(null);
  const [isBatchWhoisSyncing, setIsBatchWhoisSyncing] = useState(false);
  const [whoisScanningId, setWhoisScanningId] = useState<string | null>(null);
  const [isCheckingNewDomainWhois, setIsCheckingNewDomainWhois] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [domRes, regRes] = await Promise.all([
        fetch("/api/domains"),
        fetch("/api/domains/registrars")
      ]);
      const domData = await domRes.json();
      const regData = await regRes.json();
      
      if (domRes.ok && Array.isArray(domData)) {
        setDomains(domData);
      } else {
        setDomains([]);
      }
      
      if (regRes.ok && Array.isArray(regData.registrars)) {
        setRegistrars(regData.registrars);
      }
    } catch (err) {
      console.error("Error fetching domains data:", err);
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
        body: JSON.stringify({ 
          name: newDomain, 
          registrar: selectedRegistrar || null,
          expiresAt: newExpiresAt || null,
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambahkan domain");

      toast.success(`Domain "${newDomain}" berhasil didaftarkan ke Cloudflare!`);
      setIsModalOpen(false);
      setNewDomain("");
      setSelectedRegistrar("");
      setNewExpiresAt("");
      fetchData(); 
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Gagal menambahkan domain");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRegistrar = async (domainId: string, newRegistrar: string) => {
    setUpdatingRegistrarId(domainId);
    // Optimistic UI update
    setDomains((prev) =>
      prev.map((d) => (d.id === domainId ? { ...d, registrar: newRegistrar || null } : d))
    );

    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrar: newRegistrar || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui registrar");

      toast.success(newRegistrar ? `Registrar domain diubah ke ${newRegistrar}` : "Registrar domain direset");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui registrar");
      fetchData(); // Rollback on error
    } finally {
      setUpdatingRegistrarId(null);
    }
  };

  const handleUpdateExpiredDate = async (domainId: string, newDateStr: string) => {
    // Optimistic UI update
    setDomains((prev) =>
      prev.map((d) =>
        d.id === domainId
          ? { ...d, expiresAt: newDateStr ? new Date(newDateStr).toISOString() : null }
          : d
      )
    );

    try {
      const res = await fetch(`/api/domains/${domainId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiresAt: newDateStr || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui expired date");

      toast.success(newDateStr ? "Expired date berhasil diperbarui" : "Expired date direset");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui expired date");
      fetchData(); // Rollback on error
    }
  };

  const handleBatchWhois = async () => {
    if (!confirm("Periksa WHOIS untuk semua domain? Ini akan mendeteksi dan memperbarui Registrar serta Expired Date secara otomatis.")) {
      return;
    }

    setIsBatchWhoisSyncing(true);
    const toastId = toast.loading("Memindai data WHOIS seluruh domain... Mohon tunggu sebentar.");

    try {
      const res = await fetch("/api/domains/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchAll: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses WHOIS");

      toast.success(data.message || `Berhasil memperbarui ${data.updatedCount} domain via WHOIS!`, { id: toastId });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses WHOIS", { id: toastId });
    } finally {
      setIsBatchWhoisSyncing(false);
    }
  };

  const handleSingleWhois = async (domainId: string) => {
    setWhoisScanningId(domainId);
    try {
      const res = await fetch("/api/domains/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memeriksa WHOIS");

      const reg = data.whois?.matchedRegistrar || "Tidak terdeteksi";
      const exp = data.whois?.expiresAt ? new Date(data.whois.expiresAt).toLocaleDateString("id-ID") : "-";
      toast.success(`WHOIS Selesai! Registrar: ${reg} | Expired: ${exp}`);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal memeriksa WHOIS");
    } finally {
      setWhoisScanningId(null);
    }
  };

  const handleCheckNewDomainWhois = async () => {
    if (!newDomain) {
      toast.error("Ketik nama domain terlebih dahulu");
      return;
    }

    setIsCheckingNewDomainWhois(true);
    try {
      const res = await fetch("/api/domains/whois", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: newDomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal cek WHOIS");

      if (data.matchedRegistrar) {
        setSelectedRegistrar(data.matchedRegistrar);
      }
      if (data.expiresAt) {
        setNewExpiresAt(new Date(data.expiresAt).toISOString().split("T")[0]);
      }

      if (data.matchedRegistrar || data.expiresAt) {
        toast.success(`WHOIS Terdeteksi! Registrar: ${data.matchedRegistrar || '-'} | Expired: ${data.expiresAt ? new Date(data.expiresAt).toLocaleDateString("id-ID") : '-'}`);
      } else {
        toast.info("Tidak ada data WHOIS publik yang ditemukan untuk domain ini.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal cek WHOIS");
    } finally {
      setIsCheckingNewDomainWhois(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/domains/sync", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message || "Sinkronisasi domain berhasil!");
      fetchData(); 
    } catch (err: any) {
      toast.error(err.message || "Gagal sinkronisasi domain");
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDeleteDomain = async () => {
    if (!domainToDelete) return;
    setDeletingDomainId(domainToDelete.id);
    try {
      const res = await fetch(`/api/domains/${domainToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Domain "${domainToDelete.name}" berhasil dihapus dari Cloudflare & Database`);
      setDomainToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus domain");
    } finally {
      setDeletingDomainId(null);
    }
  };

  const openDnsManager = (domain: DomainData, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDomain({ id: domain.id, name: domain.name });
    setIsDnsModalOpen(true);
  };

  // Helper to get accent color of registrar
  const getRegistrarColor = (registrarName?: string | null) => {
    if (!registrarName) return null;
    const match = registrars.find((r) => r.name.toLowerCase() === registrarName.toLowerCase());
    return match?.color || "#64748B";
  };

  // Memoized Filtering & Pagination
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      const matchesRegistrar = 
        registrarFilter === "ALL" || 
        (registrarFilter === "UNASSIGNED" 
          ? !d.registrar 
          : d.registrar?.toLowerCase() === registrarFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesRegistrar;
    });
  }, [domains, search, statusFilter, registrarFilter]);

  const totalPages = Math.ceil(filteredDomains.length / itemsPerPage) || 1;
  
  // Safe page index clamped within [1, totalPages]
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Auto-reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, registrarFilter]);

  // Ensure page is within bounds when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentDomains = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredDomains.slice(start, start + itemsPerPage);
  }, [filteredDomains, safePage, itemsPerPage]);

  const stats = useMemo(() => {
    return {
      total: domains.length,
      active: domains.filter((d) => d.status === "ACTIVE").length,
      pending: domains.filter((d) => d.status === "PENDING").length,
      moved: domains.filter((d) => d.status === "MOVED").length,
    };
  }, [domains]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Manajemen Domain"
        subtitle="Kelola domain klien, DNS Record via Cloudflare, dan status Registrar."
        actions={
          <Button 
            variant="primary" 
            className="flex items-center gap-1.5 h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> 
            <span className="hidden sm:inline">Tambah Domain</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        }
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3.5 sm:p-4 flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-brand-muted">Total Domain</p>
            <p className="text-xl sm:text-2xl font-bold font-serif">{stats.total}</p>
          </Card>
          <Card className="p-3.5 sm:p-4 flex flex-col justify-center border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10">
            <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">Aktif (Active)</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-700 dark:text-emerald-300">{stats.active}</p>
          </Card>
          <Card className="p-3.5 sm:p-4 flex flex-col justify-center border-amber-500/20 bg-amber-50/50 dark:bg-amber-900/10">
            <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">Menunggu (Pending)</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-amber-700 dark:text-amber-300">{stats.pending}</p>
          </Card>
          <Card className="p-3.5 sm:p-4 flex flex-col justify-center border-slate-500/20 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Dipindahkan (Moved)</p>
            <p className="text-xl sm:text-2xl font-bold font-serif text-slate-700 dark:text-slate-300">{stats.moved}</p>
          </Card>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center bg-brand-surface p-3.5 sm:p-4 rounded-xl border border-brand-border shadow-xs">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
              <input 
                type="text" 
                placeholder="Cari nama domain..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-2">
              <select 
                value={registrarFilter} 
                onChange={(e) => setRegistrarFilter(e.target.value)}
                className="w-full sm:w-40 px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary cursor-pointer text-brand-text truncate"
              >
                <option value="ALL">Semua Register</option>
                {registrars.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
                <option value="UNASSIGNED">Belum Diatur</option>
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-36 px-3 py-2 bg-brand-bg border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary cursor-pointer text-brand-text"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="MOVED">Moved</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {/* Utility Tools: WHOIS, Register & Cloudflare Sync */}
          <div className="flex items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-brand-border/60 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchWhois}
              disabled={isBatchWhoisSyncing}
              title="Periksa WHOIS untuk semua domain secara otomatis"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs h-9 px-3"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isBatchWhoisSyncing ? "animate-spin" : ""}`} />
              <span>{isBatchWhoisSyncing ? "Scanning..." : "Cek WHOIS"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegistrarModalOpen(true)}
              title="Kelola Daftar Register & Warna"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs h-9 px-3"
            >
              <Tag className="w-3.5 h-3.5 text-brand-primary" />
              <span>Kelola Register</span>
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync} 
              disabled={isSyncing}
              title="Sinkronisasi dari Cloudflare"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs h-9 px-3"
            >
              <RefreshCcw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sync..." : "Sinkronisasi"}</span>
            </Button>
          </div>
        </div>

        {/* Table / Card List */}
        <Card className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-brand-surface border-b border-brand-border">
                <tr>
                  <th className="px-6 py-4 font-medium text-brand-muted">Nama Domain</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Register</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Status</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Register Date</th>
                  <th className="px-6 py-4 font-medium text-brand-muted">Expired Date</th>
                  <th className="px-6 py-4 font-medium text-brand-muted text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat daftar domain...
                    </td>
                  </tr>
                ) : currentDomains.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-brand-muted">
                      <Globe className="w-10 h-10 text-brand-border mx-auto mb-3" />
                      <p>Tidak ada domain yang ditemukan.</p>
                      {domains.length === 0 && <p className="text-xs mt-1">Klik Sinkronisasi untuk menarik dari Cloudflare.</p>}
                    </td>
                  </tr>
                ) : (
                  currentDomains.map((domain) => {
                    const regColor = getRegistrarColor(domain.registrar);
                    const isUpdating = updatingRegistrarId === domain.id;

                    return (
                      <tr 
                        key={domain.id} 
                        className="hover:bg-brand-surface transition-colors group cursor-pointer" 
                        onClick={(e) => openDnsManager(domain, e)}
                      >
                        <td className="px-6 py-4 font-medium text-brand-text">
                          {domain.name}
                        </td>

                        {/* Field Register dengan Dropdown & Aksen Warna */}
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <RegistrarSelectBadge
                            value={domain.registrar}
                            registrars={registrars}
                            onChange={(val) => handleUpdateRegistrar(domain.id, val)}
                            disabled={updatingRegistrarId === domain.id}
                            onOpenManager={() => setIsRegistrarModalOpen(true)}
                          />
                        </td>

                        <td className="px-6 py-4">
                          {domain.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : domain.status === "PENDING" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <Loader2 className="w-3 h-3 animate-spin" /> Pending
                            </span>
                          ) : domain.status === "MOVED" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <Globe className="w-3 h-3" /> Moved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                        {/* Register Date */}
                        <td className="px-6 py-4 text-brand-muted text-xs whitespace-nowrap">
                          {new Date(domain.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </td>

                        {/* Expired Date */}
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          {(() => {
                            const expDate = domain.expiresAt ? new Date(domain.expiresAt) : null;
                            const now = new Date();
                            const diffDays = expDate
                              ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                              : null;
                            const isExpired = diffDays !== null && diffDays < 0;
                            const isExpiringSoon = diffDays !== null && diffDays >= 0 && diffDays <= 30;

                            return (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="date"
                                  value={domain.expiresAt ? new Date(domain.expiresAt).toISOString().split("T")[0] : ""}
                                  onChange={(e) => handleUpdateExpiredDate(domain.id, e.target.value)}
                                  className={`text-xs font-medium px-2 py-1 rounded-md border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                                    !domain.expiresAt
                                      ? "border-dashed border-brand-border text-slate-400 bg-brand-surface hover:border-brand-primary hover:text-brand-primary"
                                      : isExpired
                                      ? "border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"
                                      : isExpiringSoon
                                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                                      : "border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary"
                                  }`}
                                  title="Ubah Expired Date"
                                />
                                {diffDays !== null && (
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${
                                      isExpired
                                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                        : isExpiringSoon
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    }`}
                                  >
                                    {isExpired ? "Expired" : isExpiringSoon ? `H-${diffDays}` : `H-${diffDays}`}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-1.5">
                          <button
                            className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleWhois(domain.id);
                            }}
                            title="Deteksi Registrar & Expired Date via WHOIS"
                            disabled={whoisScanningId === domain.id}
                          >
                            {whoisScanningId === domain.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </button>
                          <Button variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => openDnsManager(domain, e)}>
                            Kelola DNS
                          </Button>
                          <button 
                            className="p-2 text-slate-400 hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDomainToDelete(domain);
                            }}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Native Card List View */}
          <div className="sm:hidden flex flex-col divide-y divide-brand-border bg-brand-surface">
            {loading ? (
              <div className="px-6 py-12 text-center text-brand-muted">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Memuat daftar domain...
              </div>
            ) : currentDomains.length === 0 ? (
              <div className="px-6 py-12 text-center text-brand-muted">
                <Globe className="w-10 h-10 text-brand-border mx-auto mb-3" />
                <p>Tidak ada domain yang ditemukan.</p>
                {domains.length === 0 && <p className="text-xs mt-1">Klik Sinkronisasi untuk menarik dari Cloudflare.</p>}
              </div>
            ) : (
              currentDomains.map((domain) => {
                const regColor = getRegistrarColor(domain.registrar);
                const isUpdating = updatingRegistrarId === domain.id;

                return (
                  <div
                    key={domain.id}
                    className="p-4 flex flex-col gap-3 hover:bg-brand-bg/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-base text-brand-text truncate">
                        {domain.name}
                      </span>
                      {domain.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : domain.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800 shrink-0">
                          <Loader2 className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      ) : domain.status === "MOVED" ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                          <Globe className="w-3 h-3" /> Moved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 shrink-0">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </div>

                    {/* Field Register */}
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <RegistrarSelectBadge
                        value={domain.registrar}
                        registrars={registrars}
                        onChange={(val) => handleUpdateRegistrar(domain.id, val)}
                        disabled={updatingRegistrarId === domain.id}
                        onOpenManager={() => setIsRegistrarModalOpen(true)}
                        size="sm"
                      />
                    </div>

                    {/* Register Date & Expired Date (Mobile Grid) */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-brand-border/40">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-brand-muted uppercase tracking-wider">
                          Register Date
                        </span>
                        <span className="text-brand-text font-medium text-[11px]">
                          {new Date(domain.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[10px] font-medium text-brand-muted uppercase tracking-wider">
                          Expired Date
                        </span>
                        {(() => {
                          const expDate = domain.expiresAt ? new Date(domain.expiresAt) : null;
                          const now = new Date();
                          const diffDays = expDate
                            ? Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                            : null;
                          const isExpired = diffDays !== null && diffDays < 0;
                          const isExpiringSoon = diffDays !== null && diffDays >= 0 && diffDays <= 30;

                          return (
                            <div className="flex items-center gap-1 min-w-0">
                              <input
                                type="date"
                                value={domain.expiresAt ? new Date(domain.expiresAt).toISOString().split("T")[0] : ""}
                                onChange={(e) => handleUpdateExpiredDate(domain.id, e.target.value)}
                                className="w-full max-w-[120px] text-[11px] font-medium px-1.5 py-0.5 rounded border border-brand-border bg-brand-surface text-brand-text focus:outline-none focus:border-brand-primary"
                              />
                              {diffDays !== null && (
                                <span
                                  className={`text-[9px] font-semibold px-1 py-0.5 rounded shrink-0 ${
                                    isExpired
                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                      : isExpiringSoon
                                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                  }`}
                                >
                                  {isExpired ? "Exp" : `H-${diffDays}`}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Explicit Mobile Actions (Always Visible on Touch!) */}
                    <div className="pt-2 border-t border-brand-border flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] px-2.5 text-xs text-amber-600 dark:text-amber-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSingleWhois(domain.id);
                        }}
                        disabled={whoisScanningId === domain.id}
                        title="Deteksi via WHOIS"
                      >
                        {whoisScanningId === domain.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" />
                        )}
                        WHOIS
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="min-h-[40px] px-3 text-xs flex-1"
                        onClick={(e) => openDnsManager(domain, e)}
                      >
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Kelola DNS
                      </Button>

                      <button
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-brand-danger active:scale-95 hover:bg-brand-danger/10 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDomainToDelete(domain);
                        }}
                        title="Hapus Domain"
                        aria-label="Hapus Domain"
                        disabled={deletingDomainId === domain.id}
                      >
                        {deletingDomainId === domain.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-brand-danger" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Pagination */}
          {!loading && filteredDomains.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-4 bg-brand-surface border-t border-brand-border gap-4">
              <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-brand-muted">
                    Tampilkan
                  </span>
                  <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setItemsPerPage(newSize);
                      setCurrentPage(1);
                    }}
                    className="px-2.5 py-1.5 bg-brand-bg border border-brand-border rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-primary cursor-pointer text-brand-text shadow-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={500}>Semua ({filteredDomains.length})</option>
                  </select>
                </div>
                <span className="text-xs sm:text-sm text-brand-muted font-medium">
                  {`| ${(safePage - 1) * itemsPerPage + 1} - ${Math.min(safePage * itemsPerPage, filteredDomains.length)} dari ${filteredDomains.length} domain`}
                </span>
              </div>
              <div className="flex items-center justify-center w-full sm:w-auto gap-1">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="px-2.5 h-8 sm:h-9"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-3 sm:px-4 text-xs sm:text-sm font-medium text-brand-text">
                  {safePage} / {totalPages}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="px-2.5 h-8 sm:h-9"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

      </div>

      {/* Modal Tambah Domain */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Domain Cloudflare">
        <form onSubmit={handleAddDomain} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm border border-rose-200">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-brand-muted">Pilih Register</label>
              <button
                type="button"
                onClick={() => setIsRegistrarModalOpen(true)}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1"
              >
                <Tag className="w-3 h-3" /> Kelola Register
              </button>
            </div>
            <select
              value={selectedRegistrar}
              onChange={(e) => setSelectedRegistrar(e.target.value)}
              className="w-full h-11 px-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary cursor-pointer text-brand-text transition-colors"
            >
              <option value="">-- Pilih Register (Opsional) --</option>
              {registrars.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nama Domain <span className="text-rose-500">*</span>
              </label>
              {newDomain && (
                <button
                  type="button"
                  onClick={handleCheckNewDomainWhois}
                  disabled={isCheckingNewDomainWhois}
                  className="text-xs text-brand-primary hover:underline font-medium flex items-center gap-1 cursor-pointer py-1"
                >
                  <Sparkles className={`w-3 h-3 ${isCheckingNewDomainWhois ? "animate-spin" : ""}`} />
                  {isCheckingNewDomainWhois ? "Memeriksa..." : "Auto-Fill via WHOIS"}
                </button>
              )}
            </div>
            <Input
              placeholder="contoh: kientoko.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value.toLowerCase().trim())}
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Expired Date (Opsional)
              </label>
              <button
                type="button"
                onClick={() => {
                  const nextYear = new Date();
                  nextYear.setFullYear(nextYear.getFullYear() + 1);
                  setNewExpiresAt(nextYear.toISOString().split("T")[0]);
                }}
                className="text-xs text-brand-primary hover:underline font-medium py-1"
              >
                + 1 Tahun Otomatis
              </button>
            </div>
            <input
              type="date"
              value={newExpiresAt}
              onChange={(e) => setNewExpiresAt(e.target.value)}
              className="w-full h-11 px-3 bg-brand-surface border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-primary text-brand-text transition-colors"
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 border-t border-brand-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsModalOpen(false)} 
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 sm:h-10 text-sm font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText="Mendaftarkan..."
              disabled={!newDomain}
              className="w-full sm:w-auto h-11 sm:h-10 text-sm font-semibold"
            >
              Daftarkan Zone ke Cloudflare
            </Button>
          </div>
        </form>
      </Modal>

      {/* Registrar Manager Modal */}
      <RegistrarManagerModal
        isOpen={isRegistrarModalOpen}
        onClose={() => setIsRegistrarModalOpen(false)}
        registrars={registrars}
        setRegistrars={setRegistrars}
      />

      {/* DNS Manager Modal */}
      {activeDomain && (
        <DnsManagerModal
          domainId={activeDomain.id}
          domainName={activeDomain.name}
          isOpen={isDnsModalOpen}
          onClose={() => setIsDnsModalOpen(false)}
        />
      )}

      {/* Confirmation Modal Hapus Domain */}
      <ConfirmModal
        isOpen={!!domainToDelete}
        onClose={() => setDomainToDelete(null)}
        onConfirm={confirmDeleteDomain}
        title="Hapus Domain"
        description={`PERINGATAN: Menghapus domain "${domainToDelete?.name}" akan menghapusnya dari database dan sekaligus menghapus zona DNS langsung dari Cloudflare. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Domain"
        variant="danger"
        loading={!!deletingDomainId}
      />
    </div>
  );
}

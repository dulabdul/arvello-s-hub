"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input, Select, CurrencyInput } from "@/components/ui/Input";
import { ProjectData, ClientData } from "@/lib/db/store";
import { ProjectStatus, PROJECT_STATUS_MAP } from "@/types/status";
import { formatCurrency } from "@/lib/services/invoice/calculator";
import { toast } from "sonner";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};
import {
  Briefcase,
  Plus,
  Kanban,
  Table as TableIcon,
  Calendar,
  Building,
  Edit2,
  Trash2,
  Receipt,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import Link from "next/link";

const KANBAN_COLUMNS: { status: ProjectStatus; label: string; colorClass: string }[] = [
  { status: "LEAD", label: "Lead", colorClass: "border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800/30" },
  { status: "NEGOTIATION", label: "Negosiasi", colorClass: "border-amber-300 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20" },
  { status: "IN_PROGRESS", label: "Berjalan", colorClass: "border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20" },
  { status: "REVIEW", label: "Review", colorClass: "border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20" },
  { status: "COMPLETED", label: "Selesai", colorClass: "border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20" },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ProjectStatus | null>(null);
  const [activeMobileColumn, setActiveMobileColumn] = useState<ProjectStatus | "ALL">("ALL");

  // Combobox State
  const [clientSearchQuery, setClientSearchQuery] = useState<string | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    description: "",
    status: "LEAD" as ProjectStatus,
    contractType: "FIXED" as "FIXED" | "HOURLY",
    value: 0,
    startDate: "",
    deadline: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [projRes, clientRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/clients"),
      ]);
      const [projData, clientData] = await Promise.all([
        projRes.json(),
        clientRes.json(),
      ]);
      setProjects(projData);
      setClients(clientData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      clientId: clients[0]?.id || "",
      name: "",
      description: "",
      status: "LEAD",
      contractType: "FIXED",
      value: 0,
      startDate: new Date().toISOString().split("T")[0],
      deadline: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProjectData) => {
    setEditingProject(p);
    setFormData({
      clientId: p.clientId,
      name: p.name,
      description: p.description || "",
      status: p.status,
      contractType: p.contractType,
      value: p.value || 0,
      startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
      deadline: p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleStatusChange = async (projectId: string, nextStatus: ProjectStatus) => {
    // Optimistic UI Update
    const previousProjects = [...projects];
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: nextStatus } : p))
    );

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        setProjects(previousProjects);
        toast.error("Gagal memperbarui status proyek");
      } else {
        toast.success("Status proyek berhasil diperbarui");
      }
    } catch (err) {
      console.error(err);
      setProjects(previousProjects);
      toast.error("Terjadi kesalahan sistem saat mengubah status proyek");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingProject) {
        const res = await fetch(`/api/projects/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal memperbarui proyek");
        }
        toast.success("Data proyek berhasil diperbarui");
      } else {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal membuat proyek baru");
        }
        toast.success("Proyek baru berhasil dibuat");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
        toast.error(err.message);
      } else {
        setFormError("Terjadi kesalahan saat menyimpan proyek");
        toast.error("Terjadi kesalahan saat menyimpan proyek");
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setDeletingId(projectToDelete.id);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Proyek "${projectToDelete.name}" berhasil dihapus`);
        setProjectToDelete(null);
        fetchData();
      } else {
        const errData = await res.json().catch(() => null);
        toast.error(errData?.error || "Gagal menghapus proyek");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat menghapus proyek");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (p.clientCompany && p.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = hideCompleted ? !["COMPLETED", "CANCELLED"].includes(p.status) : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Manajemen Proyek"
        subtitle="Pantau progress pekerjaan, timeline, dan pipeline proyek"
        actions={
          <div className="flex items-center gap-2">
            {/* View Switcher */}
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-md text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Tampilan Kanban"
                aria-label="Tampilan Kanban"
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 min-w-[34px] min-h-[34px] flex items-center justify-center rounded-md text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                title="Tampilan Tabel"
                aria-label="Tampilan Tabel"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={openCreateModal}
              size="sm"
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
            >
              Proyek Baru
            </Button>
          </div>
        }
      />

      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4 sm:space-y-6 flex-1 flex flex-col">
        {/* Toolbar Pencarian & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari proyek atau klien..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 w-full transition-colors"
              />
            </div>
            <button
              onClick={() => setHideCompleted(!hideCompleted)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition-all shrink-0 ${
                hideCompleted 
                  ? "bg-indigo-50 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shadow-inner"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden xs:inline">{hideCompleted ? "Semua" : "Sembunyikan Selesai"}</span>
            </button>
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-100 dark:border-slate-800 self-end sm:self-auto">
            {filteredProjects.length} Proyek
          </div>
        </div>

        {/* Mobile Segmented Column Tabs for Kanban */}
        {viewMode === "kanban" && !loading && projects.length > 0 && (
          <div className="sm:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setActiveMobileColumn("ALL")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeMobileColumn === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              Semua ({filteredProjects.length})
            </button>
            {KANBAN_COLUMNS.filter(col => hideCompleted ? !["COMPLETED", "CANCELLED"].includes(col.status) : true).map((col) => {
              const count = filteredProjects.filter((p) => p.status === col.status).length;
              const isActive = activeMobileColumn === col.status;
              return (
                <button
                  key={col.status}
                  onClick={() => setActiveMobileColumn(col.status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span>{col.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data proyek...</div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Belum Ada Proyek
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Buat proyek baru untuk mengorganisasi pekerjaan Anda dalam Kanban Board.
              </p>
            </div>
            <Button onClick={openCreateModal} variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Tambah Proyek Baru
            </Button>
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN BOARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 flex-1 items-start">
            {KANBAN_COLUMNS.filter(col => hideCompleted ? !["COMPLETED", "CANCELLED"].includes(col.status) : true).map((col) => {
              const colProjects = filteredProjects.filter((p) => p.status === col.status);
              const isHiddenOnMobile = activeMobileColumn !== "ALL" && activeMobileColumn !== col.status;
              return (
                <div
                  key={col.status}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (draggedProjectId) setDragOverCol(col.status);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault(); // Must prevent default to allow drop
                  }}
                  onDragLeave={(e) => {
                    // Only clear if we are leaving the actual column, not entering a child
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverCol(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCol(null);
                    const projectId = e.dataTransfer.getData("projectId");
                    if (projectId) handleStatusChange(projectId, col.status);
                  }}
                  className={`rounded-xl border p-3 flex flex-col gap-3 min-h-[380px] sm:min-h-[500px] transition-all duration-200 ${
                    col.colorClass
                  } ${isHiddenOnMobile ? "hidden sm:flex" : "flex"} ${dragOverCol === col.status ? "ring-2 ring-indigo-500/50 scale-[1.02]" : ""}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400">
                      {colProjects.length}
                    </span>
                  </div>

                  {/* Project Cards in Column */}
                  <div className="flex-1 space-y-3">
                    {colProjects.map((p) => (
                      <Card
                        key={p.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("projectId", p.id);
                          // For Firefox compatibility
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedProjectId(p.id);
                        }}
                        onDragEnd={() => {
                          setDraggedProjectId(null);
                          setDragOverCol(null);
                        }}
                        className={`p-3.5 space-y-2.5 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow group cursor-grab active:cursor-grabbing ${
                          draggedProjectId === p.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-snug">
                            {p.name}
                          </h5>
                          <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => openEditModal(p)}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 active:scale-95 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Proyek"
                              aria-label="Edit Proyek"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setProjectToDelete(p)}
                              disabled={deletingId === p.id}
                              className={`w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 active:scale-95 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${deletingId === p.id ? 'opacity-50 cursor-wait' : ''}`}
                              title="Hapus Proyek"
                              aria-label="Hapus Proyek"
                            >
                              {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{p.clientCompany || p.clientName}</span>
                        </p>

                        <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                          {p.deadline && (
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded w-fit">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDate(p.deadline)}
                            </div>
                          )}
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-[12px] tracking-tight">
                            {formatCurrency(p.value)}
                          </div>
                        </div>

                        {/* Fast Status Transition Selector */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                          <div className="relative flex-1">
                            <select
                              value={p.status}
                              onChange={(e) =>
                                handleStatusChange(p.id, e.target.value as ProjectStatus)
                              }
                              className="w-full appearance-none text-[11px] font-semibold py-2 pl-2.5 pr-6 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <option value="LEAD">Status: Lead</option>
                              <option value="NEGOTIATION">Status: Negosiasi</option>
                              <option value="IN_PROGRESS">Status: Berjalan</option>
                              <option value="REVIEW">Status: Review</option>
                              <option value="COMPLETED">Status: Selesai</option>
                              <option value="CANCELLED">Status: Dibatalkan</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                          </div>

                          <Link
                            href={`/invoices?projectId=${p.id}&clientId=${p.clientId}`}
                            title="Buat Invoice dari Proyek ini"
                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 active:scale-95 transition-all shrink-0"
                          >
                            <Receipt className="w-4 h-4" />
                          </Link>
                        </div>
                      </Card>
                    ))}

                    {colProjects.length === 0 && (
                      <div className="h-24 border-2 border-dashed border-slate-200/70 dark:border-slate-800 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                        Kosong
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <Card className="p-0 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Nama Proyek</th>
                    <th className="p-3.5">Klien</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Tipe Kontrak</th>
                    <th className="p-3.5">Nilai Kontrak</th>
                    <th className="p-3.5">Deadline</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProjects.map((p) => {
                    const statusMeta = PROJECT_STATUS_MAP[p.status];
                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {p.clientCompany || p.clientName}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta?.badgeClass}`}
                          >
                            {statusMeta?.label}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500">{p.contractType}</td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(p.value)}
                        </td>
                        <td className="p-3.5 text-slate-500">{formatDate(p.deadline)}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <Link
                            href={`/invoices?projectId=${p.id}&clientId=${p.clientId}`}
                            className="inline-flex p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Buat Invoice"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProjectToDelete(p)}
                            disabled={deletingId === p.id}
                            className={`p-1.5 text-slate-400 hover:text-rose-600 rounded ${deletingId === p.id ? 'opacity-50 cursor-wait' : ''}`}
                            title="Hapus"
                          >
                            {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Native Card List View */}
            <div className="sm:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filteredProjects.map((p) => {
                const statusMeta = PROJECT_STATUS_MAP[p.status];
                return (
                  <div key={p.id} className="p-4 flex flex-col gap-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {p.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusMeta?.badgeClass}`}>
                        {statusMeta?.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate">{p.clientCompany || p.clientName}</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(p.value)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        Deadline: {formatDate(p.deadline)}
                      </span>

                      <div className="flex items-center gap-1">
                        <Link
                          href={`/invoices?projectId=${p.id}&clientId=${p.clientId}`}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 hover:bg-indigo-100 active:scale-95 transition-all"
                          title="Buat Invoice"
                        >
                          <Receipt className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-indigo-600 active:scale-95 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setProjectToDelete(p)}
                          disabled={deletingId === p.id}
                          className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-rose-600 active:scale-95 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Modal Tambah / Edit Proyek */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Edit Proyek" : "Buat Proyek Baru"}
        description="Hubungkan proyek dengan klien dan tentukan skema pembayaran."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pilih Klien <span className="text-rose-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ketik untuk mencari klien..."
                value={
                  clientSearchQuery !== null 
                    ? clientSearchQuery 
                    : (clients.find(c => c.id === formData.clientId)?.name || "")
                }
                onChange={(e) => {
                  setClientSearchQuery(e.target.value);
                  setShowClientDropdown(true);
                }}
                onFocus={() => setShowClientDropdown(true)}
                onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                className="w-full h-11 sm:h-10 px-3.5 rounded-lg border text-sm text-brand-text bg-brand-surface placeholder:text-brand-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:border-brand-primary border-brand-border"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {showClientDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                {clients
                  .filter(c => (c.name + " " + (c.company || "")).toLowerCase().includes((clientSearchQuery || "").toLowerCase()))
                  .map(c => (
                    <div 
                      key={c.id}
                      onClick={() => {
                        setFormData({ ...formData, clientId: c.id });
                        setClientSearchQuery(null);
                        setShowClientDropdown(false);
                      }}
                      className="px-3.5 py-2.5 sm:py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 cursor-pointer flex flex-col active:bg-indigo-100 dark:active:bg-indigo-900/60"
                    >
                      <span className="font-medium text-slate-900 dark:text-slate-100">{c.name}</span>
                      {c.company && <span className="text-[10px] text-slate-500">{c.company}</span>}
                    </div>
                ))}
                {clients.filter(c => (c.name + " " + (c.company || "")).toLowerCase().includes((clientSearchQuery || "").toLowerCase())).length === 0 && (
                  <div className="px-3.5 py-3 text-sm text-slate-400 text-center">Klien tidak ditemukan</div>
                )}
              </div>
            )}
          </div>

          <Input
            label="Nama Proyek"
            placeholder="mis. Redesign Web Korporat"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status Proyek"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as ProjectStatus })
              }
              options={[
                { value: "LEAD", label: "Lead" },
                { value: "NEGOTIATION", label: "Negosiasi" },
                { value: "IN_PROGRESS", label: "Berjalan" },
                { value: "REVIEW", label: "Review" },
                { value: "COMPLETED", label: "Selesai" },
                { value: "CANCELLED", label: "Dibatalkan" },
              ]}
            />

            <Select
              label="Tipe Kontrak"
              value={formData.contractType}
              onChange={(e) =>
                setFormData({ ...formData, contractType: e.target.value as "FIXED" | "HOURLY" })
              }
              options={[
                { value: "FIXED", label: "Fixed Price" },
                { value: "HOURLY", label: "Hourly Rate" },
              ]}
            />
          </div>

          <CurrencyInput
            label="Estimasi / Nilai Kontrak (IDR)"
            required
            value={formData.value}
            onChange={(val) => setFormData({ ...formData, value: val })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />

            <Input
              label="Batas Waktu (Deadline)"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi Proyek (Scope)
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan deliverable utama dari proyek ini..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {formError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="w-full sm:w-auto h-11 sm:h-9 text-sm font-medium"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              loadingText="Menyimpan..."
              className="w-full sm:w-auto h-11 sm:h-9 text-sm font-semibold"
            >
              {editingProject ? "Perbarui Proyek" : "Simpan Proyek"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal Hapus Proyek */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDeleteProject}
        title="Hapus Proyek"
        description={`Apakah Anda yakin ingin menghapus proyek "${projectToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Proyek"
        variant="danger"
        loading={!!deletingId}
      />
    </div>
  );
}

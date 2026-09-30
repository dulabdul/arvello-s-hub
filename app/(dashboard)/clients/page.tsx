"use client";

import React, { useState, useEffect } from "react";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ClientData } from "@/lib/db/store";
import {
  Users,
  Plus,
  Search,
  Building,
  Mail,
  Phone,
  Edit2,
  Trash2,
  FolderPlus,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({ name: "", company: "", email: "", phone: "", notes: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (c: ClientData) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      company: c.company || "",
      email: c.email,
      phone: c.phone || "",
      notes: c.notes || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (editingClient) {
        const res = await fetch(`/api/clients/${editingClient.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memperbarui klien");
        }
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal membuat klien");
        }
      }

      setIsModalOpen(false);
      fetchClients();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Terjadi kesalahan saat menyimpan");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data klien "${name}"?`)) {
      setDeletingId(id);
      try {
        await fetch(`/api/clients/${id}`, { method: "DELETE" });
        fetchClients();
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Manajemen Klien"
        subtitle="Kelola direktori kontak klien dan perusahaan partner"
        actions={
          <Button
            onClick={openCreateModal}
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Klien Baru
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Search & Actions toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, perusahaan, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filtered.length} klien ditemukan
          </span>
        </div>

        {/* Clients Table / Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data klien...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Belum Ada Klien
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tambahkan profil klien pertama Anda untuk mulai mengelola proyek dan penagihan.
              </p>
            </div>
            <Button onClick={openCreateModal} variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Tambah Klien Baru
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <Card key={client.id} className="flex flex-col justify-between hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                        {client.name}
                      </h4>
                      {client.company && (
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${client.email}`} className="truncate hover:text-indigo-600">
                        {client.email}
                      </a>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {client.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      "{client.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link href={`/projects?clientId=${client.id}`}>
                    <Button variant="ghost" size="sm" icon={<FolderPlus className="w-3.5 h-3.5" />}>
                      Proyek
                    </Button>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(client)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Data Klien"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(client.id, client.name)}
                      disabled={deletingId === client.id}
                      className={`p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors ${deletingId === client.id ? 'opacity-50 cursor-wait' : ''}`}
                      title="Hapus Klien"
                    >
                      {deletingId === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit Klien */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? "Edit Data Klien" : "Tambah Klien Baru"}
        description="Lengkapi informasi kontak klien untuk database operasional Anda."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Klien"
            placeholder="mis. Budi Pratama"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Nama Perusahaan / Organisasi (Opsional)"
            placeholder="mis. PT Solusi Digital Mandiri"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email (Opsional)"
              type="email"
              placeholder="budi@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Nomor Telepon / WhatsApp"
              type="tel"
              placeholder="+62 812-..."
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Catatan Khusus (Lead / Preferensi)
            </label>
            <textarea
              rows={3}
              placeholder="Kebutuhan khusus atau catatan riwayat komunikasi..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {formError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Menyimpan..." : editingClient ? "Perbarui Klien" : "Simpan Klien"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

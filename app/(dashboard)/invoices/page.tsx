"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, CurrencyInput } from "@/components/ui/Input";
import { InvoiceData, ClientData, ProjectData } from "@/lib/db/store";
import { INVOICE_STATUS_MAP } from "@/types/status";
import {
  formatCurrency,
  InvoiceItem,
  calculateSubtotal,
  calculateTotal,
} from "@/lib/services/invoice/calculator";
import { generateInvoicePDF } from "@/lib/services/invoice/pdf";
import {
  Receipt,
  Plus,
  FileDown,
  CheckCircle2,
  Trash2,
  Trash,
  Building,
  Calendar,
  Loader2,
} from "lucide-react";

function InvoicesContent() {
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get("projectId");
  const preselectedClientId = searchParams.get("clientId");

  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [currency, setCurrency] = useState("IDR");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState<number | "">(0);
  const [discount, setDiscount] = useState<number | "">(0);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Jasa Pembuatan Sistem & Integrasi", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = (
    defClientId?: string,
    defProjectId?: string,
    projList: ProjectData[] = projects
  ) => {
    const cId = defClientId || clients[0]?.id || "";
    const pList = projList.filter((p) => !cId || p.clientId === cId);
    const pId = defProjectId || pList[0]?.id || "";

    const selectedProj = projList.find((p) => p.id === pId);
    const projValue = selectedProj?.value || 0;

    setSelectedClientId(cId);
    setSelectedProjectId(pId);
    setCurrency("IDR");

    // 14 days default due date
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split("T")[0]);

    setItems([
      {
        id: "item-1",
        description: selectedProj ? `Pengerjaan Proyek: ${selectedProj.name}` : "Jasa Pengembangan Web",
        quantity: 1,
        rate: projValue,
        amount: projValue,
      },
    ]);
    setTaxRate(0);
    setDiscount(0);
    setFormError("");
    setIsModalOpen(true);
  };

  const fetchData = React.useCallback(async () => {
    try {
      const [invRes, clientRes, projRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);
      
      if (!invRes.ok || !clientRes.ok || !projRes.ok) {
        throw new Error(`API Error: ${invRes.status} ${clientRes.status} ${projRes.status}`);
      }

      const [invData, clientData, projData] = await Promise.all([
        invRes.json(),
        clientRes.json(),
        projRes.json(),
      ]);
      
      setInvoices(invData);
      setClients(clientData);
      setProjects(projData);

      // Auto-open modal if navigated with projectId query
      if (preselectedProjectId && preselectedClientId) {
        openCreateModal(preselectedClientId, preselectedProjectId, projData);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  }, [preselectedProjectId, preselectedClientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClientChange = (cId: string) => {
    setSelectedClientId(cId);
    const pList = projects.filter((p) => p.clientId === cId);
    if (pList.length > 0) {
      setSelectedProjectId(pList[0].id);
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                description: `Pengerjaan Proyek: ${pList[0].name}`,
                rate: pList[0].value,
                amount: pList[0].value,
              }
            : item
        )
      );
    } else {
      setSelectedProjectId("");
    }
  };

  const handleProjectChange = (pId: string) => {
    setSelectedProjectId(pId);
    const selectedProj = projects.find((p) => p.id === pId);
    if (selectedProj) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === 0
            ? {
                ...item,
                description: `Pengerjaan Proyek: ${selectedProj.name}`,
                rate: selectedProj.value,
                amount: selectedProj.value,
              }
            : item
        )
      );
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      current.amount = (Number(current.quantity) || 0) * (Number(current.rate) || 0);
    }
    updated[index] = current;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      { id: `item-${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = calculateSubtotal(items);
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const total = calculateTotal(subtotal, taxAmount, Number(discount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    try {
      if (!selectedClientId || !selectedProjectId) {
        throw new Error("Pilih klien dan proyek terlebih dahulu.");
      }

      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClientId,
          projectId: selectedProjectId,
          dueDate,
          currency,
          tax: taxAmount,
          discount: Number(discount) || 0,
          items: items.map(i => ({ ...i, quantity: Number(i.quantity) || 0, rate: Number(i.rate) || 0 })),
          status: "UNPAID",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal membuat invoice");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Gagal menyimpan invoice");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMarkingPaid(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingPaid(null);
    }
  };

  const handleDelete = async (id: string, num: string) => {
    if (confirm(`Hapus invoice ${num}?`)) {
      setDeletingId(id);
      try {
        await fetch(`/api/invoices/${id}`, { method: "DELETE" });
        await fetchData();
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDownloadPDF = (inv: InvoiceData) => {
    const doc = generateInvoicePDF({
      number: inv.number,
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      clientEmail: inv.clientEmail,
      projectName: inv.projectName,
      date: inv.createdAt.split("T")[0],
      dueDate: inv.dueDate,
      items: inv.items,
      subtotal: inv.subtotal,
      tax: inv.tax,
      discount: inv.discount,
      total: inv.total,
      currency: inv.currency,
      status: INVOICE_STATUS_MAP[inv.status]?.label || inv.status,
    });
    doc.save(`${inv.number}.pdf`);
  };

  // Filtered list
  const filtered = invoices.filter((inv) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "UNPAID") return inv.status === "UNPAID" || inv.status === "SENT";
    return inv.status === statusFilter;
  });

  const clientProjects = projects.filter((p) => p.clientId === selectedClientId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueInvoices = invoices.filter(inv => inv.status === "OVERDUE" || (inv.status !== "PAID" && new Date(inv.dueDate) < today));
  
  const dueSoonInvoices = invoices.filter(inv => {
    if (inv.status === "PAID" || inv.status === "OVERDUE") return false;
    const due = new Date(inv.dueDate);
    if (due < today) return false;
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Invoice & Penagihan"
        subtitle="Buat tagihan, kelola status pelunasan, dan unduh PDF resmi"
        actions={
          <Button
            onClick={() => openCreateModal()}
            size="sm"
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
          >
            Buat Invoice
          </Button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Reminder Banners */}
        {overdueInvoices.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <div className="bg-rose-100 dark:bg-rose-900/50 p-2 rounded-full shrink-0"><Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" /></div>
            <div>
              <h4 className="font-semibold text-sm">Invoice Overdue</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">Terdapat {overdueInvoices.length} tagihan yang telah melewati batas waktu pembayaran. Disarankan untuk segera mengirimkan pengingat kepada klien.</p>
            </div>
          </div>
        )}
        
        {dueSoonInvoices.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-full shrink-0"><Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
            <div>
              <h4 className="font-semibold text-sm">Mendekati Jatuh Tempo</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">Terdapat {dueSoonInvoices.length} tagihan yang akan jatuh tempo dalam 3 hari ke depan.</p>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: "ALL", label: "Semua Tagihan" },
            { id: "UNPAID", label: "Menunggu Pembayaran" },
            { id: "PAID", label: "Lunas" },
            { id: "DRAFT", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice Listing Table */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Memuat data invoice...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center mx-auto">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Belum Ada Invoice
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Buat invoice pertama Anda dari proyek yang sedang berjalan untuk dikirim ke klien.
              </p>
            </div>
            <Button
              onClick={() => openCreateModal()}
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
            >
              Buat Invoice Baru
            </Button>
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Nomor Invoice</th>
                    <th className="p-3.5">Klien & Proyek</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Jatuh Tempo</th>
                    <th className="p-3.5">Total Tagihan</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((inv) => {
                    const statusMeta = INVOICE_STATUS_MAP[inv.status];
                    const isPaid = inv.status === "PAID";
                    return (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {inv.number}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {inv.createdAt.split("T")[0]}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">
                            {inv.clientName}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-400" />
                            {inv.projectName}
                          </p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusMeta?.badgeClass}`}
                          >
                            {statusMeta?.label}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {inv.dueDate}
                          </span>
                        </td>

                        <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(inv.total, inv.currency)}
                        </td>

                        <td className="p-3.5 text-right space-x-2">
                          <Button
                            onClick={() => handleDownloadPDF(inv)}
                            size="sm"
                            variant="outline"
                            icon={<FileDown className="w-3.5 h-3.5" />}
                          >
                            PDF
                          </Button>

                          {!isPaid ? (
                            <Button
                              onClick={() => handleMarkPaid(inv.id)}
                              size="sm"
                              variant="secondary"
                              disabled={markingPaid === inv.id}
                              className={`text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 ${markingPaid === inv.id ? 'opacity-75 cursor-wait' : ''}`}
                              icon={markingPaid === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            >
                              {markingPaid === inv.id ? "Memproses..." : "Tandai Lunas"}
                            </Button>
                          ) : (
                            <span className="text-[11px] font-semibold text-emerald-600 inline-flex items-center gap-1 px-2">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Lunas
                            </span>
                          )}

                          <button
                            onClick={() => handleDelete(inv.id, inv.number)}
                            disabled={deletingId === inv.id}
                            className={`p-1.5 text-slate-400 hover:text-rose-600 rounded ${deletingId === inv.id ? 'opacity-50 cursor-wait text-rose-600' : ''}`}
                            title="Hapus Invoice"
                          >
                            {deletingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Modal Form Buat Invoice */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buat Invoice Baru"
        description="Pilih klien dan proyek untuk meng-generate invoice resmi siap download."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Pilih Klien"
              required
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              options={clients.map((c) => ({
                value: c.id,
                label: `${c.name} ${c.company ? `(${c.company})` : ""}`,
              }))}
            />

            <Select
              label="Pilih Proyek"
              required
              value={selectedProjectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              options={
                clientProjects.length > 0
                  ? clientProjects.map((p) => ({ value: p.id, label: p.name }))
                  : [{ value: "", label: "Tidak ada proyek untuk klien ini" }]
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Batas Jatuh Tempo"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />

            <Select
              label="Mata Uang"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={[
                { value: "IDR", label: "IDR (Rupiah Indonesia)" },
                { value: "USD", label: "USD (US Dollar)" },
              ]}
            />
          </div>

          {/* Dynamic Item Rows */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Rincian Item Tagihan
              </label>
              <Button
                type="button"
                onClick={addItemRow}
                size="sm"
                variant="ghost"
                icon={<Plus className="w-3 h-3" />}
              >
                Tambah Item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div className="col-span-12 sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Deskripsi item / milestone..."
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="Qty"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, "quantity", e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="col-span-7 sm:col-span-3">
                    <CurrencyInput
                      placeholder="Tarif"
                      required
                      value={Number(item.rate)}
                      onChange={(val) => handleItemChange(idx, "rate", val)}
                      className="!h-8 !text-xs !pl-8"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal & Calculations */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div>
                <label className="text-[11px] text-slate-500">Pajak PPN (%):</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full mt-1 text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500">Diskon Khusus:</label>
                <CurrencyInput
                  value={Number(discount)}
                  onChange={(val) => setDiscount(val)}
                  className="!h-7 mt-1 !text-xs !pl-8"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold text-indigo-600 dark:text-indigo-400">
              <span>Total Tagihan:</span>
              <span className="text-base">{formatCurrency(total, currency)}</span>
            </div>
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
              {saving ? "Menyimpan..." : "Buat & Terbitkan Invoice"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 text-sm">Memuat...</div>}>
      <InvoicesContent />
    </Suspense>
  );
}

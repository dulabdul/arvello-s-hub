"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/modules/Topbar";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, ArrowRight, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { ClientData } from "@/lib/db/store";
import { InvoiceItem, calculateSubtotal, calculateTotal } from "@/lib/services/invoice/calculator";

const DEFAULT_CONTENT = [
  { id: "objective", title: "Tujuan Proyek", body: "" },
  { id: "scope", title: "Ruang Lingkup (Scope of Work)", body: "" },
  { id: "timeline", title: "Estimasi Waktu", body: "" }
];

export default function NewProposalPage() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<ClientData[]>([]);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [prospectName, setProspectName] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  
  const [contentSections, setContentSections] = useState(DEFAULT_CONTENT);
  
  const [currency, setCurrency] = useState("IDR");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  useEffect(() => {
    fetch("/api/clients")
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error(err));
  }, []);

  // Pricing Logic
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, rate: 0, amount: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const total = calculateTotal(calculateSubtotal(items), 0, 0);

  // Content Logic
  const handleContentChange = (index: number, field: "title" | "body", value: string) => {
    const newContent = [...contentSections];
    newContent[index][field] = value;
    setContentSections(newContent);
  };
  
  const addSection = () => {
    setContentSections([...contentSections, { id: Date.now().toString(), title: "Seksi Baru", body: "" }]);
  };

  const removeSection = (index: number) => {
    setContentSections(contentSections.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        clientId: clientId || null,
        prospectName: prospectName || null,
        prospectEmail: prospectEmail || null,
        content: contentSections,
        total,
        currency,
        status: "DRAFT"
      };

      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/proposals");
      } else {
        alert("Gagal membuat proposal");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Buat Proposal Baru"
        subtitle={`Langkah ${step} dari 3`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push("/proposals")}>Batal</Button>
            {step < 3 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)}>
                Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {saving ? "Menyimpan..." : "Simpan & Selesai"}
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full">
        {step === 1 && (
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">1. Informasi Dasar</h2>
            <Input 
              label="Judul Proposal" 
              placeholder="Contoh: Pembuatan Website E-Commerce" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-500">Pilih Klien Terdaftar</h3>
                <Select
                  label="Klien"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    if (e.target.value) {
                      setProspectName("");
                      setProspectEmail("");
                    }
                  }}
                  options={[
                    { value: "", label: "-- Pilih Klien --" },
                    ...clients.map(c => ({ value: c.id, label: `${c.name} ${c.company ? `(${c.company})` : ""}` }))
                  ]}
                />
              </div>
              <div className="space-y-4 border-l border-slate-200 dark:border-slate-800 pl-6">
                <h3 className="text-sm font-medium text-slate-500">Atau Prospek Baru</h3>
                <Input 
                  label="Nama Prospek/Perusahaan" 
                  value={prospectName}
                  onChange={(e) => {
                    setProspectName(e.target.value);
                    if (e.target.value) setClientId("");
                  }}
                  disabled={!!clientId}
                />
                <Input 
                  label="Email Prospek" 
                  type="email"
                  value={prospectEmail}
                  onChange={(e) => setProspectEmail(e.target.value)}
                  disabled={!!clientId}
                />
              </div>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">2. Konten Proposal</h2>
              <Button variant="outline" onClick={addSection}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Seksi
              </Button>
            </div>
            
            <div className="space-y-8">
              {contentSections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 relative group">
                  <div className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input 
                        label={`Judul Seksi ${idx + 1}`} 
                        value={section.title}
                        onChange={(e) => handleContentChange(idx, "title", e.target.value)}
                      />
                    </div>
                    {contentSections.length > 1 && (
                      <button 
                        onClick={() => removeSection(idx)}
                        className="mt-8 p-2 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Isi Konten</label>
                    <textarea 
                      className="w-full h-32 px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-y"
                      value={section.body}
                      onChange={(e) => handleContentChange(idx, "body", e.target.value)}
                      placeholder="Tuliskan deskripsi lengkap di sini..."
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-start pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">3. Estimasi Biaya</h2>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="flex gap-4 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                  <div className="flex-1">
                    <Input
                      label="Deskripsi Pekerjaan"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                    />
                  </div>
                  <div className="w-40">
                    <Input
                      label="Harga (Rp)"
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, "rate", Number(e.target.value))}
                    />
                  </div>
                  <div className="w-40">
                    <Input
                      label="Total (Rp)"
                      value={item.amount}
                      disabled
                    />
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-3 mb-1 text-slate-400 hover:text-rose-500"
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <Button variant="outline" onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" /> Tambah Item
              </Button>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="w-64 space-y-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Biaya:</span>
                  <span>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

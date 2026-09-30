"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Plus, Loader2, Settings2 } from "lucide-react";
import { CategoryManagerModal } from "./CategoryManagerModal";

export function TransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetch("/api/finance/categories")
        .then(res => res.json())
        .then(data => {
          if (data.categories) {
            setCategories(data.categories);
            if (!category) setCategory(data.categories[0]);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          category,
          date,
          description,
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setAmount("");
        setCategory("");
        setDescription("");
        router.refresh(); // Refresh server component data
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-full font-medium text-sm shadow-sm hover:opacity-90 transition-opacity"
      >
        <Plus className="w-4 h-4" /> Catat Transaksi
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Catat Transaksi"
        description="Pemasukan atau pengeluaran manual."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipe Transaksi"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { value: "INCOME", label: "Pemasukan (+)" },
              { value: "EXPENSE", label: "Pengeluaran (-)" },
            ]}
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Kategori"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={categories.map(c => ({ value: c, label: c }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="mb-1 p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-text hover:bg-brand-bg/80 transition-colors"
              title="Kelola Kategori"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>

          <Input
            label="Tanggal"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Keterangan (Opsional)"
            placeholder="Catatan tambahan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saving ? "Menyimpan..." : (type === "INCOME" ? "Catat Pemasukan" : "Catat Pengeluaran")}
            </Button>
          </div>
        </form>
      </Modal>

      <CategoryManagerModal 
        categories={categories}
        setCategories={setCategories}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </>
  );
}

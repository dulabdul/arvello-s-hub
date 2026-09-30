"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, X, Loader2, Tag } from "lucide-react";

interface CategoryManagerModalProps {
  categories: string[];
  setCategories: (cats: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ categories, setCategories, isOpen, onClose }: CategoryManagerModalProps) {
  const [newCat, setNewCat] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = newCat.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    
    const updated = [...categories, trimmed];
    setCategories(updated);
    setNewCat("");
    await saveCategories(updated);
  };

  const handleRemove = async (catToRemove: string) => {
    const updated = categories.filter(c => c !== catToRemove);
    setCategories(updated);
    await saveCategories(updated);
  };

  const saveCategories = async (cats: string[]) => {
    setSaving(true);
    try {
      await fetch("/api/finance/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: cats }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Kategori"
      description="Tambahkan atau hapus kategori kustom untuk transaksi Anda."
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input 
              label=""
              placeholder="Nama kategori baru..."
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button type="button" onClick={handleAdd} variant="secondary" className="mt-1" disabled={!newCat.trim() || saving}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-brand-bg/50 border border-brand-border rounded-lg p-3 min-h-[150px] max-h-[300px] overflow-y-auto flex flex-wrap gap-2 content-start relative">
          {saving && (
            <div className="absolute inset-0 bg-brand-surface/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
              <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
            </div>
          )}
          {categories.length === 0 ? (
            <div className="w-full text-center text-sm text-brand-muted mt-10">Belum ada kategori</div>
          ) : (
            categories.map(cat => (
              <div key={cat} className="flex items-center gap-1.5 bg-brand-surface border border-brand-border px-2.5 py-1.5 rounded-full text-sm font-medium text-brand-text group">
                <Tag className="w-3 h-3 text-brand-muted" />
                {cat}
                <button 
                  onClick={() => handleRemove(cat)}
                  className="ml-1 w-4 h-4 rounded-full bg-brand-danger/10 text-brand-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-danger hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="button" onClick={onClose} variant="primary">Selesai</Button>
        </div>
      </div>
    </Modal>
  );
}

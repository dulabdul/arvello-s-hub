"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Plus, X, Loader2, Tag, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { RegistrarItem, DEFAULT_REGISTRARS } from "@/app/api/domains/registrars/route";

const PRESET_COLORS = [
  { label: "Oranye", hex: "#F38020" },
  { label: "Merah", hex: "#DE3723" },
  { label: "Teal", hex: "#00A4A6" },
  { label: "Biru", hex: "#0066B3" },
  { label: "Ungu", hex: "#673DE6" },
  { label: "Biru Terang", hex: "#0078FF" },
  { label: "Navy", hex: "#0B2545" },
  { label: "Hijau", hex: "#059669" },
  { label: "Amber", hex: "#D97706" },
  { label: "Rose", hex: "#E11D48" },
];

interface RegistrarManagerModalProps {
  registrars: RegistrarItem[];
  setRegistrars: (items: RegistrarItem[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrarManagerModal({
  registrars,
  setRegistrars,
  isOpen,
  onClose,
}: RegistrarManagerModalProps) {
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error("Nama registrar tidak boleh kosong");
      return;
    }

    if (registrars.some((r) => r.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Registrar "${trimmed}" sudah ada`);
      return;
    }

    const newItem: RegistrarItem = {
      id: `reg-${Date.now()}`,
      name: trimmed,
      color: selectedColor,
    };

    const updated = [...registrars, newItem];
    setRegistrars(updated);
    setNewName("");
    toast.success(`Registrar "${trimmed}" berhasil ditambahkan`);
    await saveRegistrars(updated);
  };

  const handleRemove = async (idToRemove: string, name: string) => {
    if (registrars.length <= 1) {
      toast.error("Minimal harus ada satu registrar");
      return;
    }

    const updated = registrars.filter((r) => r.id !== idToRemove);
    setRegistrars(updated);
    toast.success(`Registrar "${name}" dihapus`);
    await saveRegistrars(updated);
  };

  const handleResetDefaults = async () => {
    setRegistrars(DEFAULT_REGISTRARS);
    toast.success("Daftar registrar direset ke bawaan");
    await saveRegistrars(DEFAULT_REGISTRARS);
  };

  const saveRegistrars = async (items: RegistrarItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/domains/registrars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrars: items }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan ke server");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan perubahan registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Registrar & Aksen Warna"
      description="Tambahkan atau kustomisasi daftar registrar domain beserta warna identitasnya."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Form Tambah Registrar Baru */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tambah Registrar Baru
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Contoh: Porkbun, Dewaweb, OVH..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 h-10 px-3 rounded-lg border text-sm text-brand-text bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              onClick={handleAdd}
              variant="primary"
              disabled={!newName.trim() || saving}
              className="h-10 px-4"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah
            </Button>
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 block mb-1.5">
              Pilih Warna Aksen:
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setSelectedColor(preset.hex)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                    selectedColor === preset.hex
                      ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: preset.hex }}
                  title={preset.label}
                >
                  {selectedColor === preset.hex && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" strokeWidth={3} />
                  )}
                </button>
              ))}

              {/* Custom Color Input */}
              <div className="flex items-center gap-1.5 ml-1">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-7 h-7 rounded-full border border-slate-300 cursor-pointer overflow-hidden p-0"
                  title="Warna kustom"
                />
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {selectedColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Daftar Registrar Saat Ini */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Daftar Registrar Aktif ({registrars.length})
            </span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-[11px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Reset ke Bawaan
            </button>
          </div>

          <div className="bg-brand-bg/60 border border-brand-border rounded-xl p-3 min-h-[140px] max-h-[260px] overflow-y-auto flex flex-wrap gap-2 content-start relative">
            {saving && (
              <div className="absolute inset-0 bg-brand-surface/60 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
              </div>
            )}
            {registrars.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-xs group bg-white dark:bg-slate-900"
                style={{
                  borderColor: `${reg.color}40`,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: reg.color }}
                />
                <span style={{ color: reg.color }}>{reg.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(reg.id, reg.name)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-0.5"
                  title={`Hapus ${reg.name}`}
                  aria-label={`Hapus ${reg.name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-brand-border">
          <Button type="button" onClick={onClose} variant="primary">
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
}

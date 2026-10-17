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
      <div className="space-y-4 min-w-0 w-full">
        {/* Form Tambah Registrar Baru */}
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 min-w-0 w-full">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
            Tambah Registrar Baru
          </label>
          <div className="flex items-center gap-2 min-w-0 w-full">
            <input
              type="text"
              placeholder="Nama registrar..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 min-w-0 w-full h-11 px-3.5 rounded-xl border text-sm text-brand-text bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-brand-primary transition-colors"
            />
            <Button
              type="button"
              onClick={handleAdd}
              variant="primary"
              disabled={!newName.trim() || saving}
              className="h-11 px-3.5 sm:px-4 text-sm font-semibold rounded-xl shrink-0"
              icon={<Plus className="w-4 h-4" />}
            >
              Tambah
            </Button>
          </div>

          {/* Color Palette Selector */}
          <div className="pt-1 min-w-0 w-full">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Pilih Warna Aksen:
              </label>
              <span 
                className="text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border transition-colors shrink-0"
                style={{ 
                  color: selectedColor, 
                  backgroundColor: `${selectedColor}15`,
                  borderColor: `${selectedColor}30`
                }}
              >
                {selectedColor.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 pt-0.5 place-items-center min-w-0 w-full">
              {PRESET_COLORS.map((preset) => {
                const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setSelectedColor(preset.hex)}
                    className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-offset-2 ring-brand-primary scale-110 shadow-sm"
                        : "hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: preset.hex }}
                    title={preset.label}
                    aria-label={preset.label}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                    )}
                  </button>
                );
              })}

              {/* Custom Color Picker Swatch */}
              <label
                className={`relative w-8 h-8 min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center cursor-pointer transition-all border border-slate-300 dark:border-slate-600 shrink-0 ${
                  !PRESET_COLORS.some((p) => p.hex.toLowerCase() === selectedColor.toLowerCase())
                    ? "ring-2 ring-offset-2 ring-brand-primary scale-110 shadow-sm"
                    : "hover:scale-105"
                }`}
                style={{
                  background: !PRESET_COLORS.some((p) => p.hex.toLowerCase() === selectedColor.toLowerCase())
                    ? selectedColor
                    : "conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #FFFF00 60deg, #00FF00 120deg, #00FFFF 180deg, #0000FF 240deg, #FF00FF 300deg, #FF0000 360deg)",
                }}
                title="Pilih warna kustom"
              >
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="sr-only"
                />
                {!PRESET_COLORS.some((p) => p.hex.toLowerCase() === selectedColor.toLowerCase()) ? (
                  <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={3} />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs pointer-events-none" />
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Daftar Registrar Saat Ini */}
        <div className="min-w-0 w-full">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
              Daftar Registrar Aktif ({registrars.length})
            </span>
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-brand-muted hover:text-brand-primary flex items-center gap-1.5 transition-colors cursor-pointer py-1 shrink-0 ml-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Reset Bawaan</span>
            </button>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 min-h-[140px] max-h-[260px] overflow-y-auto overscroll-contain relative min-w-0 w-full">
            {saving && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-10 rounded-xl sm:rounded-2xl">
                <Loader2 className="w-5 h-5 text-brand-primary animate-spin" />
              </div>
            )}
            
            {registrars.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Belum ada registrar yang didaftarkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
                {registrars.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border transition-all shadow-xs group min-w-0"
                    style={{ borderColor: `${reg.color}35` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: reg.color }}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {reg.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(reg.id, reg.name)}
                      className="w-7 h-7 min-w-[28px] min-h-[28px] rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-all cursor-pointer shrink-0"
                      title={`Hapus ${reg.name}`}
                      aria-label={`Hapus ${reg.name}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            onClick={onClose}
            variant="primary"
            className="w-full h-11 text-sm font-semibold rounded-xl"
          >
            Selesai
          </Button>
        </div>
      </div>
    </Modal>
  );
}

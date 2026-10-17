"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Loader2, Tag, X } from "lucide-react";
import { RegistrarItem } from "@/app/api/domains/registrars/route";

interface RegistrarSelectBadgeProps {
  value?: string | null;
  registrars: RegistrarItem[];
  onChange: (value: string) => void;
  disabled?: boolean;
  onOpenManager?: () => void;
  size?: "sm" | "md";
}

export function RegistrarSelectBadge({
  value,
  registrars,
  onChange,
  disabled = false,
  onOpenManager,
  size = "md",
}: RegistrarSelectBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    placement: "bottom" | "top";
  }>({
    left: 0,
    placement: "bottom",
  });

  const activeRegistrar = registrars.find(
    (r) => r.name.toLowerCase() === (value || "").toLowerCase()
  );
  const color = activeRegistrar?.color || "#64748B";

  // Check mobile viewport width
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate viewport-relative coordinates for position: fixed (NEVER add scrollY!)
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const dropdownWidth = 224; // w-56 is 14rem = 224px
    const spaceBelow = window.innerHeight - rect.bottom;

    // Flip upwards if space below is too tight and there's enough space above
    const openUpwards = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    let left = rect.left;
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = Math.max(16, rect.right - dropdownWidth);
    }

    if (openUpwards) {
      setCoords({
        bottom: window.innerHeight - rect.top + 4,
        left,
        placement: "top",
      });
    } else {
      setCoords({
        top: rect.bottom + 4,
        left,
        placement: "bottom",
      });
    }
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: string) => {
    setIsOpen(false);
    if (val !== (value || "")) {
      onChange(val);
    }
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Native behavior: close popover immediately when the user scrolls the page/table
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleScroll = (e: Event) => {
      // Allow internal scrolling inside the dropdown itself
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    const handleResize = () => updateCoords();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, isMobile, updateCoords]);

  // Lock body scroll on mobile sheet open (native app feeling)
  useEffect(() => {
    if (isOpen && isMobile) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, isMobile]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 transition-all rounded-lg font-medium border select-none active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 cursor-pointer ${
          size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        } ${
          activeRegistrar
            ? "hover:brightness-95 shadow-xs"
            : "border-dashed border-brand-border text-slate-500 bg-brand-surface hover:border-brand-primary hover:text-brand-primary"
        }`}
        style={{
          backgroundColor: activeRegistrar ? `${color}18` : undefined,
          borderColor: activeRegistrar ? `${color}40` : undefined,
          color: activeRegistrar ? color : undefined,
        }}
        title="Pilih atau ubah Register"
      >
        {activeRegistrar ? (
          <>
            <span
              className="w-2 h-2 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: color }}
            />
            <span className="font-semibold truncate max-w-[130px]">{activeRegistrar.name}</span>
          </>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 italic">-- Pilih Register --</span>
        )}

        {disabled ? (
          <Loader2 className="w-3 h-3 animate-spin ml-0.5 opacity-60 shrink-0" />
        ) : (
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ml-0.5 shrink-0 opacity-60 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Render via Portal */}
      {isOpen && mounted && typeof document !== "undefined" && (
        isMobile ? (
          /* Mobile Native Action Sheet */
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
            >
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="bg-brand-surface border-t border-brand-border rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-250 pb-safe"
              >
                {/* Grab handle */}
                <div className="flex items-center justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-brand-border" />
                </div>

                {/* Header */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-brand-border">
                  <div>
                    <h3 className="text-sm font-bold text-brand-text">Pilih Register Domain</h3>
                    <p className="text-xs text-brand-muted">Tetapkan registrar dan aksen warna</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-brand-muted hover:bg-brand-bg active:scale-90 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Options list with 48px touch targets */}
                <div className="overflow-y-auto p-3 space-y-1">
                  <button
                    type="button"
                    onClick={() => handleSelect("")}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm min-h-[48px] transition-colors active:scale-98 cursor-pointer ${
                      !value
                        ? "bg-brand-primary/10 text-brand-primary font-bold"
                        : "text-slate-500 hover:bg-brand-bg"
                    }`}
                  >
                    <span className="italic text-slate-400">-- Belum Diatur --</span>
                    {!value && <Check className="w-4 h-4 text-brand-primary" />}
                  </button>

                  {registrars.map((r) => {
                    const isSelected = (value || "").toLowerCase() === r.name.toLowerCase();
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelect(r.name)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm min-h-[48px] transition-colors active:scale-98 cursor-pointer ${
                          isSelected
                            ? "bg-brand-primary/10 font-bold"
                            : "hover:bg-brand-bg text-brand-text"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: r.color }}
                          />
                          <span style={{ color: isSelected ? r.color : undefined }}>
                            {r.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 shrink-0" style={{ color: r.color }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer / Manage button */}
                {onOpenManager && (
                  <div className="p-3 border-t border-brand-border bg-brand-bg/40 pb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenManager();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm text-brand-primary font-medium hover:bg-brand-primary/10 rounded-xl transition-colors min-h-[48px] active:scale-98 cursor-pointer"
                    >
                      <Tag className="w-4 h-4" />
                      <span>Kelola Daftar Register & Warna</span>
                    </button>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )
        ) : (
          /* Desktop Fixed Popover (Zero coordinate displacement bug) */
          createPortal(
            <div
              ref={menuRef}
              onClick={(e) => e.stopPropagation()}
              className="fixed z-[9999] w-56 bg-brand-surface border border-brand-border rounded-xl shadow-2xl py-1 animate-in fade-in zoom-in-95 duration-100"
              style={{
                top: coords.placement === "bottom" ? `${coords.top}px` : undefined,
                bottom: coords.placement === "top" ? `${coords.bottom}px` : undefined,
                left: `${coords.left}px`,
              }}
            >
              {/* Header */}
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-muted border-b border-brand-border/60">
                Pilih Register Domain
              </div>

              {/* Options list */}
              <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleSelect("")}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    !value
                      ? "bg-brand-primary/10 text-brand-primary font-semibold"
                      : "text-slate-500 hover:bg-brand-bg"
                  }`}
                >
                  <span className="italic text-slate-400">-- Belum Diatur --</span>
                  {!value && <Check className="w-3.5 h-3.5 text-brand-primary" />}
                </button>

                {registrars.map((r) => {
                  const isSelected = (value || "").toLowerCase() === r.name.toLowerCase();
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelect(r.name)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brand-primary/10 font-semibold"
                          : "hover:bg-brand-bg text-brand-text"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: r.color }}
                        />
                        <span style={{ color: isSelected ? r.color : undefined }} className="truncate">
                          {r.name}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: r.color }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Manage button */}
              {onOpenManager && (
                <div className="border-t border-brand-border/60 p-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenManager();
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors font-medium cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Kelola Register & Warna...</span>
                  </button>
                </div>
              )}
            </div>,
            document.body
          )
        )
      )}
    </div>
  );
}

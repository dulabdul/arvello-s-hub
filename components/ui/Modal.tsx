"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidths = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Centered Modal Dialog */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 z-10 
          animate-in fade-in zoom-in-95 duration-200 
          max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 min-w-[36px] min-h-[36px] -mr-1 -mt-1 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content with smooth touch scrolling */}
        <div className="overflow-y-auto overscroll-contain pt-3 sm:pt-4 flex-1 -mr-1 pr-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

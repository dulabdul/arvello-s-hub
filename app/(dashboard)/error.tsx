"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught an error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Oops! Terjadi Kesalahan
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
        Kami kesulitan memuat data halaman ini. Ini biasanya terjadi jika ada masalah pada koneksi database (Supabase) atau kredensial di file <code>.env</code> Anda tidak valid.
      </p>
      
      <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-8 max-w-lg w-full text-left overflow-auto border border-slate-200 dark:border-slate-700">
        <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
          {error.message || "Unknown error occurred"}
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary">
          Coba Lagi
        </Button>
      </div>
    </div>
  );
}

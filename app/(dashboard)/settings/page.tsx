import React from "react";
import { Topbar } from "@/components/modules/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Database, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title="Pengaturan Platform"
        subtitle="Konfigurasi database Supabase dan preferensi command center"
      />
      <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Supabase Connection Status Card */}
        <Card>
          <CardHeader
            title="Koneksi Database Supabase"
            subtitle="Status integrasi PostgreSQL via Prisma ORM"
            action={
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terkonfigurasi
              </span>
            }
          />
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Platform Freelancer Hub menggunakan <strong>PostgreSQL Supabase</strong> melalui connection pooling (Transaction Mode di port 6543) dan direct connection (port 5432) untuk skema migrasi Prisma.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-[11px] space-y-1">
              <p className="text-slate-400"># Konfigurasi di file .env:</p>
              <p className="text-indigo-600 dark:text-indigo-400">DATABASE_URL=&quot;postgresql://...:6543/postgres?pgbouncer=true&quot;</p>
              <p className="text-indigo-600 dark:text-indigo-400">DIRECT_URL=&quot;postgresql://...:5432/postgres&quot;</p>
            </div>
          </div>
        </Card>

        {/* Admin Single-User Profile */}
        <Card>
          <CardHeader
            title="Profil Pengguna Single-User"
            subtitle="Sesuai spesifikasi PRD §3 persona utama"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-slate-400 block mb-1">Nama Developer / Brand</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Freelancer Hub IT
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-slate-400 block mb-1">Email Utama</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                admin@freelancer.local
              </span>
            </div>
          </div>
        </Card>

        {/* Security & Backup */}
        <Card>
          <CardHeader
            title="Keamanan & Proteksi Data"
            subtitle="Standar keamanan sesuai Development-Guidelines §7"
          />
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Data Sensitif & Enkripsi
                </p>
                <p className="text-slate-500 mt-0.5">
                  Kredensial database, API tokens Cloudflare (Fase 4), dan laporan finansial tidak pernah diekspos ke client bundle.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Cadangan Database (Backup)
                </p>
                <p className="text-slate-500 mt-0.5">
                  Disarankan mengaktifkan fitur Point-in-Time Recovery (PITR) dan Daily Backups otomatis di dashboard proyek Supabase Anda.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

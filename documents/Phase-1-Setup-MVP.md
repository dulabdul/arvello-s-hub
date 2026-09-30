# Fase 1: Setup Fundamental & MVP Dashboard

## 1. Tujuan Fase
Membangun fondasi teknis dan fitur-fitur dasar untuk pengelolaan klien, proyek, dan invoice (MVP).

## 2. Acuan ke Dokumen Utama
* **PRD**: Modul 4.1 (CRUD Klien/Proyek) & 4.2 (Invoice Dasar), Dashboard Ringkas, Autentikasi.
* **Visual-UI**: Implementasi warna global (`--color-primary`, dll), tipografi (Inter), dan layout dasar (Sidebar, Grid 12-kolom, Responsif).
* **Development**: Inisialisasi Next.js + TypeScript, Tailwind CSS, Prisma ORM + PostgreSQL, dan struktur folder awal di `/(dashboard)`.

## 3. Daftar Tugas (Checklist)
- [x] Inisiasi Next.js app dengan TypeScript & Tailwind.
- [x] Konfigurasi palet warna & tipografi di `globals.css` sesuai Visual-UI-Guidelines.
- [x] Setup Prisma ORM dan PostgreSQL (skema dasar untuk Client, Project, dan Invoice) dengan target Supabase PostgreSQL.
- [x] Implementasi autentikasi menggunakan Auth.js / NextAuth credential config.
- [x] Buat layout global (Sidebar, Topbar) untuk rute `/(dashboard)/*`.
- [x] Bangun halaman dan fungsi CRUD untuk Klien.
- [x] Bangun halaman dan fungsi CRUD untuk Proyek (termasuk Kanban Board view).
- [x] Bangun modul Invoice dasar (generate dari proyek, export ke PDF).
- [x] Buat Dashboard ringkas yang merangkum data Klien, Proyek, dan Invoice tertunda.

---
*Fase selanjutnya: Fase 2 (Modul Pembukuan & Automasi Keuangan)*

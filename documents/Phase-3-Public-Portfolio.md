# Fase 3: Area Publik (Portfolio & Proposal Builder)

## 1. Tujuan Fase
Membangun sisi eksternal (publik) dari platform yang akan dibaca oleh klien atau calon klien tanpa mengharuskan login.

## 2. Acuan ke Dokumen Utama
* **PRD**: Modul 4.3 (Halaman portfolio publik, Builder proposal berbasis template, Tracking status proposal).
* **Visual-UI**: Desain halaman non-dashboard, UI form yang panjang dipecah per-section (step-by-step), dan "Voice in UI" yang profesional.
* **Development**: Routing publik `/(public)/portfolio/[slug]` dan `/proposal/[token]`, implementasi token enkripsi/expirable, rate-limiting publik.

## 3. Daftar Tugas (Checklist)
- [ ] Update skema Prisma untuk entitas `Proposal` (dengan generate token unik).
- [ ] Buat halaman Builder Proposal di dalam dashboard (step-by-step form).
- [ ] Buat layout dan rute halaman publik `/(public)/*` (menghilangkan sidebar dashboard).
- [ ] Implementasi halaman render Proposal berdasarkan token (`/proposal/[token]`).
- [ ] Buat sistem tracking kapan proposal di-view oleh klien (`viewedAt`).
- [ ] (Opsional) Implementasi halaman Portfolio Publik dinamis berdasarkan proyek yang diselesaikan.
- [ ] Pasang Rate-limiting dasar di endpoint publik agar tidak di-abuse.

---
*Fase selanjutnya: Fase 4 (Integrasi Layanan Cloudflare)*

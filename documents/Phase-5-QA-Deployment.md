# Fase 5: QA, Finalisasi, & Deployment

## 1. Tujuan Fase
Melakukan pengecekan menyeluruh terhadap kualitas sistem (testing), penyesuaian UI terakhir, dan meluncurkan aplikasi ke tahap *production*.

## 2. Acuan ke Dokumen Utama
* **PRD**: Evaluasi Metrik Kesuksesan (load < 2 detik), backup otomatis, dan keamanan.
* **Visual-UI**: Audit UI/UX lintas perangkat (Desktop, Tablet, Mobile) dan pengecekan dukungan Dark Mode.
* **Development**: Testing E2E/Integration, pengaturan environment variables (`.env`), CI/CD pipeline ke Cloudflare Pages/Vercel.

## 3. Daftar Tugas (Checklist)
- [ ] Audit UI responsif dan fungsionalitas di viewport mobile dan tablet.
- [ ] Pastikan seluruh indikator warna status dan Dark mode bekerja dengan baik.
- [ ] Lengkapi unit test dan integration test untuk fitur kritikal (finansial & invoice).
- [ ] Persiapkan file `.env.example` dan dokumentasi deployment lokal.
- [ ] Hubungkan repositori GitHub ke Cloudflare Pages (atau platform hosting Next.js yang dipilih).
- [ ] Lakukan konfigurasi automated database deployment (contoh: eksekusi `prisma migrate deploy` saat build).
- [ ] Lakukan percobaan E2E (End-to-End) dari buat klien, kirim proposal, hingga terima pembayaran.
- [ ] Finalisasi versi 1.0.

# Fase 2: Modul Pembukuan & Automasi Keuangan

## 1. Tujuan Fase
Mengimplementasikan fitur tracking keuangan (pemasukan/pengeluaran) yang terhubung otomatis dengan status pelunasan invoice.

## 2. Acuan ke Dokumen Utama
* **PRD**: Modul 4.4 (Tracking Pemasukan & Pengeluaran, Kategorisasi) dan Modul 4.2 (Reminder otomatis invoice).
* **Visual-UI**: Implementasi Grafik (Line/Bar chart) untuk tren keuangan dengan `color-success` dan `color-danger`.
* **Development**: Arsitektur "Event-driven" (trigger otomatis saat invoice lunas), penambahan tabel `Transaction` di Prisma, logic kalkulasi finansial di `lib/services/finance`.

## 3. Daftar Tugas (Checklist)
- [ ] Update skema Prisma untuk menambahkan entitas `Transaction` (type: income/expense).
- [ ] Buat UI halaman Keuangan untuk mencatat manual pengeluaran dan pemasukan (Tabel Data).
- [ ] Implementasi logic "Event-driven": saat invoice ditandai "Lunas", otomatis buat entri `Transaction` bertipe income.
- [ ] Buat Chart sederhana di Dashboard Keuangan untuk visualisasi pemasukan vs pengeluaran.
- [ ] Buat script/worker untuk Reminder Invoice yang mendekati/lewat batas waktu (opsional bisa via email atau notifikasi UI).
- [ ] Buat Unit test (Vitest/Jest) untuk memastikan kalkulasi finansial dan kategori laporan berjalan akurat.

---
*Fase selanjutnya: Fase 3 (Area Publik - Portfolio & Proposal Builder)*

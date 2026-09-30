# Fase 4: Integrasi Layanan Cloudflare (Manajemen Domain)

## 1. Tujuan Fase
Mengelola dan menghubungkan domain milik klien langsung dari dalam platform menggunakan API Cloudflare.

## 2. Acuan ke Dokumen Utama
* **PRD**: Modul 4.5 (Hubungkan Cloudflare, tambah zona/domain, kelola DNS dasar).
* **Visual-UI**: Modal Cloudflare khusus (dengan spinner propagasi), font monospace (`JetBrains Mono`) untuk elemen DNS.
* **Development**: Layer service terpusat `services/cloudflare/`, penanganan rate limit, penyimpanan token Cloudflare terenkripsi, skema tabel `Domain`.

## 3. Daftar Tugas (Checklist)
- [ ] Update skema Prisma untuk entitas `Domain` yang berelasi ke `Project`.
- [ ] Setup enkripsi sederhana untuk menyimpan Cloudflare API Token (AES-256).
- [ ] Buat API wrapper (`services/cloudflare`) untuk endpoint `POST /zones` dan `POST /zones/:id/dns_records`.
- [ ] Bangun antarmuka (Modal/Form) di halaman Proyek untuk mendaftarkan domain baru ke Cloudflare.
- [ ] Buat UI polling status DNS real-time ("Menunggu propagasi" -> "Aktif").
- [ ] Buat antarmuka pengelolaan basic DNS Records (A, CNAME, TXT, MX) untuk tiap domain.
- [ ] Tulis integration test dengan mocking untuk memastikan wrapper Cloudflare berjalan baik tanpa memanggil API sungguhan.

---
*Fase selanjutnya: Fase 5 (QA, Finalisasi, & Deployment)*

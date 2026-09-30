# PRD — Freelancer Hub Platform
**Product Requirements Document**
Versi: 1.0 | Tanggal: 3 September 2026 | Pemilik Produk: Kamu (Developer/IT Freelancer)

---

## 1. Latar Belakang & Masalah

Sebagai freelancer di bidang developer/IT, kamu saat ini mengelola proyek, klien, invoice, keuangan, portfolio, dan deployment domain klien dengan tools yang terpisah-pisah (spreadsheet, chat, dashboard Cloudflare manual, dsb). Ini menyebabkan:

- Data klien & proyek tersebar, sulit dilacak statusnya.
- Pembuatan invoice manual, rawan telat/salah hitung.
- Tidak ada gambaran jelas arus kas (pemasukan vs pengeluaran).
- Proses onboarding domain baru ke Cloudflare dilakukan manual berulang-ulang.
- Portfolio & proposal dibuat ulang dari nol tiap ada calon klien baru.

## 2. Tujuan Produk

Membangun **satu platform web personal (single-user)** yang menjadi command center operasional freelancer developer: dari akuisisi klien (portfolio & proposal) → eksekusi (manajemen proyek) → pembayaran (invoice) → pembukuan (tracking keuangan) → operasional teknis (integrasi Cloudflare untuk domain).

### Success Metrics
| Metrik | Target |
|---|---|
| Waktu pembuatan invoice | < 3 menit per invoice |
| Waktu tambah domain baru ke Cloudflare | < 2 menit tanpa buka dashboard Cloudflare |
| Visibilitas cash flow | Bisa lihat saldo & proyeksi bulanan dalam 1 klik |
| Waktu buat proposal baru | < 10 menit dari template |
| Single source of truth | 100% data klien/proyek/invoice ada di 1 platform |

## 3. Target Pengguna

- **Persona utama:** Kamu sendiri — freelancer developer/IT, mengerjakan proyek web/app untuk beberapa klien paralel, sering deploy domain klien via Cloudflare.
- **Mode akses:** Single-user (tidak perlu multi-tenant/role kompleks di v1). Namun arsitektur data sebaiknya tetap rapi agar bisa di-multi-user-kan di masa depan (lihat §8 Future Scope).

## 4. Lingkup Fitur (Scope)

### 4.1 Modul Manajemen Proyek & Klien
- CRUD data klien (nama, perusahaan, kontak, catatan, sumber lead).
- CRUD proyek, linked ke klien: nama proyek, deskripsi, status (`Lead → Negosiasi → Berjalan → Review → Selesai → Dibatalkan`), tanggal mulai/deadline, nilai kontrak, tipe (fixed price/hourly).
- Task/milestone per proyek dengan checklist dan due date.
- Timeline/kanban view proyek (per status).
- Catatan komunikasi/log aktivitas per proyek.

### 4.2 Modul Invoice & Pembayaran
- Buat invoice dari data proyek (auto-fill klien, item pekerjaan, harga).
- Status invoice: `Draft → Terkirim → Belum Dibayar → Lunas → Overdue`.
- Dukungan pajak/PPN opsional, diskon, multi-mata uang (IDR utama + USD).
- Export invoice ke PDF, kirim via email langsung dari platform.
- Reminder otomatis untuk invoice mendekati/lewat jatuh tempo.
- Riwayat pembayaran per klien/proyek.

### 4.3 Modul Portfolio & Proposal
- Halaman portfolio publik (showcase proyek, tech stack, studi kasus, link demo/repo).
- Builder proposal berbasis template (bisa disesuaikan per klien), export ke PDF/link shareable.
- Tracking status proposal: `Draft → Dikirim → Dilihat Klien → Diterima → Ditolak`.

### 4.4 Modul Tracking Pemasukan & Pengeluaran
- Catat transaksi pemasukan (dari invoice lunas otomatis masuk, atau manual) dan pengeluaran (tools, hosting, subscription, dsb).
- Kategorisasi transaksi (Operasional, Tools/Software, Domain/Hosting, Pajak, Tabungan, Lainnya).
- Dashboard ringkasan: total pemasukan/pengeluaran per bulan, net profit, grafik tren.
- Laporan sederhana per periode (bulanan/tahunan) yang bisa diexport (CSV/PDF).

### 4.5 Modul Integrasi Cloudflare (Domain Management)
- Hubungkan akun Cloudflare via API Token (disimpan terenkripsi).
- Tambah domain baru ke akun Cloudflare langsung dari platform (add zone).
- Lihat status DNS/nameserver domain yang terhubung ke proyek klien tertentu.
- Kelola record DNS dasar (A, CNAME, TXT, MX) per domain dari dalam platform.
- Linked ke data proyek: setiap domain otomatis terasosiasi ke proyek/klien terkait, agar mudah tahu domain mana milik proyek mana.

### 4.6 Dashboard Utama
- Ringkasan: proyek aktif, invoice belum dibayar, saldo bulan ini, deadline terdekat, domain yang butuh perhatian (expired/DNS error).

## 5. Alur Pengguna Utama (User Flow)

1. **Akuisisi klien:** Buat proposal dari template → kirim link → klien lihat & terima → otomatis buat entri klien + proyek baru berstatus "Negosiasi".
2. **Eksekusi proyek:** Update status proyek, checklist task, jika perlu tambahkan domain klien ke Cloudflare langsung dari halaman proyek.
3. **Penagihan:** Saat milestone/proyek selesai, generate invoice dari data proyek → kirim ke klien → sistem tandai status & kirim reminder otomatis.
4. **Pembukuan:** Saat invoice lunas, transaksi otomatis tercatat di modul keuangan; pengeluaran diinput manual berkala.
5. **Review performa:** Cek dashboard bulanan untuk melihat net income, proyek yang overdue, dan domain yang perlu diperpanjang.

## 6. Kebutuhan Non-Fungsional

- **Keamanan:** API token Cloudflare & data finansial harus terenkripsi at-rest; autentikasi wajib (login single-user, bisa dengan email+password atau magic link).
- **Performa:** Dashboard utama harus load < 2 detik dengan data hingga ratusan proyek/invoice.
- **Reliabilitas:** Data invoice & keuangan tidak boleh hilang — perlu backup otomatis (harian).
- **Aksesibilitas & Responsif:** Bisa diakses dari desktop maupun mobile browser (freelancer sering cek dari HP).
- **Portabilitas data:** Semua data (klien, proyek, invoice, transaksi) bisa diexport (CSV/JSON) sewaktu-waktu.

## 7. Prioritas & Roadmap (Saran Fase)

| Fase | Fokus |
|---|---|
| **MVP (Fase 1)** | Autentikasi, CRUD Klien & Proyek, Invoice dasar (buat & export PDF), Dashboard ringkas |
| **Fase 2** | Tracking Pemasukan/Pengeluaran + laporan, Reminder invoice otomatis |
| **Fase 3** | Modul Portfolio & Proposal (builder + tracking status) |
| **Fase 4** | Integrasi Cloudflare (add domain, kelola DNS) |
| **Fase 5 (opsional)** | Multi-currency lanjutan, automasi lanjutan (email sequence, integrasi payment gateway) |

## 8. Di Luar Lingkup (Out of Scope) v1

- Multi-user/tim (kolaborasi dengan freelancer lain) — dicatat sebagai potensi pengembangan masa depan, bukan kebutuhan v1.
- Payment gateway terintegrasi penuh (v1 cukup catat status manual "Lunas"; integrasi otomatis seperti Midtrans/Stripe bisa fase lanjutan).
- Fitur time-tracking otomatis (timer aktif) — bisa ditambah belakangan jika dibutuhkan untuk proyek hourly.

## 9. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| API Token Cloudflare bocor | Enkripsi token, scope token dibatasi minimum (hanya izin zone/DNS) |
| Data keuangan tidak akurat karena input manual | Auto-sync invoice lunas ke modul keuangan, minimalkan input manual |
| Scope creep (fitur terlalu banyak sekaligus) | Ikuti roadmap fase, MVP dulu baru modul lain |

---
*Dokumen ini adalah bagian dari rangkaian: PRD.md · Visual-UI-Guidelines.md · Development-Guidelines.md · Master.md*

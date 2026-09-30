# Master Document — Freelancer Hub Platform

**Sebuah platform web personal untuk mengelola seluruh operasional freelancer developer/IT: klien, proyek, invoice, keuangan, portfolio & proposal, hingga integrasi domain Cloudflare — dalam satu tempat.**

Versi: 1.0 | Tanggal: 3 September 2026 | Status: Perencanaan (Pre-Development)

---

## 1. Ringkasan Proyek

| | |
|---|---|
| **Nama Produk** | Freelancer Hub Platform |
| **Target Pengguna** | Kamu — freelancer developer/IT (single-user) |
| **Tujuan Utama** | Konsolidasi manajemen proyek, klien, invoice, keuangan, portfolio, dan domain Cloudflare ke satu platform |
| **Skala** | Single-user, arsitektur dirancang agar bisa berkembang ke multi-user di masa depan |
| **Fase Saat Ini** | Dokumentasi requirement (PRD, UI, Dev Guidelines) |

## 2. Daftar Dokumen dalam Rangkaian Ini

| Dokumen | Isi | File |
|---|---|---|
| 📋 **PRD** | Latar belakang, tujuan, scope fitur, user flow, roadmap fase, risiko | `PRD.md` |
| 🎨 **Visual & UI Guidelines** | Palet warna, tipografi, grid, komponen UI, breakpoint responsif | `Visual-UI-Guidelines.md` |
| ⚙️ **Development Guidelines** | Tech stack, arsitektur, skema data, standar koding, integrasi Cloudflare, keamanan, deployment | `Development-Guidelines.md` |
| 🧭 **Master** | Dokumen ini — ringkasan & peta navigasi seluruh dokumen | `Master.md` |

## 3. Enam Modul Inti Produk

1. **Manajemen Klien & Proyek** — CRUD klien/proyek, kanban status, task/milestone.
2. **Invoice & Pembayaran** — generate invoice dari proyek, export PDF, reminder otomatis.
3. **Portfolio & Proposal** — halaman portfolio publik + builder proposal dengan tracking status.
4. **Tracking Pemasukan & Pengeluaran** — pembukuan sederhana, otomatis sinkron dari invoice lunas.
5. **Integrasi Cloudflare** — tambah domain klien & kelola DNS langsung dari platform.
6. **Dashboard Utama** — ringkasan lintas modul: proyek aktif, invoice tertunda, saldo, domain bermasalah.

## 4. Roadmap Ringkas

```
Fase 1 (MVP)   → Auth + CRUD Klien/Proyek + Invoice dasar + Dashboard
Fase 2         → Tracking Keuangan + Reminder Invoice
Fase 3         → Portfolio & Proposal
Fase 4         → Integrasi Cloudflare (domain & DNS)
Fase 5         → Penyempurnaan (multi-currency, automasi lanjutan)
```
*Detail lengkap tiap fase ada di `PRD.md` §7.*

## 5. Stack Teknis Ringkas

`Next.js + TypeScript` · `Tailwind CSS` · `PostgreSQL + Prisma` · `Auth.js` · `Cloudflare Pages/Workers/R2`

*Detail arsitektur, struktur folder, dan skema data lengkap ada di `Development-Guidelines.md`.*

## 6. Cara Menggunakan Dokumen Ini

- **Sebelum mulai coding:** baca `PRD.md` untuk memastikan scope fitur MVP sudah jelas dan disepakati (dengan diri sendiri 😄).
- **Saat membangun UI/komponen:** rujuk `Visual-UI-Guidelines.md` agar seluruh modul konsisten secara visual.
- **Saat membangun backend/arsitektur:** rujuk `Development-Guidelines.md` untuk struktur folder, skema data, dan cara integrasi Cloudflare yang aman.
- Dokumen ini bersifat **living document** — update `Master.md` ini setiap kali ada perubahan besar di scope, stack, atau roadmap agar tetap jadi satu titik referensi utama.

## 7. Catatan Versi

| Versi | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 3 September 2026 | Dokumen awal: PRD, Visual UI Guidelines, Development Guidelines dibuat |

---
*Rangkaian dokumen: **Master.md** (kamu di sini) · `PRD.md` · `Visual-UI-Guidelines.md` · `Development-Guidelines.md`*

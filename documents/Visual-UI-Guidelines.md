# Visual & UI Guidelines — Freelancer Hub Platform
Versi: 1.0 | Tanggal: 3 September 2026

---

## 1. Prinsip Desain

1. **Clarity over decoration** — ini tools kerja harian, bukan showcase. Prioritaskan keterbacaan data (angka invoice, status proyek) di atas estetika berlebihan.
2. **Density seimbang** — cukup informasi terlihat sekaligus (dashboard, tabel) tanpa terasa penuh sesak. Gunakan whitespace untuk memisahkan grup informasi.
3. **Status selalu jelas lewat warna & label** — proyek, invoice, dan domain semua punya status; harus bisa dikenali sekilas (scannable) lewat badge warna, bukan cuma teks.
4. **Konsisten lintas modul** — komponen (card, tabel, form) yang sama dipakai ulang di modul Klien, Proyek, Invoice, Keuangan, Domain — bukan reinvent tiap modul.
5. **Mobile-friendly, desktop-first** — dirancang utama untuk desktop (kerja detail: invoice, DNS record), tapi tetap dapat dipakai nyaman dari HP untuk cek cepat.

## 2. Palet Warna

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#4F46E5` (Indigo 600) | Aksi utama, link, elemen brand |
| `--color-primary-dark` | `#3730A3` | Hover/active state primary |
| `--color-bg` | `#F8FAFC` (Slate 50) | Background utama (light mode) |
| `--color-surface` | `#FFFFFF` | Card, panel, modal |
| `--color-border` | `#E2E8F0` (Slate 200) | Border tipis antar elemen |
| `--color-text-primary` | `#0F172A` (Slate 900) | Teks utama |
| `--color-text-secondary` | `#64748B` (Slate 500) | Teks sekunder/caption |
| `--color-success` | `#16A34A` | Status: Lunas, Selesai, DNS Aktif |
| `--color-warning` | `#F59E0B` | Status: Menunggu, Draft, Mendekati Deadline |
| `--color-danger` | `#DC2626` | Status: Overdue, Ditolak, Error DNS |
| `--color-info` | `#0EA5E9` | Status: Terkirim, Sedang Diproses |

**Dark mode:** sediakan varian dengan `--color-bg: #0B1120`, `--color-surface: #111827`, `--color-text-primary: #F1F5F9` — mapping status color tetap sama agar konsistensi makna warna terjaga.

## 3. Tipografi

- **Font:** `Inter` (UI umum) untuk teks, `JetBrains Mono` untuk elemen teknis (API token, DNS record, kode domain).
- **Skala:**
  | Level | Ukuran | Bobot | Penggunaan |
  |---|---|---|---|
  | H1 | 28px | 700 | Judul halaman |
  | H2 | 22px | 600 | Judul section/card besar |
  | H3 | 18px | 600 | Sub-section, judul card |
  | Body | 14px | 400 | Teks umum, tabel |
  | Small/Caption | 12px | 400 | Label, metadata, timestamp |
- **Line-height:** 1.5 untuk body text, 1.2 untuk heading.

## 4. Grid & Spacing

- **Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64px.
- **Grid layout dashboard:** 12-kolom, gutter 24px, max-width konten 1280px, dengan sidebar fixed 240px (collapsible ke 64px icon-only).
- **Card padding:** 20px (desktop), 16px (mobile).
- **Border-radius:** 8px untuk card/button, 6px untuk input, 999px (full) untuk badge status.

## 5. Breakpoint Responsif

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| Mobile | < 640px | Sidebar jadi bottom nav/hamburger, tabel → stacked card list |
| Tablet | 640–1024px | Sidebar collapsible, tabel tetap tabel tapi kolom diringkas |
| Desktop | > 1024px | Layout penuh: sidebar + main content + optional right panel (detail) |

## 6. Komponen Utama

### 6.1 Navigasi
- **Sidebar kiri** (persistent di desktop): Dashboard, Klien, Proyek, Invoice, Keuangan, Portfolio & Proposal, Domain (Cloudflare), Pengaturan.
- Icon + label, item aktif ditandai background `--color-primary` tint 10% + border-left accent.

### 6.2 Status Badge
Bentuk pill kecil (`border-radius: 999px`, padding 4px 10px, font 12px 600), warna background pastel dari status color + teks warna solid. Contoh: `Lunas` (hijau), `Overdue` (merah), `Draft` (abu/kuning).

### 6.3 Card
Dipakai di dashboard (ringkasan angka) dan list item (klien/proyek). Struktur: judul kecil di atas (secondary text), angka/nama besar di tengah (H2/H3), metadata kecil di bawah, opsional badge status di pojok kanan atas.

### 6.4 Tabel Data
Digunakan untuk list Invoice, Transaksi Keuangan, Domain. Header sticky saat scroll, row hover highlight ringan, aksi (edit/hapus/lihat) muncul sebagai icon button di kolom paling kanan saat hover.

### 6.5 Form
Label di atas input (bukan placeholder-only), input height 40px, focus state border `--color-primary` + shadow tipis. Form panjang (misal buat invoice/proposal) dipecah jadi step/section dengan judul jelas, bukan satu form raksasa.

### 6.6 Kanban Board (Proyek)
Kolom per status (`Lead / Negosiasi / Berjalan / Review / Selesai`), card proyek berisi nama proyek, klien, deadline, dan progress bar mini. Drag-and-drop antar kolom untuk update status.

### 6.7 Grafik (Dashboard Keuangan)
Line/bar chart sederhana untuk tren pemasukan vs pengeluaran bulanan, warna: pemasukan `--color-success`, pengeluaran `--color-danger`. Hindari 3D/efek berlebihan — flat & jelas.

### 6.8 Modal Cloudflare Domain
Form tambah domain: input nama domain → tampilkan nameserver yang harus diarahkan → status polling ("Menunggu propagasi DNS" dengan spinner → "Aktif" dengan check hijau).

## 7. Iconografi

Gunakan satu set icon konsisten (disarankan **Lucide Icons** — outline style, stroke 1.5–2px). Icon size standar 20px di sidebar/tombol, 16px di dalam tabel/badge.

## 8. Nada Visual (Voice in UI)

- Microcopy singkat, langsung, tidak bertele-tele (contoh tombol: "Buat Invoice", bukan "Silakan Buat Invoice Anda Sekarang").
- Empty state selalu punya ilustrasi/icon ringan + CTA jelas (contoh: belum ada proyek → "Belum ada proyek. + Tambah Proyek Baru").
- Pesan error spesifik dan actionable (contoh: "Token Cloudflare tidak valid — cek kembali di Pengaturan", bukan "Terjadi kesalahan").

---
*Dokumen ini adalah bagian dari rangkaian: PRD.md · Visual-UI-Guidelines.md · Development-Guidelines.md · Master.md*

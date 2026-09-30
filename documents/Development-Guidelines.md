# Development Guidelines — Freelancer Hub Platform
Versi: 1.0 | Tanggal: 3 September 2026

---

## 1. Tech Stack yang Disarankan

| Layer | Pilihan | Alasan |
|---|---|---|
| Frontend | **Next.js (React) + TypeScript** | SSR/SSG untuk portfolio publik, ekosistem matang |
| Styling | **Tailwind CSS** | Cepat konsisten dengan design tokens di Visual-UI-Guidelines |
| Backend | **Next.js API Routes / Node.js (Express atau Hono)** | Satu bahasa (TS) full-stack, mudah dipelihara solo |
| Database | **PostgreSQL** (mis. via Supabase/Neon) | Relasional cocok untuk data klien-proyek-invoice yang saling terhubung |
| ORM | **Prisma** | Type-safe query, migration mudah |
| Auth | **Auth.js (NextAuth) / Lucia Auth** | Simple untuk single-user, bisa dikembangkan ke multi-user nanti |
| File/PDF generation | **React-PDF atau Puppeteer** | Generate invoice & proposal PDF |
| Hosting | **Cloudflare Pages + Cloudflare Workers** | Selaras dengan kebutuhan integrasi Cloudflare API |
| Storage file | **Cloudflare R2** | Simpan aset portfolio, PDF invoice |

> Catatan: stack ini saran, sesuaikan dengan keahlian kamu saat ini sebagai developer. Prinsip pentingnya: **TypeScript end-to-end** dan **arsitektur modular per domain** (lihat §3).

## 2. Prinsip Arsitektur

1. **Modular by domain** — kode dikelompokkan per modul bisnis (client, project, invoice, finance, portfolio, cloudflare), bukan per tipe file. Memudahkan kalau nanti mau split jadi microservice atau tambah modul.
2. **Single source of truth untuk status** — semua enum status (proyek, invoice, proposal, domain) didefinisikan terpusat, dipakai bersama backend & frontend agar tidak ada string status yang tidak sinkron.
3. **Idempotent integration layer untuk Cloudflare** — semua pemanggilan Cloudflare API dibungkus di satu service layer (`services/cloudflare/`), sehingga jika API berubah/token perlu rotasi, perubahan hanya di satu tempat.
4. **Automasi keuangan lewat event, bukan cron manual** — saat status invoice berubah ke "Lunas", trigger event yang otomatis membuat entri transaksi pemasukan (event-driven, bukan job terjadwal yang scan semua invoice).

## 3. Struktur Folder (Referensi)

```
/app
  /(dashboard)
    /clients
    /projects
    /invoices
    /finance
    /portfolio
    /proposals
    /domains
    /settings
  /(public)
    /portfolio/[slug]
    /proposal/[token]
/components
  /ui            # komponen generik (Button, Card, Badge, Table, Modal)
  /modules       # komponen spesifik per modul (ProjectKanban, InvoiceForm, dsb)
/lib
  /db            # prisma client, query helpers
  /services
    /cloudflare  # wrapper API Cloudflare (add zone, DNS record)
    /invoice     # generate PDF, hitung total
    /finance     # kalkulasi laporan, kategori
  /auth
/prisma
  schema.prisma
/types           # shared TypeScript types & enums status
```

## 4. Skema Data Inti (Ringkasan Entity)

- **Client**: id, name, company, email, phone, notes, createdAt
- **Project**: id, clientId, name, description, status (enum), contractType (fixed/hourly), value, startDate, deadline
- **Task**: id, projectId, title, done, dueDate
- **Invoice**: id, projectId, clientId, number, items[], subtotal, tax, discount, currency, status (enum), dueDate, paidAt
- **Transaction**: id, type (income/expense), amount, category, relatedInvoiceId (nullable), date, note
- **Proposal**: id, clientId (nullable jika prospek belum jadi klien), title, content, status (enum), sentAt, viewedAt
- **Domain**: id, projectId, domainName, cloudflareZoneId, status, nameservers[], createdAt

Semua enum status **didefinisikan di `/types/status.ts`** dan diimpor bersama, jangan hardcode string di banyak tempat.

## 5. Integrasi Cloudflare — Panduan Teknis

- Gunakan **Cloudflare API Token** (bukan Global API Key) dengan permission minimum: `Zone:Edit`, `DNS:Edit`.
- Simpan token terenkripsi (mis. AES-256) di database atau gunakan Cloudflare secret binding jika deploy di Workers.
- Endpoint penting yang dipakai:
  - `POST /zones` — tambah domain baru (add zone)
  - `GET /zones/:id` — cek status zone (aktif/pending nameserver)
  - `POST /zones/:id/dns_records` — tambah record DNS (A/CNAME/TXT/MX)
- Selalu **poll status zone** setelah add domain (nameserver butuh waktu propagasi), tampilkan status real-time di UI (lihat Visual-UI-Guidelines §6.8).
- Rate limit Cloudflare API: rancang retry-with-backoff sederhana untuk request yang gagal karena rate limit.

## 6. Standar Koding

- **TypeScript strict mode** aktif (`strict: true` di tsconfig).
- **Naming:** `camelCase` untuk variabel/fungsi, `PascalCase` untuk komponen React & tipe, `SCREAMING_SNAKE_CASE` untuk konstanta global.
- **Komponen React:** functional component + hooks, hindari komponen > 200 baris (pecah jadi sub-komponen).
- **Validasi input:** gunakan **Zod** di setiap form dan setiap API route (validasi di client DAN server, jangan percaya client saja).
- **Error handling:** semua service layer melempar error bertipe jelas (`ClientError`, `IntegrationError`, dst), ditangkap terpusat di API handler untuk response konsisten.
- **Tidak ada magic string** untuk status/kategori — selalu pakai enum dari `/types`.

## 7. Keamanan

- Autentikasi wajib untuk semua route `/(dashboard)/*`; halaman publik hanya `/portfolio/[slug]` dan `/proposal/[token]` (token unik, expirable).
- Data sensitif (Cloudflare token, data finansial) tidak pernah dikirim ke client tanpa perlu — fetch & proses di server side saja.
- Backup database otomatis harian (kalau pakai Supabase/Neon, aktifkan point-in-time recovery).
- Gunakan HTTPS penuh (otomatis jika hosting di Cloudflare Pages).
- Rate-limit endpoint publik (proposal view, portfolio) untuk cegah abuse.

## 8. Testing

| Jenis | Tools | Fokus |
|---|---|---|
| Unit test | Vitest/Jest | Logic kalkulasi invoice, kategori keuangan, status transition |
| Integration test | Vitest + Prisma test DB | Service layer (invoice, finance, cloudflare wrapper dengan mock API) |
| E2E test (opsional) | Playwright | Flow kritikal: buat proyek → buat invoice → tandai lunas → cek transaksi otomatis muncul |

Prioritaskan test untuk **modul finansial dan integrasi Cloudflare** — dua area paling berisiko kalau salah (uang & infra domain klien).

## 9. Git Workflow

- Branch: `main` (production) ← `develop` ← `feature/nama-fitur`.
- Commit message format: `<tipe>: <deskripsi singkat>` (`feat`, `fix`, `chore`, `refactor`, `docs`).
- Karena solo project, boleh commit langsung ke `develop`, tapi **selalu lewat PR ke `main`** agar ada checkpoint review sebelum deploy production (bisa self-review, minimal cek diff sebelum merge).

## 10. Deployment

- **Environment terpisah:** `local` (dev), `staging` (opsional), `production`.
- Environment variables (`.env`) minimal: `DATABASE_URL`, `AUTH_SECRET`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY`, dst — **jangan pernah commit `.env` ke repo**, gunakan `.env.example` sebagai referensi.
- Deploy otomatis dari `main` branch ke Cloudflare Pages via GitHub integration (CI/CD bawaan).
- Jalankan `prisma migrate deploy` sebagai step otomatis sebelum build di pipeline deploy.

---
*Dokumen ini adalah bagian dari rangkaian: PRD.md · Visual-UI-Guidelines.md · Development-Guidelines.md · Master.md*

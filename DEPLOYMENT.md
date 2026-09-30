# Panduan Deployment ke Vercel

Aplikasi **Freelancer Hub** dibangun menggunakan Next.js App Router dan sangat optimal untuk di-deploy ke Vercel. Berikut adalah langkah-langkah untuk meluncurkan versi 1.0 ke production.

## 1. Persiapan Repositori GitHub
1. Buat repositori baru di GitHub.
2. Commit semua perubahan lokal dan push ke repositori GitHub Anda:
   ```bash
   git add .
   git commit -m "feat: Freelancer Hub v1.0"
   git push origin main
   ```

## 2. Persiapan Database (Supabase)
Karena Anda menggunakan Supabase, Anda memerlukan dua URL koneksi:
- **`DATABASE_URL`**: Digunakan untuk aplikasi berjalan, menggunakan Transaction Pooler (Port 6543). Berikan param `?pgbouncer=true` di akhir URL.
- **`DIRECT_URL`**: Digunakan oleh Prisma untuk melakukan migrasi database. Menggunakan koneksi langsung (Port 5432).

## 3. Konfigurasi Vercel
1. Kunjungi [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Klik **Add New...** > **Project**.
3. Pilih repositori GitHub `freelancer-dashboard` yang baru saja Anda buat.
4. Pada bagian **Configure Project**:
   - **Framework Preset**: Next.js (akan terpilih secara otomatis)
   - **Build Command**: Biarkan *default*, Vercel akan mengeksekusi script `"build"` di `package.json` yang telah kita atur menjadi `prisma generate && prisma migrate deploy && next build`. Ini akan otomatis menjalankan migrasi database saat proses deploy.
   
5. Buka bagian **Environment Variables** dan tambahkan variabel yang ada di file `.env.example`:
   - `DATABASE_URL` = <URL_POOLER_SUPABASE>
   - `DIRECT_URL` = <URL_DIRECT_SUPABASE>
   - `ENCRYPTION_KEY` = <32_BYTE_SECRET>
   - `NEXTAUTH_SECRET` = <RANDOM_SECRET>
   - `NEXTAUTH_URL` = (Dikosongkan saat deploy di Vercel, karena Vercel akan menggunakan VERCEL_URL. Jika menggunakan domain kustom, setel menjadi `https://domain-anda.com`).

6. Klik **Deploy**.

## 4. Pasca-Deployment
Setelah deployment sukses:
1. Pastikan fitur seperti Proposal Publik, Manajemen Cloudflare, dan PDF generator (Invoice) berfungsi baik pada URL production.
2. Simpan Cloudflare API Token Anda melalui antarmuka *Settings* atau seed ke database production Anda jika Anda tidak membuatnya interaktif.

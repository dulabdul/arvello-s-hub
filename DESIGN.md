# DESIGN.md (Freelancer Dashboard)

Sesuai aturan `antislop` (R-37), dokumen ini berfungsi sebagai jiwa dan arah visual (*Direction*) dari antarmuka aplikasi.

## 1. Identity & Personality
- **Mood**: Santai, ramah, dan personal (Relaxed & Friendly).
- **Karakter**: Ruang kerja pribadi yang nyaman, bukan aplikasi *enterprise* yang kaku. Menghindari bahasa yang terlalu korporat. Elegan namun mudah didekati.

## 2. Color Palette
Menggunakan palet "Warm Minimalist" untuk memberikan kesan ramah dan personal.
- **Base (Background)**: *Warm Sand* atau *Off-white* (misal: `#FDFBF7`) untuk mode terang, *Muted Charcoal* (`#1C1B1A`) untuk mode gelap.
- **Text (Primary)**: *Deep Slate* (`#2D3748`) untuk kontras tinggi namun tidak sekeras hitam pekat.
- **Accent (Satu-satunya fokus)**: *Sage Green* (`#6B8E23` atau `emerald-600`) atau *Terracotta*. Kita akan menggunakan **Sage Green** sebagai penanda aksi (Tombol CTA, status sukses).

## 3. Typography (Elegant)
- **Headings (H1, H2, dll)**: **Playfair Display** atau **Lora** (Serif) untuk memberikan sentuhan elegan dan editorial.
- **Body & UI Controls**: **Inter** atau **Figtree** (Sans-serif) untuk keterbacaan data (tabel, angka tagihan).

## 4. The Dials (Liveliness)
Dial ini akan dipertahankan di seluruh aplikasi:
- **ENERGY: 3 (Bold/Expressive)**. Elemen akan menggunakan hierarki yang kuat. Tulisan *header* akan besar dan berani. Ruang negatif (whitespace) digunakan dengan percaya diri. Tidak ada komponen yang "malu-malu".
- **RHYTHM: 2 (Balanced/Consistent with breaks)**. Tata letak umumnya konsisten, namun dengan variasi sengaja di beberapa bagian (misalnya, area hero proposal klien yang asimetris) untuk memecah kebosanan.
- **MOTION: 2 (Scroll-reveal & Transitions)**. Ada elemen transisi yang mulus saat *hover* atau saat komponen pertama kali masuk ke layar (*fade-up* ringan), tanpa *looping* yang mengganggu.

## 5. Antislop Core Directives
- **Tidak ada gradien biru/ungu** sebagai latar belakang.
- **Satu Aksen Saja**: Sage Green hanya digunakan di momen penting (CTA, nominal tagihan).
- **Radius**: Radius sedang (`rounded-lg` atau `rounded-xl`), menghindari bentuk *pill* di semua tempat.
- **Shadow**: Bayangan hanya untuk hierarki penting (modal, *dropdown*), bukan gaya bawaan setiap *card*.

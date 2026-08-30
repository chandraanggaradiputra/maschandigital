# 🤖 Standar Rekayasa Kode & Instruksi AI Agent Proyek "Mas Chan Digital"

Dokumen ini adalah **Instruksi Acuan Mutlak (Single Source of Truth)** bagi seluruh AI Agent di Antigravity yang bekerja pada proyek **Mas Chan Digital** (Marketplace & Direktori UMKM Lokal Kota Serang, Banten).

**Filosofi Utama**: *"Kode dan arsitektur yang baik itu kritis terhadap celah, jujur soal ketidakpastian, dan menolak asumsi tersembunyi — jika ada logika yang ambigu atau data tidak valid, identifikasi kelemahan tersebut dan sajikan solusi eksplisit, bukan menebak dan berharap kebetulan benar."*

---

## 🏢 Business Constants & Identitas Resmi (Mas Chan Digital)

- **Brand Name**: Mas Chan Digital (Marketplace & Direktori UMKM Lokal Kota Serang, Banten).
- **Official Business & Support WhatsApp**: `0822-9814-8474` (Format Internasional: `6282298148474`).
- **Official Support Email**: `admin@maschandigital.id`.
- **Frontend Domain (Next.js)**: `https://maschandigital.id`
- **Headless WordPress Backend**: `https://app.maschandigital.id`
- **Alamat Kantor**: Banten Indah Permai Blok E1 No.12A, Kelurahan Unyur, Kota Serang, Banten 42111, Indonesia.

---

## 🔴 5 Prinsip Rekayasa Kode Baku (Strict Engineering Principles)

### 1. Dilarang Keras Diam-Diam Fallback ke "Data Default" (Zero Silent Fallback)
* **Aturan**: Jika sesi login, token autentikasi, ID relasi, atau data kepemilikan tidak valid/kosong, sistem **WAJIB** mengembalikan **Error 401**, **Null**, atau **Array Kosong `[]`**.
* **Dilarang**: Menaruh fallback ID angka (seperti `author_id = 2`, `vendor_id = 1`) atau menampilkan nama entitas/toko tiruan. Nilai default *hanya* diperbolehkan untuk aset visual murni (seperti foto placeholder).

### 2. Logika Filter Harus Eksplisit (Anti-Dangling `return true`)
* **Aturan**: Setiap fungsi `.filter()` atau percabangan logika wajib memiliki evaluasi boolean yang eksplisit (`return Boolean(...)`).
* **Dilarang**: Mengakhiri fungsi filter dengan `return true;` liar yang berisiko meloloskan data yang seharusnya dikecualikan.

### 3. Satu Sumber Kebenaran & Fungsi Bersama (Single Source of Truth & Shared Logic)
* **Aturan**: Dua fungsi atau endpoint yang merepresentasikan aksi/data yang sama wajib menggunakan **fungsi bersama yang identik** di `lib/utils.ts` atau `lib/api/*.ts` (misal: `formatRupiah`, `normalizeWhatsAppNumber`).

### 4. Diagnostik Cache Server Terlebih Dahulu (Cache-First Diagnostic)
* **Aturan**: Seluruh endpoint REST API kustom yang dinamis/terkait status pengguna/transaksi wajib memuat header *cache bypass* eksplisit: `nocache_headers()`, `header('Cache-Control: no-cache, no-store, must-revalidate')`, `DONOTCACHEPAGE`, dan `LSCACHE_NO_CACHE`.

### 5. Strict Type Safety & Bebas `any` Liar
* **Aturan**: Dilarang menggunakan `any` sebagai jalan pintas. Seluruh struktur data wajib merujuk ke interface domain terdaftar di `types/index.ts`. Tangani error secara aman: `catch (err: unknown)` dengan pengecekan `if (err instanceof Error)`.

---

## 🧠 Standar Koding Next.js 16.3.3, React 19, & TypeScript 7

### 1. Kepatuhan React 19 & ESLint 9.39.5 (Flat Config)
- **Anti-Cascading-Render (`react-hooks/set-state-in-effect`)**:
  - Dilarang memanggil `setState()` secara sinkron langsung di badan utama `useEffect` saat mount.
  - Perhitungan nilai yang bergantung pada URL atau environment browser wajib diderivasi secara murni saat render atau saat event handler dijalankan.
- **Penanganan Asynchronous Route Params**:
  - Parameter `params` dan `searchParams` pada Server Component adalah `Promise`, selalu selesaikan secara aman:
    `const resolvedParams = await Promise.resolve(params);`
- **Pembersihan JSX & A11y**:
  - Dilarang menggunakan unescaped HTML characters (`'`, `"`, `<` dsb.) tanpa kurung kurawal atau entity name (`&apos;`, `&quot;`).
  - Setiap tag interaktif wajib menyertakan atribut aksesibilitas (`aria-label`, `role`, focus trap).

### 2. Verifikasi Kontrak REST API WordPress (`maschan-headless.php`)
- **Aturan**: Keberhasilan `npx tsc --noEmit` atau `npm run build` **TIDAK** membuktikan bahwa endpoint REST API benar-benar terdaftar di server WordPress.
- Setiap kali menambahkan pemanggilan `fetch('/wp-json/maschan/v1/...')` baru di frontend, **WAJIB** memastikan rute terdaftar resmi di `maschan-headless.php` via `register_rest_route()`.

### 3. Dilarang Silent Fallback ke URL Blob Lokal Pada Uploader
- Jika upload file ke server gagal, komponen uploader **DILARANG** menggunakan `URL.createObjectURL(blob)` sebagai fallback palsu yang seolah-olah sukses.
- Kegagalan upload harus dilaporkan sebagai error eksplisit ke pengguna. Endpoint media upload wajib diverifikasi menggunakan token JWT Bearer (`Authorization: Bearer <token>`).

### 4. Penanganan Nilai Bergantung Waktu (*Hydration-Safe Time Pattern*)
- Nilai waktu dinamis (seperti jam operasional toko `checkStoreStatus`) wajib dihitung di Server Component (`page.tsx`) dan dioper sebagai `initialStoreStatus`, lalu direvalidasi via `useEffect` pasca-mount di Client Component.

---

## 📱 Standar UI/UX Modern 2026 & Navigasi Adaptif Peran (Role-Adaptive)

### 1. Prinsip Mobile-First Navigation
- Di layar smartphone (`< md`), navigasi utama wajib bertumpu pada *Bottom Navigation Bar* (`fixed bottom-0 left-0 right-0 z-50 h-16`) dengan padding bawah yang aman (`pb-20 md:pb-0` pada kontainer halaman).

### 2. Adaptasi Dinamis Berdasarkan Sesi Pengguna:
- **Tamu / Publik (Guest)**:
  - *Header*: Logo Mas Chan Digital, Pencarian Produk/Toko, Tombol Daftar Mitra, Tombol Masuk/Login, Dark Mode.
  - *Bottom Nav*: [Beranda] [Katalog Produk] [Direktori Toko] [Keranjang] [Akun / Masuk].
- **Mitra Toko / Vendor (`role === 'vendor'`)**:
  - *Header*: Logo, Pencarian, Badge Nama Toko, Tombol [+ Tambah Produk], Dasbor Toko, Logout.
  - *Bottom Nav*: [Beranda] [Katalog] [➕ Tambah Produk (FAB Tengah)] [Pesanan Masuk] [Dasbor Toko].
- **Super Admin (`role === 'admin'`)**:
  - *Header*: Logo, Pencarian, Badge Super Admin, Dasbor Moderasi, Profil, Logout.
  - *Bottom Nav*: [Beranda] [Katalog] [🛡️ Moderasi Toko] [Kelola Invoice] [Dasbor Admin].

---

## 🚀 Protokol Git Otomatis Setiap Selesai Tugas

Setiap kali AI Agent selesai mengimplementasikan fitur atau memperbaiki bug, AI Agent **WAJIB** menjalankan urutan perintah:
1. `npx tsc --noEmit` (Memastikan 0 error TypeScript).
2. `npm run lint` (Memastikan 0 error linter).
3. `git add .`
4. `git commit -m "feat/fix: [ringkasan perubahan ringkas dan deskriptif]"`
5. `git push origin main`
# PANDUAN PENGEMBANGAN & STANDAR KODE AI AGENT (AGENTS.md)

## Proyek: Mas Chan Digital Marketplace (Kota Serang, Banten)

> Dokumen ini adalah **SOP Baku Proyek** untuk seluruh AI Agent (Google Antigravity, Claude Code, Cursor, dll). Setiap agen yang membaca repositori ini **WAJIB** mematuhi seluruh aturan, prinsip, dan batasan arsitektur di bawah ini tanpa pengecualian.

---

## 1\. Identitas Proyek & Konstanta Bisnis Resmi

- **Nama Brand**: Mas Chan Digital
- **Fokus Platform**: Direktori & Marketplace UMKM Lokal Kota Serang, Banten.
- **Model Transaksi**: Direct WhatsApp ke Penjual \+ Tautan Afiliasi Resmi (Bebas Biaya Gateway / 0% Potongan Fee).
- **Nomor Kontak Bantuan / WhatsApp Bisnis Resmi**: `0822-9814-8474` (Format Internasional: `6282298148474`).
- **Email Resmi**: `admin@maschandigital.id`.
- **Domain Frontend**: `https://maschandigital.id`
- **Domain Backend (Headless WordPress)**: `https://app.maschandigital.id`
- **Lokasi Geografis Target**: 6 Kecamatan di Kota Serang (Serang, Cipocok Jaya, Kasemen, Curug, Taktakan, Walantaka), Banten 42111\.

---

## 2\. Tech Stack & Arsitektur Utama

### Frontend (Next.js App Router)

- **Framework**: Next.js 16.3.1 (Turbopack, React 19, TypeScript).
- **Styling**: Tailwind CSS (Mobile-first responsive design, bottom navigation bar, dark/light theme, font Roboto Slab & Sans).
- **State & Auth**: `localStorage` (`maschan_vendor_session`) dengan event broadcasting (`maschan:auth-change`).

### Backend (Headless WordPress)

- **CMS**: WordPress Headless \+ WooCommerce \+ WCFM Marketplace (Multi-Vendor) \+ WPGraphQL \+ Rank Math SEO.
- **Core Engine**: Must-Use Plugin di `wp-content/mu-plugins/maschan-headless.php`.
- **Autentikasi**: Native JWT Bearer Token (Base64URL RFC 7519\) dengan bypass filter `rest_authentication_errors`.

---

## 3\. 5 Prinsip Rekayasa Kode Baku (Strict Engineering Principles)

### 🔴 Prinsip 1: Dilarang Keras Diam-Diam Fallback ke "Data Default" (Zero Silent Fallback)

- **Aturan**: Jika sesi login, token autentikasi, atau data kepemilikan tidak valid/kosong, sistem **WAJIB** mengembalikan **Error 401** atau **Array Kosong `[]`**.
- **Dilarang**: Menaruh fallback ID (seperti `author_id = 2`, `vendor_id = 1`) atau menampilkan seluruh data katalog saat sesi tidak terdeteksi. Nilai default _hanya_ diperbolehkan untuk aset visual murni (seperti foto placeholder).

### 🔴 Prinsip 2: Logika Filter Harus Eksplisit (Anti-Dangling `return true`)

- **Aturan**: Setiap fungsi `.filter()` atau percabangan logika wajib memiliki evaluasi boolean yang eksplisit (`return Boolean(...)`).
- **Dilarang**: Mengakhiri fungsi filter dengan `return true;` liar yang berisiko meloloskan kategori/entitas induk yang seharusnya dikecualikan.

### 🔴 Prinsip 3: Satu Sumber Kebenaran & Definisi Identik (Consistent Single Source of Truth)

- **Aturan**: Dua fungsi atau endpoint yang merepresentasikan data yang sama dari sudut pandang berbeda (misal: total produk di ringkasan vs daftar produk di katalog) wajib menggunakan kriteria status yang sama persis (`['publish', 'draft']`).

### 🔴 Prinsip 4: Diagnostik Cache Server Terlebih Dahulu (Cache-First Diagnostic)

- **Aturan**: Seluruh endpoint REST API kustom yang dinamis/terkait status pengguna wajib memuat header _cache bypass_ eksplisit: `nocache_headers()`, `header('Cache-Control: no-cache, no-store, must-revalidate')`, `DONOTCACHEPAGE`, dan `LSCACHE_NO_CACHE`.

### 🔴 Prinsip 5: Strict Type Safety & Bebas `any` Liar

- **Aturan**: Dilarang menggunakan `any` sebagai jalan pintas. Gunakan interface domain terstruktur di `types/index.ts`. Tangani error secara aman: `catch (err: unknown)` dengan pengecekan `if (err instanceof Error)`.

---

## 4\. Sistem Langganan Vendor (Paket Starter UMKM & Manual Transfer)

### A. Struktur 5 Paket Resmi (Single Source of Truth di `maschan_get_subscription_plans()`)

1. **`free_forever` (Paket Starter UMKM)**: Rp 0 | Masa Aktif Selamanya | Maks. **3 Produk**.
2. **`monthly_1m` (Paket 1 Bulan)**: Rp 30.000 | 30 Hari | Maks. **10 Produk**.
3. **`quarterly_3m` (Paket 3 Bulan)**: Rp 90.000 | 90 Hari | Maks. **10 Produk**.
4. **`biannual_6m` (Paket 6 Bulan)**: Rp 160.000 | 180 Hari | **Unlimited Produk** (Hemat Rp 20.000).
5. **`annual_1y` (Paket 1 Tahun VIP)**: Rp 280.000 | 365 Hari | **Unlimited Produk** (Hemat Rp 80.000 \+ Prioritas Beranda).

### B. Metode Pembayaran & Verifikasi

- **Metode**: Transfer Bank Manual (BCA/Mandiri/BSI/QRIS) dengan harga pas (_flat price_, tanpa kode unik).
- **Konfirmasi**: Vendor mengunggah foto struk transfer \+ input Nama Rekening Pengirim \+ tombol kirim WhatsApp ke Admin (`0822-9814-8474`).
- **Verifikasi Admin**: Single-click approval di endpoint `POST /maschan/v1/admin/billing/approve`.

### C. Aturan Khusus Autentikasi Admin Headless

// ❌ JANGAN PAKAI INI (Gagal pada REST API JWT)

if (\!current_user_can('manage_options')) { ... }

// ✅ WAJIB PAKAI INI

$admin\_id \= maschan\_get\_authenticated\_admin\_id($request);

if (\!$admin_id) { ... }

### D. Solusi "Admin Telat Verifikasi" & Gating Downgrade

- **Grace Protection Window**: Status `pending_approval` **menjamin toko vendor TETAP BUKA di publik** (tidak di-expire oleh cron), sehingga keterlambatan admin memverifikasi mutasi tidak merugikan vendor.
- **Kebijakan Downgrade**: Produk lama tidak pernah dihapus/disembunyikan. Sistem hanya memblokir penambahan produk BARU jika total produk saat ini $\\ge$ kuota paket aktif.
- **Hak Tambah Produk**: `renewal_due` diperbolehkan tambah produk (masa aktif masih sah). `grace_period` dan `payment_rejected` diblokir untuk tambah produk.

### E. Kebijakan Terbaru: Auto-Downgrade ke Starter (BUKAN Auto-Expire) — 21 Agustus 2026

- **Perubahan penting**: cron harian (saat dibangun nanti) yang mengevaluasi `grace_period` **TIDAK PERNAH** lagi mengubah status jadi `expired`. Vendor berbayar yang lewat masa tenggang tanpa bayar **otomatis diturunkan ke `active` + `free_forever`** (Paket Starter UMKM, kuota 3 produk) — toko TETAP TAMPIL di publik, cuma kuota produknya turun.
- **Konsekuensi**: status `expired` pada praktiknya tidak akan pernah dipicu otomatis oleh sistem lagi. Status ini dipertahankan di kode (`maschan_subscription_closes_store()`) HANYA untuk kemungkinan aksi manual admin di masa depan (belum dibangun) — jangan hapus dari union type/enum, tapi jangan andalkan sebagai bagian dari alur otomatis.
- **Status `trial` juga dipensiunkan** dari alur baru (pendaftar baru langsung `active` + `free_forever`, bukan `trial`). Tetap ada di kode untuk kompatibilitas data lama.
- **Downgrade manual oleh vendor**: vendor berbayar boleh pindah balik ke Starter kapan saja lewat `POST /billing/renew` dengan `plan_id: 'free_forever'`. Karena harganya Rp 0, endpoint ini **auto-approve langsung** (skip alur upload bukti transfer/`pending_approval`/approval admin sepenuhnya) — jangan tambahkan validasi bukti bayar untuk paket berharga Rp 0.
- **Endpoint migrasi vendor lama** (`POST /admin/billing/migrate-legacy-vendor`): mode `'trial'` sudah diganti jadi mode `'starter'` (karena `trial_30d` sudah tidak ada, digantikan `free_forever`). Kalau ada kode/dokumentasi lain yang masih menyebut mode `'trial'`, itu sudah usang — update ke `'starter'`.

### F. Prinsip Baru: Cek Utility yang Sudah Ada Sebelum Menulis Baru — 23 Agustus 2026

- **Sebelum menulis fungsi baru** (terutama di `lib/utils.ts`, `lib/api/*.ts`), **grep dulu** apakah sudah ada fungsi serupa. Kasus nyata: saat merancang Smart WhatsApp Order Form, hampir ada 2 implementasi berbeda untuk normalisasi nomor WhatsApp — padahal `normalizeWhatsAppNumber()` sudah ada dan dipakai 2 fungsi WA lain di `lib/utils.ts`. Semua fungsi pembangun URL WhatsApp (`generateWhatsApp*Url`) WAJIB ada di satu file itu, bukan ditulis inline di komponen.
- **Client Component yang butuh nilai bergantung waktu/status real-time** (mis. `checkStoreStatus()`, apa pun yang pakai `new Date()`/`Date.now()`): render pertama HARUS pakai nilai yang sudah dihitung di Server Component dan dioper sebagai prop — supaya HTML dari server dan hasil hydration di client sama persis. Kalau perlu revalidasi (data bisa berubah selama halaman terbuka lama), lakukan lewat `useEffect` SETELAH mount, bukan dihitung ulang saat render pertama. Pola referensinya: `components/product/OrderSection.tsx` (`initialStoreStatus` sebagai prop dari server, `useEffect` untuk revalidasi ringan) — sama filosofinya dengan pola `mounted` guard di `ThemeToggle.tsx`.

### G. Prinsip Baru: `tsc`/`eslint`/`build` Sukses TIDAK BERARTI Kontrak API Frontend-Backend Benar — 23 Agustus 2026

- **Kasus nyata**: `lib/api/wordpress.ts` (`getCategories()`) dan `MediaUploader.tsx` sudah lama memanggil `GET/POST /wp-json/maschan/v1/categories` dan `POST /wp-json/maschan/v1/media/upload` — tapi kedua endpoint itu **tidak pernah ada** di `maschan-headless.php`. `tsc --noEmit`, `eslint`, bahkan `npm run build` semuanya lolos 0 error, karena TypeScript cuma tahu bentuk data yang **diasumsikan**, bukan apakah endpoint-nya benar-benar ada di server. Baru ketahuan setelah ditelusuri manual.
- **Lebih berbahaya lagi**: karena `getCategories()` punya `catch` yang diam-diam kembalikan `[]`, kegagalan endpoint ini **tidak memunculkan error terlihat sama sekali** — cuma kategori kosong di mana-mana (footer, filter `/products`, sitemap). Ini persis kelas masalah "silent fallback" yang sudah berkali-kali kita hindari di level kode PHP — ternyata bisa juga terjadi di level "apakah endpoint API-nya ada".
- **Aturan wajib ke depannya**: setiap kali menambah/mengubah fungsi di `lib/api/*.ts` yang memanggil endpoint baru (`/wp-json/maschan/v1/...`), **WAJIB** cross-check langsung ke `maschan-headless.php` — pastikan `register_rest_route()` untuk path & method (GET/POST) itu benar-benar terdaftar. Jangan asumsikan endpoint "pasti sudah ada" hanya karena kodenya lolos type-check. Kalau menulis endpoint PHP baru, lakukan pengecekan sebaliknya juga: pastikan ada pemanggil di frontend yang benar-benar memakainya (endpoint yang tidak pernah dipanggil = kemungkinan besar salah asumsi kontrak).
- **Tambahan dari kasus yang sama**: `MediaUploader.tsx` ternyata juga punya fallback berbahaya — kalau upload gagal, dulu diam-diam pakai `URL.createObjectURL()` (blob URL lokal browser) sebagai pengganti dan tetap lapor "berhasil" ke form. Blob URL cuma valid di sesi browser saat itu — kalau tersimpan ke database (misal form produk disubmit), jadi link rusak permanen begitu halaman ditutup. Sudah diperbaiki: sekarang gagal upload berarti PREVIEW KOSONG + PESAN ERROR JELAS, bukan data palsu yang terlihat berhasil. Prinsipnya sama dengan "Zero Silent Fallback" di bagian 3 — berlaku juga untuk fallback di level UI, bukan cuma di level PHP.

---

## 5\. UI, Komponen, & Alur Navigasi

1. **Jam Buka & Mode Libur Real-Time (`lib/storeStatus.ts`)**:
   - Memvalidasi 7-hari jam operasional dan `vacation_mode`.
   - Jika toko libur/tutup, tombol checkout WhatsApp di `<ProductCard />` otomatis digantikan dengan tombol disabled berlogo close/lock (**"Toko Sedang Libur"** / **"Toko Sedang Tutup"**).
2. **Keamanan Rendering React 19 / Turbopack**:
   - Selalu gunakan composite unique keys pada looping array: `key={item.id ? \`entity-${item.id}-${item.slug}-${index}\` : \`entity-idx-${index}\`}\`.
3. **Alur Logout Bersih**:
   - `clearVendorSession()` membersihkan `localStorage`, memancarkan event `maschan:auth-change`, dan mengarahkan kembali ke Beranda (`/`) sebagai pengunjung biasa tanpa akun aktif (`window.location.href = '/'`).
4. **Proteksi Dashboard**:
   - Akses unauthenticated ke `/dashboard/*` otomatis dialihkan ke `/vendor/login`.

---

## 6\. Checklist Verifikasi Sebelum Menyatakan Tugas Selesai

- [ ] Jalankan `npx tsc --noEmit` untuk memastikan 0 error TypeScript di seluruh project.
- [ ] Pastikan tidak ada fallback hardcoded ID (seperti `vendor_id = 2` atau `author_id = 2`).
- [ ] Uji kasus _data kosong_ (tidak ada sesi login $\\rightarrow$ pastikan tampil error 401 / array kosong, bukan data vendor lain).
- [ ] Pastikan seluruh evaluasi filter boolean bersifat eksplisit tanpa _dangling `return true`_.
- [ ] Pastikan nomor kontak resmi yang digunakan adalah **`0822-9814-8474`**.
- [ ] Kalau menambah/mengubah pemanggilan `/wp-json/maschan/v1/...` di `lib/api/*.ts` atau komponen manapun, **cross-check langsung** ke `maschan-headless.php` — pastikan `register_rest_route()` untuk path & method itu benar-benar terdaftar. `tsc`/`eslint`/`build` sukses TIDAK membuktikan endpoint-nya ada (lihat bagian 4G).

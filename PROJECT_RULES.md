# Panduan & Standar Koding Mas Chan Digital

## Profil Bisnis & Kontak Resmi:

- Nama Platform: Mas Chan Digital (Marketplace & Direktori UMKM Kota Serang)
- WhatsApp Resmi: 0822-9814-8474 (Format: 6282298148474)
- Email Pengirim Resmi: admin@maschandigital.id
- Domain Frontend: https://maschandigital.id
- Backend WordPress: https://app.maschandigital.id

## 5 Prinsip Rekayasa Baku:

1. Zero Silent Fallback: Dilarang keras membuat fallback ID palsu jika sesi login kosong.
2. Filter Eksplisit: Seluruh percabangan .filter() wajib boolean eksplisit (return Boolean(...)).
3. Hydration-Safe Time: Jam operasional toko dihitung di server, lalu direvalidasi aman di client.
4. Strict TypeScript: Bebas dari tipe 'any' liar, gunakan tipe dari types/index.ts.
5. Verifikasi Kontrak API: Setiap endpoint fetch wajib cocok dengan register_rest_route() di maschan-headless.php.

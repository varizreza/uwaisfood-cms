# Uwais Food CMS

CMS terpisah untuk mengelola website https://uwaisfood.my.id melalui https://cms.uwaisfood.my.id.

## Frontend tersedia
- `index.html`: login dan workspace CMS.
- `assets/cms.css`: tampilan Material 3 Expressive Dark AMOLED responsif.
- `assets/cms.js`: navigasi editor, draft lokal, dan klien API Apps Script.
- `CNAME`: custom domain `cms.uwaisfood.my.id`.

## Aktifkan GitHub Pages
1. Buka Settings → Pages pada repository ini.
2. Pilih **Deploy from a branch**, branch `main`, folder `/(root)`.
3. Pastikan custom domain `cms.uwaisfood.my.id`.
4. Setelah DNS dan sertifikat siap, aktifkan **Enforce HTTPS**.

## Integrasi backend wajib sebelum dipakai
Frontend menyiapkan kontrak POST JSON ke Google Apps Script Admin Uwais Food:
- `namespace: "websiteCms"`
- action `login` dengan `pin`
- action `getDraft`
- action `saveDraft` dengan `content`
- action `publish` dengan `content`

Backend harus memvalidasi PIN memakai mekanisme autentikasi Admin yang sebenarnya, menerbitkan token sesi yang kedaluwarsa, memvalidasi token pada setiap operasi, serta menyimpan draft/publikasi ke Spreadsheet. Jangan pernah menaruh PIN atau token dalam source frontend.

**Penting:** source `Code.gs` produksi tidak tersedia pada repository CMS atau website publik yang saya periksa. Karena itu addon Apps Script dan integrasi website publik belum dipasang atau diuji. Sampai backend disesuaikan dengan project Admin produksi, login, penyimpanan server, dan publikasi belum aktif. Draft lokal hanya tersimpan di browser.

## Integrasi website publik
Website showcase saat ini memakai `config.js`, `assets/app.js`, dan `data/products.json`. Perlu patch tambahan agar konten CMS yang sudah dipublikasikan dibaca website publik, tanpa mengekspos data pelanggan, transaksi, PIN, atau token.

## Fitur antarmuka
- Dashboard CMS.
- Beranda: pengumuman, judul, deskripsi, banner, tombol.
- Produk Website.
- Promo & Galeri.
- Profil Toko.
- Kontak & Sosial.
- SEO Website.
- Draft lokal, pratinjau website, dan tombol publikasi (publikasi memerlukan backend).


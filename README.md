# Uwais Food CMS

Panel khusus untuk mengelola konten website utama https://uwaisfood.my.id melalui https://cms.uwaisfood.my.id.

## File frontend
- `index.html`: login dan workspace.
- `assets/cms.css`: desain responsif Dark AMOLED.
- `assets/cms.js`: editor, upload gambar, autentikasi, draft dan publikasi.
- `CNAME`: custom domain `cms.uwaisfood.my.id`.

## Aktifkan GitHub Pages
1. Buka Settings → Pages.
2. Pilih Deploy from a branch, branch `main`, folder `/(root)`.
3. Pastikan Custom domain adalah `cms.uwaisfood.my.id`.
4. Aktifkan Enforce HTTPS setelah DNS dan sertifikat siap.

## Backend Apps Script (harus dipasang)
1. Tambahkan `apps-script/WebsiteCMS_Addon.gs` sebagai file .gs baru pada project Admin.
2. Ikuti langkah persis di `apps-script/PATCH-INTEGRASI-CODEGS.md`: daftarkan lima action CMS pada dispatcher api_() dan dua parameter publik pada doGet(e).
3. Jangan mengganti Code.gs utama.
4. Deploy Apps Script sebagai New version dengan URL Web App /exec yang sama.
5. Login ke CMS menggunakan URL /exec dan PIN Admin Uwais Food.

Addon menyimpan data pada sheet baru `WebsiteCMS` dan `WebsiteCMS_Log`. Sheet transaksi, PO, Menu, Pelanggan, dan HPP tidak diubah. Draft dan publikasi menggunakan autentikasi `auth_(token)` dari backend yang sudah ada.

## Fitur
- Dashboard status CMS dan publikasi.
- Beranda: pengumuman, judul, deskripsi, gambar banner, tombol.
- Produk: tampil/sembunyikan, unggulan, label, urutan. Nama/harga/deskripsi/foto tetap berasal dari sheet Menu.
- Promo & galeri: teks, gambar utama, upload galeri.
- Profil toko: cerita, lokasi, jam operasional dan kutipan.
- Kontak: WhatsApp, Instagram, Google Maps.
- SEO: title, description, Open Graph image.
- Simpan draft, preview, publikasi dan catatan riwayat.

## Integrasi website publik
Setelah backend addon dipasang, endpoint publik adalah:
`https://script.google.com/macros/s/ID_DEPLOYMENT/exec?websiteCmsPublic=1`
Endpoint JSONP kompatibel dengan website showcase. URL ini hanya mengirim konten yang sudah dipublikasikan dan data katalog publik. Untuk mengaktifkannya pada website, isi `catalogUrl` di `config.js` repo website utama dengan URL endpoint di atas.

## Keamanan
- Jangan pernah memasukkan PIN, token, API key, atau data pesanan pada file publik.
- Endpoint baca/tulis CMS memvalidasi token sesi melalui fungsi `auth_(token)`.
- Foto CMS disimpan pada folder Drive terpisah; tautan foto dipublikasi agar dapat ditampilkan di website.
- Jika kebijakan Google Workspace membatasi "Anyone with the link", upload foto akan ditolak oleh Apps Script.

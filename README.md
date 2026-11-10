# Uwais Food CMS

CMS khusus untuk mengelola konten website https://uwaisfood.my.id.
Target domain: https://cms.uwaisfood.my.id

## Arsitektur
- Frontend CMS: GitHub Pages pada repository ini.
- Backend dan autentikasi: Google Apps Script Admin Uwais Food.
- Penyimpanan draft/publikasi: Google Spreadsheet Admin Uwais Food, sheet `WebsiteCMS`.
- Website publik membaca hanya data yang telah dipublikasikan melalui endpoint JSONP `?websiteCmsPublic=1`.

CMS tidak menyimpan PIN atau token di source code. Admin login menggunakan PIN aplikasi Uwais Food; token hanya disimpan di sesi browser.

## Instalasi GitHub Pages
1. Buka Settings → Pages.
2. Pilih Deploy from a branch, branch `main`, folder `/ (root)`.
3. Simpan custom domain `cms.uwaisfood.my.id`.
4. Pastikan file `CNAME` berisi `cms.uwaisfood.my.id`.
5. Tunggu DNS/HTTPS tervalidasi, lalu aktifkan Enforce HTTPS.

## Instalasi Apps Script
1. Tambahkan `apps-script/WebsiteCMS_Addon.gs` sebagai file .gs baru pada project Apps Script Admin yang sama dengan Code.gs v11.3.5.
2. Ikuti `apps-script/PATCH-DOGET-AND-DISPATCHER.txt` untuk mendaftarkan tiga API CMS dan endpoint publik. Jangan membuat doGet kedua.
3. Deploy Web App sebagai versi baru dan pastikan akses web app tetap sesuai pengaturan Admin.
4. Masukkan URL Web App berakhiran /exec pada halaman login CMS.

## Integrasi website publik
Tambahkan pemanggilan endpoint CMS ke website showcase sesuai panduan `website-integration/PATCH-WEBSITE.md`. CMS memublikasikan konten ke Spreadsheet; website membaca data publik saja.

## Fitur
- Beranda: pengumuman, judul, deskripsi, banner, tombol.
- Produk: tampil/sembunyikan, unggulan, label, urutan (detail nama/harga/foto tetap dari sheet Menu Admin).
- Promo & galeri: konten promo dan foto.
- Profil toko: deskripsi, lokasi, jam operasional.
- Kontak: WhatsApp, Instagram, Google Maps.
- SEO: title, description, Open Graph image.
- Draft, preview, publish, status publikasi.

## Keamanan
- Endpoint publik hanya mengirim konten yang telah dipublikasikan dan field katalog publik.
- Endpoint baca/tulis CMS di API POST membutuhkan token hasil login PIN Admin.
- Jangan menaruh PIN, token, API key, atau data pelanggan di repository publik.

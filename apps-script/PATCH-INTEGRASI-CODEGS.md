# PATCH INTEGRASI BACKEND CMS — UWAIS FOOD

Paket dibuat untuk source Admin yang tersimpan sebagai `Code(20261110-054648).gs` (header v11.3.2). Patch ini hanya menambah fungsi baru dan mengubah dua titik routing. Jangan mengganti seluruh Code.gs.

## 1. Tambahkan file Apps Script
Di Apps Script Admin Uwais Food, buat file baru bernama `WebsiteCMS_Addon.gs`.
Salin seluruh isi file `apps-script/WebsiteCMS_Addon.gs` dari repository ini.

Addon menggunakan fungsi yang telah tersedia pada backend:
- `auth_(token)` untuk memvalidasi token sesi Admin
- `login(pin)` untuk PIN Admin yang sudah ada
- `ss_()` untuk Spreadsheet Uwais Food yang sama
- `menu_()` untuk daftar produk dari sheet Menu

Addon membuat dua sheet baru saja:
- `WebsiteCMS` untuk draft, publikasi, dan metadata publikasi.
- `WebsiteCMS_Log` untuk riwayat perubahan CMS.

Tidak mengubah sheet transaksi, stok/PO, pelanggan, pembayaran, atau HPP.

## 2. Daftarkan action CMS pada dispatcher api_()
Pada `Code.gs`, cari fungsi `api_(action, args)`. Di dalam objek `fns`, tambahkan lima nama ini:

```javascript
cms_login, cms_getDraft, cms_saveDraft, cms_publish, cms_uploadImage
```

Contoh letak:
```javascript
const fns = {
  login, getData, addOrder,
  // ... semua action lama jangan dihapus ...
  customer_adminOrderAlerts,
  cms_login, cms_getDraft, cms_saveDraft, cms_publish, cms_uploadImage
};
```

Jangan membuat fungsi api_() kedua.

## 3. Daftarkan endpoint publik pada doGet(e)
Pada awal fungsi `doGet(e)`, sebelum pengecekan parameter `action`, tambahkan:

```javascript
if (e && e.parameter &&
    (e.parameter.websiteCmsPublic === '1' || e.parameter.publicCatalog === '1')) {
  return cms_publicResponse_(e);
}
```

Jika fungsi doGet Anda sudah memiliki blok `publicCatalog`, ganti blok lama tersebut dengan potongan di atas agar URL katalog lama tetap bekerja dan menerima konten CMS terbaru.

Jangan membuat doGet kedua.

## 4. Simpan dan deploy
1. Simpan semua file.
2. Deploy > Manage deployments > Edit deployment Web App > New version > Deploy.
3. Pertahankan URL deployment /exec yang sama.
4. Saat pertama kali CMS upload foto, Apps Script mungkin meminta otorisasi Google Drive.

## 5. Kontrak API yang digunakan CMS
Request memakai pola API yang sudah dipakai Admin:
`POST { "action": "cms_login", "args": ["PIN"] }`
`POST { "action": "cms_getDraft", "args": ["TOKEN"] }`
`POST { "action": "cms_saveDraft", "args": ["TOKEN", CONTENT] }`
`POST { "action": "cms_publish", "args": ["TOKEN", CONTENT] }`
`POST { "action": "cms_uploadImage", "args": ["TOKEN", FILENAME, MIMETYPE, BASE64] }`

Respons tetap memakai format lama `{ok:true,data:...}`.

Endpoint publik:
- `/exec?websiteCmsPublic=1`
- JSONP: `/exec?websiteCmsPublic=1&callback=namaCallback`
- URL lama `/exec?publicCatalog=1` juga diarahkan ke payload publik CMS setelah patch dipasang.

Payload publik hanya mengandung konten website dan kolom katalog publik dari sheet Menu. PIN, token, pesanan, alamat/nomor pelanggan, konfigurasi QRIS, dan data internal tidak disertakan.

## 6. Catatan keamanan dan pengujian
- Repository CMS frontend bersifat publik; PIN dan token tidak ditanam pada file.
- PIN hanya dikirim saat login melalui HTTPS. Token disimpan pada sessionStorage browser.
- Draft/publikasi tersimpan di Spreadsheet dan setiap operasi edit memanggil auth_().
- Foto disimpan di folder Drive khusus CMS. Link gambar hanya dibuat publik agar dapat ditampilkan pada website.
- Lakukan tes terlebih dahulu: login, simpan draft, muat ulang, publikasi, buka endpoint publik, kemudian periksa website.
- Jika kebijakan Google Workspace melarang Drive Anyone with link, fitur upload gambar akan mengembalikan pesan gagal; jangan ubah akses folder transaksi/dokumen pelanggan.


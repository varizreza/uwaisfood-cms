# Tombol Kelola Website pada Admin Uwais Food

Agar Admin Uwais Food memiliki shortcut ke panel CMS terpisah, tambahkan tombol yang membuka `https://cms.uwaisfood.my.id` pada sidebar.

## Desktop dan sidebar mobile
Pada HTML Admin Uwais Food, cari template sidebar di dalam fungsi `render()`. Temukan baris:

```javascript
<div class="nav-label nav-label-gap">PENGELOLAAN</div>${DESKTOP_MGMT.map(sideButton).join('')}
```

Ganti dengan:

```javascript
<div class="nav-label nav-label-gap">PENGELOLAAN</div>${DESKTOP_MGMT.map(sideButton).join('')}
<button class="nv" type="button" onclick="window.open('https://cms.uwaisfood.my.id','_blank','noopener')">
  <span class="nv-ico">🌐</span><span>Kelola Website</span>
</button>
```

Tombol ini membuka CMS pada tab baru dan tidak mengubah navigasi internal, sesi PIN Admin, atau transaksi.

## Mobile menu "Lainnya" (opsional)
Pada fungsi `vLainnya()`, setelah array `items` selesai dibuat dan sebelum template HTML dikembalikan, dapat ditambahkan kartu tautan terpisah:

```javascript
<a class="more-card" href="https://cms.uwaisfood.my.id" target="_blank" rel="noopener">
  <span class="more-icon">🌐</span>
  <span class="more-copy"><b>Kelola Website</b><small>Atur konten website Uwais Food</small><em>Buka CMS →</em></span>
  <span class="more-arrow">›</span>
</a>
```

Jika menambahkan kartu mobile, sisipkan ke dalam container `.more-grid` di sebelah kartu yang sudah ada. Jangan mengganti atau menghapus item PO, Pelanggan, Menu Produk, HPP, maupun Pengaturan.

Setelah menyimpan Index.html, deploy Apps Script sebagai versi baru.

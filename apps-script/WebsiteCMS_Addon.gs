/**
 * UWAIS FOOD — WEBSITE CMS ADDON
 * Add-on terpisah untuk Code.gs Admin Uwais Food.
 *
 * Kebutuhan dari Code.gs utama:
 * - auth_(token) untuk verifikasi sesi admin
 * - ss_() untuk Spreadsheet yang sama
 * - menu_() untuk membaca katalog Menu
 * - dispatcher api_() mendaftarkan lima aksi CMS (lihat file PATCH...)
 *
 * Addon ini tidak mengubah sheet Orders, PO, Menu, Pelanggan, atau data HPP.
 */

/** Wrapper API publik internal: login menggunakan mekanisme PIN Admin yang sama. */
function cms_login(pin) {
  return login(pin);
}

const UWAIS_CMS_SHEET = 'WebsiteCMS';
const UWAIS_CMS_LOG_SHEET = 'WebsiteCMS_Log';
const UWAIS_CMS_IMAGE_FOLDER_KEY = 'UWAIS_CMS_IMAGE_FOLDER_ID';

function uwaisCmsDefaults_() {
  return {
    schemaVersion: 1,
    home: {
      announcement: 'Homemade with love, freshly made for you',
      headline: 'Bahagia itu\nsesederhana\ngigitan pertama.',
      description: 'Temukan kelezatan bakery homemade dengan bahan pilihan, rasa istimewa, dan sentuhan hangat di setiap sajian.',
      heroImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1100&q=85',
      primaryButton: 'Jelajahi Produk',
      primaryLink: '#produk',
      secondaryButton: 'Kenali Uwais Food',
      secondaryLink: '#tentang'
    },
    products: { note: 'Ketersediaan produk dan harga dapat berubah. Silakan konfirmasi sebelum memesan.', items: [] },
    promo: {
      title: 'Bukan sekadar\nrasa, tapi juga\ncerita.',
      description: 'Kami percaya hal sederhana bisa menjadi istimewa. Karena itu, setiap produk Uwais Food dibuat dengan perhatian pada rasa, kualitas, dan detail kecil yang membuat hari lebih menyenangkan.',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=85',
      gallery: []
    },
    profile: {
      title: 'Hangatnya homemade,\nistimewanya setiap momen.',
      description: 'Uwais Food hadir untuk menemani momen kecil maupun spesial melalui sajian bakery homemade. Kami ingin setiap gigitan membawa rasa nyaman, bahagia, dan kehangatan.',
      location: 'Tanjungpinang, Kepulauan Riau',
      quote: 'Setiap sajian punya cerita. Kami senang bisa menjadi bagian dari ceritamu.',
      quoteAuthor: 'Uwais Food',
      openingHours: ''
    },
    contact: {
      whatsapp: '6282221021094',
      whatsappMessage: 'Halo Uwais Food, saya ingin bertanya tentang produk.',
      instagram: 'https://www.instagram.com/uwaisfood_id/',
      maps: ''
    },
    seo: {
      title: 'Uwais Food — Homemade with Love',
      description: 'Homemade bakery dengan cita rasa istimewa. Temukan bolen pisang, banana milk cheese, cheesecake, dan hampers premium.',
      ogImage: ''
    }
  };
}

function uwaisCmsText_(value, maxLength, fallback) {
  var s = value == null ? '' : String(value);
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
  if (!s && fallback != null) s = String(fallback);
  return s.slice(0, maxLength);
}

function uwaisCmsUrl_(value, allowAnchor) {
  var s = String(value == null ? '' : value).trim();
  if (!s) return '';
  if (allowAnchor && /^#[A-Za-z][A-Za-z0-9_-]{0,60}$/.test(s)) return s;
  return /^https:\/\/[^\s"'<>]{1,1800}$/i.test(s) ? s : '';
}

function uwaisCmsSlug_(value) {
  var s = String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 55);
  return s || 'produk';
}

function uwaisCmsNormalizeContent_(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Format konten CMS tidak valid.');
  var d = uwaisCmsDefaults_();
  var home = input.home || {};
  var products = input.products || {};
  var promo = input.promo || {};
  var profile = input.profile || {};
  var contact = input.contact || {};
  var seo = input.seo || {};

  var items = Array.isArray(products.items) ? products.items.slice(0, 150) : [];
  var cleanItems = [];
  var seen = {};
  items.forEach(function(x) {
    if (!x || typeof x !== 'object') return;
    var id = uwaisCmsSlug_(x.id);
    if (seen[id]) return;
    seen[id] = true;
    cleanItems.push({
      id: id,
      active: x.active !== false,
      featured: x.featured === true,
      tag: uwaisCmsText_(x.tag, 36, ''),
      sort: Math.max(0, Math.min(9999, Math.floor(Number(x.sort) || 0)))
    });
  });

  var gallery = Array.isArray(promo.gallery) ? promo.gallery : [];
  gallery = gallery.slice(0, 15).map(function(x) { return uwaisCmsUrl_(x, false); }).filter(Boolean);

  var number = String(contact.whatsapp == null ? d.contact.whatsapp : contact.whatsapp).replace(/\D/g, '').slice(0, 15);
  var clean = {
    schemaVersion: 1,
    home: {
      announcement: uwaisCmsText_(home.announcement, 140, d.home.announcement),
      headline: uwaisCmsText_(home.headline, 240, d.home.headline),
      description: uwaisCmsText_(home.description, 600, d.home.description),
      heroImage: uwaisCmsUrl_(home.heroImage, false) || d.home.heroImage,
      primaryButton: uwaisCmsText_(home.primaryButton, 50, d.home.primaryButton),
      primaryLink: uwaisCmsUrl_(home.primaryLink, true) || d.home.primaryLink,
      secondaryButton: uwaisCmsText_(home.secondaryButton, 50, d.home.secondaryButton),
      secondaryLink: uwaisCmsUrl_(home.secondaryLink, true) || d.home.secondaryLink
    },
    products: {
      note: uwaisCmsText_(products.note, 240, d.products.note),
      items: cleanItems
    },
    promo: {
      title: uwaisCmsText_(promo.title, 180, d.promo.title),
      description: uwaisCmsText_(promo.description, 600, d.promo.description),
      image: uwaisCmsUrl_(promo.image, false) || d.promo.image,
      gallery: gallery
    },
    profile: {
      title: uwaisCmsText_(profile.title, 180, d.profile.title),
      description: uwaisCmsText_(profile.description, 800, d.profile.description),
      location: uwaisCmsText_(profile.location, 160, d.profile.location),
      quote: uwaisCmsText_(profile.quote, 280, d.profile.quote),
      quoteAuthor: uwaisCmsText_(profile.quoteAuthor, 80, d.profile.quoteAuthor),
      openingHours: uwaisCmsText_(profile.openingHours, 160, '')
    },
    contact: {
      whatsapp: number,
      whatsappMessage: uwaisCmsText_(contact.whatsappMessage, 240, d.contact.whatsappMessage),
      instagram: uwaisCmsUrl_(contact.instagram, false) || d.contact.instagram,
      maps: uwaisCmsUrl_(contact.maps, false)
    },
    seo: {
      title: uwaisCmsText_(seo.title, 120, d.seo.title),
      description: uwaisCmsText_(seo.description, 300, d.seo.description),
      ogImage: uwaisCmsUrl_(seo.ogImage, false)
    }
  };

  var json = JSON.stringify(clean);
  if (json.length > 42000) throw new Error('Konten terlalu besar. Kurangi jumlah foto galeri atau teks.');
  return clean;
}

function uwaisCmsSheet_() {
  var ss = ss_();
  var sh = ss.getSheetByName(UWAIS_CMS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(UWAIS_CMS_SHEET);
    sh.getRange(1, 1, 1, 4).setValues([['KEY', 'JSON_VALUE', 'UPDATED_AT', 'UPDATED_BY']]);
    sh.setFrozenRows(1);
  } else if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 4).setValues([['KEY', 'JSON_VALUE', 'UPDATED_AT', 'UPDATED_BY']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function uwaisCmsRead_(key, fallback) {
  var sh = uwaisCmsSheet_();
  var last = sh.getLastRow();
  if (last < 2) return fallback;
  var rows = sh.getRange(2, 1, last - 1, 2).getValues();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i][0]) === key) {
      try { return JSON.parse(String(rows[i][1] || '')); } catch (_) { return fallback; }
    }
  }
  return fallback;
}

function uwaisCmsWrite_(key, content) {
  var sh = uwaisCmsSheet_();
  var last = sh.getLastRow();
  var row = 0;
  if (last >= 2) {
    var keys = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = keys.length - 1; i >= 0; i--) {
      if (String(keys[i][0]) === key) { row = i + 2; break; }
    }
  }
  var values = [[key, JSON.stringify(content), new Date(), 'Admin']];
  if (row) sh.getRange(row, 1, 1, 4).setValues(values);
  else sh.appendRow(values[0]);
}

function uwaisCmsLog_(action, detail) {
  var ss = ss_();
  var sh = ss.getSheetByName(UWAIS_CMS_LOG_SHEET);
  if (!sh) {
    sh = ss.insertSheet(UWAIS_CMS_LOG_SHEET);
    sh.appendRow(['WAKTU', 'AKSI', 'RINGKASAN']);
    sh.setFrozenRows(1);
  }
  sh.appendRow([new Date(), String(action || ''), uwaisCmsText_(detail, 180, '')]);
}

function uwaisCmsCatalog_(content, includeHidden) {
  var rows = menu_().getDataRange().getValues();
  var settings = {};
  var items = content && content.products && Array.isArray(content.products.items) ? content.products.items : [];
  items.forEach(function(x) { settings[String(x.id)] = x; });
  var products = [];
  var usedIds = {};
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var name = String(row[0] == null ? '' : row[0]).trim();
    if (!name) continue;
    var slug = uwaisCmsSlug_(name);
    var id = 'menu-' + slug;
    if (usedIds[id]) id += '-' + i;
    usedIds[id] = true;
    var opt = settings[id] || {};
    if (opt.active === false && !includeHidden) continue;
    var rawPrice = row[1];
    var price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice);
    if (!isFinite(price)) price = Number(String(rawPrice || '').replace(/[^0-9-]/g, '')) || 0;
    price = Math.max(0, Math.round(price));
    var image = String(row[3] == null ? '' : row[3]).trim();
    if (!/^https:\/\//i.test(image)) image = '';
    var nameLower = name.toLowerCase();
    var category = /(cake|cheese cake|dessert|puding|pudding|tiramisu)/i.test(nameLower) ? 'cake' :
      (/(hampers|parcel|gift|bingkisan|paket hadiah)/i.test(nameLower) ? 'hampers' : 'pastry');
    products.push({
      id: id,
      name: name,
      category: category,
      categoryLabel: category === 'cake' ? 'Cake & Dessert' : (category === 'hampers' ? 'Hampers' : 'Pastry'),
      description: String(row[2] == null ? '' : row[2]).slice(0, 400),
      price: price,
      priceLabel: price > 0 ? 'Rp' + price.toLocaleString('id-ID') : 'Hubungi kami',
      unit: '',
      tag: uwaisCmsText_(opt.tag, 36, opt.featured ? 'PILIHAN FAVORIT' : ''),
      featured: opt.featured === true,
      sort: Math.max(0, Number(opt.sort) || i),
      image: image,
      active: opt.active !== false
    });
  }
  products.sort(function(a, b) { return a.sort - b.sort || a.name.localeCompare(b.name, 'id'); });
  return products;
}

function cms_getDraft(token) {
  auth_(token);
  var content = uwaisCmsRead_('DRAFT', null) || uwaisCmsRead_('PUBLISHED', null) || uwaisCmsDefaults_();
  content = uwaisCmsNormalizeContent_(content);
  return {
    content: content,
    products: uwaisCmsCatalog_(content),
    publishedAt: uwaisCmsRead_('PUBLISHED_META', {})
  };
}

function cms_saveDraft(token, content) {
  auth_(token);
  var clean = uwaisCmsNormalizeContent_(content);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    uwaisCmsWrite_('DRAFT', clean);
    uwaisCmsLog_('SAVE_DRAFT', 'Draft konten website diperbarui');
    return { saved: true, content: clean };
  } finally {
    lock.releaseLock();
  }
}

function cms_publish(token, content) {
  auth_(token);
  var clean = uwaisCmsNormalizeContent_(content);
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    uwaisCmsWrite_('DRAFT', clean);
    uwaisCmsWrite_('PUBLISHED', clean);
    var meta = { publishedAt: new Date().toISOString(), publishedBy: 'Admin' };
    uwaisCmsWrite_('PUBLISHED_META', meta);
    uwaisCmsLog_('PUBLISH', 'Konten website dipublikasikan');
    return { published: true, meta: meta };
  } finally {
    lock.releaseLock();
  }
}

function cms_uploadImage(token, fileName, mimeType, base64) {
  auth_(token);
  mimeType = String(mimeType || '').toLowerCase();
  if (['image/jpeg', 'image/png', 'image/webp'].indexOf(mimeType) < 0) {
    throw new Error('Format gambar harus JPG, PNG, atau WEBP.');
  }
  base64 = String(base64 || '').replace(/^data:[^,]+,/, '').replace(/\s/g, '');
  if (!base64 || base64.length > 1700000) throw new Error('Gambar kosong atau terlalu besar.');
  var bytes = Utilities.base64Decode(base64);
  if (!bytes.length || bytes.length > 1250000) throw new Error('Ukuran gambar maksimal 1,25 MB.');
  var props = PropertiesService.getScriptProperties();
  var folderId = props.getProperty(UWAIS_CMS_IMAGE_FOLDER_KEY);
  var folder;
  if (folderId) {
    try { folder = DriveApp.getFolderById(folderId); } catch (_) { folder = null; }
  }
  if (!folder) {
    folder = DriveApp.createFolder('Uwais Food - Website CMS');
    props.setProperty(UWAIS_CMS_IMAGE_FOLDER_KEY, folder.getId());
  }
  var safeName = String(fileName || 'website-image').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80);
  var ext = mimeType === 'image/jpeg' ? 'jpg' : (mimeType === 'image/png' ? 'png' : 'webp');
  var file = folder.createFile(Utilities.newBlob(bytes, mimeType, safeName + '.' + ext));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    file.setTrashed(true);
    throw new Error('Drive tidak mengizinkan berbagi gambar dengan tautan. Periksa kebijakan berbagi Google Drive.');
  }
  return {
    id: file.getId(),
    name: file.getName(),
    url: 'https://drive.google.com/thumbnail?id=' + encodeURIComponent(file.getId()) + '&sz=w1600'
  };
}

function cms_publicPayload_() {
  var published = uwaisCmsRead_('PUBLISHED', null);
  if (!published) {
    published = uwaisCmsDefaults_();
  } else {
    published = uwaisCmsNormalizeContent_(published);
  }
  return {
    success: true,
    brand: 'Uwais Food',
    updatedAt: new Date().toISOString(),
    content: published,
    products: uwaisCmsCatalog_(published)
  };
}

function cms_publicResponse_(e) {
  try {
    var data = cms_publicPayload_();
    var json = JSON.stringify(data);
    var callback = String((e && e.parameter && e.parameter.callback) || '').trim();
    if (callback) {
      if (!/^[A-Za-z_$][0-9A-Za-z_$]{0,99}$/.test(callback)) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Callback tidak valid' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(callback + '(' + json + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var failed = { success: false, error: String(err && err.message ? err.message : err) };
    var cb = String((e && e.parameter && e.parameter.callback) || '').trim();
    if (cb && /^[A-Za-z_$][0-9A-Za-z_$]{0,99}$/.test(cb)) {
      return ContentService.createTextOutput(cb + '(' + JSON.stringify(failed) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(failed)).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Kompatibilitas endpoint katalog lama + endpoint CMS yang baru. */
function uwaisCmsPublicResponse_(e) {
  return cms_publicResponse_(e);
}

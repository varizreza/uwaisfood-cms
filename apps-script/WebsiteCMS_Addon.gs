/**
 * UWAIS FOOD — WEBSITE PUBLIC CATALOG + CMS API
 * Add this as a NEW .gs file in the same Apps Script project as Code.gs.
 * The CMS uses the existing login PIN/token and auth_() functions.
 * Public endpoint exposes only explicitly selected website settings + Menu rows.
 */
const UF_WEBSITE_SETTINGS_KEY = 'UWAIS_WEBSITE_CMS_V1';
const UF_WEBSITE_CACHE_KEY = 'UWAIS_PUBLIC_CATALOG_V2';

function ufWebsiteDefaultSettings_() {
  return {
    announcement: 'Freshly made, with love — Uwais Food',
    heroEyebrow: 'SMALL BATCH · BIG HEART',
    heroTitle: 'Bahagia dimulai dari',
    heroAccent: 'gigitan pertama.',
    heroDescription: 'Racikan homemade dengan rasa istimewa, dibuat penuh perhatian untuk menemani hari dan momen spesialmu.',
    aboutTitle: 'Bukan sekadar rasa, ada hangat di dalamnya.',
    aboutText: 'Kami percaya kebahagiaan sering hadir lewat hal sederhana. Dari dapur Uwais Food, setiap sajian disiapkan dengan perhatian pada rasa, kualitas, dan detail kecil yang membuat momen terasa lebih dekat.',
    locationIntro: 'Kami berada di Tanjungpinang, Kepulauan Riau. Lihat lokasi dan hubungi kami sebelum berkunjung atau mengambil pesanan.',
    address: '', latitude: '', longitude: '', mapsUrl: '', businessHours: '',
    whatsappNumber: '6282221021094', whatsappMessage: 'Halo Uwais Food, saya ingin bertanya tentang produk.',
    instagramUrl: 'https://www.instagram.com/uwaisfood_id/', customerPwaUrl: 'https://order.uwaisfood.my.id/', heroImage: '',
    seoTitle: 'Uwais Food | Homemade Bakery & Hampers',
    seoDescription: 'Temukan pilihan bakery homemade dan hampers spesial dari Uwais Food, Tanjungpinang.',
    gallery: [], visibleProducts: null, featuredProducts: []
  };
}
function ufWebsiteGetSettings_() {
  const props = PropertiesService.getScriptProperties();
  let saved = {};
  try { saved = JSON.parse(props.getProperty(UF_WEBSITE_SETTINGS_KEY) || '{}') || {}; } catch (_) {}
  const settings = Object.assign(ufWebsiteDefaultSettings_(), saved);
  // Nilai awal kontak: hanya mengisi bila sebelumnya belum ada nilai.
  if (!String(settings.whatsappNumber || '').replace(/\D/g, '')) settings.whatsappNumber = '6282221021094';
  if (!String(settings.customerPwaUrl || '').trim()) settings.customerPwaUrl = 'https://order.uwaisfood.my.id/';
  return settings;
}
function ufWebsiteText_(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}
function ufWebsiteHttpsUrl_(value, label) {
  const v = ufWebsiteText_(value, 1500);
  if (!v) return '';
  if (!/^https:\/\//i.test(v)) throw new Error(label + ' harus menggunakan tautan HTTPS.');
  return v;
}
function ufWebsiteSlug_(value) {
  return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}
function ufWebsiteCategory_(name) {
  const s = String(name || '').toLowerCase();
  if (/cake|dessert|cheesecake/.test(s)) return 'cake';
  if (/hampers|parcel|gift/.test(s)) return 'hampers';
  return 'pastry';
}
function ufWebsiteMenuRows_() {
  const sh = menu_();
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, H_MENU.length).getValues()
    .filter(r => String(r[0] || '').trim())
    .map(r => ({
      id: 'menu-' + ufWebsiteSlug_(r[0]),
      name: String(r[0]).trim(),
      price: Number(r[1]) || 0,
      description: String(r[2] || '').trim(),
      image: String(r[3] || '').trim(),
      category: ufWebsiteCategory_(r[0]),
      active: true
    }));
}
function cms_getData(token) {
  auth_(token);
  const settings = ufWebsiteGetSettings_();
  return {
    settings: settings,
    products: ufWebsiteMenuRows_(),
    updatedAt: settings.updatedAt || ''
  };
}
function cms_saveSettings(token, payload) {
  auth_(token);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Pengaturan website tidak valid.');
  const currentProducts = ufWebsiteMenuRows_();
  const validNames = new Set(currentProducts.map(p => p.name));
  const list = (v, max) => Array.isArray(v) ? v.map(x => ufWebsiteText_(x, 120)).filter(x => validNames.has(x)).slice(0, max) : [];
  const gallery = Array.isArray(payload.gallery) ? payload.gallery.slice(0, 6).map(x => ufWebsiteHttpsUrl_(x, 'URL galeri')).filter(Boolean) : [];
  const settings = {
    announcement: ufWebsiteText_(payload.announcement, 180),
    heroEyebrow: ufWebsiteText_(payload.heroEyebrow, 100),
    heroTitle: ufWebsiteText_(payload.heroTitle, 160),
    heroAccent: ufWebsiteText_(payload.heroAccent, 120),
    heroDescription: ufWebsiteText_(payload.heroDescription, 500),
    aboutTitle: ufWebsiteText_(payload.aboutTitle, 180),
    aboutText: ufWebsiteText_(payload.aboutText, 1200),
    locationIntro: ufWebsiteText_(payload.locationIntro, 500),
    address: ufWebsiteText_(payload.address, 500),
    latitude: payload.latitude === '' || payload.latitude == null ? '' : String(Number(payload.latitude)),
    longitude: payload.longitude === '' || payload.longitude == null ? '' : String(Number(payload.longitude)),
    mapsUrl: ufWebsiteHttpsUrl_(payload.mapsUrl, 'Link Google Maps'),
    businessHours: ufWebsiteText_(payload.businessHours, 240),
    whatsappNumber: ufWebsiteText_(payload.whatsappNumber, 25).replace(/[^0-9]/g, ''),
    whatsappMessage: ufWebsiteText_(payload.whatsappMessage, 500),
    instagramUrl: ufWebsiteHttpsUrl_(payload.instagramUrl, 'Instagram URL'),
    customerPwaUrl: ufWebsiteHttpsUrl_(payload.customerPwaUrl, 'Customer PWA URL'),
    heroImage: ufWebsiteHttpsUrl_(payload.heroImage, 'Foto utama'),
    seoTitle: ufWebsiteText_(payload.seoTitle, 100),
    seoDescription: ufWebsiteText_(payload.seoDescription, 300),
    gallery: gallery,
    visibleProducts: list(payload.visibleProducts, 150),
    featuredProducts: list(payload.featuredProducts, 150),
    updatedAt: new Date().toISOString()
  };
  const latEmpty = settings.latitude === '', lngEmpty = settings.longitude === '';
  if (latEmpty !== lngEmpty) throw new Error('Latitude dan longitude harus diisi berpasangan.');
  if (!latEmpty) {
    const lat = Number(settings.latitude), lng = Number(settings.longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) throw new Error('Koordinat lokasi tidak valid.');
  }
  const json = JSON.stringify(settings);
  if (json.length > 20000) throw new Error('Pengaturan terlalu besar. Kurangi jumlah URL galeri atau teks.');
  PropertiesService.getScriptProperties().setProperty(UF_WEBSITE_SETTINGS_KEY, json);
  CacheService.getScriptCache().remove(UF_WEBSITE_CACHE_KEY);
  return { saved: true, updatedAt: settings.updatedAt };
}
function uwaisPublicCatalog_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(UF_WEBSITE_CACHE_KEY);
  if (cached) return JSON.parse(cached);
  const settings = ufWebsiteGetSettings_();
  let products = ufWebsiteMenuRows_();
  if (Array.isArray(settings.visibleProducts)) {
    const visible = new Set(settings.visibleProducts);
    products = products.filter(p => visible.has(p.name));
  }
  const featured = new Set(Array.isArray(settings.featuredProducts) ? settings.featuredProducts : []);
  products = products.map(p => Object.assign({}, p, { featured: featured.has(p.name), tag: featured.has(p.name) ? 'PILIHAN FAVORIT' : '' }));
  // Only whitelisted public fields leave the backend. Never serialize the entire app config.
  const publicSettings = {
    announcement: settings.announcement,
    heroEyebrow: settings.heroEyebrow,
    heroTitle: settings.heroTitle,
    heroAccent: settings.heroAccent,
    heroDescription: settings.heroDescription,
    aboutTitle: settings.aboutTitle,
    aboutText: settings.aboutText,
    locationIntro: settings.locationIntro,
    address: settings.address,
    latitude: settings.latitude,
    longitude: settings.longitude,
    mapsUrl: settings.mapsUrl,
    businessHours: settings.businessHours,
    whatsappNumber: settings.whatsappNumber,
    whatsappMessage: settings.whatsappMessage,
    instagramUrl: settings.instagramUrl,
    customerPwaUrl: settings.customerPwaUrl,
    heroImage: settings.heroImage,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    gallery: settings.gallery
  };
  const result = { success: true, brand: 'Uwais Food', updatedAt: new Date().toISOString(), settings: publicSettings, products: products };
  cache.put(UF_WEBSITE_CACHE_KEY, JSON.stringify(result), 45);
  return result;
}
function uwaisPublicCatalogResponse_(e) {
  const callback = String((e && e.parameter && e.parameter.callback) || '');
  const data = uwaisPublicCatalog_();
  const output = JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(callback)) {
      return ContentService.createTextOutput('Invalid callback').setMimeType(ContentService.MimeType.TEXT);
    }
    return ContentService.createTextOutput(callback + '(' + output + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}
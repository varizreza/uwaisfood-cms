(() => {
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const siteUrl = 'https://uwaisfood.my.id';
const pageInfo = {
  home:{title:'Beranda',description:'Atur pengumuman, judul utama, deskripsi, gambar banner, dan tombol utama.',group:'home',fields:[
    ['home.announcement','Teks pengumuman','text','Pengumuman tipis di bagian teratas website'],
    ['home.headline','Judul utama','textarea','Pisahkan baris dengan Enter untuk mengatur susunan judul'],
    ['home.description','Deskripsi utama','textarea'],
    ['home.heroImage','Gambar banner beranda','image','Unggah gambar JPG, PNG, atau WEBP; maksimal 1,25 MB'],
    ['home.primaryButton','Teks tombol utama','text'],
    ['home.primaryLink','Tautan tombol utama','text','Contoh: #produk atau https://alamat-tujuan'],
    ['home.secondaryButton','Teks tombol kedua','text'],
    ['home.secondaryLink','Tautan tombol kedua','text']
  ]},
  products:{title:'Produk Website',description:'Atur produk yang ditampilkan pada katalog. Nama, harga, deskripsi, dan foto tetap bersumber dari Menu Admin.',group:'products'},
  promo:{title:'Promo & Galeri',description:'Atur cerita promo, gambar utama, dan foto galeri website.',group:'promo',fields:[
    ['promo.title','Judul promo / cerita','textarea'],
    ['promo.description','Deskripsi promo','textarea'],
    ['promo.image','Gambar promo utama','image'],
    ['promo.gallery','URL foto galeri','textarea','Satu URL HTTPS per baris'],
    ['promo.galleryUpload','Unggah foto galeri','images','Pilih beberapa gambar sekaligus']
  ]},
  profile:{title:'Profil Toko',description:'Atur profil, lokasi, jam operasional, dan kutipan Uwais Food.',group:'profile',fields:[
    ['profile.title','Judul profil','textarea'],
    ['profile.description','Deskripsi toko','textarea'],
    ['profile.location','Lokasi toko','text'],
    ['profile.openingHours','Jam operasional','text'],
    ['profile.quote','Kutipan / pesan brand','textarea'],
    ['profile.quoteAuthor','Nama penanda kutipan','text']
  ]},
  contact:{title:'Kontak & Sosial',description:'Perbarui jalur komunikasi pelanggan dari website publik.',group:'contact',fields:[
    ['contact.whatsapp','Nomor WhatsApp toko','text','Format internasional, contoh 62812xxxx'],
    ['contact.whatsappMessage','Pesan awal WhatsApp','textarea'],
    ['contact.instagram','URL Instagram','text'],
    ['contact.maps','URL Google Maps','text']
  ]},
  seo:{title:'SEO Website',description:'Atur metadata agar website lebih mudah dikenali mesin pencari dan saat dibagikan.',group:'seo',fields:[
    ['seo.title','Judul SEO','text'],
    ['seo.description','Deskripsi SEO','textarea'],
    ['seo.ogImage','Gambar Open Graph','image','Gambar yang muncul saat link website dibagikan']
  ]}
};
const defaults = {
  home:{announcement:'Homemade with love, freshly made for you',headline:'Bahagia itu\nsesederhana\ngigitan pertama.',description:'Temukan kelezatan bakery homemade dengan bahan pilihan, rasa istimewa, dan sentuhan hangat di setiap sajian.',heroImage:'',primaryButton:'Jelajahi Produk',primaryLink:'#produk',secondaryButton:'Kenali Uwais Food',secondaryLink:'#tentang'},
  products:{note:'Ketersediaan produk dan harga dapat berubah. Silakan konfirmasi sebelum memesan.',items:[]},
  promo:{title:'Bukan sekadar\nrasa, tapi juga\ncerita.',description:'',image:'',gallery:[]},
  profile:{title:'Hangatnya homemade,\nistimewanya setiap momen.',description:'',location:'Tanjungpinang, Kepulauan Riau',openingHours:'',quote:'',quoteAuthor:'Uwais Food'},
  contact:{whatsapp:'6282221021094',whatsappMessage:'Halo Uwais Food, saya ingin bertanya tentang produk.',instagram:'https://www.instagram.com/uwaisfood_id/',maps:''},
  seo:{title:'Uwais Food — Homemade with Love',description:'',ogImage:''}
};
let apiUrl=localStorage.getItem('uwaisCmsApi')||'';
let token=sessionStorage.getItem('uwaisCmsToken')||'';
let content=structuredClone(defaults);
let catalog=[];
let currentPage='dashboard';
let publishedMeta={};
let busy=false;
$('#year').textContent=new Date().getFullYear();
$('#apiUrl').value=apiUrl;

function notify(message){const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>t.classList.remove('show'),3000)}
function errMessage(e){return e&&e.message?e.message:String(e)}
function deepMerge(base,extra){if(!extra||typeof extra!=='object')return base;Object.keys(extra).forEach(k=>{if(extra[k]&&typeof extra[k]==='object'&&!Array.isArray(extra[k]))base[k]=deepMerge(base[k]&&typeof base[k]==='object'?base[k]:{},extra[k]);else base[k]=extra[k]});return base}
function escapeHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function getPath(path){return path.split('.').reduce((a,k)=>a==null?undefined:a[k],content)}
function setPath(path,value){const keys=path.split('.');let x=content;keys.slice(0,-1).forEach(k=>{if(!x[k]||typeof x[k]!=='object')x[k]={};x=x[k]});x[keys[keys.length-1]]=value}
async function request(action,args,withToken=true){
  if(!apiUrl)throw new Error('URL Web App Apps Script belum diisi.');
  const allArgs=withToken?[token].concat(args||[]):(args||[]);
  let response;
  try{response=await fetch(apiUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:action,args:allArgs}),redirect:'follow'})}
  catch(e){throw new Error('Tidak dapat terhubung ke Apps Script. Periksa koneksi, URL /exec, dan akses deployment.')}
  let json;try{json=await response.json()}catch(e){throw new Error('Respons Apps Script bukan JSON. Periksa URL /exec dan versi deployment.')}
  if(!json.ok)throw new Error(json.error||'Permintaan gagal.');
  return json.data;
}
function toggleLogin(show){$('#loginView').classList.toggle('hidden',!show);$('#appView').classList.toggle('hidden',show)}
function syncCatalogSettings(){
  const settings=Array.isArray(content.products.items)?content.products.items:[];
  const byId={};settings.forEach(x=>byId[x.id]=x);
  content.products.items=catalog.map((p,i)=>Object.assign({id:p.id,active:p.active!==false,featured:p.featured===true,tag:p.tag||'',sort:i},byId[p.id]||{}));
}
function updateStatus(){
  $('#publishStatus').textContent=publishedMeta&&publishedMeta.publishedAt?'Sudah dipublikasikan':'Belum dipublikasikan';
  $('#publishDate').textContent=publishedMeta&&publishedMeta.publishedAt?'Terakhir: '+new Date(publishedMeta.publishedAt).toLocaleString('id-ID'):'Konten masih berupa draft';
  $('#connectionText').textContent='Apps Script aktif';
  $('#publicEndpointText').textContent='Endpoint publik: '+apiUrl+'?websiteCmsPublic=1';
}
async function login(){
  apiUrl=$('#apiUrl').value.trim();const pin=$('#pin').value.trim();
  if(!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/.test(apiUrl)){ $('#loginMessage').textContent='Masukkan URL Web App Apps Script yang berakhiran /exec.';return}
  if(!pin){$('#loginMessage').textContent='PIN Admin wajib diisi.';return}
  $('#loginBtn').disabled=true;$('#loginMessage').textContent='Memeriksa akses Admin…';
  try{
    const data=await request('cms_login',[pin],false);
    token=String(data||'');if(!token)throw new Error('Server tidak mengembalikan token sesi.');
    sessionStorage.setItem('uwaisCmsToken',token);sessionStorage.setItem('uwaisCmsApi',apiUrl);localStorage.setItem('uwaisCmsApi',apiUrl);
    toggleLogin(false);await loadFromServer();notify('Berhasil masuk ke Uwais Food CMS');
  }catch(e){$('#loginMessage').textContent='Login gagal: '+errMessage(e)}
  finally{$('#loginBtn').disabled=false}
}
async function loadFromServer(){
  const data=await request('cms_getDraft',[]);
  content=deepMerge(structuredClone(defaults),data.content||{});
  catalog=Array.isArray(data.products)?data.products:[];
  publishedMeta=data.publishedAt||{};
  syncCatalogSettings();updateStatus();
}
function goto(page){
  currentPage=page;
  const info=pageInfo[page];
  $('#dashboardPage').classList.toggle('hidden',page!=='dashboard');
  $('#editorPage').classList.toggle('hidden',page==='dashboard');
  $('#pageTitle').textContent=page==='dashboard'?'Dashboard Website':info.title;
  $$('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  if(info)renderEditor(page);
}
function createField(field){
  const [path,label,type,help]=field;
  const value=getPath(path);
  if(type==='images')return '<div class="field full"><label>'+escapeHtml(label)+'</label><input type="file" id="galleryFiles" accept="image/jpeg,image/png,image/webp" multiple><div class="help">Foto akan diunggah ke folder Drive CMS dan URL-nya ditambahkan ke galeri.</div><div id="galleryUploadStatus" class="help"></div></div>';
  if(type==='image')return '<div class="field full"><label>'+escapeHtml(label)+'</label><input id="field_'+path.replace(/\./g,'_')+'" type="url" value="'+escapeHtml(value||'')+'" placeholder="https://…"><div class="upload-row"><input type="file" id="upload_'+path.replace(/\./g,'_')+'" accept="image/jpeg,image/png,image/webp"><button type="button" class="btn ghost upload-btn" data-upload="'+path+'">Unggah gambar</button></div><div class="help">'+escapeHtml(help||'URL gambar HTTPS')+'</div><div class="image-preview" id="preview_'+path.replace(/\./g,'_')+'"></div></div>';
  const fieldId='field_'+path.replace(/\./g,'_');
  const input=type==='textarea'?'<textarea id="'+fieldId+'">'+escapeHtml(value||'')+'</textarea>':'<input id="'+fieldId+'" type="text" value="'+escapeHtml(value||'')+'">';
  return '<div class="field '+(type==='textarea'?'full':'')+'"><label for="'+fieldId+'">'+escapeHtml(label)+'</label>'+input+(help?'<div class="help">'+escapeHtml(help)+'</div>':'')+'</div>';
}
function renderEditor(page){
  const info=pageInfo[page];$('#editorTitle').textContent=info.title;$('#editorDescription').textContent=info.description;
  $('#fieldsContainer').classList.toggle('hidden',page==='products');
  $('#productEditor').classList.toggle('hidden',page!=='products');
  if(page==='products'){renderProducts();return}
  $('#fieldsContainer').innerHTML=info.fields.map(createField).join('');
  info.fields.filter(f=>f[2]==='image').forEach(f=>{const path=f[0],v=getPath(path),id=path.replace(/\./g,'_');const preview=$('#preview_'+id);if(v)preview.innerHTML='<img src="'+escapeHtml(v)+'" alt="Pratinjau gambar">';});
  $$('.upload-btn').forEach(b=>b.addEventListener('click',()=>uploadOne(b.dataset.upload)));
}
function renderProducts(){
  syncCatalogSettings();
  const rows=content.products.items.map((p,i)=>{
    const info=catalog.find(x=>x.id===p.id)||{};
    return '<tr><td class="product-name-cell"><b>'+escapeHtml(info.name||p.id)+'</b><small>'+escapeHtml(info.categoryLabel||info.category||'Produk')+' · '+escapeHtml(info.priceLabel||'')+'</small></td><td><input type="checkbox" data-product="'+i+'" data-key="active" '+(p.active!==false?'checked':'')+' aria-label="Tampilkan produk"></td><td><input type="checkbox" data-product="'+i+'" data-key="featured" '+(p.featured===true?'checked':'')+' aria-label="Produk unggulan"></td><td><input type="text" data-product="'+i+'" data-key="tag" value="'+escapeHtml(p.tag||'')+'" placeholder="Label"></td><td><input type="number" data-product="'+i+'" data-key="sort" value="'+Number(p.sort||0)+'"></td></tr>'
  }).join('');
  $('#productEditor').innerHTML='<div class="product-tools"><p>'+catalog.length+' produk dibaca dari sheet Menu pada Admin Uwais Food.</p><button type="button" id="refreshCatalog" class="btn ghost">↻ Muat ulang katalog</button></div><div class="product-table-wrap"><table class="product-table"><thead><tr><th>PRODUK</th><th>TAYANG</th><th>UNGGULAN</th><th>LABEL</th><th>URUTAN</th></tr></thead><tbody>'+(rows||'<tr><td colspan="5">Belum ada data produk.</td></tr>')+'</tbody></table></div><div class="field full" style="margin-top:18px"><label for="productNote">Catatan katalog</label><textarea id="productNote">'+escapeHtml(content.products.note||'')+'</textarea></div>';
  $('#refreshCatalog').addEventListener('click',async()=>{try{await loadFromServer();renderProducts();notify('Katalog diperbarui dari Admin')}catch(e){notify(errMessage(e))}});
  $$('#productEditor [data-product]').forEach(el=>el.addEventListener('change',()=>{
    const p=content.products.items[Number(el.dataset.product)],key=el.dataset.key;
    p[key]=el.type==='checkbox'?el.checked:(key==='sort'?Math.max(0,Number(el.value)||0):el.value);
  }));
}
function collectForm(){
  if(currentPage==='products'){
    content.products.note=$('#productNote').value.trim();
    $$('#productEditor [data-product]').forEach(el=>{
      const p=content.products.items[Number(el.dataset.product)],key=el.dataset.key;
      p[key]=el.type==='checkbox'?el.checked:(key==='sort'?Math.max(0,Number(el.value)||0):el.value);
    });
    return;
  }
  pageInfo[currentPage].fields.forEach(([path,,type])=>{
    if(type==='images')return;
    if(type==='image'||type==='textarea'||type==='text')setPath(path,$('#field_'+path.replace(/\./g,'_')).value.trim());
  });
}
function base64FromFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=()=>reject(new Error('Gagal membaca file gambar.'));r.readAsDataURL(file)})}
async function uploadOne(path){
  const id=path.replace(/\./g,'_'),file=$('#upload_'+id).files[0];if(!file)return notify('Pilih gambar terlebih dahulu.');
  if(file.size>1250000)return notify('Ukuran gambar maksimal 1,25 MB.');
  const btn=$('[data-upload="'+path+'"]');btn.disabled=true;btn.textContent='Mengunggah…';
  try{
    const result=await request('cms_uploadImage',[file.name,file.type,await base64FromFile(file)]);
    setPath(path,result.url);$('#field_'+id).value=result.url;$('#preview_'+id).innerHTML='<img src="'+escapeHtml(result.url)+'" alt="Pratinjau gambar">';
    notify('Gambar berhasil diunggah ke Drive CMS.');
  }catch(e){notify('Upload gagal: '+errMessage(e))}
  finally{btn.disabled=false;btn.textContent='Unggah gambar'}
}
async function uploadGallery(){
  const input=$('#galleryFiles');if(!input||!input.files.length)return;
  const files=Array.from(input.files);const status=$('#galleryUploadStatus');status.textContent='Mengunggah '+files.length+' gambar…';
  try{
    for(const file of files){
      if(file.size>1250000)throw new Error(file.name+' melebihi 1,25 MB.');
      const result=await request('cms_uploadImage',[file.name,file.type,await base64FromFile(file)]);
      content.promo.gallery.push(result.url);
    }
    status.textContent=content.promo.gallery.length+' foto tersimpan pada daftar galeri. Klik Simpan draft.';
    notify('Foto galeri berhasil diunggah.');
  }catch(e){status.textContent=errMessage(e);notify('Upload galeri gagal: '+errMessage(e))}
}
async function saveDraft(){
  collectForm();
  try{const result=await request('cms_saveDraft',[content]);content=result.content||content;notify('Draft berhasil disimpan di Spreadsheet Uwais Food.')}
  catch(e){notify('Gagal menyimpan draft: '+errMessage(e))}
}
async function publish(){
  if(!confirm('Publikasikan konten website sekarang? Konten publik akan berubah.'))return;
  collectForm();$('#publishBtn').disabled=true;
  try{const result=await request('cms_publish',[content]);publishedMeta=result.meta||{};updateStatus();notify('Website berhasil dipublikasikan. Muat ulang website publik untuk melihat hasilnya.')}
  catch(e){notify('Publikasi gagal: '+errMessage(e))}
  finally{$('#publishBtn').disabled=false}
}
$('#loginBtn').addEventListener('click',login);
$('#pin').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
$$('.nav-item[data-page]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.page)));
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.goto)));
$('#contentForm').addEventListener('submit',async e=>{e.preventDefault();await saveDraft()});
$('#publishBtn').addEventListener('click',publish);
$('#reloadBtn').addEventListener('click',async()=>{try{await loadFromServer();renderEditor(currentPage);notify('Data terbaru dimuat dari server.')}catch(e){notify(errMessage(e))}});
$('#fieldsContainer').addEventListener('change',e=>{if(e.target&&e.target.id==='galleryFiles')uploadGallery()});
$('#logoutBtn').addEventListener('click',()=>{sessionStorage.removeItem('uwaisCmsToken');sessionStorage.removeItem('uwaisCmsApi');token='';toggleLogin(true);$('#pin').value='';notify('Anda telah keluar dari CMS.')});
if(token){apiUrl=sessionStorage.getItem('uwaisCmsApi')||apiUrl;$('#apiUrl').value=apiUrl;toggleLogin(false);loadFromServer().catch(e=>{toggleLogin(true);$('#loginMessage').textContent='Sesi tidak dapat digunakan: '+errMessage(e)})}
else toggleLogin(true);
})();
const CACHE = 'turnos-cache-v1';
const CORE_ASSETS = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const RUNTIME_ALLOWLIST = ['https://cdn.tailwindcss.com'];
self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE_ASSETS))); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))); });
self.addEventListener('fetch', e=>{
  const url=new URL(e.request.url);
  if (CORE_ASSETS.some(p=>url.pathname.endsWith(p.replace('./','/'))||url.pathname==='/')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))); return;
  }
  if (RUNTIME_ALLOWLIST.some(origin=>url.href.startsWith(origin))){
    e.respondWith(caches.match(e.request).then(cached=>{
      const f=fetch(e.request).then(nr=>{ const cl=nr.clone(); caches.open(CACHE).then(c=>c.put(e.request, cl)); return nr; }).catch(()=>cached);
      return cached||f;
    })); return;
  }
  e.respondWith(fetch(e.request).then(nr=>{ const cl=nr.clone(); caches.open(CACHE).then(c=>c.put(e.request, cl)); return nr; }).catch(()=>caches.match(e.request)));
});

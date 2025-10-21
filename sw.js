// --- Ajustes ---
const CACHE_STATIC = 'turnos-static-v1';
const CACHE_RUNTIME = 'turnos-runtime-v1';

// Solo lo esencial para iniciar (no incluimos index.html para no fijarlo)
const CORE_ASSETS = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Orígenes permitidos para cachear en runtime (Tailwind CDN)
const RUNTIME_ALLOWLIST = [
  'https://cdn.tailwindcss.com'
];

// Helpers
async function putInCache(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  try { await cache.put(request, response.clone()); } catch {}
  return response;
}

// Instalación: precache mínimo
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => cache.addAll(CORE_ASSETS))
  );
  // Tomar control apenas se instala el nuevo SW
  self.skipWaiting();
});

// Activación: limpiar caches viejos y tomar control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k !== CACHE_STATIC && k !== CACHE_RUNTIME)
            .map(k => caches.delete(k))
      );
      await self.clients.claim();
      // Avisar a las pestañas que hay versión nueva (para recargar)
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientsList) {
        client.postMessage({ type: 'SW_ACTIVATED' });
      }
    })()
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1) HTML / navegaciones → Network First (si falla, usar caché)
  const isHTMLRequest =
    request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isHTMLRequest) {
    event.respondWith((async () => {
      try {
        // Intentar red primero (última versión del index y páginas)
        const networkResp = await fetch(request, { cache: 'no-store' });
        // Guardar copia en caché runtime
        putInCache(CACHE_RUNTIME, request, networkResp);
        return networkResp.clone();
      } catch {
        // Offline/falla → intentar caché
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fallback básico si no hay nada
        return new Response('<h1>Sin conexión</h1><p>Vuelve a intentar.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // 2) Recursos del CDN permitido (Tailwind) → Stale-While-Revalidate
  if (RUNTIME_ALLOWLIST.some(origin => url.href.startsWith(origin))) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const fetchPromise = fetch(request).then(resp => putInCache(CACHE_RUNTIME, request, resp))
                                         .catch(() => null);
      return cached || (await fetchPromise) || new Response('', { status: 504 });
    })());
    return;
  }

  // 3) Otros archivos estáticos propios (manifest, íconos, etc.) → Cache First
  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      try {
        const resp = await fetch(request);
        // Guardar en estático si es parte del core, sino en runtime
        const targetCache = CORE_ASSETS.some(p => url.pathname.endsWith(p.replace('./','/')))
          ? CACHE_STATIC : CACHE_RUNTIME;
        return await putInCache(targetCache, request, resp);
      } catch {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // 4) Default: red → cache fallback
  event.respondWith((async () => {
    try {
      const resp = await fetch(request);
      putInCache(CACHE_RUNTIME, request, resp);
      return resp.clone();
    } catch {
      const cached = await caches.match(request);
      return cached || new Response('', { status: 504 });
    }
  })());
});

// Mensajes desde la página (opcional)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

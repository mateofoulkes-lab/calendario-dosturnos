// Service worker exclusivo de TresTurn. No toca la caché de DosTurn.
const CACHE = "tresturn-original-style-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"];
const TAILWIND_CDN = "https://cdn.tailwindcss.com";
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_SHELL);
    // Tailwind es el mismo que usa DosTurn; se guarda para abrir offline.
    try {
      const cdnRequest = new Request(TAILWIND_CDN, { mode: "no-cors" });
      const cdnResponse = await fetch(cdnRequest);
      // cache.put admite respuestas opacas (el script CDN es cross-origin).
      await cache.put(cdnRequest, cdnResponse);
    } catch {}
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("tresturn-") && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const request = event.request;
  const url = new URL(request.url);
  const ownScope = new URL(self.registration.scope);
  if (url.origin !== ownScope.origin && url.origin !== new URL(TAILWIND_CDN).origin) return;
  if (url.origin === ownScope.origin && !url.pathname.startsWith(ownScope.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (request.mode === "navigate") {
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        return cached || await cache.match("./index.html") || Response.error();
      }
    }
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok || response.type === "opaque") await cache.put(request, response.clone());
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
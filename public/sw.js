/* eslint-disable no-restricted-globals */
/**
 * Service Worker — Restaurante El Quijote
 *
 * Estrategias:
 *  - Navegación (páginas públicas): network-first → caché → /offline.
 *  - /_next/static/*: cache-first (los archivos llevan hash, son inmutables).
 *  - Imágenes (locales, Cloudinary, Supabase, Unsplash): stale-while-revalidate.
 *  - Google Fonts: stale-while-revalidate.
 *  - /api/*, /dashboard/*, peticiones RSC y todo lo que no sea GET: siempre a la
 *    red, nunca se cachea (datos sensibles o en tiempo real).
 *
 * Para forzar que todos los clientes descarten la caché anterior, sube CACHE_VERSION.
 */

const CACHE_VERSION = "v1";
const PAGES_CACHE = `quijote-pages-${CACHE_VERSION}`;
const STATIC_CACHE = `quijote-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `quijote-images-${CACHE_VERSION}`;
const FONTS_CACHE = `quijote-fonts-${CACHE_VERSION}`;
const CURRENT_CACHES = [PAGES_CACHE, STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE];

const OFFLINE_URL = "/offline";

const MAX_PAGES = 30;
const MAX_IMAGES = 120;

const IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "mdygrtdebtmuhmirnbxz.supabase.co",
  "lh3.googleusercontent.com",
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

// Rutas que nunca deben guardarse en caché (privadas o en tiempo real).
const NO_CACHE_PREFIXES = ["/api/", "/dashboard", "/profile", "/login", "/register", "/reset", "/frm_reset"];

// ─── Ciclo de vida ──────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("quijote-") && !CURRENT_CACHES.includes(key))
          .map((key) => caches.delete(key)),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

// ─── Enrutamiento ───────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    if (NO_CACHE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      if (request.mode === "navigate") event.respondWith(networkOrOffline(event));
      return;
    }

    // Peticiones de React Server Components (navegación del cliente de Next).
    if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

    if (request.mode === "navigate") {
      event.respondWith(networkFirstPage(event));
      return;
    }

    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
      return;
    }

    if (
      url.pathname.startsWith("/_next/image") ||
      url.pathname.startsWith("/icons/") ||
      request.destination === "image"
    ) {
      event.respondWith(staleWhileRevalidate(event, IMAGES_CACHE, MAX_IMAGES));
      return;
    }

    return;
  }

  if (IMAGE_HOSTS.includes(url.hostname) && request.destination === "image") {
    event.respondWith(staleWhileRevalidate(event, IMAGES_CACHE, MAX_IMAGES));
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event, FONTS_CACHE));
  }
});

// ─── Estrategias ────────────────────────────────────────────────────────────

async function fetchNavigation(event) {
  const preloaded = await event.preloadResponse;
  return preloaded || fetch(event.request);
}

async function offlineFallback() {
  const cached = await caches.match(OFFLINE_URL);
  return (
    cached ||
    new Response("Sin conexión", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  );
}

async function networkOrOffline(event) {
  try {
    return await fetchNavigation(event);
  } catch {
    return offlineFallback();
  }
}

async function networkFirstPage(event) {
  const { request } = event;
  try {
    const response = await fetchNavigation(event);
    // Solo se guardan respuestas finales de esta misma página (no redirecciones).
    if (response.ok && response.type === "basic" && !response.redirected) {
      const cache = await caches.open(PAGES_CACHE);
      cache
        .put(request, response.clone())
        .then(() => trimCache(PAGES_CACHE, MAX_PAGES))
        .catch(() => {});
    }
    return response;
  } catch {
    const cached = await caches.match(request, { ignoreVary: true });
    return cached || offlineFallback();
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName, maxEntries) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(async (response) => {
      // Las respuestas "opaque" (no-cors) también se aceptan para imágenes externas.
      if (response.ok || response.type === "opaque") {
        await cache.put(request, response.clone()).catch(() => {});
        if (maxEntries) await trimCache(cacheName, maxEntries);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }

  const response = await network;
  return response || Response.error();
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    // No se elimina la página offline precargada.
    if (new URL(keys[i].url).pathname === OFFLINE_URL) continue;
    await cache.delete(keys[i]);
  }
}

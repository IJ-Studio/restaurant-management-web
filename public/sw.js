/* eslint-disable no-restricted-globals */
/**
 * Service Worker — Restaurante El Quijote
 *
 * Estrategias:
 *  - Precarga: al instalarse guarda todas las páginas estáticas (PRECACHE_PAGES)
 *    junto con el JS/CSS que cada una necesita, para que funcionen sin conexión
 *    aunque nunca se hayan visitado. Se refresca en segundo plano (ver "message").
 *  - Navegación (páginas públicas): network-first → caché → /offline.
 *  - /_next/static/*: cache-first (los archivos llevan hash, son inmutables).
 *  - Imágenes (locales, Cloudinary, Supabase, Unsplash): stale-while-revalidate;
 *    sin conexión no se revalida, y si no está guardada se devuelve una imagen
 *    transparente en lugar de un error.
 *  - Google Fonts: stale-while-revalidate.
 *  - Peticiones RSC (navegación interna de Next): red; sin conexión responde
 *    vacío para que Next haga una navegación completa, que sirve la caché.
 *  - /api/*, /dashboard/* y todo lo que no sea GET: siempre a la red, nunca se
 *    cachea (datos sensibles o en tiempo real). El contenido dinámico se oculta
 *    en el cliente hasta que vuelve la conexión.
 *
 * Para forzar que todos los clientes descarten la caché anterior, sube CACHE_VERSION.
 */

const CACHE_VERSION = "v3";
const PAGES_CACHE = `quijote-pages-${CACHE_VERSION}`;
const STATIC_CACHE = `quijote-static-${CACHE_VERSION}`;
const IMAGES_CACHE = `quijote-images-${CACHE_VERSION}`;
const FONTS_CACHE = `quijote-fonts-${CACHE_VERSION}`;
const CURRENT_CACHES = [PAGES_CACHE, STATIC_CACHE, IMAGES_CACHE, FONTS_CACHE];

const OFFLINE_URL = "/offline";

// Páginas públicas que se guardan desde la instalación. Las que muestran datos
// del servidor (menú, promociones, reservas) guardan solo su estructura; los
// datos se piden al reconectar.
const PRECACHE_PAGES = [
  OFFLINE_URL,
  "/",
  "/menu",
  "/promociones",
  "/reservations",
  "/menu/pedido",
  "/login",
  "/register",
  "/about",
  "/ayuda",
  "/condiciones",
  "/corporativo",
  "/devoluciones",
  "/privacidad",
  "/seguridad",
];
const PRECACHE_FILES = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];
// Logos del restaurante (Cloudinary) que usan el navbar y el footer.
const PRECACHE_EXTERNAL_IMAGES = [
  "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1775662960/logo_text_white_ktnpgg.png",
  "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1776056964/logo_dark_fvfcdk.svg",
  "https://res.cloudinary.com/dcb1tspbj/image/upload/q_auto/f_auto/v1776056964/logo_light_xy8ce1.svg",
];
// Estas entradas nunca se eliminan al recortar la caché.
const PROTECTED_PATHS = new Set([...PRECACHE_PAGES, ...PRECACHE_FILES]);
const PROTECTED_URLS = new Set(PRECACHE_EXTERNAL_IMAGES);

// Imagen vacía para cuando no hay red ni copia guardada (evita el ícono roto).
const TRANSPARENT_IMAGE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"/>';

// Cada cuánto se vuelve a descargar la precarga (para tomar nuevos despliegues).
const PRECACHE_REFRESH_MS = 60 * 60 * 1000;
const PRECACHE_META_KEY = "/__precache-meta";

const MAX_PAGES = 40;
const MAX_IMAGES = 150;

const IMAGE_HOSTS = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "mdygrtdebtmuhmirnbxz.supabase.co",
  "lh3.googleusercontent.com",
];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

// Rutas que nunca deben guardarse en caché (privadas o en tiempo real).
const NO_CACHE_PREFIXES = ["/api/", "/dashboard", "/profile", "/reset", "/frm_reset"];

// ─── Precarga ───────────────────────────────────────────────────────────────

// Extrae del HTML de Next los archivos de /_next/static que la página necesita
// (aparecen tanto en <script>/<link> como dentro del payload RSC escapado).
function extractStaticAssets(html) {
  const matches = html.match(/\/_next\/static\/[^"'\s\\)]+/g) || [];
  return [...new Set(matches)];
}

async function precacheFile(cache, path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  await cache.put(path, response);
}

async function precacheAll() {
  const pages = await caches.open(PAGES_CACHE);
  const statics = await caches.open(STATIC_CACHE);
  const images = await caches.open(IMAGES_CACHE);

  const assets = new Set();
  const results = await Promise.allSettled(
    PRECACHE_PAGES.map(async (path) => {
      const response = await fetch(path, { cache: "no-cache", credentials: "same-origin" });
      if (!response.ok || response.redirected) throw new Error(`${path}: ${response.status}`);
      const html = await response.clone().text();
      extractStaticAssets(html).forEach((asset) => assets.add(asset));
      await pages.put(path, response);
    }),
  );

  await Promise.allSettled([
    precacheFile(pages, "/manifest.webmanifest"),
    ...PRECACHE_FILES.filter((path) => path.startsWith("/icons/")).map((path) =>
      precacheFile(images, path),
    ),
    // Imágenes de otro dominio: se guardan como respuesta "opaque" (no-cors).
    ...PRECACHE_EXTERNAL_IMAGES.map(async (url) => {
      const response = await fetch(url, { mode: "no-cors" });
      await images.put(url, response);
    }),
    // Los archivos estáticos son inmutables: solo se descargan los que faltan.
    ...[...assets].map(async (asset) => {
      if (!(await statics.match(asset))) await precacheFile(statics, asset);
    }),
  ]);

  await pages.put(PRECACHE_META_KEY, new Response(String(Date.now())));
  return results;
}

async function refreshPrecacheIfStale() {
  const pages = await caches.open(PAGES_CACHE);
  const meta = await pages.match(PRECACHE_META_KEY);
  const last = meta ? Number(await meta.text()) : 0;
  if (Date.now() - last > PRECACHE_REFRESH_MS) await precacheAll();
}

// ─── Ciclo de vida ──────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // /offline es indispensable; el resto se intenta sin bloquear la instalación.
      const pages = await caches.open(PAGES_CACHE);
      await pages.add(OFFLINE_URL);
      await precacheAll().catch(() => {});
      await self.skipWaiting();
    })(),
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

// La app avisa al cargar con conexión; si la precarga tiene más de una hora se
// vuelve a descargar para incluir el último despliegue.
self.addEventListener("message", (event) => {
  if (event.data === "REFRESH_PRECACHE") {
    event.waitUntil(refreshPrecacheIfStale().catch(() => {}));
  }
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

    // Peticiones de React Server Components (navegación y prefetch de Next).
    if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) {
      event.respondWith(rscRequest(request));
      return;
    }

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

    if (PROTECTED_PATHS.has(url.pathname)) {
      event.respondWith(networkFirst(request, PAGES_CACHE));
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
    // Sin conexión: la versión guardada de esta URL, o de la misma ruta sin
    // parámetros (p. ej. /menu?mesa=3 → /menu), o la página offline.
    const cached =
      (await caches.match(request, { ignoreVary: true })) ||
      (await caches.match(new URL(request.url).pathname, { ignoreVary: true }));
    return cached || offlineFallback();
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(new URL(request.url).pathname, response.clone()).catch(() => {});
    }
    return response;
  } catch {
    const cached = await caches.match(new URL(request.url).pathname);
    return cached || Response.error();
  }
}

// Sin conexión se responde vacío (sin contenido RSC): Next lo interpreta como
// "haz una navegación completa", que el SW sirve desde la caché de páginas.
async function rscRequest(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
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
  const isImage = cacheName === IMAGES_CACHE;

  // Sin conexión no tiene caso revalidar.
  if (!self.navigator.onLine) {
    if (cached) return cached;
    if (isImage) return transparentImage();
  }

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
  if (response) return response;
  return isImage ? transparentImage() : Response.error();
}

function transparentImage() {
  return new Response(TRANSPARENT_IMAGE, {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
  });
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = (await cache.keys()).filter((request) => {
    const url = new URL(request.url);
    if (PROTECTED_URLS.has(request.url)) return false;
    return !(url.origin === self.location.origin && (PROTECTED_PATHS.has(url.pathname) || url.pathname === PRECACHE_META_KEY));
  });
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

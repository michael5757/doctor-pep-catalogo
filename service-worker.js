'use strict';

const CACHE = 'doctor-ecupep-v6';
const FALLBACK = './';
const CORE = [
  './',
  './manifest.webmanifest',
  './site.min.css?v=b842bd161f',
  './styles-webflow-redesign.css?v=20260930-polish2',
  './ux-upgrade.css?v=20260930-1',
  './script-v2.min.js?v=b842bd161f',
  './ux-upgrade.js?v=20260930-2',
  './catalog-extras.min.js?v=__ASSET_VERSION__',
  './catalog-extras.min.css?v=__ASSET_VERSION__',
  './assets/favicon-32.png',
  './assets/doctor-ecupep-logo-ui.webp',
  './assets/doctor-ecupep-icon-192.png',
  './assets/doctor-ecupep-icon-512.png'
];

async function putInCache(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    return await putInCache(request, response);
  } catch {
    return (await caches.match(request)) ||
      (fallbackUrl ? await caches.match(fallbackUrl) : Response.error());
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await putInCache(request, await fetch(request));
  } catch {
    return Response.error();
  }
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(CORE.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const needsFreshness =
    isNavigation ||
    ['script', 'style', 'manifest', 'document'].includes(request.destination) ||
    /\.(?:html|css|js|json|webmanifest)$/i.test(url.pathname);

  if (needsFreshness) {
    event.respondWith(networkFirst(request, isNavigation ? FALLBACK : null));
    return;
  }

  if (request.destination === 'image' || /\.(?:png|jpg|jpeg|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

'use strict';

const CACHE = 'doctor-ecupep-v8-blurfix';
const ROOT = './';
const OFFLINE = './offline.html';
const CORE = [
  ROOT,
  OFFLINE,
  './manifest.webmanifest',
  './site.min.css?v=b842bd161f',
  './styles-webflow-redesign.css?v=20260930-polish2',
  './ux-upgrade.css?v=20260930-1',
  './production-polish.css?v=20261001-blurfix1',
  './script-v2.min.js?v=b842bd161f',
  './ux-upgrade.js?v=20260930-3',
  './production-polish.js?v=20261001-blurfix1',
  './analytics.js?v=20260930-prod1',
  './assets/favicon-32.png',
  './assets/doctor-ecupep-logo-ui.webp',
  './assets/doctor-ecupep-icon-192.png',
  './assets/doctor-ecupep-icon-512.png'
];

async function cacheResponse(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    return await cacheResponse(request, response);
  } catch {
    return (await caches.match(request)) || Response.error();
  }
}

async function navigationFirst(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    return await cacheResponse(request, response);
  } catch {
    return (await caches.match(request)) ||
      (await caches.match(ROOT)) ||
      (await caches.match(OFFLINE)) ||
      Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(request, await fetch(request));
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

  if (request.mode === 'navigate') {
    event.respondWith(navigationFirst(request));
    return;
  }

  const mutableResource =
    ['script', 'style', 'manifest', 'document'].includes(request.destination) ||
    /\.(?:html|css|js|json|webmanifest)$/i.test(url.pathname);

  if (mutableResource) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.destination === 'image' || /\.(?:png|jpg|jpeg|webp|avif|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

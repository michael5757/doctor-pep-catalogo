'use strict';

const CACHE = 'doctor-ecupep-v5';
const FALLBACK = './';
const CORE = [
  FALLBACK,
  './manifest.webmanifest',
  './assets/favicon-32.png',
  './assets/doctor-ecupep-icon-192.png'
];

async function cacheResponse(request, response) {
  if (response && response.ok) {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    return await cacheResponse(request, response);
  } catch {
    return (await caches.match(request)) ||
      (fallbackUrl ? await caches.match(fallbackUrl) : Response.error());
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

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const extensionNeedsFreshness = /\.(?:html|css|js|json|webmanifest)$/i.test(url.pathname);
  const mutableResource =
    request.mode === 'navigate' ||
    ['script', 'style', 'manifest', 'document'].includes(request.destination) ||
    extensionNeedsFreshness;

  if (mutableResource) {
    event.respondWith(networkFirst(request, request.mode === 'navigate' ? FALLBACK : null));
    return;
  }

  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

const CACHE_NAME = 'scorepad-static-v5';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './games/canasta/',
  './games/canasta/index.html'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Cache each resource independently so one unavailable path does not
    // prevent the entire service worker from installing.
    await Promise.all(APP_SHELL.map(async path => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) await cache.put(path, response);
      } catch (_) { /* Online fetch may be unavailable during installation. */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('scorecard-static-') || key.startsWith('scorepad-static-')).filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // For page navigation, try the network first so deployed updates appear;
  // if offline, return the exact cached page instead of the homepage for every URL.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        const cached = await caches.match(request) || await caches.match(url.pathname.endsWith('/') ? url.pathname + 'index.html' : request.url);
        if (cached) return cached;
        if (url.pathname.endsWith('/games/canasta') || url.pathname.endsWith('/games/canasta/')) {
          const game = await caches.match('./games/canasta/index.html') || await caches.match('./games/canasta/');
          if (game) return game;
        }
        if (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
          const home = await caches.match('./index.html') || await caches.match('./');
          if (home) return home;
        }
        return new Response('This page is not available offline yet. Connect to the internet and open it once, then try again.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (_) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});

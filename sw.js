// Service Worker básico para cachear y permitir instalación/offline
const NOMBRE_CACHE = 'yoselin-cluedo-v5';
const RECURSOS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.webmanifest',
  './assets/lamansiondeyoselin.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evento) => {
  self.skipWaiting();
  evento.waitUntil(
    caches.open(NOMBRE_CACHE).then((cache) => cache.addAll(RECURSOS))
  );
});

self.addEventListener('activate', (evento) => {
  clients.claim();
  evento.waitUntil(
    caches.keys().then((claves) =>
      Promise.all(claves.filter((c) => c !== NOMBRE_CACHE).map((c) => caches.delete(c)))
    )
  );
});

self.addEventListener('fetch', (evento) => {
  evento.respondWith(
    caches.match(evento.request).then((resp) => resp || fetch(evento.request))
  );
});
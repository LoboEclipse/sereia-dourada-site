/**
 * ==============================================================================
 * SEREIA DOURADA - SERVICE WORKER OFICIAL (PWA / WEB APP)
 * Cache de Alta Performance com Estratégia Network-First
 * ==============================================================================
 */

const CACHE_NAME = 'sereia-dourada-v4';

const STATIC_ASSETS = [
  '/sereia-dourada-site/',
  '/sereia-dourada-site/css/styles.css',
  '/sereia-dourada-site/js/app.js',
  '/sereia-dourada-site/js/firebase-config.js',
  '/sereia-dourada-site/manifest.json',
  '/sereia-dourada-site/assets/logo.png',
  '/sereia-dourada-site/assets/logo.jpg',
  '/sereia-dourada-site/assets/pousada.jpg',
  '/sereia-dourada-site/assets/camping.jpg',
  '/sereia-dourada-site/assets/restaurante.jpg'
];

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Aviso ao pré-carregar cache:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia Network-First com Fallback para Cache
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Não intercepta chamadas externas (Firestore, Google Auth, Fontes)
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone);
          });
        }
        return networkRes;
      })
      .catch(() => {
        return caches.match(req).then((cachedRes) => {
          if (cachedRes) return cachedRes;
          if (req.headers.get('accept')?.includes('text/html')) {
            return caches.match('/sereia-dourada-site/');
          }
          return new Response('Recurso indisponível offline.', { status: 503, statusText: 'Offline' });
        });
      })
  );
});

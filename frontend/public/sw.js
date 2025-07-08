/* eslint-disable no-restricted-globals, no-undef */
const CACHE_NAME = 'saas-pedidos-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/static/media/logo.svg',
  '/manifest.json'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache.filter(url => {
          return !url.includes('chrome-extension') && !url.includes('moz-extension');
        }));
      })
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Función para verificar si la request es cacheable
function isRequestCacheable(request) {
  const url = new URL(request.url);
  
  // Solo cachear HTTP y HTTPS
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }
  
  // Ignorar extensiones del navegador
  if (url.protocol.includes('extension')) {
    return false;
  }
  
  // Ignorar requests del mismo origen si contienen chrome-extension
  if (request.url.includes('chrome-extension') || request.url.includes('moz-extension')) {
    return false;
  }
  
  return true;
}

// Estrategia de cache: Network First para API calls, Cache First para assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Verificar si la request es cacheable antes de procesarla
  if (!isRequestCacheable(request)) {
    return;
  }

  const url = new URL(request.url);

  // API calls - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Solo cachear respuestas GET exitosas y cacheables
          if (request.method === 'GET' && response.status === 200 && isRequestCacheable(request)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone).catch((err) => {
                console.warn('Failed to cache request:', request.url, err);
              });
            });
          }
          return response;
        })
        .catch(() => {
          // Intentar servir desde cache si no hay conexión
          return caches.match(request);
        })
    );
  }
  // Static assets - Cache First
  else {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          // Devolver desde cache si existe
          if (response) {
            return response;
          }
          // Si no está en cache, hacer fetch y cachear solo si es cacheable
          return fetch(request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic' || !isRequestCacheable(request)) {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache).catch((err) => {
                console.warn('Failed to cache request:', request.url, err);
              });
            });
            return response;
          });
        })
    );
  }
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;
  
  if (action === 'close') {
    notification.close();
  } else {
    // Abrir la app o enfocar ventana existente
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
  
  notification.close();
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí puedes implementar lógica para sincronizar datos
      // cuando se recupere la conexión
      console.log('Background sync triggered')
    );
  }
}); 
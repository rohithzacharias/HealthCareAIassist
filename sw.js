// MedAide AI Service Worker
const CACHE_NAME = 'medaide-ai-v1.0.0';
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './offline.html',
  './styles.css',
  './script.js',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('./index.html').catch(() => {
                return caches.match('./offline.html');
              });
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'mood-sync') {
    event.waitUntil(syncMoodData());
  } else if (event.tag === 'study-sync') {
    event.waitUntil(syncStudyData());
  }
});

// Sync mood data when back online
async function syncMoodData() {
  try {
    const moodData = await getStoredMoodData();
    if (moodData.length > 0) {
      // In a real app, this would sync with server
      console.log('Syncing mood data:', moodData);
      await clearStoredMoodData();
    }
  } catch (error) {
    console.error('Failed to sync mood data:', error);
  }
}

// Sync study data when back online
async function syncStudyData() {
  try {
    const studyData = await getStoredStudyData();
    if (studyData.length > 0) {
      // In a real app, this would sync with server
      console.log('Syncing study data:', studyData);
      await clearStoredStudyData();
    }
  } catch (error) {
    console.error('Failed to sync study data:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New study reminder!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'study',
        title: 'Start Studying',
        icon: '/icons/action-study.png'
      },
      {
        action: 'break',
        title: 'Take a Break',
        icon: '/icons/action-break.png'
      }
    ],
    requireInteraction: true,
    tag: 'medaide-notification'
  };

  event.waitUntil(
    self.registration.showNotification('MedAide AI', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'study') {
    event.waitUntil(
      clients.openWindow('/?section=study')
    );
  } else if (event.action === 'break') {
    event.waitUntil(
      clients.openWindow('/?section=wellness')
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', event => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'mood-background-sync') {
    event.waitUntil(syncMoodData());
  }
});

// Utility functions for data management
async function getStoredMoodData() {
  // In a real app, this would use IndexedDB
  return [];
}

async function clearStoredMoodData() {
  // In a real app, this would clear IndexedDB
  console.log('Mood data cleared');
}

async function getStoredStudyData() {
  // In a real app, this would use IndexedDB
  return [];
}

async function clearStoredStudyData() {
  // In a real app, this would clear IndexedDB
  console.log('Study data cleared');
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('MedAide AI Service Worker loaded');

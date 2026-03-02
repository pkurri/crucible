---
name: pwa-builder
description: Progressive Web App builder with offline support, service workers, and native-like experience. Use when building PWAs, implementing offline functionality, adding push notifications, or optimizing for mobile.
triggers:
  - "PWA"
  - "offline"
  - "service worker"
  - "progressive web app"
  - "push notifications"
---

# PWA Builder

Build Progressive Web Apps with offline support, caching strategies, and native-like features.

## Capabilities

- **Offline Support**: Service workers, caching
- **Install Prompt**: Add to home screen
- **Push Notifications**: Web push API
- **Background Sync**: Queue requests offline
- **App Shell**: Instant loading

## Usage

```markdown
@skill pwa-builder

Convert my Next.js app to a PWA:
- Offline: Cache pages and API
- Icons: Generate all sizes
- Manifest: Complete web app manifest
- Push: Enable notifications
```

## Service Worker

```typescript
// sw.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache pages and assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API calls
registerRoute(
  '/api/',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// Cache images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      data: data.url
    })
  );
});
```

## Web App Manifest

```json
{
  "name": "My PWA",
  "short_name": "PWA",
  "description": "A progressive web app",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

## Offline Detection

```typescript
// hooks/useOffline.ts
import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}
```

## Push Notifications

```typescript
// lib/notifications.ts
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  // Send subscription to server
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}

export async function sendNotification(title: string, body: string) {
  const registration = await navigator.serviceWorker.ready;
  
  registration.showNotification(title, {
    body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png'
  });
}
```

## Best Practices

1. **Caching Strategy**: Cache-first for static, stale-while-revalidate for dynamic
2. **Update Flow**: Show update available toast
3. **Storage**: Use IndexedDB for large data
4. **Performance**: Lighthouse score 90+
5. **Install Prompt**: Custom install button

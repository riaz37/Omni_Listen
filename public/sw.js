// PWA is disabled. This worker unregisters itself so stale installations
// from previous builds stop producing precache-404 errors, and deletes the
// old precache so no stale app shell can ever be served again.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() =>
      self.registration.unregister()
    ).then(() =>
      self.clients.matchAll({ type: 'window' })
    ).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});

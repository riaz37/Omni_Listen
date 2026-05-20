// PWA is disabled. This worker unregisters itself so stale installations
// from previous builds stop producing precache-404 errors.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() =>
      self.clients.matchAll({ type: 'window' })
    ).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});

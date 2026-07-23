// PWA is disabled. This worker unregisters itself so stale installations
// from previous builds stop producing precache-404 errors, and deletes the
// old precache so no stale app shell can ever be served again.
//
// Deliberately does NOT force-navigate open tabs after cleanup: doing so
// raced with in-flight client-side (SPA) navigations — e.g. a Back button
// calling router.back() — producing an intermittent blank page when the
// forced reload landed mid-transition. Clearing the caches and unregistering
// is sufficient; nothing stale can be served again regardless, and the
// existing version-skew toast (useVersionSkew) already prompts a refresh
// when a newer deploy is detected.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => caches.delete(key)))
    ).then(() =>
      self.registration.unregister()
    )
  );
});

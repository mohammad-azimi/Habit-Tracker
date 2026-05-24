const CACHE_NAME = "habit-tracker-v1";

function fromScope(path) {
  return new URL(path, self.registration.scope).toString();
}

const APP_SHELL = [
  fromScope("./"),
  fromScope("./habit-tracker.webmanifest"),
  fromScope("./icon-192.png"),
  fromScope("./icon-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      ),
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const dashboardUrl = fromScope("./#/dashboard");

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            return;
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(dashboardUrl);
        }
      }),
  );
});

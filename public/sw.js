const CACHE_NAME = "habit-tracker-v3";

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

  const requestUrl = new URL(event.request.url);

  // Do not intercept API calls or cross-origin requests.
  if (requestUrl.origin !== self.location.origin) return;
  if (requestUrl.pathname.includes("/api/")) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cachedResponse = await caches.match(event.request);

      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.match(fromScope("./"));
    }),
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch (error) {
    payload = {
      title: "Habit Tracker Reminder",
      body: event.data?.text() || "You have pending habits today.",
    };
  }

  const title = payload.title || "Habit Tracker Reminder";

  const options = {
    body: payload.body || "You have pending habits today.",
    icon: fromScope("./icon-192.png"),
    badge: fromScope("./icon-192.png"),
    data: {
      url: fromScope("./#/dashboard"),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || fromScope("./#/dashboard");

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
          return clients.openWindow(targetUrl);
        }
      }),
  );
});

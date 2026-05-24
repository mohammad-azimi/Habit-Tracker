export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // Do not register service worker during development.
  // This prevents cache problems while using npm run dev.
  if (import.meta.env.DEV) return;

  window.addEventListener("load", () => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    const serviceWorkerUrl = `${baseUrl}sw.js`;

    navigator.serviceWorker
      .register(serviceWorkerUrl, {
        scope: baseUrl,
      })
      .then((registration) => {
        console.info("Service worker registered:", registration.scope);
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}

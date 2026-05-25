export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  // In development, remove old service workers so they do not break API calls.
  if (import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      })
      .catch((error) => {
        console.error("Failed to unregister service workers in dev:", error);
      });

    return;
  }

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

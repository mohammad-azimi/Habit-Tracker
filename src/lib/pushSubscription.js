function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export function getClientTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function getReadyServiceWorkerRegistration() {
  if (!isPushSupported()) return null;

  const baseUrl = import.meta.env.BASE_URL || "/";

  const existingRegistration =
    (await navigator.serviceWorker.getRegistration(baseUrl)) ||
    (await navigator.serviceWorker.getRegistration());

  if (existingRegistration?.active) {
    return existingRegistration;
  }

  // In npm run dev, service worker is intentionally disabled.
  // Do not wait forever for navigator.serviceWorker.ready.
  if (import.meta.env.DEV) {
    return null;
  }

  return navigator.serviceWorker.ready;
}

export async function getCurrentPushSubscription() {
  const registration = await getReadyServiceWorkerRegistration();

  if (!registration) return null;

  return registration.pushManager.getSubscription();
}

export async function subscribeBrowserToPush(vapidPublicKey) {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }

  if (!vapidPublicKey) {
    throw new Error("VAPID public key is missing.");
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await getReadyServiceWorkerRegistration();

  if (!registration) {
    throw new Error(
      "Service worker is not active. Use npm run build and npm run preview to test backend push.",
    );
  }

  const existingSubscription = await registration.pushManager.getSubscription();

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });
}

export async function unsubscribeBrowserFromPush() {
  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return {
      ok: true,
      endpoint: "",
    };
  }

  const endpoint = subscription.endpoint;
  const ok = await subscription.unsubscribe();

  return {
    ok,
    endpoint,
  };
}

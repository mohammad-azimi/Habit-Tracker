import webpush from "web-push";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
} else {
  console.warn(
    "VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing. Push notifications will not work.",
  );
}

export function getVapidPublicKey() {
  return publicKey || "";
}

export function buildPushSubscriptionFromRecord(record) {
  return {
    endpoint: record.endpoint,
    keys: {
      p256dh: record.p256dh,
      auth: record.auth,
    },
  };
}

export async function sendPushNotification(subscription, payload) {
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

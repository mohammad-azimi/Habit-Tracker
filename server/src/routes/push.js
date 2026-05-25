import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  buildPushSubscriptionFromRecord,
  getVapidPublicKey,
  sendPushNotification,
} from "../lib/push.js";

const router = Router();

function isValidTimeValue(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""));
}

function normalizeTimezone(value) {
  const timezone = String(value || "").trim();

  if (!timezone) return "UTC";

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return timezone;
  } catch {
    return "UTC";
  }
}

function normalizeSubscription(subscription) {
  const endpoint = String(subscription?.endpoint || "").trim();
  const p256dh = String(subscription?.keys?.p256dh || "").trim();
  const auth = String(subscription?.keys?.auth || "").trim();

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint,
    p256dh,
    auth,
  };
}

router.get("/vapid-public-key", (req, res) => {
  res.json({
    publicKey: getVapidPublicKey(),
  });
});

router.get("/preferences", async (req, res) => {
  try {
    const userId = req.user.id;

    const preference = await prisma.reminderPreference.upsert({
      where: { userId },
      create: {
        userId,
        enabled: false,
        time: "20:00",
        timezone: "UTC",
      },
      update: {},
    });

    res.json({
      preference,
    });
  } catch (error) {
    console.error("Failed to load reminder preferences:", error);
    res.status(500).json({ error: "Failed to load reminder preferences" });
  }
});

router.put("/preferences", async (req, res) => {
  try {
    const userId = req.user.id;

    const enabled =
      typeof req.body.enabled === "boolean" ? req.body.enabled : false;

    const time = isValidTimeValue(req.body.time)
      ? String(req.body.time)
      : "20:00";

    const timezone = normalizeTimezone(req.body.timezone);

    const preference = await prisma.reminderPreference.upsert({
      where: { userId },
      create: {
        userId,
        enabled,
        time,
        timezone,
      },
      update: {
        enabled,
        time,
        timezone,
      },
    });

    res.json({
      message: "Reminder preferences saved",
      preference,
    });
  } catch (error) {
    console.error("Failed to save reminder preferences:", error);
    res.status(500).json({ error: "Failed to save reminder preferences" });
  }
});

router.post("/subscribe", async (req, res) => {
  try {
    const userId = req.user.id;
    const normalized = normalizeSubscription(req.body.subscription);

    if (!normalized) {
      return res.status(400).json({ error: "Invalid push subscription" });
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: normalized.endpoint,
      },
      create: {
        userId,
        endpoint: normalized.endpoint,
        p256dh: normalized.p256dh,
        auth: normalized.auth,
        userAgent: req.headers["user-agent"] || null,
      },
      update: {
        userId,
        p256dh: normalized.p256dh,
        auth: normalized.auth,
        userAgent: req.headers["user-agent"] || null,
      },
    });

    res.json({
      message: "Push subscription saved",
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    res.status(500).json({ error: "Failed to save push subscription" });
  }
});

router.delete("/unsubscribe", async (req, res) => {
  try {
    const userId = req.user.id;
    const endpoint = String(req.body.endpoint || "").trim();

    if (!endpoint) {
      return res.status(400).json({ error: "Endpoint is required" });
    }

    await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });

    res.json({
      message: "Push subscription removed",
    });
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    res.status(500).json({ error: "Failed to remove push subscription" });
  }
});

router.post("/test", async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (!subscriptions.length) {
      return res.status(400).json({
        error: "No push subscriptions found for this user",
      });
    }

    const payload = {
      title: "Habit Tracker Reminder",
      body: "This is a backend test notification.",
      url: "/#/dashboard",
    };

    let sent = 0;
    let removed = 0;

    for (const record of subscriptions) {
      try {
        await sendPushNotification(
          buildPushSubscriptionFromRecord(record),
          payload,
        );
        sent += 1;
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: record.id },
          });
          removed += 1;
        } else {
          console.error("Push test failed:", error);
        }
      }
    }

    res.json({
      message: "Test notification processed",
      sent,
      removed,
    });
  } catch (error) {
    console.error("Failed to send test push notification:", error);
    res.status(500).json({ error: "Failed to send test push notification" });
  }
});

export default router;

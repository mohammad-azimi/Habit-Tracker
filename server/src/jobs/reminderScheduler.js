import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import {
  buildPushSubscriptionFromRecord,
  sendPushNotification,
} from "../lib/push.js";

function getLocalDateParts(timezone) {
  const safeTimezone = timezone || "UTC";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);
  const hour = String(map.hour).padStart(2, "0");
  const minute = String(map.minute).padStart(2, "0");

  return {
    year,
    month,
    day,
    dayIndex: day - 1,
    time: `${hour}:${minute}`,
    dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
  };
}

function countPendingHabitsForDay(monthData, dayIndex) {
  const habits = Array.isArray(monthData?.habits) ? monthData.habits : [];

  const activeHabits = habits.filter((habit) => !habit.archived);

  const pendingHabits = activeHabits.filter(
    (habit) => !Boolean(habit.checks?.[dayIndex]),
  );

  return {
    total: activeHabits.length,
    pending: pendingHabits.length,
  };
}

function isReminderDue(localTime, reminderTime) {
  return localTime >= reminderTime;
}

async function sendReminderForPreference(preference) {
  const local = getLocalDateParts(preference.timezone || "UTC");

  if (!preference.enabled) return;
  if (!isReminderDue(local.time, preference.time)) return;
  if (preference.lastSentDate === local.dateKey) return;

  const monthRecord = await prisma.dashboardMonth.findUnique({
    where: {
      userId_monthKey: {
        userId: preference.userId,
        monthKey: local.monthKey,
      },
    },
  });

  if (!monthRecord?.data) {
    console.log(
      `Reminder skipped for ${preference.userId}: no month data for ${local.monthKey}`,
    );
    return;
  }

  const habitCounts = countPendingHabitsForDay(
    monthRecord.data,
    local.dayIndex,
  );

  if (habitCounts.total <= 0) {
    console.log(`Reminder skipped for ${preference.userId}: no active habits`);
    return;
  }

  if (habitCounts.pending <= 0) {
    await prisma.reminderPreference.update({
      where: { userId: preference.userId },
      data: { lastSentDate: local.dateKey },
    });

    console.log(
      `Reminder marked as done for ${preference.userId}: all habits completed`,
    );

    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: preference.userId,
    },
  });

  if (!subscriptions.length) {
    console.log(
      `Reminder skipped for ${preference.userId}: no push subscriptions`,
    );
    return;
  }

  const payload = {
    title: "Habit Tracker Reminder",
    body: `You still have ${habitCounts.pending} habit(s) left for today.`,
    url: "/#/dashboard",
  };

  let sentCount = 0;
  let removedCount = 0;

  for (const record of subscriptions) {
    try {
      await sendPushNotification(
        buildPushSubscriptionFromRecord(record),
        payload,
      );

      sentCount += 1;
    } catch (error) {
      if (error.statusCode === 404 || error.statusCode === 410) {
        await prisma.pushSubscription.delete({
          where: {
            id: record.id,
          },
        });

        removedCount += 1;
      } else {
        console.error("Failed to send scheduled push:", error);
      }
    }
  }

  if (sentCount > 0) {
    await prisma.reminderPreference.update({
      where: { userId: preference.userId },
      data: {
        lastSentDate: local.dateKey,
      },
    });
  }

  await prisma.reminderLog.create({
    data: {
      userId: preference.userId,
      type: "scheduled",
      status: sentCount > 0 ? "sent" : "failed",
      title: payload.title,
      body: payload.body,
      pendingCount: habitCounts.pending,
      sentCount,
      removedCount,
      error: sentCount > 0 ? null : "No scheduled notification was sent",
    },
  });

  console.log(
    `Reminder processed for ${preference.userId}: sent=${sentCount}, removed=${removedCount}, pending=${habitCounts.pending}`,
  );
}

export function startReminderScheduler() {
  cron.schedule("* * * * *", async () => {
    try {
      const preferences = await prisma.reminderPreference.findMany({
        where: {
          enabled: true,
        },
      });

      for (const preference of preferences) {
        await sendReminderForPreference(preference);
      }
    } catch (error) {
      console.error("Reminder scheduler failed:", error);
    }
  });

  console.log("Reminder scheduler started");
}

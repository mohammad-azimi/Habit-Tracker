import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import {
  buildPushSubscriptionFromRecord,
  sendPushNotification,
} from "../lib/push.js";

function getLocalDateParts(timezone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
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

async function sendReminderForPreference(preference) {
  const local = getLocalDateParts(preference.timezone || "UTC");

  if (local.time !== preference.time) return;
  if (preference.lastSentDate === local.dateKey) return;

  const monthRecord = await prisma.dashboardMonth.findUnique({
    where: {
      userId_monthKey: {
        userId: preference.userId,
        monthKey: local.monthKey,
      },
    },
  });

  if (!monthRecord?.data) return;

  const habitCounts = countPendingHabitsForDay(
    monthRecord.data,
    local.dayIndex,
  );

  if (habitCounts.total <= 0) return;
  if (habitCounts.pending <= 0) {
    await prisma.reminderPreference.update({
      where: { userId: preference.userId },
      data: { lastSentDate: local.dateKey },
    });
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId: preference.userId,
    },
  });

  if (!subscriptions.length) return;

  const payload = {
    title: "Habit Tracker Reminder",
    body: `You still have ${habitCounts.pending} habit(s) left for today.`,
    url: "/#/dashboard",
  };

  let sentCount = 0;

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

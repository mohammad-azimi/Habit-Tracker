import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  ListChecks,
  Sparkles,
} from "lucide-react";
import {
  REMINDER_SENT_KEY,
  loadReminderPrefs,
  subscribeReminderPrefs,
  updateReminderPrefs,
} from "../lib/reminderPrefs";

function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function getCurrentTimeValue() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default function TodayReminderCard({
  habits,
  todayIndex,
  selectedMonthName,
  selectedYear,
  onToggleHabitDay,
}) {
  const [prefs, setPrefs] = useState(() => loadReminderPrefs());
  const [nowTime, setNowTime] = useState(() => getCurrentTimeValue());

  const todayHabits = useMemo(() => {
    if (todayIndex === null || todayIndex < 0) return [];

    return habits
      .filter((habit) => !habit.archived)
      .map((habit) => ({
        ...habit,
        isDoneToday: Boolean(habit.checks?.[todayIndex]),
      }));
  }, [habits, todayIndex]);

  const pendingHabits = useMemo(() => {
    return todayHabits.filter((habit) => !habit.isDoneToday);
  }, [todayHabits]);

  const completedTodayCount = todayHabits.length - pendingHabits.length;
  const totalTodayCount = todayHabits.length;
  const todayPercent = totalTodayCount
    ? Math.round((completedTodayCount / totalTodayCount) * 100)
    : 0;

  const isReminderDue =
    prefs.enabled &&
    pendingHabits.length > 0 &&
    nowTime >= prefs.time &&
    todayIndex !== null;

  const updatePrefs = (patch) => {
    const nextPrefs = updateReminderPrefs(patch);
    setPrefs(nextPrefs);
  };

  const requestBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    const permission = await Notification.requestPermission();

    updatePrefs({
      browserNotifications: permission === "granted",
    });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowTime(getCurrentTimeValue());
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    return subscribeReminderPrefs((nextPrefs) => {
      setPrefs(nextPrefs);
    });
  }, []);

  useEffect(() => {
    if (!prefs.enabled) return;
    if (!prefs.browserNotifications) return;
    if (!isReminderDue) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const todayKey = getTodayKey();
    const sentKey = `${todayKey}-${prefs.time}`;

    try {
      const previousSentKey = localStorage.getItem(REMINDER_SENT_KEY);

      if (previousSentKey === sentKey) return;

      new Notification("Habit Tracker Reminder", {
        body: `You still have ${pendingHabits.length} habit(s) left for today.`,
      });

      localStorage.setItem(REMINDER_SENT_KEY, sentKey);
    } catch (error) {
      console.error("Failed to send reminder notification:", error);
    }
  }, [
    prefs.enabled,
    prefs.browserNotifications,
    prefs.time,
    isReminderDue,
    pendingHabits.length,
  ]);

  if (todayIndex === null) {
    return (
      <div className="theme-card p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-violet-950/30 p-2 text-violet-200 ring-1 ring-violet-900/40">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <div className="theme-section-title">Today Focus</div>
            <div className="theme-section-subtitle">
              Select the current month to see today&apos;s reminder checklist.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`theme-card p-5 ${
        isReminderDue
          ? "border-violet-700/50 shadow-[0_18px_45px_rgba(139,92,246,0.15)]"
          : ""
      }`}
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-2xl p-2 ring-1 ${
              isReminderDue
                ? "bg-violet-400/15 text-violet-200 ring-violet-700/50"
                : "bg-white/[0.04] text-neutral-300 ring-white/5"
            }`}
          >
            {isReminderDue ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="theme-section-title">Today Focus</div>
            <div className="theme-section-subtitle">
              Day {todayIndex + 1} of {selectedMonthName} {selectedYear}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() =>
              updatePrefs({
                enabled: !prefs.enabled,
              })
            }
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-150 active:scale-[0.98] ${
              prefs.enabled
                ? "bg-violet-300 text-black hover:bg-violet-200"
                : "border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Bell className="h-4 w-4" />
            {prefs.enabled ? "Reminder On" : "Reminder Off"}
          </button>

          <label className="inline-flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-neutral-300">
            <Clock className="h-4 w-4 text-neutral-500" />
            <input
              type="time"
              value={prefs.time}
              onChange={(event) =>
                updatePrefs({
                  time: event.target.value,
                })
              }
              className="bg-transparent text-sm text-white outline-none"
            />
          </label>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <ListChecks className="h-4 w-4" />
            Today Total
          </div>
          <div className="text-2xl font-semibold text-white">
            {totalTodayCount}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
          <div className="text-2xl font-semibold text-white">
            {completedTodayCount}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Sparkles className="h-4 w-4" />
            Progress
          </div>
          <div className="text-2xl font-semibold text-white">
            {todayPercent}%
          </div>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-violet-300 transition-all duration-300"
          style={{ width: `${todayPercent}%` }}
        />
      </div>

      {isReminderDue ? (
        <div className="mt-4 rounded-3xl border border-violet-800/40 bg-violet-950/20 px-4 py-3 text-sm text-violet-100">
          Reminder time has passed. You still have{" "}
          <span className="font-semibold text-white">
            {pendingHabits.length}
          </span>{" "}
          habit(s) left for today.
        </div>
      ) : null}

      <div className="mt-5">
        <div className="mb-3 text-sm font-semibold text-neutral-300">
          Pending Today
        </div>

        {pendingHabits.length > 0 ? (
          <div className="space-y-2">
            {pendingHabits.slice(0, 6).map((habit) => (
              <div
                key={habit.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/5 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">
                    {habit.name} <span>{habit.icon}</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    Mark this habit complete for today.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleHabitDay(habit.id, todayIndex)}
                  className="theme-button-secondary w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark Done
                </button>
              </div>
            ))}

            {pendingHabits.length > 6 ? (
              <div className="text-xs text-neutral-500">
                +{pendingHabits.length - 6} more pending habit(s) in the habit
                grid.
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-3xl border border-emerald-900/30 bg-emerald-950/15 px-4 py-4 text-sm text-emerald-200">
            Great job. All active habits are completed for today.
          </div>
        )}
      </div>

      {typeof window !== "undefined" && "Notification" in window ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-neutral-500">
            Browser notifications work while the site is open or allowed by the
            browser.
          </div>

          <button
            type="button"
            onClick={requestBrowserNotifications}
            className="theme-button-secondary w-full sm:w-auto"
          >
            Enable Browser Notification
          </button>
        </div>
      ) : null}
    </div>
  );
}

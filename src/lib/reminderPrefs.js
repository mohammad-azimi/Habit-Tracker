export const REMINDER_PREFS_KEY = "habit-tracker-reminder-prefs-v1";
export const REMINDER_SENT_KEY = "habit-tracker-reminder-sent-v1";

export const DEFAULT_REMINDER_PREFS = {
  enabled: true,
  time: "20:00",
  browserNotifications: false,
};

function normalizeReminderPrefs(value = {}) {
  return {
    enabled:
      typeof value.enabled === "boolean"
        ? value.enabled
        : DEFAULT_REMINDER_PREFS.enabled,
    time:
      typeof value.time === "string" && value.time
        ? value.time
        : DEFAULT_REMINDER_PREFS.time,
    browserNotifications:
      typeof value.browserNotifications === "boolean"
        ? value.browserNotifications
        : DEFAULT_REMINDER_PREFS.browserNotifications,
  };
}

export function loadReminderPrefs() {
  if (typeof window === "undefined") {
    return DEFAULT_REMINDER_PREFS;
  }

  try {
    const raw = localStorage.getItem(REMINDER_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return normalizeReminderPrefs(parsed);
  } catch (error) {
    console.error("Failed to load reminder preferences:", error);
    return DEFAULT_REMINDER_PREFS;
  }
}

export function saveReminderPrefs(prefs) {
  if (typeof window === "undefined") return DEFAULT_REMINDER_PREFS;

  const nextPrefs = normalizeReminderPrefs(prefs);

  try {
    localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify(nextPrefs));

    window.dispatchEvent(
      new CustomEvent("habit-tracker-reminder-prefs-changed", {
        detail: nextPrefs,
      }),
    );
  } catch (error) {
    console.error("Failed to save reminder preferences:", error);
  }

  return nextPrefs;
}

export function updateReminderPrefs(patch) {
  const current = loadReminderPrefs();

  return saveReminderPrefs({
    ...current,
    ...patch,
  });
}

export function resetReminderPrefs() {
  return saveReminderPrefs(DEFAULT_REMINDER_PREFS);
}

export function subscribeReminderPrefs(listener) {
  if (typeof window === "undefined") return () => {};

  const handleCustomChange = (event) => {
    listener(event.detail || loadReminderPrefs());
  };

  const handleStorageChange = (event) => {
    if (event.key === REMINDER_PREFS_KEY) {
      listener(loadReminderPrefs());
    }
  };

  window.addEventListener(
    "habit-tracker-reminder-prefs-changed",
    handleCustomChange,
  );
  window.addEventListener("storage", handleStorageChange);

  return () => {
    window.removeEventListener(
      "habit-tracker-reminder-prefs-changed",
      handleCustomChange,
    );
    window.removeEventListener("storage", handleStorageChange);
  };
}

export function getNotificationPermissionStatus() {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";

  return Notification.permission;
}

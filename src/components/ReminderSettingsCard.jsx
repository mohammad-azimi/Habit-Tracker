import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  ShieldCheck,
  ShieldX,
  Smartphone,
} from "lucide-react";
import {
  getNotificationPermissionStatus,
  loadReminderPrefs,
  resetReminderPrefs,
  subscribeReminderPrefs,
  updateReminderPrefs,
} from "../lib/reminderPrefs";

function getPermissionLabel(permissionStatus) {
  if (permissionStatus === "granted") return "Allowed";
  if (permissionStatus === "denied") return "Blocked";
  if (permissionStatus === "default") return "Not requested";
  return "Unsupported";
}

function getPermissionClasses(permissionStatus) {
  if (permissionStatus === "granted") {
    return "border-emerald-900/40 bg-emerald-950/20 text-emerald-200";
  }

  if (permissionStatus === "denied") {
    return "border-red-900/40 bg-red-950/20 text-red-200";
  }

  return "border-violet-900/40 bg-violet-950/20 text-violet-200";
}

export default function ReminderSettingsCard() {
  const [prefs, setPrefs] = useState(() => loadReminderPrefs());
  const [permissionStatus, setPermissionStatus] = useState(() =>
    getNotificationPermissionStatus(),
  );
  const [statusMessage, setStatusMessage] = useState("");

  const updatePrefs = (patch) => {
    const nextPrefs = updateReminderPrefs(patch);
    setPrefs(nextPrefs);
  };

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatusMessage("Browser notifications are not supported here.");
      return;
    }

    const permission = await Notification.requestPermission();

    setPermissionStatus(permission);
    updatePrefs({
      browserNotifications: permission === "granted",
    });

    if (permission === "granted") {
      setStatusMessage("Browser notifications are now enabled.");
      return;
    }

    if (permission === "denied") {
      setStatusMessage(
        "Notifications are blocked. You need to allow them from browser settings.",
      );
      return;
    }

    setStatusMessage("Notification permission was not enabled.");
  };

  const sendTestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setStatusMessage("Browser notifications are not supported here.");
      return;
    }

    let permission = Notification.permission;

    if (permission !== "granted") {
      permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }

    if (permission !== "granted") {
      updatePrefs({
        browserNotifications: false,
      });
      setStatusMessage("Allow notifications first, then try the test again.");
      return;
    }

    updatePrefs({
      browserNotifications: true,
    });

    const baseUrl = import.meta.env.BASE_URL || "/";

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;

        await registration.showNotification("Habit Tracker Reminder", {
          body: "This is a test reminder notification.",
          icon: `${baseUrl}icon-192.png`,
          badge: `${baseUrl}icon-192.png`,
        });
      } else {
        new Notification("Habit Tracker Reminder", {
          body: "This is a test reminder notification.",
          icon: `${baseUrl}icon-192.png`,
        });
      }

      setStatusMessage("Test notification sent successfully.");
    } catch (error) {
      console.error("Failed to send test notification:", error);
      setStatusMessage("Failed to send test notification.");
    }
  };

  const resetSettings = () => {
    const nextPrefs = resetReminderPrefs();
    setPrefs(nextPrefs);
    setStatusMessage("Reminder settings reset to default.");
  };

  useEffect(() => {
    setPermissionStatus(getNotificationPermissionStatus());

    return subscribeReminderPrefs((nextPrefs) => {
      setPrefs(nextPrefs);
    });
  }, []);

  return (
    <div className="theme-card p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="theme-section-title">Reminder Settings</div>
          <div className="theme-section-subtitle">
            Control today reminders, notification permission, and reminder time.
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${getPermissionClasses(
            permissionStatus,
          )}`}
        >
          {permissionStatus === "granted" ? (
            <ShieldCheck className="h-4 w-4" />
          ) : permissionStatus === "denied" ? (
            <ShieldX className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
          {getPermissionLabel(permissionStatus)}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            {prefs.enabled ? (
              <BellRing className="h-4 w-4 text-violet-300" />
            ) : (
              <Bell className="h-4 w-4 text-neutral-500" />
            )}
            Daily reminder
          </div>

          <button
            type="button"
            onClick={() =>
              updatePrefs({
                enabled: !prefs.enabled,
              })
            }
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition duration-150 active:scale-[0.98] ${
              prefs.enabled
                ? "bg-violet-300 text-black hover:bg-violet-200"
                : "border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            <Bell className="h-4 w-4" />
            {prefs.enabled ? "Reminder On" : "Reminder Off"}
          </button>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Clock className="h-4 w-4 text-violet-300" />
            Reminder time
          </div>

          <input
            type="time"
            value={prefs.time}
            onChange={(event) =>
              updatePrefs({
                time: event.target.value,
              })
            }
            className="theme-input"
          />

          <div className="mt-2 text-xs text-neutral-500">
            The reminder card checks this time while the app is open.
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Smartphone className="h-4 w-4 text-violet-300" />
            Browser notification
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={requestPermission}
              className="theme-button-secondary w-full"
            >
              <CheckCircle2 className="h-4 w-4" />
              Allow Notification
            </button>

            <button
              type="button"
              onClick={sendTestNotification}
              className="theme-button-secondary w-full"
            >
              <Send className="h-4 w-4" />
              Send Test
            </button>
          </div>

          <div className="mt-2 text-xs text-neutral-500">
            For real reminders, notification permission must be allowed.
          </div>
        </div>

        <button
          type="button"
          onClick={resetSettings}
          className="theme-button-secondary w-full"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Reminder Settings
        </button>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-violet-900/40 bg-violet-950/20 px-4 py-3 text-xs leading-5 text-violet-200">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}

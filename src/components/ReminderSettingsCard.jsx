import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  RotateCcw,
  Send,
  Server,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Unplug,
} from "lucide-react";
import {
  getPushPreferences,
  getVapidPublicKey,
  savePushPreferences,
  sendBackendPushTest,
  subscribePushNotification,
  unsubscribePushNotification,
} from "../lib/api";
import {
  getClientTimezone,
  getCurrentPushSubscription,
  isPushSupported,
  subscribeBrowserToPush,
  unsubscribeBrowserFromPush,
} from "../lib/pushSubscription";
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

function normalizeTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ""))
    ? value
    : "20:00";
}

export default function ReminderSettingsCard() {
  const [prefs, setPrefs] = useState(() => loadReminderPrefs());
  const [permissionStatus, setPermissionStatus] = useState(() =>
    getNotificationPermissionStatus(),
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timezone, setTimezone] = useState(() => getClientTimezone());
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const pushSupported = isPushSupported();

  const updateLocalPrefs = (patch) => {
    const nextPrefs = updateReminderPrefs(patch);
    setPrefs(nextPrefs);
    return nextPrefs;
  };

  const loadBackendSettings = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("");

      const [preferenceResponse, browserSubscription] = await Promise.all([
        getPushPreferences(),
        getCurrentPushSubscription(),
      ]);

      const backendPreference = preferenceResponse?.preference;

      if (backendPreference) {
        const nextPrefs = updateReminderPrefs({
          enabled: Boolean(backendPreference.enabled),
          time: normalizeTime(backendPreference.time),
          browserNotifications: Boolean(browserSubscription),
        });

        setPrefs(nextPrefs);
        setTimezone(backendPreference.timezone || getClientTimezone());
      }

      setIsSubscribed(Boolean(browserSubscription));
      setPermissionStatus(getNotificationPermissionStatus());
    } catch (error) {
      console.error("Failed to load backend reminder settings:", error);
      setStatusMessage(
        error.message || "Failed to load backend reminder settings.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettingsToBackend = async (nextPrefs = prefs) => {
    try {
      setIsLoading(true);
      setStatusMessage("");

      const response = await savePushPreferences({
        enabled: Boolean(nextPrefs.enabled),
        time: normalizeTime(nextPrefs.time),
        timezone,
      });

      setStatusMessage(response?.message || "Reminder settings saved.");
    } catch (error) {
      console.error("Failed to save reminder settings:", error);
      setStatusMessage(error.message || "Failed to save reminder settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    if (!pushSupported) {
      setStatusMessage("Push notifications are not supported in this browser.");
      return;
    }

    const permission = await Notification.requestPermission();

    setPermissionStatus(permission);

    if (permission === "granted") {
      const nextPrefs = updateLocalPrefs({
        browserNotifications: true,
      });

      await saveSettingsToBackend(nextPrefs);
      setStatusMessage("Browser notifications are now allowed.");
      return;
    }

    const nextPrefs = updateLocalPrefs({
      browserNotifications: false,
    });

    await saveSettingsToBackend(nextPrefs);
    setStatusMessage("Notification permission was not enabled.");
  };

  const enableBackendPush = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("");

      if (!pushSupported) {
        throw new Error(
          "Push notifications are not supported in this browser.",
        );
      }

      const keyResponse = await getVapidPublicKey();
      const vapidPublicKey = keyResponse?.publicKey;

      const browserSubscription = await subscribeBrowserToPush(vapidPublicKey);

      await subscribePushNotification(browserSubscription);

      const nextPrefs = updateLocalPrefs({
        enabled: true,
        browserNotifications: true,
      });

      await savePushPreferences({
        enabled: true,
        time: normalizeTime(nextPrefs.time),
        timezone,
      });

      setIsSubscribed(true);
      setPermissionStatus(getNotificationPermissionStatus());
      setStatusMessage("Backend push reminders are enabled.");
    } catch (error) {
      console.error("Failed to enable backend push:", error);
      setStatusMessage(error.message || "Failed to enable backend push.");
    } finally {
      setIsLoading(false);
    }
  };

  const disableBackendPush = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("");

      const result = await unsubscribeBrowserFromPush();

      if (result.endpoint) {
        await unsubscribePushNotification(result.endpoint);
      }

      const nextPrefs = updateLocalPrefs({
        enabled: false,
        browserNotifications: false,
      });

      await savePushPreferences({
        enabled: false,
        time: normalizeTime(nextPrefs.time),
        timezone,
      });

      setIsSubscribed(false);
      setPermissionStatus(getNotificationPermissionStatus());
      setStatusMessage("Backend push reminders are disabled.");
    } catch (error) {
      console.error("Failed to disable backend push:", error);
      setStatusMessage(error.message || "Failed to disable backend push.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      setIsLoading(true);
      setStatusMessage("");

      if (!isSubscribed) {
        throw new Error("Enable backend push first, then send a test.");
      }

      const response = await sendBackendPushTest();

      setStatusMessage(
        `Backend test processed. Sent: ${response?.sent ?? 0}, removed: ${
          response?.removed ?? 0
        }.`,
      );
    } catch (error) {
      console.error("Failed to send backend test notification:", error);
      setStatusMessage(error.message || "Failed to send test notification.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSettings = async () => {
    const nextPrefs = resetReminderPrefs();

    setPrefs(nextPrefs);

    try {
      await savePushPreferences({
        enabled: Boolean(nextPrefs.enabled),
        time: normalizeTime(nextPrefs.time),
        timezone,
      });

      setStatusMessage("Reminder settings reset to default.");
    } catch (error) {
      setStatusMessage(
        "Local reminder settings reset, but backend save failed.",
      );
    }
  };

  useEffect(() => {
    loadBackendSettings();

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
            Control local reminders and backend push notifications.
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
            onClick={async () => {
              const nextPrefs = updateLocalPrefs({
                enabled: !prefs.enabled,
              });

              await saveSettingsToBackend(nextPrefs);
            }}
            disabled={isLoading}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
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
              updateLocalPrefs({
                time: normalizeTime(event.target.value),
              })
            }
            onBlur={() => saveSettingsToBackend()}
            disabled={isLoading}
            className="theme-input"
          />

          <div className="mt-2 text-xs text-neutral-500">
            Timezone: {timezone}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Smartphone className="h-4 w-4 text-violet-300" />
            Browser permission
          </div>

          <button
            type="button"
            onClick={requestPermission}
            disabled={isLoading || !pushSupported}
            className="theme-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Allow Notification
          </button>

          <div className="mt-2 text-xs text-neutral-500">
            Browser permission is required before backend push can work.
          </div>
        </div>

        <div className="rounded-3xl border border-violet-900/30 bg-violet-950/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Server className="h-4 w-4 text-violet-300" />
            Backend Push
          </div>

          <div className="mb-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-neutral-400">
            Status:{" "}
            <span
              className={isSubscribed ? "text-emerald-300" : "text-red-300"}
            >
              {isSubscribed ? "Subscribed" : "Not subscribed"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={enableBackendPush}
              disabled={isLoading || !pushSupported}
              className="theme-button-primary w-full disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              <BellRing className="h-4 w-4" />
              Enable Backend Push
            </button>

            <button
              type="button"
              onClick={sendTestNotification}
              disabled={isLoading || !isSubscribed}
              className="theme-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Send Backend Test
            </button>

            <button
              type="button"
              onClick={disableBackendPush}
              disabled={isLoading}
              className="theme-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Unplug className="h-4 w-4" />
              Disable Backend Push
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={resetSettings}
          disabled={isLoading}
          className="theme-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
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

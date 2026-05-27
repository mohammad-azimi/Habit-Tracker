import { getAuthToken } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const REQUEST_TIMEOUT_MS = 15000;

function getFriendlyApiError(error) {
  if (error?.name === "AbortError") {
    return "Request timed out. The backend may be waking up. Please try again.";
  }

  if (
    error instanceof TypeError ||
    String(error?.message || "").includes("Failed to fetch")
  ) {
    return "Could not connect to the API server. Check your internet connection or backend deployment.";
  }

  return error?.message || "API request failed.";
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Your session expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("You do not have permission to perform this action.");
      }

      if (response.status === 404) {
        throw new Error("The requested API endpoint was not found.");
      }

      if (response.status === 413) {
        throw new Error("The uploaded data is too large.");
      }

      if (response.status === 429) {
        throw new Error(
          "Too many requests. Please wait a moment and try again.",
        );
      }

      if (response.status >= 500) {
        throw new Error(
          data?.error ||
            "The server had a problem. If the backend is hosted on Render, it may be waking up.",
        );
      }

      throw new Error(data?.error || "API request failed.");
    }

    return data;
  } catch (error) {
    throw new Error(getFriendlyApiError(error));
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function updateProfile({ username, email, avatarUrl }) {
  return request("/auth/update-profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email,
      avatarUrl,
    }),
  });
}

export function exportAccountData() {
  return request("/auth/export-account");
}

export function importAccountData(payload) {
  return request("/auth/import-account", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function changePassword({ currentPassword, newPassword }) {
  return request("/auth/change-password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });
}

export function deleteAccount() {
  return request("/auth/delete-account", {
    method: "DELETE",
  });
}

export function getAllMonthsExport() {
  return request("/dashboard/export/all");
}

export function getDeletedMonthBackups() {
  return request("/dashboard/deleted-backups");
}

export function restoreDeletedMonthBackup(year, month) {
  return request(`/dashboard/restore/${year}/${month}`, {
    method: "POST",
  });
}

export function deleteDeletedMonthBackup(year, month) {
  return request(`/dashboard/deleted-backups/${year}/${month}`, {
    method: "DELETE",
  });
}

export function getMonthData(year, month) {
  return request(`/dashboard/${year}/${month}`);
}

export function saveMonthData(year, month, data) {
  return request(`/dashboard/${year}/${month}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });
}

export function deleteMonthData(year, month) {
  return request(`/dashboard/${year}/${month}`, {
    method: "DELETE",
  });
}

export function getVapidPublicKey() {
  return request("/push/vapid-public-key");
}

export function getPushPreferences() {
  return request("/push/preferences");
}

export function savePushPreferences({ enabled, time, timezone }) {
  return request("/push/preferences", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      enabled,
      time,
      timezone,
    }),
  });
}

export function subscribePushNotification(subscription) {
  return request("/push/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription,
    }),
  });
}

export function unsubscribePushNotification(endpoint) {
  return request("/push/unsubscribe", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      endpoint,
    }),
  });
}

export function sendBackendPushTest() {
  return request("/push/test", {
    method: "POST",
  });
}

export function getReminderLogs() {
  return request("/push/logs");
}

export function clearReminderLogs() {
  return request("/push/logs", {
    method: "DELETE",
  });
}

export function checkApiHealth() {
  return request("/health");
}
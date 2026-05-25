import { getAuthToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:4000/api");

async function request(path, options = {}) {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
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
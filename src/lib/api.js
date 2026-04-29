import { getAuthToken } from "./auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

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

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const DEFAULT_USER_ID = import.meta.env.VITE_USER_ID || "mohammad";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-user-id": DEFAULT_USER_ID,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "API request failed");
  }

  return data;
}

export function getHealth() {
  return request("/health");
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

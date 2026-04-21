export const STORAGE_KEY = "habit_tracker_v1";

export function loadDashboardData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { months: {} };
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    return { months: {} };
  }
}

export function saveDashboardData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save dashboard data:", error);
  }
}

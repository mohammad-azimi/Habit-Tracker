import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, LogOut, Plus } from "lucide-react";

import ChangePasswordCard from "./components/ChangePasswordCard";
import ArchivedHabitsPanel from "./components/ArchivedHabitsPanel";
import HabitFilters from "./components/HabitFilters";
import ToastNotice from "./components/ToastNotice";
import MonthlySummaryCard from "./components/MonthlySummaryCard";
import MonthlyNotesPanel from "./components/MonthlyNotesPanel";
import EditHabitModal from "./components/EditHabitModal";
import UserProfileCard from "./components/UserProfileCard";
import OverallStatsCard from "./components/OverallStatsCard";
import defaultHabits from "./data/defaultHabits";
import {
  MONTHS,
  WEEKDAY_LABELS,
  createMonthKey,
  getDaysInMonth,
  getWeekRanges,
} from "./lib/date";
import { downloadBlob, toCSV } from "./lib/export";
import {
  changePassword,
  getCurrentUser,
  getMonthData,
  loginUser,
  registerUser,
  saveMonthData,
} from "./lib/api";
import {
  clearAuthSession,
  getAuthToken,
  getAuthUser,
  saveAuthSession,
} from "./lib/auth";

import DashboardHeader from "./components/DashboardHeader";
import ProgressCharts from "./components/ProgressCharts";
import HabitGrid from "./components/HabitGrid";
import MentalStateSection from "./components/MentalStateSection";
import AnalysisPanel from "./components/AnalysisPanel";
import TopHabitsCard from "./components/TopHabitsCard";
import AuthScreen from "./components/AuthScreen";

function buildDefaultMonthData(year, monthIndex) {
  const days = getDaysInMonth(year, monthIndex);

  return {
    habits: defaultHabits.map((habit) => ({
      ...habit,
      checks: Array.from({ length: days }, () => false),
    })),
    mood: Array.from({ length: days }, () => 5),
    motivation: Array.from({ length: days }, () => 5),
    notes: "",
  };
}

function ensureMonthShape(monthData, year, monthIndex) {
  const days = getDaysInMonth(year, monthIndex);
  const safe = monthData || buildDefaultMonthData(year, monthIndex);

  return {
    habits: (safe.habits || []).map((habit, idx) => ({
      id: habit.id || `${habit.name}-${idx}`,
      name: habit.name || `Habit ${idx + 1}`,
      icon: habit.icon || "✅",
      archived: Boolean(habit.archived),
      checks: Array.from({ length: days }, (_, day) =>
        Boolean(habit.checks?.[day]),
      ),
    })),
    mood: Array.from({ length: days }, (_, day) =>
      Number(safe.mood?.[day] ?? 5),
    ),
    motivation: Array.from({ length: days }, (_, day) =>
      Number(safe.motivation?.[day] ?? 5),
    ),
    notes: safe.notes || "",
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildPrintableReportHTML({
  selectedYear,
  selectedMonthName,
  completionPercent,
  totalGoal,
  totalCompleted,
  totalLeft,
  moodAverage,
  motivationAverage,
  bestHabit,
  needsAttentionHabit,
  strongestCurrentStreakHabit,
  analysisRows,
  notes,
}) {
  const habitRows = analysisRows
    .map(
      (row) => `
        <tr>
          <td>${row.name} ${row.icon || ""}</td>
          <td>${row.goal}</td>
          <td>${row.actual}</td>
          <td>${row.left}</td>
          <td>${row.progress}%</td>
          <td>${row.currentStreak || 0}</td>
          <td>${row.bestStreak || 0}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Habit Tracker Report - ${selectedMonthName} ${selectedYear}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 32px;
            color: #111;
            background: #fff;
          }
          h1, h2 {
            margin-bottom: 8px;
          }
          .muted {
            color: #666;
            margin-bottom: 24px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 24px;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 14px;
            padding: 16px;
            background: #fafafa;
          }
          .label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
          }
          .value {
            font-size: 24px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #f3f3f3;
          }
          .section {
            margin-top: 28px;
          }
          .notes {
            border: 1px solid #ddd;
            border-radius: 14px;
            padding: 16px;
            background: #fafafa;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <h1>Habit Tracker Monthly Report</h1>
        <div class="muted">${selectedMonthName} ${selectedYear}</div>

        <div class="grid">
          <div class="card">
            <div class="label">Completion</div>
            <div class="value">${completionPercent}%</div>
          </div>
          <div class="card">
            <div class="label">Total Goal</div>
            <div class="value">${totalGoal}</div>
          </div>
          <div class="card">
            <div class="label">Completed</div>
            <div class="value">${totalCompleted}</div>
          </div>
          <div class="card">
            <div class="label">Left</div>
            <div class="value">${totalLeft}</div>
          </div>
          <div class="card">
            <div class="label">Mood Avg</div>
            <div class="value">${moodAverage}</div>
          </div>
          <div class="card">
            <div class="label">Motivation Avg</div>
            <div class="value">${motivationAverage}</div>
          </div>
        </div>

        <div class="section">
          <h2>Highlights</h2>
          <div class="grid">
            <div class="card">
              <div class="label">Best Habit</div>
              <div>${bestHabit ? `${bestHabit.name} ${bestHabit.icon || ""} (${bestHabit.progress}%)` : "No data"}</div>
            </div>
            <div class="card">
              <div class="label">Needs Attention</div>
              <div>${needsAttentionHabit ? `${needsAttentionHabit.name} ${needsAttentionHabit.icon || ""} (${needsAttentionHabit.progress}%)` : "No data"}</div>
            </div>
            <div class="card">
              <div class="label">Streak Leader</div>
              <div>${strongestCurrentStreakHabit ? `${strongestCurrentStreakHabit.name} ${strongestCurrentStreakHabit.icon || ""} (${strongestCurrentStreakHabit.currentStreak} days)` : "No data"}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Habit Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Habit</th>
                <th>Goal</th>
                <th>Completed</th>
                <th>Left</th>
                <th>Progress</th>
                <th>Current Streak</th>
                <th>Best Streak</th>
              </tr>
            </thead>
            <tbody>
              ${habitRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Monthly Notes</h2>
          <div class="notes">${notes || "No notes for this month."}</div>
        </div>
      </body>
    </html>
  `;
}

function calculateCurrentStreak(checks) {
  let streak = 0;
  let i = checks.length - 1;

  while (i >= 0 && !checks[i]) {
    i -= 1;
  }

  while (i >= 0 && checks[i]) {
    streak += 1;
    i -= 1;
  }

  return streak;
}

function calculateBestStreak(checks) {
  let best = 0;
  let current = 0;

  checks.forEach((checked) => {
    if (checked) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  });

  return best;
}

export default function App() {
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear()),
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    currentDate.getMonth(),
  );

  const [editingHabit, setEditingHabit] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState("");
  const [editingHabitIcon, setEditingHabitIcon] = useState("✅");
  const [isMonthLoaded, setIsMonthLoaded] = useState(false);
  const [monthData, setMonthData] = useState(null);
  const [loadedMonthKey, setLoadedMonthKey] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [habitSearchTerm, setHabitSearchTerm] = useState("");
  const [habitFilterMode, setHabitFilterMode] = useState("all");
  const [toast, setToast] = useState(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✅");

  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const monthKey = createMonthKey(selectedYear, selectedMonthIndex);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);

  const safeMonthData = useMemo(() => {
    return ensureMonthShape(monthData, selectedYear, selectedMonthIndex);
  }, [monthData, selectedYear, selectedMonthIndex]);

  const showToast = (message, type = "success") => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const activeDayCount = useMemo(() => {
    const now = new Date();
    const year = Number(selectedYear);

    if (year < now.getFullYear()) return daysInMonth;
    if (year > now.getFullYear()) return 0;

    if (selectedMonthIndex < now.getMonth()) return daysInMonth;
    if (selectedMonthIndex > now.getMonth()) return 0;

    return Math.min(now.getDate(), daysInMonth);
  }, [selectedYear, selectedMonthIndex, daysInMonth]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapAuth() {
      const token = getAuthToken();
      const savedUser = getAuthUser();

      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          setAuthChecked(true);
        }
        return;
      }

      if (savedUser && !cancelled) {
        setCurrentUser(savedUser);
      }

      try {
        const response = await getCurrentUser();

        if (cancelled) return;

        setCurrentUser(response.user);
      } catch (error) {
        clearAuthSession();

        if (cancelled) return;

        setCurrentUser(null);
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    }

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    if (!authChecked) return;
    if (!currentUser) return;

    let cancelled = false;

    async function loadMonthFromApi() {
      try {
        setIsSyncing(true);
        setIsMonthLoaded(false);
        setLoadedMonthKey(null);

        const response = await getMonthData(
          Number(selectedYear),
          selectedMonthIndex + 1,
        );

        const nextMonthData = response?.data
          ? ensureMonthShape(response.data, selectedYear, selectedMonthIndex)
          : buildDefaultMonthData(selectedYear, selectedMonthIndex);

        if (cancelled) return;

        setMonthData(nextMonthData);
        setLoadedMonthKey(monthKey);
      } catch (error) {
        console.error("Failed to load month from API:", error);

        if (cancelled) return;

        setMonthData(buildDefaultMonthData(selectedYear, selectedMonthIndex));
        setLoadedMonthKey(monthKey);
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
          setIsMonthLoaded(true);
        }
      }
    }

    loadMonthFromApi();

    return () => {
      cancelled = true;
    };
  }, [authChecked, currentUser, selectedYear, selectedMonthIndex, monthKey]);

  useEffect(() => {
    if (!authChecked) return;
    if (!currentUser) return;
    if (!isMonthLoaded) return;
    if (!monthData) return;
    if (loadedMonthKey !== monthKey) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSyncing(true);

        await saveMonthData(
          Number(selectedYear),
          selectedMonthIndex + 1,
          safeMonthData,
        );
      } catch (error) {
        console.error("Failed to save month to API:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [
    authChecked,
    currentUser,
    isMonthLoaded,
    monthData,
    safeMonthData,
    loadedMonthKey,
    monthKey,
    selectedYear,
    selectedMonthIndex,
  ]);

  const updateMonth = (updater) => {
    setMonthData((prev) =>
      updater(ensureMonthShape(prev, selectedYear, selectedMonthIndex)),
    );
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              checks: habit.checks.map((checked, idx) =>
                idx === dayIndex ? !checked : checked,
              ),
            }
          : habit,
      ),
    }));
  };

  const setMentalMetric = (type, dayIndex, value) => {
    const safeValue = Math.max(1, Math.min(10, Number(value) || 1));

    updateMonth((month) => ({
      ...month,
      [type]: month[type].map((item, idx) =>
        idx === dayIndex ? safeValue : item,
      ),
    }));
  };

  const setMonthlyNotes = (value) => {
    updateMonth((month) => ({
      ...month,
      notes: value,
    }));
  };

  const addHabit = () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;

    const safeId = trimmed.toLowerCase().replace(/\s+/g, "-");

    updateMonth((month) => ({
      ...month,
      habits: [
        ...month.habits,
        {
          id: `${safeId}-${Date.now()}`,
          name: trimmed,
          icon: newHabitIcon || "✅",
          archived: false,
          checks: Array.from({ length: daysInMonth }, () => false),
        },
      ],
    }));

    setNewHabitName("");
    setNewHabitIcon("✅");
  };

  const deleteHabit = (habitId) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.filter((habit) => habit.id !== habitId),
    }));
  };

  const archiveHabit = (habitId) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              archived: true,
            }
          : habit,
      ),
    }));

    showToast("Habit archived.", "info");
  };

  const restoreHabit = (habitId) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              archived: false,
            }
          : habit,
      ),
    }));

    showToast("Habit restored.", "success");
  };

  const moveHabitUp = (habitId) => {
    updateMonth((month) => {
      const habits = [...month.habits];
      const index = habits.findIndex((habit) => habit.id === habitId);

      if (index <= 0) return month;

      [habits[index - 1], habits[index]] = [habits[index], habits[index - 1]];

      return {
        ...month,
        habits,
      };
    });
  };

  const moveHabitDown = (habitId) => {
    updateMonth((month) => {
      const habits = [...month.habits];
      const index = habits.findIndex((habit) => habit.id === habitId);

      if (index === -1 || index >= habits.length - 1) return month;

      [habits[index], habits[index + 1]] = [habits[index + 1], habits[index]];

      return {
        ...month,
        habits,
      };
    });
  };
  
  const startEditHabit = (habit) => {
    setEditingHabit(habit);
    setEditingHabitName(habit.name || "");
    setEditingHabitIcon(habit.icon || "✅");
  };

  const closeEditHabit = () => {
    setEditingHabit(null);
    setEditingHabitName("");
    setEditingHabitIcon("✅");
  };

  const saveEditedHabit = () => {
    const trimmedName = editingHabitName.trim();

    if (!editingHabit || !trimmedName) return;

    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === editingHabit.id
          ? {
              ...habit,
              name: trimmedName,
              icon: editingHabitIcon || "✅",
            }
          : habit,
      ),
    }));

    closeEditHabit();
  };

  const resetCurrentMonth = () => {
    setMonthData(buildDefaultMonthData(selectedYear, selectedMonthIndex));
  };

  const handleRegister = async ({ username, email, password }) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const response = await registerUser({ username, email, password });

      saveAuthSession(response);
      setCurrentUser(response.user);
      setMonthData(null);
      setIsMonthLoaded(false);
      setLoadedMonthKey(null);
      showToast("Account created successfully.", "success");
    } catch (error) {
      setAuthError(error.message || "Failed to register");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async ({ identifier, password }) => {
    try {
      setAuthLoading(true);
      setAuthError("");

      const response = await loginUser({ identifier, password });

      saveAuthSession(response);
      setCurrentUser(response.user);
      setMonthData(null);
      setIsMonthLoaded(false);
      setLoadedMonthKey(null);
      showToast("Logged in successfully.", "success");
    } catch (error) {
      setAuthError(error.message || "Failed to login");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setMonthData(null);
    setIsMonthLoaded(false);
    setLoadedMonthKey(null);
    setIsSyncing(false);
    setAuthError("");
  };

  const handleChangePassword = async ({ currentPassword, newPassword }) => {
    try {
      setIsChangingPassword(true);

      await changePassword({
        currentPassword,
        newPassword,
      });

      showToast("Password changed successfully.", "success");
      return { ok: true };
    } catch (error) {
      const message = error.message || "Failed to change password";
      showToast(message, "error");
      return {
        ok: false,
        message,
      };
    } finally {
      setIsChangingPassword(false);
    }
  };

  const analysisRows = useMemo(() => {
    const weekRanges = getWeekRanges(daysInMonth);

    return safeMonthData.habits.map((habit) => {
      const actual = habit.checks.filter(Boolean).length;
      const goal = daysInMonth;
      const left = goal - actual;
      const progress = goal ? Math.round((actual / goal) * 100) : 0;

      const trackedChecks = habit.checks.slice(0, activeDayCount);
      const currentStreak = calculateCurrentStreak(trackedChecks);
      const bestStreak = calculateBestStreak(trackedChecks);

      const weekly = weekRanges.map(([start, end], idx) => {
        const slice = habit.checks.slice(start, end);
        const rate = slice.length
          ? Math.round((slice.filter(Boolean).length / slice.length) * 100)
          : 0;

        return {
          label: `W${idx + 1}`,
          value: rate,
        };
      });

      return {
        ...habit,
        goal,
        actual,
        left,
        progress,
        currentStreak,
        bestStreak,
        weekly,
      };
    });
  }, [safeMonthData, daysInMonth, activeDayCount]);

  const activeAnalysisRows = useMemo(() => {
    return analysisRows.filter((habit) => !habit.archived);
  }, [analysisRows]);

  const archivedAnalysisRows = useMemo(() => {
    return analysisRows.filter((habit) => habit.archived);
  }, [analysisRows]);

  const filteredAnalysisRows = useMemo(() => {
    return activeAnalysisRows.filter((habit) => {
      const matchesSearch = habit.name
        .toLowerCase()
        .includes(habitSearchTerm.trim().toLowerCase());

      if (!matchesSearch) return false;

      if (habitFilterMode === "completed") {
        return habit.progress === 100;
      }

      if (habitFilterMode === "in-progress") {
        return habit.progress > 0 && habit.progress < 100;
      }

      if (habitFilterMode === "not-started") {
        return habit.actual === 0;
      }

      return true;
    });
  }, [activeAnalysisRows, habitSearchTerm, habitFilterMode]);

  const dailyProgress = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const completed = safeMonthData.habits.filter(
        (habit) => habit.checks[dayIndex],
      ).length;
      const total = safeMonthData.habits.length || 1;

      return {
        day: dayIndex + 1,
        value: Math.round((completed / total) * 100),
      };
    });
  }, [safeMonthData, daysInMonth]);

  const weeklyProgress = useMemo(() => {
    return getWeekRanges(daysInMonth).map(([start, end], idx) => {
      const slice = dailyProgress.slice(start, end);

      return {
        label: `Week ${idx + 1}`,
        value: Math.round(average(slice.map((item) => item.value))),
      };
    });
  }, [dailyProgress, daysInMonth]);

  const totalGoal = daysInMonth * safeMonthData.habits.length;
  const totalCompleted = analysisRows.reduce((sum, row) => sum + row.actual, 0);
  const totalLeft = Math.max(totalGoal - totalCompleted, 0);
  const completionPercent = totalGoal
    ? Math.round((totalCompleted / totalGoal) * 100)
    : 0;

  const rankedHabits = [...activeAnalysisRows].sort(
    (a, b) => b.progress - a.progress,
  );

  const mentalStateData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, dayIndex) => ({
      day: dayIndex + 1,
      Mood: Number(safeMonthData.mood[dayIndex] || 1),
      Motivation: Number(safeMonthData.motivation[dayIndex] || 1),
    }));
  }, [safeMonthData, daysInMonth]);

  const monthlySummary = {
    year: selectedYear,
    month: MONTHS[selectedMonthIndex],
    monthKey,
    daysInMonth,
    totalGoal,
    totalCompleted,
    totalLeft,
    completionPercent,
    moodAverage: average(safeMonthData.mood).toFixed(1),
    motivationAverage: average(safeMonthData.motivation).toFixed(1),
    habits: analysisRows,
    dailyProgress,
    weeklyProgress,
    mentalStateData,
    notes: safeMonthData.notes,
  };

  const monthlyInsights = useMemo(() => {
    const sortedByProgress = [...analysisRows].sort(
      (a, b) => b.progress - a.progress,
    );
    const sortedByCurrentStreak = [...analysisRows].sort(
      (a, b) => (b.currentStreak || 0) - (a.currentStreak || 0),
    );

    return {
      bestHabit: sortedByProgress[0] || null,
      needsAttentionHabit:
        sortedByProgress[sortedByProgress.length - 1] || null,
      strongestCurrentStreakHabit: sortedByCurrentStreak[0] || null,
    };
  }, [analysisRows]);

  const exportMonthJSON = () => {
    downloadBlob(
      `habit-tracker-${monthKey}.json`,
      JSON.stringify(monthlySummary, null, 2),
      "application/json",
    );

    showToast("JSON report exported successfully.", "success");
  };

  const exportMonthCSV = () => {
    const rows = [
      ["Habit", "Goal", "Completed", "Left", "Progress %"],
      ...analysisRows.map((row) => [
        row.name,
        row.goal,
        row.actual,
        row.left,
        row.progress,
      ]),
      [],
      ["Day", "Mood", "Motivation", "Daily Progress %"],
      ...Array.from({ length: daysInMonth }, (_, dayIndex) => [
        dayIndex + 1,
        safeMonthData.mood[dayIndex],
        safeMonthData.motivation[dayIndex],
        dailyProgress[dayIndex]?.value ?? 0,
      ]),
    ];

    downloadBlob(
      `habit-tracker-${monthKey}.csv`,
      toCSV(rows),
      "text/csv;charset=utf-8;",
    );

    showToast("CSV report exported successfully.", "success");
  };

  const exportFullBackup = () => {
    downloadBlob(
      `habit-tracker-${monthKey}-backup.json`,
      JSON.stringify(safeMonthData, null, 2),
      "application/json",
    );

    showToast("Backup exported successfully.", "success");
  };

  const exportPrintableHTMLReport = () => {
    const html = buildPrintableReportHTML({
      selectedYear,
      selectedMonthName: MONTHS[selectedMonthIndex],
      completionPercent,
      totalGoal,
      totalCompleted,
      totalLeft,
      moodAverage: average(safeMonthData.mood).toFixed(1),
      motivationAverage: average(safeMonthData.motivation).toFixed(1),
      bestHabit: monthlyInsights.bestHabit,
      needsAttentionHabit: monthlyInsights.needsAttentionHabit,
      strongestCurrentStreakHabit: monthlyInsights.strongestCurrentStreakHabit,
      analysisRows,
      notes: safeMonthData.notes,
    });

    downloadBlob(
      `habit-tracker-${monthKey}-report.html`,
      html,
      "text/html;charset=utf-8;",
    );

    showToast("Printable HTML report exported.", "success");
  };

  const importBackup = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup file");
      }

      setMonthData(ensureMonthShape(parsed, selectedYear, selectedMonthIndex));
      showToast("Backup imported successfully.", "success");
    } catch (error) {
      console.error(error);
      showToast("Backup file is not valid JSON.", "error");
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-6 py-4 shadow-2xl">
          Loading Habit Tracker...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <AuthScreen
          onLogin={handleLogin}
          onRegister={handleRegister}
          isSubmitting={authLoading}
          errorMessage={authError}
        />
        <ToastNotice toast={toast} onClose={closeToast} />
      </>
    );
  }

  if (currentUser && !isMonthLoaded) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-6 py-4 shadow-2xl">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <DashboardHeader
          onExportCSV={exportMonthCSV}
          onExportJSON={exportMonthJSON}
          onExportBackup={exportFullBackup}
          onImportBackup={importBackup}
          onExportPrintableHTML={exportPrintableHTMLReport}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-neutral-400">
            {isSyncing
              ? "Syncing with server..."
              : `Logged in as ${currentUser.username} • Connected to PostgreSQL API`}
          </div>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium inline-flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <section className="xl:col-span-3 space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="text-xl font-semibold">HABIT TRACKER</div>
              <div className="text-neutral-400 mt-1">
                - {MONTHS[selectedMonthIndex]} -
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <CalendarDays className="h-4 w-4" />
                Calendar Settings
              </div>

              <UserProfileCard user={currentUser} />

              <ChangePasswordCard
                onSubmit={handleChangePassword}
                isSubmitting={isChangingPassword}
              />

              <div>
                <label className="text-xs text-neutral-500 mb-2 block">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none"
                >
                  {[2025, 2026, 2027, 2028].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-500 mb-2 block">
                  Month
                </label>
                <select
                  value={selectedMonthIndex}
                  onChange={(e) =>
                    setSelectedMonthIndex(Number(e.target.value))
                  }
                  className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none"
                >
                  {MONTHS.map((month, index) => (
                    <option key={month} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-3">
              <div className="text-sm font-semibold text-neutral-300">
                Add Habit
              </div>

              <input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name"
                className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none"
              />

              <input
                value={newHabitIcon}
                onChange={(e) => setNewHabitIcon(e.target.value)}
                placeholder="Icon, e.g. ✅"
                className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none"
              />

              <button
                onClick={addHabit}
                className="w-full rounded-2xl bg-white text-black hover:bg-neutral-200 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Habit
              </button>

              <button
                onClick={resetCurrentMonth}
                className="w-full rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium"
              >
                Reset Current Month
              </button>
            </div>

            <TopHabitsCard habits={rankedHabits} />

            <ArchivedHabitsPanel
              archivedHabits={archivedAnalysisRows}
              onRestoreHabit={restoreHabit}
            />
          </section>

          <section className="xl:col-span-6 space-y-4">
            <ProgressCharts
              dailyProgress={dailyProgress}
              weeklyProgress={weeklyProgress}
            />

            <HabitFilters
              searchTerm={habitSearchTerm}
              onChangeSearchTerm={setHabitSearchTerm}
              filterMode={habitFilterMode}
              onChangeFilterMode={setHabitFilterMode}
            />

            <HabitGrid
              habits={filteredAnalysisRows}
              daysInMonth={daysInMonth}
              weekdayLabels={WEEKDAY_LABELS}
              onToggleHabitDay={toggleHabitDay}
              onDeleteHabit={deleteHabit}
              onStartEditHabit={startEditHabit}
              onMoveHabitUp={moveHabitUp}
              onMoveHabitDown={moveHabitDown}
              onArchiveHabit={archiveHabit}
            />

            <MentalStateSection
              daysInMonth={daysInMonth}
              mood={safeMonthData.mood}
              motivation={safeMonthData.motivation}
              mentalStateData={mentalStateData}
              onSetMentalMetric={setMentalMetric}
            />

            <MonthlyNotesPanel
              notes={safeMonthData.notes}
              onChangeNotes={setMonthlyNotes}
            />
          </section>

          <div className="xl:col-span-3 space-y-4">
            <OverallStatsCard
              totalGoal={totalGoal}
              totalCompleted={totalCompleted}
              totalLeft={totalLeft}
              completionPercent={completionPercent}
            />

            <MonthlySummaryCard
              selectedYear={selectedYear}
              selectedMonthName={MONTHS[selectedMonthIndex]}
              completionPercent={completionPercent}
              moodAverage={average(safeMonthData.mood).toFixed(1)}
              motivationAverage={average(safeMonthData.motivation).toFixed(1)}
              bestHabit={monthlyInsights.bestHabit}
              needsAttentionHabit={monthlyInsights.needsAttentionHabit}
              strongestCurrentStreakHabit={
                monthlyInsights.strongestCurrentStreakHabit
              }
            />

            <AnalysisPanel
              totalGoal={totalGoal}
              totalCompleted={totalCompleted}
              totalLeft={totalLeft}
              completionPercent={completionPercent}
              analysisRows={analysisRows}
            />

            <EditHabitModal
              isOpen={Boolean(editingHabit)}
              habitName={editingHabitName}
              habitIcon={editingHabitIcon}
              onChangeName={setEditingHabitName}
              onChangeIcon={setEditingHabitIcon}
              onClose={closeEditHabit}
              onSave={saveEditedHabit}
            />
          </div>
        </div>
      </div>

      <ToastNotice toast={toast} onClose={closeToast} />
    </div>
  );
}

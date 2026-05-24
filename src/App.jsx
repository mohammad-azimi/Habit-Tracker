import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Plus,
  RotateCcw,
  Trash2,
  UserCircle,
} from "lucide-react";
import StreakLeaderboardCard from "./components/StreakLeaderboardCard";
import YearlyOverviewCard from "./components/YearlyOverviewCard";
import MonthComparisonCard from "./components/MonthComparisonCard";
import MonthlyReviewCard from "./components/MonthlyReviewCard";
import { exportDashboardPdf } from "./lib/pdfReport";
import CopyMonthModal from "./components/CopyMonthModal";
import ConfirmActionModal from "./components/ConfirmActionModal";
import ProfilePage from "./components/ProfilePage";
import ArchivedHabitsPanel from "./components/ArchivedHabitsPanel";
import HabitFilters from "./components/HabitFilters";
import ToastNotice from "./components/ToastNotice";
import MonthlySummaryCard from "./components/MonthlySummaryCard";
import MonthlyNotesPanel from "./components/MonthlyNotesPanel";
import EditHabitModal from "./components/EditHabitModal";
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
  deleteAccount,
  deleteDeletedMonthBackup,
  deleteMonthData,
  exportAccountData,
  getAllMonthsExport,
  getCurrentUser,
  getDeletedMonthBackups,
  getMonthData,
  importAccountData,
  loginUser,
  registerUser,
  restoreDeletedMonthBackup,
  saveMonthData,
  updateProfile,
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
import {
  formatGoalTypeLabel,
  normalizeGoalType,
  normalizeGoalValue,
} from "./lib/goalType";
import ActiveHabitFilters from "./components/ActiveHabitFilters";
import HabitQuickFilters from "./components/HabitQuickFilters";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import ErrorBoundary from "./components/ErrorBoundary";
import DashboardStateCard from "./components/DashboardStateCard";
import DashboardLoadingCard from "./components/DashboardLoadingCard";
import AnalyticsHighlightsCard from "./components/AnalyticsHighlightsCard";
import WeekdayPerformanceCard from "./components/WeekdayPerformanceCard";
import WeeklyMomentumCard from "./components/WeeklyMomentumCard";
import habitTemplates from "./data/habitTemplates";
import HabitTemplatesCard from "./components/HabitTemplatesCard";
import DashboardPreferencesCard from "./components/DashboardPreferencesCard";
import FullScreenStatus from "./components/FullScreenStatus";
import SyncStatusBadge from "./components/SyncStatusBadge";
import AchievementsCard from "./components/AchievementsCard";
import TodayReminderCard from "./components/TodayReminderCard";
import ReminderSettingsCard from "./components/ReminderSettingsCard";

function getHabitMonthlyGoal(habit, daysInMonth) {
  const targetType = habit?.targetType || "daily";
  const targetValue = Math.max(1, Number(habit?.targetValue || 1));

  if (targetType === "daily") {
    return Math.min(daysInMonth, targetValue * daysInMonth);
  }

  if (targetType === "weekly") {
    const weeksInMonth = Math.ceil(daysInMonth / 7);
    return targetValue * weeksInMonth;
  }

  if (targetType === "monthly") {
    return targetValue;
  }

  return daysInMonth;
}

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
    review: {
      wins: "",
      blockers: "",
      nextFocus: "",
    },
  };
}

function ensureReviewShape(review = {}) {
  return {
    wins: typeof review?.wins === "string" ? review.wins : "",
    blockers: typeof review?.blockers === "string" ? review.blockers : "",
    nextFocus: typeof review?.nextFocus === "string" ? review.nextFocus : "",
  };
}

function isEffectivelyEmptyMonth(monthData) {
  if (!monthData) return true;

  const hasAnyCompletedHabit = (monthData.habits || []).some((habit) =>
    (habit.checks || []).some(Boolean),
  );

  const hasNotes = Boolean(monthData.notes?.trim());

  const hasReview = Boolean(
    monthData.review?.wins?.trim() ||
    monthData.review?.blockers?.trim() ||
    monthData.review?.nextFocus?.trim(),
  );

  const hasNonDefaultMood = (monthData.mood || []).some(
    (value) => Number(value) !== 5,
  );

  const hasNonDefaultMotivation = (monthData.motivation || []).some(
    (value) => Number(value) !== 5,
  );

  const hasChangedHabitStructure =
    (monthData.habits || []).length !== defaultHabits.length ||
    (monthData.habits || []).some((habit, index) => {
      const baseHabit = defaultHabits[index];
      if (!baseHabit) return true;

      return (
        habit.name !== baseHabit.name ||
        habit.icon !== baseHabit.icon ||
        Boolean(habit.archived) ||
        (habit.targetType || "daily") !== (baseHabit.targetType || "daily") ||
        Number(habit.targetValue || 1) !== Number(baseHabit.targetValue || 1)
      );
    });

  return !(
    hasAnyCompletedHabit ||
    hasNotes ||
    hasReview ||
    hasNonDefaultMood ||
    hasNonDefaultMotivation ||
    hasChangedHabitStructure
  );
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
      targetType: normalizeGoalType(habit.targetType),
      targetValue: normalizeGoalValue(habit.targetValue),
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
    review: ensureReviewShape(safe.review),
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateConsistencyScore(rows) {
  if (!rows.length) return 0;

  const averageProgress =
    rows.reduce((sum, row) => sum + Number(row.progress || 0), 0) / rows.length;

  const activeHabitsCount = rows.filter(
    (row) => Number(row.actual || 0) > 0,
  ).length;
  const activityCoverage = (activeHabitsCount / rows.length) * 100;

  return Math.round(averageProgress * 0.7 + activityCoverage * 0.3);
}

function getBestDaySummary(habits, daysInMonth, weekdayLabels) {
  if (!habits.length || daysInMonth <= 0) return null;

  let best = null;

  for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex += 1) {
    const completed = habits.reduce(
      (sum, habit) => sum + (habit.checks?.[dayIndex] ? 1 : 0),
      0,
    );

    const total = habits.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;

    if (!best || completed > best.completed) {
      best = {
        day: dayIndex + 1,
        weekday: weekdayLabels[dayIndex % 7],
        completed,
        total,
        percent,
      };
    }
  }

  return best && best.completed > 0 ? best : null;
}

function getStrongestGoalType(rows) {
  if (!rows.length) return null;

  const grouped = rows.reduce((acc, row) => {
    const key = row.targetType || "daily";

    if (!acc[key]) {
      acc[key] = {
        key,
        goal: 0,
        actual: 0,
      };
    }

    acc[key].goal += Number(row.goal || 0);
    acc[key].actual += Number(row.actual || 0);

    return acc;
  }, {});

  const mapped = Object.values(grouped).map((item) => {
    const progress = item.goal
      ? Math.min(100, Math.round((item.actual / item.goal) * 100))
      : 0;

    const labelMap = {
      daily: "Daily Goals",
      weekly: "Weekly Goals",
      monthly: "Monthly Goals",
    };

    return {
      ...item,
      label: labelMap[item.key] || item.key,
      progress,
    };
  });

  mapped.sort((a, b) => b.progress - a.progress || b.actual - a.actual);

  return mapped[0] || null;
}

function getTrendInsight(dailyProgress) {
  if (!dailyProgress.length) {
    return {
      title: "No trend yet",
      description: "Track a few days to unlock monthly trend insights.",
    };
  }

  const values = dailyProgress.map((item) => Number(item.value || 0));
  const validValues = values.filter((value) => Number.isFinite(value));

  if (!validValues.length) {
    return {
      title: "No trend yet",
      description: "Track a few days to unlock monthly trend insights.",
    };
  }

  const average =
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length;

  const midpoint = Math.max(1, Math.floor(validValues.length / 2));
  const firstHalf = validValues.slice(0, midpoint);
  const secondHalf = validValues.slice(midpoint);

  const avgFirstHalf = firstHalf.length
    ? firstHalf.reduce((sum, value) => sum + value, 0) / firstHalf.length
    : 0;

  const avgSecondHalf = secondHalf.length
    ? secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length
    : avgFirstHalf;

  const last7 = validValues.slice(-7);
  const first7 = validValues.slice(0, 7);

  const avgLast7 = last7.length
    ? last7.reduce((sum, value) => sum + value, 0) / last7.length
    : average;

  const avgFirst7 = first7.length
    ? first7.reduce((sum, value) => sum + value, 0) / first7.length
    : average;

  let swingCount = 0;
  for (let i = 1; i < validValues.length; i += 1) {
    if (Math.abs(validValues[i] - validValues[i - 1]) >= 25) {
      swingCount += 1;
    }
  }

  if (avgLast7 >= average + 10 && avgLast7 >= 75) {
    return {
      title: "Strong finish",
      description: "Your final stretch is stronger than your monthly average.",
    };
  }

  if (avgSecondHalf >= avgFirstHalf + 10) {
    return {
      title: "Improving",
      description:
        "Your second-half performance is clearly better than your first half.",
    };
  }

  if (swingCount >= 5) {
    return {
      title: "Unstable rhythm",
      description:
        "Your progress swings a lot from day to day. A steadier routine could help.",
    };
  }

  if (avgLast7 <= avgFirst7 - 12 && average < 70) {
    return {
      title: "Needs reset",
      description:
        "Your recent momentum dropped. A small reset could help you recover consistency.",
    };
  }

  return {
    title: "Steady rhythm",
    description: "Your month looks balanced and reasonably consistent overall.",
  };
}

function getWeekdayPerformance(habits, daysInMonth, weekdayLabels) {
  if (!habits.length || daysInMonth <= 0) {
    return {
      rows: [],
      bestWeekday: null,
      weakestWeekday: null,
    };
  }

  const grouped = weekdayLabels.map((label) => ({
    label,
    completed: 0,
    total: 0,
    percent: 0,
  }));

  for (let dayIndex = 0; dayIndex < daysInMonth; dayIndex += 1) {
    const weekdayIndex = dayIndex % weekdayLabels.length;
    const completed = habits.reduce(
      (sum, habit) => sum + (habit.checks?.[dayIndex] ? 1 : 0),
      0,
    );

    grouped[weekdayIndex].completed += completed;
    grouped[weekdayIndex].total += habits.length;
  }

  const rows = grouped.map((item) => ({
    ...item,
    percent: item.total ? Math.round((item.completed / item.total) * 100) : 0,
  }));

  const rowsWithData = rows.filter((row) => row.total > 0);

  if (!rowsWithData.length) {
    return {
      rows,
      bestWeekday: null,
      weakestWeekday: null,
    };
  }

  const sorted = [...rowsWithData].sort(
    (a, b) => b.percent - a.percent || b.completed - a.completed,
  );

  const weakestSorted = [...rowsWithData].sort(
    (a, b) => a.percent - b.percent || a.completed - b.completed,
  );

  return {
    rows,
    bestWeekday: sorted[0] || null,
    weakestWeekday: weakestSorted[0] || null,
  };
}

function getWeeklyMomentum(weeklyProgress) {
  if (!weeklyProgress.length) {
    return {
      strongestWeek: null,
      weakestWeek: null,
      trend: "stable",
    };
  }

  const strongestWeek =
    [...weeklyProgress].sort((a, b) => b.value - a.value)[0] || null;

  const weakestWeek =
    [...weeklyProgress].sort((a, b) => a.value - b.value)[0] || null;

  const firstHalf = weeklyProgress.slice(
    0,
    Math.ceil(weeklyProgress.length / 2),
  );
  const secondHalf = weeklyProgress.slice(Math.ceil(weeklyProgress.length / 2));

  const avgFirstHalf = firstHalf.length
    ? firstHalf.reduce((sum, item) => sum + item.value, 0) / firstHalf.length
    : 0;

  const avgSecondHalf = secondHalf.length
    ? secondHalf.reduce((sum, item) => sum + item.value, 0) / secondHalf.length
    : avgFirstHalf;

  let trend = "stable";

  if (avgSecondHalf >= avgFirstHalf + 8) {
    trend = "improving";
  } else if (avgSecondHalf <= avgFirstHalf - 8) {
    trend = "slowing";
  }

  return {
    strongestWeek,
    weakestWeek,
    trend,
  };
}

function getPreviousMonthMeta(selectedYear, selectedMonthIndex) {
  const year = Number(selectedYear);

  if (selectedMonthIndex === 0) {
    return {
      year: year - 1,
      monthIndex: 11,
    };
  }

  return {
    year,
    monthIndex: selectedMonthIndex - 1,
  };
}

function getNextMonthMeta(selectedYear, selectedMonthIndex) {
  const year = Number(selectedYear);

  if (selectedMonthIndex === 11) {
    return {
      year: year + 1,
      monthIndex: 0,
    };
  }

  return {
    year,
    monthIndex: selectedMonthIndex + 1,
  };
}

function buildCopiedMonthData(monthData, nextYear, nextMonthIndex) {
  const nextDays = getDaysInMonth(nextYear, nextMonthIndex);
  const safe = ensureMonthShape(monthData, nextYear, nextMonthIndex);

  return {
    habits: safe.habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      archived: Boolean(habit.archived),
      targetType: normalizeGoalType(habit.targetType),
      targetValue: normalizeGoalValue(habit.targetValue),
      checks: Array.from({ length: nextDays }, () => false),
    })),
    mood: Array.from({ length: nextDays }, () => 5),
    motivation: Array.from({ length: nextDays }, () => 5),
    notes: "",
    review: {
      wins: "",
      blockers: "",
      nextFocus: "",
    },
  };
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
        <td>${formatGoalTypeLabel(row.targetType, row.targetValue)}</td>
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

  const bestHabitText = bestHabit
    ? `${bestHabit.name} ${bestHabit.icon || ""} • ${formatGoalTypeLabel(bestHabit.targetType, bestHabit.targetValue)} • ${bestHabit.progress}%`
    : "No data";

  const needsAttentionHabitText = needsAttentionHabit
    ? `${needsAttentionHabit.name} ${needsAttentionHabit.icon || ""} • ${formatGoalTypeLabel(needsAttentionHabit.targetType, needsAttentionHabit.targetValue)} • ${needsAttentionHabit.progress}%`
    : "No data";

  const streakLeaderText = strongestCurrentStreakHabit
    ? `${strongestCurrentStreakHabit.name} ${strongestCurrentStreakHabit.icon || ""} • ${formatGoalTypeLabel(
        strongestCurrentStreakHabit.targetType,
        strongestCurrentStreakHabit.targetValue,
      )} • ${strongestCurrentStreakHabit.currentStreak} days`
    : "No data";

  const notesText = notes?.trim() || "No notes for this month.";

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
              <div>${bestHabitText}</div>
            </div>
            <div class="card">
              <div class="label">Needs Attention</div>
              <div>${needsAttentionHabitText}</div>
            </div>
            <div class="card">
              <div class="label">Streak Leader</div>
              <div>${streakLeaderText}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Habit Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Habit</th>
                <th>Goal Type</th>
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
          <div class="notes">${notesText}</div>
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

function sortHabits(rows, sortMode) {
  const items = [...rows];

  switch (sortMode) {
    case "manual":
      return items;

    case "current-streak-desc":
      return items.sort(
        (a, b) =>
          (b.currentStreak || 0) - (a.currentStreak || 0) ||
          b.progress - a.progress,
      );

    case "best-streak-desc":
      return items.sort(
        (a, b) =>
          (b.bestStreak || 0) - (a.bestStreak || 0) || b.progress - a.progress,
      );

    case "completed-desc":
      return items.sort(
        (a, b) => (b.actual || 0) - (a.actual || 0) || b.progress - a.progress,
      );

    case "name-asc":
      return items.sort((a, b) => a.name.localeCompare(b.name));

    case "progress-desc":
    default:
      return items.sort(
        (a, b) =>
          (b.progress || 0) - (a.progress || 0) ||
          (b.currentStreak || 0) - (a.currentStreak || 0),
      );
  }
}

function normalizeHabitName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function buildHabitsFromTemplate(templateHabits, daysInMonth, existingHabits) {
  const existingNames = new Set(
    existingHabits.map((habit) => normalizeHabitName(habit.name)),
  );

  return templateHabits
    .filter((habit) => !existingNames.has(normalizeHabitName(habit.name)))
    .map((habit, index) => {
      const safeName = String(habit.name || `Habit ${index + 1}`).trim();
      const safeId = safeName.toLowerCase().replace(/\s+/g, "-");

      return {
        id: `${safeId}-${Date.now()}-${index}`,
        name: safeName,
        icon: habit.icon || "✅",
        archived: false,
        targetType: normalizeGoalType(habit.targetType),
        targetValue: normalizeGoalValue(habit.targetValue),
        checks: Array.from({ length: daysInMonth }, () => false),
      };
    });
}

const CUSTOM_HABIT_TEMPLATES_KEY = "habit-tracker-custom-templates";

function loadCustomHabitTemplates() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CUSTOM_HABIT_TEMPLATES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load custom habit templates:", error);
    return [];
  }
}

function saveCustomHabitTemplates(templates) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CUSTOM_HABIT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error("Failed to save custom habit templates:", error);
  }
}

function buildTemplateFromCurrentHabits(habits, title) {
  return {
    id: `custom-template-${Date.now()}`,
    title: String(title || "").trim(),
    description: "Saved from your current active habit setup.",
    isCustom: true,
    habits: habits.map((habit) => ({
      name: habit.name,
      icon: habit.icon,
      targetType: normalizeGoalType(habit.targetType),
      targetValue: normalizeGoalValue(habit.targetValue),
    })),
  };
}

function normalizeImportedCustomTemplate(template, index = 0) {
  const safeTitle = String(template?.title || `Imported Template ${index + 1}`)
    .trim()
    .replace(/\s+/g, " ");

  const safeHabits = Array.isArray(template?.habits)
    ? template.habits
        .map((habit, habitIndex) => ({
          name: String(habit?.name || `Habit ${habitIndex + 1}`)
            .trim()
            .replace(/\s+/g, " "),
          icon: String(habit?.icon || "✅").trim() || "✅",
          targetType: normalizeGoalType(habit?.targetType),
          targetValue: normalizeGoalValue(habit?.targetValue),
        }))
        .filter((habit) => habit.name)
    : [];

  return {
    id: `custom-template-${Date.now()}-${index}`,
    title: safeTitle,
    description: String(
      template?.description || "Imported custom habit template.",
    ).trim(),
    isCustom: true,
    habits: safeHabits,
  };
}

function getExportFilterSummary({
  habitSearchTerm,
  habitFilterMode,
  goalTypeFilter,
  habitSortMode,
  filteredCount,
}) {
  const statusMap = {
    all: "All habits",
    completed: "Completed only",
    "in-progress": "In progress only",
    "not-started": "Not started only",
  };

  const goalTypeMap = {
    all: "All goal types",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
  };

  const sortMap = {
    manual: "Manual Order",
    "progress-desc": "Progress",
    "current-streak-desc": "Current Streak",
    "best-streak-desc": "Best Streak",
    "completed-desc": "Completed Count",
    "name-asc": "Name (A-Z)",
  };

  return {
    search: habitSearchTerm.trim() || "None",
    status: statusMap[habitFilterMode] || habitFilterMode,
    goalType: goalTypeMap[goalTypeFilter] || goalTypeFilter,
    sort: sortMap[habitSortMode] || habitSortMode,
    filteredCount,
  };
}

function sanitizeFilenamePart(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-");
}

function buildExportBaseName({
  selectedYear,
  selectedMonthName,
  scope = "full",
}) {
  const safeMonth = sanitizeFilenamePart(selectedMonthName);
  const safeScope = sanitizeFilenamePart(scope);

  return `habit-tracker-${selectedYear}-${safeMonth}-${safeScope}`;
}

function buildExportMetadata({
  selectedYear,
  selectedMonthName,
  monthKey,
  exportType,
  filters = null,
}) {
  return {
    exportedAt: new Date().toISOString(),
    exportType,
    monthKey,
    month: selectedMonthName,
    year: selectedYear,
    filters,
  };
}

function getHabitFormError({
  name,
  targetValue,
  existingHabits,
  editingHabitId = null,
}) {
  const trimmedName = String(name || "")
    .trim()
    .replace(/\s+/g, " ");
  const normalizedName = normalizeHabitName(trimmedName);
  const numericTargetValue = Number(targetValue);

  if (!trimmedName) {
    return "Habit name cannot be empty.";
  }

  if (trimmedName.length < 2) {
    return "Habit name must be at least 2 characters.";
  }

  if (trimmedName.length > 40) {
    return "Habit name must be 40 characters or less.";
  }

  if (!Number.isFinite(numericTargetValue) || numericTargetValue < 1) {
    return "Target value must be at least 1.";
  }

  const alreadyExists = existingHabits.some(
    (habit) =>
      habit.id !== editingHabitId &&
      normalizeHabitName(habit.name) === normalizedName,
  );

  if (alreadyExists) {
    return "A habit with this name already exists.";
  }

  return "";
}

const DASHBOARD_PREFS_KEY = "habit-tracker-dashboard-prefs";
const DEFAULT_DASHBOARD_PREFS = {
  selectedYear: null,
  selectedMonthIndex: null,
  habitSortMode: "manual",
  autoScrollToToday: true,
  showArchivedHabits: true,
  showAdvancedAnalytics: true,
  showTodayProgress: true,
  showTopHabits: true,
  showYearlyOverview: true,
  showStreakLeaderboard: true,
  habitSearchTerm: "",
  habitFilterMode: "all",
  goalTypeFilter: "all",
};
const YEAR_OPTIONS = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];

function loadDashboardPrefs() {
  if (typeof window === "undefined") {
    return DEFAULT_DASHBOARD_PREFS;
  }

  try {
    const raw = localStorage.getItem(DASHBOARD_PREFS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      ...DEFAULT_DASHBOARD_PREFS,
      ...parsed,
      selectedMonthIndex: Number.isInteger(parsed?.selectedMonthIndex)
        ? parsed.selectedMonthIndex
        : DEFAULT_DASHBOARD_PREFS.selectedMonthIndex,
      habitSearchTerm:
        typeof parsed?.habitSearchTerm === "string"
          ? parsed.habitSearchTerm
          : DEFAULT_DASHBOARD_PREFS.habitSearchTerm,
    };
  } catch (error) {
    console.error("Failed to load dashboard preferences:", error);
    return DEFAULT_DASHBOARD_PREFS;
  }
}

function saveDashboardPrefs(prefs) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(DASHBOARD_PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error("Failed to save dashboard preferences:", error);
  }
}

export default function App() {
  const currentDate = new Date();
  const navigate = useNavigate();
  const location = useLocation();
  const savedDashboardPrefs = useMemo(() => loadDashboardPrefs(), []);
  const customTemplateFileInputRef = React.useRef(null);
  const fullAccountImportInputRef = React.useRef(null);
  const skipNextAutoSaveRef = React.useRef(false);

  const [selectedYear, setSelectedYear] = useState(
    savedDashboardPrefs?.selectedYear || String(currentDate.getFullYear()),
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    Number.isInteger(savedDashboardPrefs?.selectedMonthIndex)
      ? savedDashboardPrefs.selectedMonthIndex
      : currentDate.getMonth(),
  );

  const [editingHabit, setEditingHabit] = useState(null);
  const [editingHabitName, setEditingHabitName] = useState("");
  const [editingHabitIcon, setEditingHabitIcon] = useState("✅");
  const [editingHabitTargetType, setEditingHabitTargetType] = useState("daily");
  const [editingHabitTargetValue, setEditingHabitTargetValue] = useState(1);
  const [isMonthLoaded, setIsMonthLoaded] = useState(false);
  const [monthData, setMonthData] = useState(null);
  const [loadedMonthKey, setLoadedMonthKey] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState("");
  const [saveTrigger, setSaveTrigger] = useState(0);

  const [habitSortMode, setHabitSortMode] = useState(
    savedDashboardPrefs?.habitSortMode || "manual",
  );
  const [autoScrollToToday, setAutoScrollToToday] = useState(
    savedDashboardPrefs?.autoScrollToToday ?? true,
  );
  const [showArchivedHabits, setShowArchivedHabits] = useState(
    savedDashboardPrefs?.showArchivedHabits ?? true,
  );
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(
    savedDashboardPrefs?.showAdvancedAnalytics ?? true,
  );
  const [showTodayProgress, setShowTodayProgress] = useState(
    savedDashboardPrefs?.showTodayProgress ?? true,
  );
  const [showTopHabits, setShowTopHabits] = useState(
    savedDashboardPrefs?.showTopHabits ?? true,
  );
  const [showYearlyOverview, setShowYearlyOverview] = useState(
    savedDashboardPrefs?.showYearlyOverview ?? true,
  );
  const [showStreakLeaderboard, setShowStreakLeaderboard] = useState(
    savedDashboardPrefs?.showStreakLeaderboard ?? true,
  );
  const [yearlyOverviewData, setYearlyOverviewData] = useState([]);
  const [isYearlyOverviewLoading, setIsYearlyOverviewLoading] = useState(false);
  const [previousMonthData, setPreviousMonthData] = useState(null);
  const [isPreviousMonthLoading, setIsPreviousMonthLoading] = useState(false);
  const [isCopyMonthModalOpen, setIsCopyMonthModalOpen] = useState(false);
  const [copyTargetYear, setCopyTargetYear] = useState(
    String(currentDate.getFullYear()),
  );
  const [copyTargetMonthIndex, setCopyTargetMonthIndex] = useState(
    currentDate.getMonth(),
  );
  const [draggedHabitId, setDraggedHabitId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirmActionSubmitting, setIsConfirmActionSubmitting] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [habitSearchTerm, setHabitSearchTerm] = useState(
    savedDashboardPrefs?.habitSearchTerm || "",
  );
  const [habitFilterMode, setHabitFilterMode] = useState(
    savedDashboardPrefs?.habitFilterMode || "all",
  );
  const [goalTypeFilter, setGoalTypeFilter] = useState(
    savedDashboardPrefs?.goalTypeFilter || "all",
  );
  const [toast, setToast] = useState(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✅");

  const [newHabitTargetType, setNewHabitTargetType] = useState("daily");
  const [newHabitTargetValue, setNewHabitTargetValue] = useState(1);
  const [customHabitTemplates, setCustomHabitTemplates] = useState(() =>
    loadCustomHabitTemplates(),
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileErrorMessage, setProfileErrorMessage] = useState("");
  const [profileSuccessMessage, setProfileSuccessMessage] = useState("");
  const [deletedMonthBackups, setDeletedMonthBackups] = useState([]);
  const [isDeletedMonthBackupsLoading, setIsDeletedMonthBackupsLoading] =
    useState(false);

  const monthKey = createMonthKey(selectedYear, selectedMonthIndex);
  const selectedMonthName = MONTHS[selectedMonthIndex];
  const fullExportBaseName = buildExportBaseName({
    selectedYear,
    selectedMonthName,
    scope: "full",
  });
  const filteredExportBaseName = buildExportBaseName({
    selectedYear,
    selectedMonthName,
    scope: "filtered",
  });
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);
  const now = new Date();

  const isCurrentViewedMonth =
    Number(selectedYear) === now.getFullYear() &&
    selectedMonthIndex === now.getMonth();

  const todayIndex = isCurrentViewedMonth ? now.getDate() - 1 : null;

  const previousMonthMeta = useMemo(() => {
    return getPreviousMonthMeta(selectedYear, selectedMonthIndex);
  }, [selectedYear, selectedMonthIndex]);

  const previousMonthLabel = `${MONTHS[previousMonthMeta.monthIndex]} ${previousMonthMeta.year}`;

  const safeMonthData = useMemo(() => {
    return ensureMonthShape(monthData, selectedYear, selectedMonthIndex);
  }, [monthData, selectedYear, selectedMonthIndex]);

  const allHabitTemplates = useMemo(() => {
    const builtInTemplates = habitTemplates.map((template) => ({
      ...template,
      isCustom: false,
    }));

    return [...customHabitTemplates, ...builtInTemplates];
  }, [customHabitTemplates]);

  const newHabitError = useMemo(() => {
    return getHabitFormError({
      name: newHabitName,
      targetValue: newHabitTargetValue,
      existingHabits: safeMonthData.habits,
    });
  }, [newHabitName, newHabitTargetValue, safeMonthData.habits]);

  const editHabitError = useMemo(() => {
    return getHabitFormError({
      name: editingHabitName,
      targetValue: editingHabitTargetValue,
      existingHabits: safeMonthData.habits,
      editingHabitId: editingHabit?.id || null,
    });
  }, [
    editingHabitName,
    editingHabitTargetValue,
    safeMonthData.habits,
    editingHabit,
  ]);

  const todaySummary = useMemo(() => {
    if (todayIndex === null) return null;

    const completedToday = safeMonthData.habits.filter(
      (habit) => habit.checks?.[todayIndex],
    ).length;

    const totalToday = safeMonthData.habits.length || 1;

    return {
      day: todayIndex + 1,
      completed: completedToday,
      total: totalToday,
      percent: Math.round((completedToday / totalToday) * 100),
    };
  }, [safeMonthData, todayIndex]);

  const syncStatusText = useMemo(() => {
    if (syncStatus === "loading") {
      return "Loading month data...";
    }

    if (syncStatus === "saving") {
      return "Syncing changes with server...";
    }

    if (syncStatus === "saved") {
      if (lastSavedAt) {
        return `All changes saved • ${lastSavedAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
      return "All changes saved";
    }

    if (syncStatus === "error") {
      return syncErrorMessage || "Save failed";
    }

    return "Connected";
  }, [syncStatus, lastSavedAt, syncErrorMessage]);

  const showToast = (
    message,
    type = "success",
    actionLabel = null,
    onAction = null,
  ) => {
    setToast({
      id: Date.now(),
      message,
      type,
      actionLabel,
      onAction,
    });
  };

  const closeToast = () => {
    setToast(null);
  };

  const retrySaveNow = () => {
    setSaveTrigger((prev) => prev + 1);
    showToast("Retrying save...", "info");
  };

  const goToPreviousMonth = () => {
    const prev = getPreviousMonthMeta(selectedYear, selectedMonthIndex);
    setSelectedYear(String(prev.year));
    setSelectedMonthIndex(prev.monthIndex);
  };

  const goToNextMonth = () => {
    const next = getNextMonthMeta(selectedYear, selectedMonthIndex);
    setSelectedYear(String(next.year));
    setSelectedMonthIndex(next.monthIndex);
  };

  const goToCurrentMonth = () => {
    setSelectedYear(String(currentDate.getFullYear()));
    setSelectedMonthIndex(currentDate.getMonth());
  };

  const resetHabitFilters = () => {
    setHabitSearchTerm("");
    setHabitFilterMode("all");
    setGoalTypeFilter("all");
  };

  const resetDashboardPreferences = () => {
    setHabitSortMode(DEFAULT_DASHBOARD_PREFS.habitSortMode);
    setAutoScrollToToday(DEFAULT_DASHBOARD_PREFS.autoScrollToToday);
    setShowArchivedHabits(DEFAULT_DASHBOARD_PREFS.showArchivedHabits);
    setShowAdvancedAnalytics(DEFAULT_DASHBOARD_PREFS.showAdvancedAnalytics);
    setShowTodayProgress(DEFAULT_DASHBOARD_PREFS.showTodayProgress);
    setShowTopHabits(DEFAULT_DASHBOARD_PREFS.showTopHabits);
    setShowYearlyOverview(DEFAULT_DASHBOARD_PREFS.showYearlyOverview);
    setShowStreakLeaderboard(DEFAULT_DASHBOARD_PREFS.showStreakLeaderboard);
    setHabitSearchTerm(DEFAULT_DASHBOARD_PREFS.habitSearchTerm);
    setHabitFilterMode(DEFAULT_DASHBOARD_PREFS.habitFilterMode);
    setGoalTypeFilter(DEFAULT_DASHBOARD_PREFS.goalTypeFilter);

    showToast("Dashboard preferences reset to default.", "success");
  };

  const applyQuickFilter = (filterKey) => {
    setHabitSearchTerm("");

    if (filterKey === "all") {
      setHabitFilterMode("all");
      setGoalTypeFilter("all");
      return;
    }

    if (filterKey === "daily") {
      setHabitFilterMode("all");
      setGoalTypeFilter("daily");
      return;
    }

    if (filterKey === "weekly") {
      setHabitFilterMode("all");
      setGoalTypeFilter("weekly");
      return;
    }

    if (filterKey === "monthly") {
      setHabitFilterMode("all");
      setGoalTypeFilter("monthly");
      return;
    }

    if (filterKey === "completed") {
      setHabitFilterMode("completed");
      setGoalTypeFilter("all");
      return;
    }

    if (filterKey === "needs-focus") {
      setHabitFilterMode("in-progress");
      setGoalTypeFilter("all");
    }
  };

  const restoreDeletedHabit = (habitSnapshot, originalIndex) => {
    updateMonth((month) => {
      if (month.habits.some((habit) => habit.id === habitSnapshot.id)) {
        return month;
      }

      const habits = [...month.habits];
      const insertIndex = Math.min(originalIndex, habits.length);

      habits.splice(insertIndex, 0, habitSnapshot);

      return {
        ...month,
        habits,
      };
    });

    showToast("Habit restored.", "success");
  };

  const restoreHabitChecks = (habitId, checksSnapshot) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              checks: [...checksSnapshot],
            }
          : habit,
      ),
    }));

    showToast("Day change undone.", "success");
  };

  const restoreEditedHabitSnapshot = (habitSnapshot) => {
    if (!habitSnapshot) return;

    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitSnapshot.id
          ? {
              ...habit,
              name: habitSnapshot.name,
              icon: habitSnapshot.icon,
              archived: Boolean(habitSnapshot.archived),
              targetType: normalizeGoalType(habitSnapshot.targetType),
              targetValue: normalizeGoalValue(habitSnapshot.targetValue),
              checks: [...(habitSnapshot.checks || habit.checks)],
            }
          : habit,
      ),
    }));

    showToast("Habit edit undone.", "success");
  };

  const restoreMonthSnapshot = (monthSnapshot) => {
    if (!monthSnapshot) return;

    setMonthData(
      ensureMonthShape(monthSnapshot, selectedYear, selectedMonthIndex),
    );

    showToast("Month restored.", "success");
  };

  const openConfirmModal = ({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
    helperText = "",
    requireTypedConfirmation = "",
    onConfirm,
  }) => {
    setConfirmAction({
      title,
      message,
      confirmLabel,
      cancelLabel,
      variant,
      helperText,
      requireTypedConfirmation,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    if (isConfirmActionSubmitting) return;
    setConfirmAction(null);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction?.onConfirm) return;

    try {
      setIsConfirmActionSubmitting(true);
      await Promise.resolve(confirmAction.onConfirm());
      setConfirmAction(null);
    } finally {
      setIsConfirmActionSubmitting(false);
    }
  };

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
    saveDashboardPrefs({
      selectedYear,
      selectedMonthIndex,
      habitSortMode,
      autoScrollToToday,
      showArchivedHabits,
      showAdvancedAnalytics,
      showTodayProgress,
      showTopHabits,
      showYearlyOverview,
      showStreakLeaderboard,
      habitSearchTerm,
      habitFilterMode,
      goalTypeFilter,
    });
  }, [
    selectedYear,
    selectedMonthIndex,
    habitSortMode,
    autoScrollToToday,
    showArchivedHabits,
    showAdvancedAnalytics,
    showTodayProgress,
    showTopHabits,
    showYearlyOverview,
    showStreakLeaderboard,
    habitSearchTerm,
    habitFilterMode,
    goalTypeFilter,
  ]);

  useEffect(() => {
    if (!authChecked) return;
    if (!currentUser) return;

    let cancelled = false;

    async function loadMonthFromApi() {
      try {
        setIsSyncing(true);
        setSyncStatus("loading");
        setSyncErrorMessage("");
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
        setSyncStatus("saved");
      } catch (error) {
        console.error("Failed to load month from API:", error);

        if (cancelled) return;

        setMonthData(buildDefaultMonthData(selectedYear, selectedMonthIndex));
        setLoadedMonthKey(monthKey);
        setSyncStatus("error");
        setSyncErrorMessage(
          "Failed to load month from server. Showing local default month.",
        );
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
    let cancelled = false;

    const loadPreviousMonth = async () => {
      if (!currentUser) return;

      setIsPreviousMonthLoading(true);

      try {
        const response = await getMonthData(
          previousMonthMeta.year,
          previousMonthMeta.monthIndex + 1,
        );

        if (cancelled) return;

        setPreviousMonthData(
          ensureMonthShape(
            response?.data,
            previousMonthMeta.year,
            previousMonthMeta.monthIndex,
          ),
        );
      } catch (error) {
        if (cancelled) return;
        setPreviousMonthData(null);
      } finally {
        if (!cancelled) {
          setIsPreviousMonthLoading(false);
        }
      }
    };

    loadPreviousMonth();

    return () => {
      cancelled = true;
    };
  }, [currentUser, previousMonthMeta]);

  useEffect(() => {
    let cancelled = false;

    const loadYearlyOverview = async () => {
      if (!currentUser) return;

      setIsYearlyOverviewLoading(true);

      try {
        const results = await Promise.all(
          MONTHS.map(async (monthName, monthIndex) => {
            try {
              const response = await getMonthData(
                Number(selectedYear),
                monthIndex + 1,
              );

              const safeData = ensureMonthShape(
                response?.data,
                selectedYear,
                monthIndex,
              );

              if (isEffectivelyEmptyMonth(safeData)) {
                return {
                  month: monthName,
                  shortMonth: monthName.slice(0, 3),
                  completionPercent: 0,
                  moodAverage: "0.0",
                  motivationAverage: "0.0",
                  isEmpty: true,
                };
              }

              const monthDays = getDaysInMonth(
                Number(selectedYear),
                monthIndex,
              );

              const totalGoal = safeData.habits.reduce(
                (sum, habit) => sum + getHabitMonthlyGoal(habit, monthDays),
                0,
              );

              const totalCompleted = safeData.habits.reduce(
                (sum, habit) => sum + habit.checks.filter(Boolean).length,
                0,
              );

              return {
                month: monthName,
                shortMonth: monthName.slice(0, 3),
                completionPercent: totalGoal
                  ? Math.round((totalCompleted / totalGoal) * 100)
                  : 0,
                moodAverage: (
                  safeData.mood.reduce(
                    (sum, value) => sum + Number(value || 0),
                    0,
                  ) / safeData.mood.length
                ).toFixed(1),
                motivationAverage: (
                  safeData.motivation.reduce(
                    (sum, value) => sum + Number(value || 0),
                    0,
                  ) / safeData.motivation.length
                ).toFixed(1),
                isEmpty: false,
              };
            } catch (error) {
              return {
                month: monthName,
                shortMonth: monthName.slice(0, 3),
                completionPercent: 0,
                moodAverage: "0.0",
                motivationAverage: "0.0",
                isEmpty: true,
              };
            }
          }),
        );

        if (cancelled) return;
        setYearlyOverviewData(results);
      } finally {
        if (!cancelled) {
          setIsYearlyOverviewLoading(false);
        }
      }
    };

    loadYearlyOverview();

    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedYear]);

  useEffect(() => {
    let cancelled = false;

    const loadDeletedMonthBackups = async () => {
      if (!currentUser) return;

      setIsDeletedMonthBackupsLoading(true);

      try {
        const response = await getDeletedMonthBackups();

        if (cancelled) return;

        setDeletedMonthBackups(
          Array.isArray(response?.backups) ? response.backups : [],
        );
      } catch (error) {
        if (cancelled) return;
        setDeletedMonthBackups([]);
      } finally {
        if (!cancelled) {
          setIsDeletedMonthBackupsLoading(false);
        }
      }
    };

    loadDeletedMonthBackups();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!authChecked) return;
    if (!currentUser) return;
    if (!isMonthLoaded) return;
    if (!monthData) return;
    if (loadedMonthKey !== monthKey) return;
    if (skipNextAutoSaveRef.current) {
      skipNextAutoSaveRef.current = false;
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSyncing(true);
        setSyncStatus("saving");
        setSyncErrorMessage("");

        await saveMonthData(
          Number(selectedYear),
          selectedMonthIndex + 1,
          safeMonthData,
        );

        setSyncStatus("saved");
        setLastSavedAt(new Date());
      } catch (error) {
        console.error("Failed to save month to API:", error);
        setSyncStatus("error");
        setSyncErrorMessage(
          error?.message || "Failed to save changes to the server.",
        );
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
    saveTrigger,
  ]);

  const updateMonth = (updater) => {
    setMonthData((prev) =>
      updater(ensureMonthShape(prev, selectedYear, selectedMonthIndex)),
    );
  };

  const updateMonthlyReviewField = (field, value) => {
    updateMonth((month) => ({
      ...month,
      review: {
        ...ensureReviewShape(month.review),
        [field]: value,
      },
    }));
  };

  const toggleHabitDay = (habitId, dayIndex) => {
    const habitSnapshot = safeMonthData.habits.find(
      (habit) => habit.id === habitId,
    );

    if (!habitSnapshot) return;

    const previousChecks = [...habitSnapshot.checks];
    const nextChecked = !Boolean(habitSnapshot.checks[dayIndex]);

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

    showToast(
      nextChecked
        ? `Day ${dayIndex + 1} marked complete.`
        : `Day ${dayIndex + 1} unchecked.`,
      nextChecked ? "success" : "info",
      "Undo",
      () => restoreHabitChecks(habitId, previousChecks),
    );
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
    const trimmedName = newHabitName.trim().replace(/\s+/g, " ");
    const trimmedIcon = newHabitIcon.trim() || "✅";
    const normalizedTargetType = normalizeGoalType(newHabitTargetType);
    const normalizedTargetValue = normalizeGoalValue(newHabitTargetValue);

    if (newHabitError) {
      showToast(newHabitError, "error");
      return;
    }

    const safeId = trimmedName.toLowerCase().replace(/\s+/g, "-");

    updateMonth((month) => ({
      ...month,
      habits: [
        ...month.habits,
        {
          id: `${safeId}-${Date.now()}`,
          name: trimmedName,
          icon: trimmedIcon,
          archived: false,
          targetType: normalizedTargetType,
          targetValue: normalizedTargetValue,
          checks: Array.from({ length: daysInMonth }, () => false),
        },
      ],
    }));

    setNewHabitName("");
    setNewHabitIcon("✅");
    setNewHabitTargetType("daily");
    setNewHabitTargetValue(1);

    showToast("Habit added successfully.", "success");
  };

  const applyHabitTemplate = (template) => {
    if (!template?.habits?.length) return;

    const monthSnapshot = JSON.parse(JSON.stringify(safeMonthData));

    const newHabits = buildHabitsFromTemplate(
      template.habits,
      daysInMonth,
      safeMonthData.habits,
    );

    if (!newHabits.length) {
      showToast("All habits from this template already exist.", "info");
      return;
    }

    updateMonth((month) => ({
      ...month,
      habits: [...month.habits, ...newHabits],
    }));

    showToast(
      `${newHabits.length} habits added from "${template.title}".`,
      "success",
      "Undo",
      () => restoreMonthSnapshot(monthSnapshot),
    );
  };

  const saveCurrentHabitsAsTemplate = () => {
    const activeHabits = safeMonthData.habits.filter(
      (habit) => !habit.archived,
    );

    if (!activeHabits.length) {
      showToast("There are no active habits to save as a template.", "error");
      return;
    }

    const templateTitle = window.prompt("Template name:");

    if (!templateTitle || !templateTitle.trim()) {
      return;
    }

    const normalizedTitle = templateTitle.trim().toLowerCase();

    const alreadyExists = customHabitTemplates.some(
      (template) => template.title.trim().toLowerCase() === normalizedTitle,
    );

    if (alreadyExists) {
      showToast("A custom template with this name already exists.", "error");
      return;
    }

    const nextTemplate = buildTemplateFromCurrentHabits(
      activeHabits,
      templateTitle,
    );
    const nextTemplates = [nextTemplate, ...customHabitTemplates];

    setCustomHabitTemplates(nextTemplates);
    saveCustomHabitTemplates(nextTemplates);

    showToast(
      `Template "${nextTemplate.title}" saved successfully.`,
      "success",
    );
  };

  const deleteCustomHabitTemplate = (templateId) => {
    const templateToDelete = customHabitTemplates.find(
      (template) => template.id === templateId,
    );

    if (!templateToDelete) return;

    const nextTemplates = customHabitTemplates.filter(
      (template) => template.id !== templateId,
    );

    setCustomHabitTemplates(nextTemplates);
    saveCustomHabitTemplates(nextTemplates);

    showToast(`Template "${templateToDelete.title}" deleted.`, "info");
  };

  const exportCustomHabitTemplates = () => {
    if (!customHabitTemplates.length) {
      showToast("There are no custom templates to export.", "error");
      return;
    }

    const payload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportType: "custom-habit-templates",
        count: customHabitTemplates.length,
      },
      templates: customHabitTemplates.map((template) => ({
        title: template.title,
        description: template.description,
        habits: template.habits.map((habit) => ({
          name: habit.name,
          icon: habit.icon,
          targetType: normalizeGoalType(habit.targetType),
          targetValue: normalizeGoalValue(habit.targetValue),
        })),
      })),
    };

    downloadBlob(
      "habit-tracker-custom-templates.json",
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    showToast("Custom templates exported successfully.", "success");
  };

  const triggerImportCustomTemplates = () => {
    customTemplateFileInputRef.current?.click();
  };

  const importCustomHabitTemplates = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const rawTemplates = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.templates)
          ? parsed.templates
          : null;

      if (!rawTemplates || !rawTemplates.length) {
        throw new Error("No templates found.");
      }

      const importedTemplates = rawTemplates
        .map((template, index) =>
          normalizeImportedCustomTemplate(template, index),
        )
        .filter((template) => template.title && template.habits.length > 0);

      if (!importedTemplates.length) {
        throw new Error("No valid templates found.");
      }

      const existingTitles = new Set(
        customHabitTemplates.map((template) =>
          template.title.trim().toLowerCase(),
        ),
      );

      const dedupedTemplates = importedTemplates.filter(
        (template) => !existingTitles.has(template.title.trim().toLowerCase()),
      );

      if (!dedupedTemplates.length) {
        showToast("All imported templates already exist.", "info");
        return;
      }

      const nextTemplates = [...dedupedTemplates, ...customHabitTemplates];

      setCustomHabitTemplates(nextTemplates);
      saveCustomHabitTemplates(nextTemplates);

      showToast(
        `${dedupedTemplates.length} custom template(s) imported successfully.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast("Template file is not valid.", "error");
    }
  };

  const deleteHabit = (habitId) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.filter((habit) => habit.id !== habitId),
    }));
  };

  const setHabitArchivedState = (habitId, archived) => {
    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              archived,
            }
          : habit,
      ),
    }));
  };

  const archiveHabit = (habitId, options = {}) => {
    const { showUndo = false } = options;

    setHabitArchivedState(habitId, true);

    if (showUndo) {
      showToast("Habit archived.", "info", "Undo", () => {
        setHabitArchivedState(habitId, false);
        showToast("Habit restored.", "success");
      });
    }
  };

  const requestDeleteHabit = (habit) => {
    openConfirmModal({
      title: "Delete habit?",
      message: `This will permanently remove "${habit.name}" from the current month.`,
      confirmLabel: "Delete Habit",
      variant: "danger",
      helperText:
        "This only affects the current month. You can still undo it immediately from the toast message.",
      onConfirm: () => {
        const originalHabit = safeMonthData.habits.find(
          (item) => item.id === habit.id,
        );
        const originalIndex = safeMonthData.habits.findIndex(
          (item) => item.id === habit.id,
        );

        if (!originalHabit || originalIndex === -1) return;

        deleteHabit(habit.id);

        showToast("Habit deleted.", "error", "Undo", () =>
          restoreDeletedHabit(originalHabit, originalIndex),
        );
      },
    });
  };

  const requestArchiveHabit = (habit) => {
    openConfirmModal({
      title: "Archive habit?",
      message: `"${habit.name}" will be removed from the main list and moved to archived habits.`,
      confirmLabel: "Archive Habit",
      variant: "info",
      helperText:
        "Archived habits are not deleted. You can restore them later from the archived habits panel.",
      onConfirm: () => {
        archiveHabit(habit.id, { showUndo: true });
      },
    });
  };

  const restoreHabit = (habitId, options = {}) => {
    const { showUndo = false } = options;

    setHabitArchivedState(habitId, false);

    if (showUndo) {
      showToast("Habit restored.", "success", "Undo", () => {
        setHabitArchivedState(habitId, true);
        showToast("Habit archived again.", "info");
      });
      return;
    }

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

  const reorderHabitByIds = (sourceHabitId, targetHabitId) => {
    updateMonth((month) => {
      const habits = [...month.habits];

      const sourceIndex = habits.findIndex(
        (habit) => habit.id === sourceHabitId,
      );
      const targetIndex = habits.findIndex(
        (habit) => habit.id === targetHabitId,
      );

      if (
        sourceIndex === -1 ||
        targetIndex === -1 ||
        sourceIndex === targetIndex
      ) {
        return month;
      }

      const [movedHabit] = habits.splice(sourceIndex, 1);
      habits.splice(targetIndex, 0, movedHabit);

      return {
        ...month,
        habits,
      };
    });
  };

  const handleHabitDragStart = (habitId) => {
    setDraggedHabitId(habitId);
  };

  const handleHabitDragOver = (event) => {
    event.preventDefault();
  };

  const handleHabitDrop = (targetHabitId) => {
    if (!draggedHabitId) return;

    if (draggedHabitId !== targetHabitId) {
      reorderHabitByIds(draggedHabitId, targetHabitId);
      showToast("Habit order updated.", "success");
    }

    setDraggedHabitId(null);
  };

  const handleHabitDragEnd = () => {
    setDraggedHabitId(null);
  };

  const startEditHabit = (habit) => {
    setEditingHabit(habit);
    setEditingHabitName(habit.name || "");
    setEditingHabitIcon(habit.icon || "✅");
    setEditingHabitTargetType(habit.targetType || "daily");
    setEditingHabitTargetValue(Number(habit.targetValue || 1));
  };

  const closeEditHabit = () => {
    setEditingHabit(null);
    setEditingHabitName("");
    setEditingHabitIcon("✅");
    setEditingHabitTargetType("daily");
    setEditingHabitTargetValue(1);
  };

  const saveEditedHabit = () => {
    const trimmedName = editingHabitName.trim().replace(/\s+/g, " ");
    const trimmedIcon = editingHabitIcon.trim() || "✅";
    const normalizedTargetType = normalizeGoalType(editingHabitTargetType);
    const normalizedTargetValue = normalizeGoalValue(editingHabitTargetValue);

    if (!editingHabit) return;

    if (editHabitError) {
      showToast(editHabitError, "error");
      return;
    }

    const previousHabitSnapshot = safeMonthData.habits.find(
      (habit) => habit.id === editingHabit.id,
    );

    if (!previousHabitSnapshot) return;

    updateMonth((month) => ({
      ...month,
      habits: month.habits.map((habit) =>
        habit.id === editingHabit.id
          ? {
              ...habit,
              name: trimmedName,
              icon: trimmedIcon,
              targetType: normalizedTargetType,
              targetValue: normalizedTargetValue,
            }
          : habit,
      ),
    }));

    closeEditHabit();
    showToast("Habit updated successfully.", "success", "Undo", () =>
      restoreEditedHabitSnapshot(previousHabitSnapshot),
    );
  };

  const resetCurrentMonth = () => {
    setMonthData(buildDefaultMonthData(selectedYear, selectedMonthIndex));
  };

  const requestResetCurrentMonth = () => {
    openConfirmModal({
      title: "Reset current month?",
      message:
        "This will replace the current month's habits, mood, motivation, notes, and review with fresh default values.",
      confirmLabel: "Reset Month",
      variant: "warning",
      helperText:
        "This action resets the visible month only. You can undo it immediately after reset.",
      onConfirm: () => {
        const monthSnapshot = JSON.parse(JSON.stringify(safeMonthData));

        resetCurrentMonth();

        showToast("Current month has been reset.", "info", "Undo", () =>
          restoreMonthSnapshot(monthSnapshot),
        );
      },
    });
  };

  const deleteCurrentMonthFromServer = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("saving");
      setSyncErrorMessage("");

      await deleteMonthData(Number(selectedYear), selectedMonthIndex + 1);

      skipNextAutoSaveRef.current = true;

      setMonthData(buildDefaultMonthData(selectedYear, selectedMonthIndex));
      setLoadedMonthKey(monthKey);
      setSyncStatus("saved");
      setLastSavedAt(new Date());

      setYearlyOverviewData((prev) =>
        prev.map((item) =>
          item.month === MONTHS[selectedMonthIndex]
            ? {
                ...item,
                completionPercent: 0,
                moodAverage: "0.0",
                motivationAverage: "0.0",
                isEmpty: true,
              }
            : item,
        ),
      );

      const backupsResponse = await getDeletedMonthBackups();

      setDeletedMonthBackups(
        Array.isArray(backupsResponse?.backups) ? backupsResponse.backups : [],
      );

      showToast(
        `${MONTHS[selectedMonthIndex]} ${selectedYear} deleted. Backup created.`,
        "success",
      );
    } catch (error) {
      console.error("Failed to delete current month:", error);
      setSyncStatus("error");
      setSyncErrorMessage(error?.message || "Failed to delete current month.");
      showToast(error.message || "Failed to delete current month.", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const requestDeleteCurrentMonth = () => {
    openConfirmModal({
      title: "Delete current month?",
      message: `This will delete ${MONTHS[selectedMonthIndex]} ${selectedYear} from your dashboard and create a restore backup.`,
      confirmLabel: "Delete Month",
      variant: "danger",
      helperText:
        "A restore backup will be created, but the current month data will disappear from the dashboard until restored.",
      requireTypedConfirmation: "DELETE",
      onConfirm: deleteCurrentMonthFromServer,
    });
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
      navigate("/dashboard");
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
      navigate("/dashboard");
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
    setSyncStatus("idle");
    setSyncErrorMessage("");
    setAuthError("");
    navigate("/login");
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

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);

      await deleteAccount();

      clearAuthSession();
      setCurrentUser(null);
      setMonthData(null);
      setIsMonthLoaded(false);
      setLoadedMonthKey(null);
      setAuthError("");
      navigate("/login");

      showToast("Account deleted successfully.", "success");

      return { ok: true };
    } catch (error) {
      const message = error.message || "Failed to delete account";
      showToast(message, "error");
      return {
        ok: false,
        message,
      };
    } finally {
      setIsDeletingAccount(false);
    }
  };

    const pageNavButtonBase =
      "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition duration-150";

    const pageTabs = (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={`${pageNavButtonBase} ${
            location.pathname === "/dashboard"
              ? "bg-white text-black"
              : "border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/analytics")}
          className={`${pageNavButtonBase} ${
            location.pathname === "/analytics"
              ? "bg-white text-black"
              : "border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>

        <button
          onClick={() => navigate("/notes-review")}
          className={`${pageNavButtonBase} ${
            location.pathname === "/notes-review"
              ? "bg-white text-black"
              : "border border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          Notes & Review
        </button>
      </div>
    );

    const restoreDeletedMonthBackupNow = async (backup) => {
      try {
        setIsSyncing(true);

        await restoreDeletedMonthBackup(backup.year, backup.month);

        setDeletedMonthBackups((prev) =>
          prev.filter((item) => item.monthKey !== backup.monthKey),
        );

        if (
          Number(selectedYear) === backup.year &&
          selectedMonthIndex === backup.month - 1
        ) {
          const refreshedMonth = await getMonthData(backup.year, backup.month);

          const nextMonthData = refreshedMonth?.data
            ? ensureMonthShape(
                refreshedMonth.data,
                backup.year,
                backup.month - 1,
              )
            : buildDefaultMonthData(backup.year, backup.month - 1);

          setMonthData(nextMonthData);
          setLoadedMonthKey(monthKey);
          setIsMonthLoaded(true);
        }

        if (
          previousMonthMeta.year === backup.year &&
          previousMonthMeta.monthIndex === backup.month - 1
        ) {
          const refreshedPreviousMonth = await getMonthData(
            backup.year,
            backup.month,
          );

          setPreviousMonthData(
            refreshedPreviousMonth?.data
              ? ensureMonthShape(
                  refreshedPreviousMonth.data,
                  backup.year,
                  backup.month - 1,
                )
              : null,
          );
        }

        showToast(
          `${MONTHS[backup.month - 1]} ${backup.year} restored successfully.`,
          "success",
        );
      } catch (error) {
        console.error("Failed to restore deleted month backup:", error);
        showToast(
          error.message || "Failed to restore deleted month backup.",
          "error",
        );
      } finally {
        setIsSyncing(false);
      }
    };

    const deleteDeletedMonthBackupNow = async (backup) => {
      try {
        setIsSyncing(true);

        await deleteDeletedMonthBackup(backup.year, backup.month);

        setDeletedMonthBackups((prev) =>
          prev.filter((item) => item.monthKey !== backup.monthKey),
        );

        showToast(
          `Backup for ${MONTHS[backup.month - 1]} ${backup.year} was deleted.`,
          "success",
        );
      } catch (error) {
        console.error("Failed to delete deleted month backup:", error);
        showToast(
          error.message || "Failed to delete deleted month backup.",
          "error",
        );
      } finally {
        setIsSyncing(false);
      }
    };

    const requestRestoreDeletedMonthBackup = (backup) => {
      openConfirmModal({
        title: "Restore deleted month?",
        message: `This will restore ${MONTHS[backup.month - 1]} ${backup.year} from backup.`,
        confirmLabel: "Restore Month",
        variant: "success",
        helperText:
          "The restored month will be available again in your dashboard.",
        onConfirm: () => restoreDeletedMonthBackupNow(backup),
      });
    };

    const requestDeleteDeletedMonthBackup = (backup) => {
      openConfirmModal({
        title: "Delete month backup?",
        message: `This will permanently remove the backup for ${MONTHS[backup.month - 1]} ${backup.year}.`,
        confirmLabel: "Delete Backup",
        variant: "danger",
        helperText:
          "After deleting this backup, you will not be able to restore this deleted month from the backup list.",
        requireTypedConfirmation: "DELETE",
        onConfirm: () => deleteDeletedMonthBackupNow(backup),
      });
    };

    const fileToDataUrl = (file) =>
      new Promise((resolve, reject) => {
        if (!file) {
          resolve("");
          return;
        }

        const reader = new FileReader();

        reader.onload = () => {
          resolve(typeof reader.result === "string" ? reader.result : "");
        };

        reader.onerror = () => {
          reject(new Error("Failed to read avatar file"));
        };

        reader.readAsDataURL(file);
      });

    const handleSaveProfile = async ({
      username,
      email,
      avatarFile,
      removeAvatar,
    }) => {
      try {
        setIsSavingProfile(true);
        setProfileErrorMessage("");
        setProfileSuccessMessage("");

        let nextAvatarUrl = currentUser?.avatarUrl || "";

        if (removeAvatar) {
          nextAvatarUrl = "";
        } else if (avatarFile) {
          nextAvatarUrl = await fileToDataUrl(avatarFile);
        }

        const payload = {
          username: String(username || "").trim(),
          email: String(email || "").trim(),
          avatarUrl: String(nextAvatarUrl || "").trim(),
        };

        const response = await updateProfile(payload);

        const updatedUser = response?.user
          ? response.user
          : {
              ...currentUser,
              ...payload,
            };

        setCurrentUser(updatedUser);
        setProfileSuccessMessage("Profile updated successfully.");
        showToast("Profile updated successfully.", "success");

        return { ok: true };
      } catch (error) {
        const message = error.message || "Failed to update profile";
        setProfileErrorMessage(message);
        setProfileSuccessMessage("");
        showToast(message, "error");

        return {
          ok: false,
          message,
        };
      } finally {
        setIsSavingProfile(false);
      }
    };

    const accountActions = (
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => navigate("/profile")}
          className="theme-button-secondary"
        >
          <UserCircle className="h-4 w-4" />
          Profile
        </button>

        <button onClick={handleLogout} className="theme-button-secondary">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    );

  const requestDeleteAccount = () => {
    openConfirmModal({
      title: "Delete account?",
      message:
        "This will permanently delete your account and all saved habit data connected to it.",
      confirmLabel: "Delete Account",
      variant: "danger",
      helperText:
        "This action cannot be undone. Export your account data first if you want to keep a backup.",
      requireTypedConfirmation: "DELETE",
      onConfirm: handleDeleteAccount,
    });
  };

  const analysisRows = useMemo(() => {
    const weekRanges = getWeekRanges(daysInMonth);

    return safeMonthData.habits.map((habit) => {
      const actual = habit.checks.filter(Boolean).length;
      const goal = getHabitMonthlyGoal(habit, daysInMonth);
      const left = Math.max(goal - actual, 0);
      const progress = goal
        ? Math.min(100, Math.round((actual / goal) * 100))
        : 0;

      const currentStreak = calculateCurrentStreak(habit.checks);
      const bestStreak = calculateBestStreak(habit.checks);

      const weekly = weekRanges.map(([start, end], idx) => {
        const slice = habit.checks.slice(start, end);
        const completedInWeek = slice.filter(Boolean).length;

        let rate = 0;

        if (habit.targetType === "weekly") {
          const weeklyGoal = Math.max(1, Number(habit.targetValue || 1));
          rate = Math.min(
            100,
            Math.round((completedInWeek / weeklyGoal) * 100),
          );
        } else {
          rate = slice.length
            ? Math.round((completedInWeek / slice.length) * 100)
            : 0;
        }

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
  }, [safeMonthData, daysInMonth]);

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

      const matchesGoalType =
        goalTypeFilter === "all" ? true : habit.targetType === goalTypeFilter;

      if (!matchesGoalType) return false;

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
  }, [activeAnalysisRows, habitSearchTerm, habitFilterMode, goalTypeFilter]);

  const sortedFilteredAnalysisRows = useMemo(() => {
    return sortHabits(filteredAnalysisRows, habitSortMode);
  }, [filteredAnalysisRows, habitSortMode]);

  const filteredHabitsCount = sortedFilteredAnalysisRows.length;
  const totalActiveHabitsCount = activeAnalysisRows.length;

  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (habitSearchTerm.trim()) {
      chips.push({
        key: "search",
        label: `Search: ${habitSearchTerm.trim()}`,
        onRemove: () => setHabitSearchTerm(""),
      });
    }

    if (habitFilterMode !== "all") {
      const statusMap = {
        completed: "Completed",
        "in-progress": "In Progress",
        "not-started": "Not Started",
      };

      chips.push({
        key: "status",
        label: `Status: ${statusMap[habitFilterMode] || habitFilterMode}`,
        onRemove: () => setHabitFilterMode("all"),
      });
    }

    if (goalTypeFilter !== "all") {
      const goalTypeMap = {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
      };

      chips.push({
        key: "goal-type",
        label: `Goal: ${goalTypeMap[goalTypeFilter] || goalTypeFilter}`,
        onRemove: () => setGoalTypeFilter("all"),
      });
    }

    return chips;
  }, [habitSearchTerm, habitFilterMode, goalTypeFilter]);

  const activeQuickFilter = useMemo(() => {
    if (
      habitFilterMode === "completed" &&
      goalTypeFilter === "all" &&
      !habitSearchTerm.trim()
    ) {
      return "completed";
    }

    if (
      habitFilterMode === "in-progress" &&
      goalTypeFilter === "all" &&
      !habitSearchTerm.trim()
    ) {
      return "needs-focus";
    }

    if (
      habitFilterMode === "all" &&
      goalTypeFilter === "daily" &&
      !habitSearchTerm.trim()
    ) {
      return "daily";
    }

    if (
      habitFilterMode === "all" &&
      goalTypeFilter === "weekly" &&
      !habitSearchTerm.trim()
    ) {
      return "weekly";
    }

    if (
      habitFilterMode === "all" &&
      goalTypeFilter === "monthly" &&
      !habitSearchTerm.trim()
    ) {
      return "monthly";
    }

    if (
      habitFilterMode === "all" &&
      goalTypeFilter === "all" &&
      !habitSearchTerm.trim()
    ) {
      return "all";
    }

    return null;
  }, [habitFilterMode, goalTypeFilter, habitSearchTerm]);

  const exportFilterSummary = useMemo(() => {
    return getExportFilterSummary({
      habitSearchTerm,
      habitFilterMode,
      goalTypeFilter,
      habitSortMode,
      filteredCount: filteredHabitsCount,
    });
  }, [
    habitSearchTerm,
    habitFilterMode,
    goalTypeFilter,
    habitSortMode,
    filteredHabitsCount,
  ]);

  const dailyProgress = useMemo(() => {
    const totalFlexibleGoal = analysisRows.reduce(
      (sum, row) => sum + Number(row.goal || 0),
      0,
    );

    return Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const completedSoFar = safeMonthData.habits.reduce((sum, habit) => {
        return sum + habit.checks.slice(0, dayIndex + 1).filter(Boolean).length;
      }, 0);

      const expectedSoFar =
        totalFlexibleGoal > 0
          ? (totalFlexibleGoal * (dayIndex + 1)) / daysInMonth
          : 0;

      const value = expectedSoFar
        ? Math.min(100, Math.round((completedSoFar / expectedSoFar) * 100))
        : 0;

      return {
        day: dayIndex + 1,
        value,
        completedSoFar,
        expectedSoFar: Number(expectedSoFar.toFixed(1)),
      };
    });
  }, [analysisRows, safeMonthData.habits, daysInMonth]);

  const weeklyProgress = useMemo(() => {
    const totalFlexibleGoal = analysisRows.reduce(
      (sum, row) => sum + Number(row.goal || 0),
      0,
    );

    return getWeekRanges(daysInMonth).map(([start, end], idx) => {
      const completedInWeek = safeMonthData.habits.reduce((sum, habit) => {
        return sum + habit.checks.slice(start, end).filter(Boolean).length;
      }, 0);

      const weekLength = end - start;
      const expectedInWeek =
        totalFlexibleGoal > 0
          ? (totalFlexibleGoal * weekLength) / daysInMonth
          : 0;

      const value = expectedInWeek
        ? Math.min(100, Math.round((completedInWeek / expectedInWeek) * 100))
        : 0;

      return {
        label: `Week ${idx + 1}`,
        value,
        completedInWeek,
        expectedInWeek: Number(expectedInWeek.toFixed(1)),
      };
    });
  }, [analysisRows, safeMonthData.habits, daysInMonth]);

  const totalGoal = safeMonthData.habits.reduce(
    (sum, habit) => sum + getHabitMonthlyGoal(habit, daysInMonth),
    0,
  );
  const totalCompleted = analysisRows.reduce((sum, row) => sum + row.actual, 0);
  const totalLeft = Math.max(totalGoal - totalCompleted, 0);
  const completionPercent = totalGoal
    ? Math.round((totalCompleted / totalGoal) * 100)
    : 0;

  const sortedActiveAnalysisRows = useMemo(() => {
    return sortHabits(activeAnalysisRows, habitSortMode);
  }, [activeAnalysisRows, habitSortMode]);

  const rankedHabits = useMemo(() => {
    return [...activeAnalysisRows].sort(
      (a, b) =>
        (b.progress || 0) - (a.progress || 0) ||
        (b.currentStreak || 0) - (a.currentStreak || 0),
    );
  }, [activeAnalysisRows]);

  const mentalStateData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, dayIndex) => ({
      day: dayIndex + 1,
      Mood: Number(safeMonthData.mood[dayIndex] || 1),
      Motivation: Number(safeMonthData.motivation[dayIndex] || 1),
    }));
  }, [safeMonthData, daysInMonth]);

  const previousMonthSummary = useMemo(() => {
    if (!previousMonthData) return null;
    if (isEffectivelyEmptyMonth(previousMonthData)) return null;

    const previousMonthDays = getDaysInMonth(
      previousMonthMeta.year,
      previousMonthMeta.monthIndex,
    );

    const totalGoal = previousMonthData.habits.reduce(
      (sum, habit) => sum + getHabitMonthlyGoal(habit, previousMonthDays),
      0,
    );

    const totalCompleted = previousMonthData.habits.reduce(
      (sum, habit) => sum + habit.checks.filter(Boolean).length,
      0,
    );

    const totalLeft = totalGoal - totalCompleted;

    return {
      year: previousMonthMeta.year,
      month: MONTHS[previousMonthMeta.monthIndex],
      totalGoal,
      totalCompleted,
      totalLeft,
      completionPercent: totalGoal
        ? Math.round((totalCompleted / totalGoal) * 100)
        : 0,
      moodAverage: (
        previousMonthData.mood.reduce(
          (sum, value) => sum + Number(value || 0),
          0,
        ) / previousMonthData.mood.length
      ).toFixed(1),
      motivationAverage: (
        previousMonthData.motivation.reduce(
          (sum, value) => sum + Number(value || 0),
          0,
        ) / previousMonthData.motivation.length
      ).toFixed(1),
    };
  }, [previousMonthData, previousMonthMeta]);

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
    review: safeMonthData.review,
    previousMonthSummary,
    previousMonthLabel,
    yearlyOverviewData,
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

  const consistencyScore = useMemo(() => {
    return calculateConsistencyScore(activeAnalysisRows);
  }, [activeAnalysisRows]);

  const bestDaySummary = useMemo(() => {
    return getBestDaySummary(
      safeMonthData.habits.filter((habit) => !habit.archived),
      daysInMonth,
      WEEKDAY_LABELS,
    );
  }, [safeMonthData.habits, daysInMonth]);

  const strongestGoalType = useMemo(() => {
    return getStrongestGoalType(activeAnalysisRows);
  }, [activeAnalysisRows]);

  const trendInsight = useMemo(() => {
    return getTrendInsight(dailyProgress);
  }, [dailyProgress]);

  const weekdayPerformance = useMemo(() => {
    return getWeekdayPerformance(
      safeMonthData.habits.filter((habit) => !habit.archived),
      daysInMonth,
      WEEKDAY_LABELS,
    );
  }, [safeMonthData.habits, daysInMonth]);

  const weeklyMomentum = useMemo(() => {
    return getWeeklyMomentum(weeklyProgress);
  }, [weeklyProgress]);

  const achievementStats = useMemo(() => {
    const bestCurrentStreak = activeAnalysisRows.reduce(
      (max, row) => Math.max(max, Number(row.currentStreak || 0)),
      0,
    );

    const bestOverallStreak = activeAnalysisRows.reduce(
      (max, row) => Math.max(max, Number(row.bestStreak || 0)),
      0,
    );

    const completedHabitsCount = activeAnalysisRows.filter(
      (row) => Number(row.progress || 0) >= 100,
    ).length;

    return {
      totalCompleted,
      completionPercent,
      activeHabitsCount: activeAnalysisRows.length,
      completedHabitsCount,
      bestCurrentStreak,
      bestOverallStreak,
      moodAverage: Number(average(safeMonthData.mood).toFixed(1)),
      motivationAverage: Number(average(safeMonthData.motivation).toFixed(1)),
    };
  }, [
    activeAnalysisRows,
    totalCompleted,
    completionPercent,
    safeMonthData.mood,
    safeMonthData.motivation,
  ]);

  const exportMonthJSON = () => {
    const payload = {
      metadata: buildExportMetadata({
        selectedYear,
        selectedMonthName,
        monthKey,
        exportType: "full-json",
        filters: null,
      }),
      summary: monthlySummary,
    };

    downloadBlob(
      `${fullExportBaseName}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    showToast("JSON report exported successfully.", "success");
  };

  const exportMonthCSV = () => {
    const metadata = buildExportMetadata({
      selectedYear,
      selectedMonthName,
      monthKey,
      exportType: "full-csv",
      filters: null,
    });

    const rows = [
      ["Full Habit Export"],
      ["Exported At", metadata.exportedAt],
      ["Export Type", metadata.exportType],
      ["Month", `${selectedMonthName} ${selectedYear}`],
      ["Month Key", monthKey],
      [],
      ["Habit", "Goal Type", "Goal", "Completed", "Left", "Progress %"],
      ...analysisRows.map((row) => [
        row.name,
        formatGoalTypeLabel(row.targetType, row.targetValue),
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
      `${fullExportBaseName}.csv`,
      toCSV(rows),
      "text/csv;charset=utf-8;",
    );

    showToast("CSV report exported successfully.", "success");
  };

  const exportFilteredCSV = () => {
    if (!sortedFilteredAnalysisRows.length) {
      showToast("There are no filtered habits to export.", "error");
      return;
    }

    const metadata = buildExportMetadata({
      selectedYear,
      selectedMonthName,
      monthKey,
      exportType: "filtered-csv",
      filters: exportFilterSummary,
    });

    const rows = [
      ["Filtered Habit Export"],
      ["Exported At", metadata.exportedAt],
      ["Export Type", metadata.exportType],
      ["Month", `${selectedMonthName} ${selectedYear}`],
      ["Month Key", monthKey],
      ["Search", exportFilterSummary.search],
      ["Status Filter", exportFilterSummary.status],
      ["Goal Type Filter", exportFilterSummary.goalType],
      ["Sort Mode", exportFilterSummary.sort],
      ["Habit Count", exportFilterSummary.filteredCount],
      [],
      [
        "Habit",
        "Goal Type",
        "Goal",
        "Completed",
        "Left",
        "Progress %",
        "Current Streak",
        "Best Streak",
      ],
      ...sortedFilteredAnalysisRows.map((row) => [
        row.name,
        formatGoalTypeLabel(row.targetType, row.targetValue),
        row.goal,
        row.actual,
        row.left,
        row.progress,
        row.currentStreak,
        row.bestStreak,
      ]),
    ];

    downloadBlob(
      `${filteredExportBaseName}.csv`,
      toCSV(rows),
      "text/csv;charset=utf-8;",
    );

    showToast("Filtered CSV exported successfully.", "success");
  };

  const exportFilteredJSON = () => {
    if (!sortedFilteredAnalysisRows.length) {
      showToast("There are no filtered habits to export.", "error");
      return;
    }

    const payload = {
      metadata: buildExportMetadata({
        selectedYear,
        selectedMonthName,
        monthKey,
        exportType: "filtered-json",
        filters: exportFilterSummary,
      }),
      habits: sortedFilteredAnalysisRows.map((row) => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        targetType: row.targetType,
        targetValue: row.targetValue,
        goal: row.goal,
        actual: row.actual,
        left: row.left,
        progress: row.progress,
        currentStreak: row.currentStreak,
        bestStreak: row.bestStreak,
        weekly: row.weekly,
      })),
    };

    downloadBlob(
      `${filteredExportBaseName}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    showToast("Filtered JSON exported successfully.", "success");
  };

  const exportFullBackup = () => {
    const payload = {
      metadata: buildExportMetadata({
        selectedYear,
        selectedMonthName,
        monthKey,
        exportType: "backup-json",
        filters: null,
      }),
      data: safeMonthData,
    };

    downloadBlob(
      `${fullExportBaseName}-backup.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );

    showToast("Backup exported successfully.", "success");
  };

  const exportAllMonthsJSON = async () => {
    try {
      const response = await getAllMonthsExport();

      const payload = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportType: "all-months-json",
          totalMonths: Array.isArray(response?.months)
            ? response.months.length
            : 0,
        },
        months: response?.months || [],
      };

      downloadBlob(
        `habit-tracker-all-months-${currentUser?.username || "user"}.json`,
        JSON.stringify(payload, null, 2),
        "application/json",
      );

      showToast("All months exported successfully.", "success");
    } catch (error) {
      console.error("Failed to export all months:", error);
      showToast(error.message || "Failed to export all months.", "error");
    }
  };

  const exportFullAccountJSON = async () => {
    try {
      const payload = await exportAccountData();

      downloadBlob(
        `habit-tracker-account-${currentUser?.username || "user"}.json`,
        JSON.stringify(payload, null, 2),
        "application/json",
      );

      showToast("Full account data exported successfully.", "success");
    } catch (error) {
      console.error("Failed to export account data:", error);
      showToast(error.message || "Failed to export account data.", "error");
    }
  };

  const triggerImportFullAccount = () => {
    fullAccountImportInputRef.current?.click();
  };

  const importFullAccountFromFile = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await importAccountData(parsed);

      if (response?.token && response?.user) {
        saveAuthSession({
          token: response.token,
          user: response.user,
        });
        setCurrentUser(response.user);
      } else if (response?.user) {
        setCurrentUser(response.user);
      }

      setMonthData(null);
      setIsMonthLoaded(false);
      setLoadedMonthKey(null);
      setProfileErrorMessage("");
      setProfileSuccessMessage("");

      showToast("Full account data imported successfully.", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to import account data:", error);
      showToast(error.message || "Failed to import account data.", "error");
    }
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
      `${fullExportBaseName}-report.html`,
      html,
      "text/html;charset=utf-8;",
    );

    showToast("Printable HTML report exported.", "success");
  };

  const exportPDFReport = () => {
    exportDashboardPdf(monthlySummary);
    showToast("PDF report exported successfully.", "success");
  };

  const copyCurrentMonthToNextMonth = async () => {
    try {
      setIsSyncing(true);

      const nextMonth = getNextMonthMeta(selectedYear, selectedMonthIndex);
      const copiedData = buildCopiedMonthData(
        safeMonthData,
        nextMonth.year,
        nextMonth.monthIndex,
      );

      await saveMonthData(nextMonth.year, nextMonth.monthIndex + 1, copiedData);

      showToast(
        `Copied this setup to ${MONTHS[nextMonth.monthIndex]} ${nextMonth.year}.`,
        "success",
      );
    } catch (error) {
      console.error("Failed to copy month:", error);
      showToast(
        error.message || "Failed to copy month to next month.",
        "error",
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const requestCopyToNextMonth = () => {
    const nextMonth = getNextMonthMeta(selectedYear, selectedMonthIndex);

    openConfirmModal({
      title: "Copy current month to next month?",
      message: `This will create or overwrite ${MONTHS[nextMonth.monthIndex]} ${nextMonth.year} with the current habit setup. Daily progress, mood, motivation, and notes will be reset.`,
      confirmLabel: "Copy Month",
      onConfirm: () => {
        copyCurrentMonthToNextMonth();
      },
    });
  };

  const openCopyMonthModal = () => {
    const nextMonth = getNextMonthMeta(selectedYear, selectedMonthIndex);

    setCopyTargetYear(String(nextMonth.year));
    setCopyTargetMonthIndex(nextMonth.monthIndex);
    setIsCopyMonthModalOpen(true);
  };

  const closeCopyMonthModal = () => {
    setIsCopyMonthModalOpen(false);
  };

  const copyCurrentMonthToSelectedMonth = async () => {
    const sameMonth =
      Number(copyTargetYear) === Number(selectedYear) &&
      copyTargetMonthIndex === selectedMonthIndex;

    if (sameMonth) {
      showToast("Choose a different target month.", "error");
      return;
    }

    try {
      setIsSyncing(true);

      const copiedData = buildCopiedMonthData(
        safeMonthData,
        Number(copyTargetYear),
        copyTargetMonthIndex,
      );

      await saveMonthData(
        Number(copyTargetYear),
        copyTargetMonthIndex + 1,
        copiedData,
      );

      closeCopyMonthModal();

      showToast(
        `Copied this setup to ${MONTHS[copyTargetMonthIndex]} ${copyTargetYear}.`,
        "success",
      );
    } catch (error) {
      console.error("Failed to copy month:", error);
      showToast(error.message || "Failed to copy month.", "error");
    } finally {
      setIsSyncing(false);
    }
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
    return <FullScreenStatus message="Loading Habit Tracker..." />;
  }

  if (!currentUser) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                isSubmitting={authLoading}
                errorMessage={authError}
              />
              <ToastNotice toast={toast} onClose={closeToast} />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (currentUser && !isMonthLoaded) {
    return <FullScreenStatus message="Loading your dashboard..." />;
  }

    const dashboardPage = (
      <div className="app-theme-bg min-h-screen p-4 md:p-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <input
            ref={customTemplateFileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await importCustomHabitTemplates(file);
              }
              event.target.value = "";
            }}
          />

          <DashboardHeader
            title="Habit Tracker Dashboard"
            subtitle="Focus on tracking, updating, and managing your habits without distraction."
            onExportCSV={exportMonthCSV}
            onExportJSON={exportMonthJSON}
            onExportFilteredCSV={exportFilteredCSV}
            onExportFilteredJSON={exportFilteredJSON}
            onExportAllMonths={exportAllMonthsJSON}
            onExportAccountData={exportFullAccountJSON}
            onImportAccountData={triggerImportFullAccount}
            onExportBackup={exportFullBackup}
            onImportBackup={importBackup}
            onExportPrintableHTML={exportPrintableHTMLReport}
            onExportPDF={exportPDFReport}
            onCopyToNextMonth={requestCopyToNextMonth}
            onOpenCopyToMonth={openCopyMonthModal}
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-neutral-400">
                Logged in as {currentUser.username}
              </div>

              <SyncStatusBadge
                syncStatus={syncStatus}
                syncStatusText={syncStatusText}
                onRetry={retrySaveNow}
              />
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              {pageTabs}
              {accountActions}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <section className="space-y-4 xl:col-span-3">
              <div className="theme-card p-5">
                <div className="theme-section-title">Habit Tracker</div>
                <div className="theme-section-subtitle">
                  {MONTHS[selectedMonthIndex]} {selectedYear}
                </div>
              </div>

              <div className="theme-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                  <CalendarDays className="h-4 w-4" />
                  Calendar Settings
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="theme-button-secondary justify-between px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <ChevronLeft className="h-4 w-4 shrink-0" />
                      Previous Month
                    </span>
                  </button>

                  <button
                    onClick={goToCurrentMonth}
                    className="theme-button-secondary justify-between px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <RotateCcw className="h-4 w-4 shrink-0" />
                      This Month
                    </span>
                  </button>

                  <button
                    onClick={goToNextMonth}
                    className="theme-button-secondary justify-between px-4 py-3 text-sm"
                  >
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <ChevronRight className="h-4 w-4 shrink-0" />
                      Next Month
                    </span>
                  </button>

                  <button
                    onClick={requestDeleteCurrentMonth}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm font-medium text-red-200 transition duration-150 hover:bg-red-950/35 active:scale-[0.98]"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Delete Current Month
                  </button>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="theme-select"
                  >
                    {YEAR_OPTIONS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Month
                  </label>
                  <select
                    value={selectedMonthIndex}
                    onChange={(e) =>
                      setSelectedMonthIndex(Number(e.target.value))
                    }
                    className="theme-select"
                  >
                    {MONTHS.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="theme-card p-5 space-y-3">
                <div className="text-sm font-semibold text-neutral-300">
                  Add Habit
                </div>

                <input
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Habit name"
                  className="theme-input"
                />

                <input
                  value={newHabitIcon}
                  onChange={(e) => setNewHabitIcon(e.target.value)}
                  placeholder="Icon, e.g. ✅"
                  className="theme-input"
                />

                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Target Type
                  </label>
                  <select
                    value={newHabitTargetType}
                    onChange={(e) => setNewHabitTargetType(e.target.value)}
                    className="theme-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-neutral-500">
                    Target Value
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newHabitTargetValue}
                    onChange={(e) => setNewHabitTargetValue(e.target.value)}
                    className="theme-input"
                    placeholder="1"
                  />
                </div>

                {newHabitError ? (
                  <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-3 py-2 text-xs text-red-300">
                    {newHabitError}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    Choose a unique habit name and a target value of at least 1.
                  </div>
                )}

                <button
                  onClick={addHabit}
                  disabled={Boolean(newHabitError)}
                  className="theme-button-primary w-full disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Habit
                </button>

                <button
                  onClick={requestResetCurrentMonth}
                  className="theme-button-secondary w-full"
                >
                  Reset Month
                </button>
              </div>

              <HabitTemplatesCard
                templates={allHabitTemplates}
                onApplyTemplate={applyHabitTemplate}
                onSaveCurrentTemplate={saveCurrentHabitsAsTemplate}
                onDeleteTemplate={deleteCustomHabitTemplate}
                onExportCustomTemplates={exportCustomHabitTemplates}
                onImportCustomTemplates={triggerImportCustomTemplates}
              />

              <div className="theme-card p-5 space-y-3">
                <div>
                  <div className="theme-section-title text-base">
                    Deleted Month Backups
                  </div>
                  <div className="theme-section-subtitle text-xs">
                    Restore previously deleted months or remove old backups
                    permanently.
                  </div>
                </div>

                {isDeletedMonthBackupsLoading ? (
                  <div className="text-sm text-neutral-500">
                    Loading deleted backups...
                  </div>
                ) : deletedMonthBackups.length > 0 ? (
                  <div className="space-y-3">
                    {deletedMonthBackups.map((backup) => (
                      <div
                        key={backup.monthKey}
                        className="theme-summary-card px-4 py-3"
                      >
                        <div className="flex flex-col gap-3">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {MONTHS[backup.month - 1]} {backup.year}
                            </div>
                            <div className="mt-1 text-xs text-neutral-500">
                              Deleted{" "}
                              {backup.deletedAt
                                ? new Date(backup.deletedAt).toLocaleString()
                                : "recently"}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 sm:flex-row">
                            <button
                              type="button"
                              onClick={() =>
                                requestRestoreDeletedMonthBackup(backup)
                              }
                              className="theme-button-secondary w-full sm:w-auto"
                            >
                              Restore
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                requestDeleteDeletedMonthBackup(backup)
                              }
                              className="theme-button-secondary w-full sm:w-auto"
                            >
                              Delete Backup
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-neutral-500">
                    No deleted month backups yet.
                  </div>
                )}
              </div>

              {showArchivedHabits ? (
                <ArchivedHabitsPanel
                  archivedHabits={archivedAnalysisRows}
                  onRestoreHabit={(habitId) =>
                    restoreHabit(habitId, { showUndo: true })
                  }
                />
              ) : null}
            </section>

            <section className="space-y-4 xl:col-span-9">
              {showTodayProgress && todaySummary ? (
                <div className="theme-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral-300">
                        Today Progress
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        Day {todaySummary.day} of {MONTHS[selectedMonthIndex]}{" "}
                        {selectedYear}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="theme-pill px-4 py-2 text-sm">
                        {todaySummary.completed}/{todaySummary.total} habits
                        done
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-sm">
                        {todaySummary.percent}%
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <TodayReminderCard
                habits={safeMonthData.habits}
                todayIndex={todayIndex}
                selectedMonthName={MONTHS[selectedMonthIndex]}
                selectedYear={selectedYear}
                onToggleHabitDay={toggleHabitDay}
              />

              <MentalStateSection
                daysInMonth={daysInMonth}
                mood={safeMonthData.mood}
                motivation={safeMonthData.motivation}
                mentalStateData={mentalStateData}
                onSetMentalMetric={setMentalMetric}
                showChart={false}
                title="Mental Check-in"
                subtitle="Quick daily input for mood and motivation."
              />

              <HabitFilters
                searchTerm={habitSearchTerm}
                onChangeSearchTerm={setHabitSearchTerm}
                filterMode={habitFilterMode}
                onChangeFilterMode={setHabitFilterMode}
                goalTypeFilter={goalTypeFilter}
                onChangeGoalTypeFilter={setGoalTypeFilter}
                filteredCount={filteredHabitsCount}
                totalCount={totalActiveHabitsCount}
                onResetFilters={resetHabitFilters}
              />

              <HabitQuickFilters
                activeFilter={activeQuickFilter}
                onApplyFilter={applyQuickFilter}
              />

              <ActiveHabitFilters chips={activeFilterChips} />

              <div className="theme-card p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-300">
                      Sort Habits
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Choose how habits are ordered across the dashboard
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select
                      value={habitSortMode}
                      onChange={(e) => setHabitSortMode(e.target.value)}
                      className="theme-select min-w-[220px] px-4 py-2.5"
                    >
                      <option value="progress-desc">Progress</option>
                      <option value="current-streak-desc">
                        Current Streak
                      </option>
                      <option value="best-streak-desc">Best Streak</option>
                      <option value="completed-desc">Completed Count</option>
                      <option value="name-asc">Name (A-Z)</option>
                      <option value="manual">Manual Order</option>
                    </select>

                    <div className="theme-pill">
                      {habitSortMode === "manual"
                        ? "Drag & drop and move buttons are active."
                        : "Automatic ranking is active."}
                    </div>
                  </div>
                </div>
              </div>

              {sortedFilteredAnalysisRows.length > 0 ? (
                <HabitGrid
                  habits={sortedFilteredAnalysisRows}
                  daysInMonth={daysInMonth}
                  weekdayLabels={WEEKDAY_LABELS}
                  draggedHabitId={draggedHabitId}
                  onToggleHabitDay={toggleHabitDay}
                  onRequestDeleteHabit={requestDeleteHabit}
                  onStartEditHabit={startEditHabit}
                  onMoveHabitUp={moveHabitUp}
                  onMoveHabitDown={moveHabitDown}
                  onRequestArchiveHabit={requestArchiveHabit}
                  onHabitDragStart={handleHabitDragStart}
                  onHabitDragOver={handleHabitDragOver}
                  onHabitDrop={handleHabitDrop}
                  onHabitDragEnd={handleHabitDragEnd}
                  todayIndex={todayIndex}
                  isManualSort={habitSortMode === "manual"}
                  autoScrollToToday={autoScrollToToday}
                />
              ) : (
                <div className="theme-card p-8 text-center">
                  <div className="text-lg font-semibold text-white">
                    No matching habits
                  </div>
                  <div className="mt-2 text-sm text-neutral-500">
                    Try adjusting your filters or clearing the current search.
                  </div>
                  <button
                    onClick={resetHabitFilters}
                    className="theme-button-primary mt-4"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>

        <ToastNotice toast={toast} onClose={closeToast} />

        <CopyMonthModal
          isOpen={isCopyMonthModalOpen}
          currentYear={selectedYear}
          currentMonthIndex={selectedMonthIndex}
          targetYear={copyTargetYear}
          targetMonthIndex={copyTargetMonthIndex}
          yearOptions={YEAR_OPTIONS}
          monthOptions={MONTHS}
          isSubmitting={isSyncing}
          onChangeTargetYear={setCopyTargetYear}
          onChangeTargetMonthIndex={setCopyTargetMonthIndex}
          onClose={closeCopyMonthModal}
          onConfirm={copyCurrentMonthToSelectedMonth}
        />

        <EditHabitModal
          isOpen={Boolean(editingHabit)}
          habitName={editingHabitName}
          habitIcon={editingHabitIcon}
          habitTargetType={editingHabitTargetType}
          habitTargetValue={editingHabitTargetValue}
          errorMessage={editHabitError}
          isSaveDisabled={Boolean(editHabitError)}
          onChangeName={setEditingHabitName}
          onChangeIcon={setEditingHabitIcon}
          onChangeTargetType={setEditingHabitTargetType}
          onChangeTargetValue={setEditingHabitTargetValue}
          onClose={closeEditHabit}
          onSave={saveEditedHabit}
        />
      </div>
    );

      const analyticsPage = (
        <div className="app-theme-bg min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-[1600px] space-y-6">
            <DashboardHeader
              title="Analytics & Insights"
              subtitle="Review progress, trends, summaries, and monthly comparisons in a separate workspace."
              onExportCSV={exportMonthCSV}
              onExportJSON={exportMonthJSON}
              onExportFilteredCSV={exportFilteredCSV}
              onExportFilteredJSON={exportFilteredJSON}
              onExportAllMonths={exportAllMonthsJSON}
              onExportAccountData={exportFullAccountJSON}
              onImportAccountData={triggerImportFullAccount}
              onExportBackup={exportFullBackup}
              onImportBackup={importBackup}
              onExportPrintableHTML={exportPrintableHTMLReport}
              onExportPDF={exportPDFReport}
              onCopyToNextMonth={requestCopyToNextMonth}
              onOpenCopyToMonth={openCopyMonthModal}
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-neutral-400">
                  Logged in as {currentUser.username}
                </div>

                <SyncStatusBadge
                  syncStatus={syncStatus}
                  syncStatusText={syncStatusText}
                  onRetry={retrySaveNow}
                />
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                {pageTabs}
                {accountActions}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <section className="space-y-4 xl:col-span-3">
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
                  motivationAverage={average(safeMonthData.motivation).toFixed(
                    1,
                  )}
                  bestHabit={monthlyInsights.bestHabit}
                  needsAttentionHabit={monthlyInsights.needsAttentionHabit}
                  strongestCurrentStreakHabit={
                    monthlyInsights.strongestCurrentStreakHabit
                  }
                />

                <AchievementsCard stats={achievementStats} />

                {showTopHabits ? (
                  rankedHabits.length > 0 ? (
                    <TopHabitsCard
                      habits={rankedHabits}
                      sortMode={habitSortMode}
                    />
                  ) : (
                    <DashboardStateCard
                      compact
                      title="No top habits yet"
                      description="Your best-performing habits will appear here once you add and track them."
                    />
                  )
                ) : null}

                <DashboardPreferencesCard
                  autoScrollToToday={autoScrollToToday}
                  onToggleAutoScrollToToday={() =>
                    setAutoScrollToToday((prev) => !prev)
                  }
                  showArchivedHabits={showArchivedHabits}
                  onToggleShowArchivedHabits={() =>
                    setShowArchivedHabits((prev) => !prev)
                  }
                  showAdvancedAnalytics={showAdvancedAnalytics}
                  onToggleShowAdvancedAnalytics={() =>
                    setShowAdvancedAnalytics((prev) => !prev)
                  }
                  showTodayProgress={showTodayProgress}
                  onToggleShowTodayProgress={() =>
                    setShowTodayProgress((prev) => !prev)
                  }
                  showTopHabits={showTopHabits}
                  onToggleShowTopHabits={() =>
                    setShowTopHabits((prev) => !prev)
                  }
                  showYearlyOverview={showYearlyOverview}
                  onToggleShowYearlyOverview={() =>
                    setShowYearlyOverview((prev) => !prev)
                  }
                  showStreakLeaderboard={showStreakLeaderboard}
                  onToggleShowStreakLeaderboard={() =>
                    setShowStreakLeaderboard((prev) => !prev)
                  }
                  onResetPreferences={resetDashboardPreferences}
                />

                <ReminderSettingsCard />
              </section>

              <section className="space-y-4 xl:col-span-6">
                {activeAnalysisRows.length > 0 ? (
                  <ProgressCharts
                    dailyProgress={dailyProgress}
                    weeklyProgress={weeklyProgress}
                  />
                ) : (
                  <DashboardStateCard
                    title="No chart data yet"
                    description="Add your first habit to start seeing daily and weekly progress charts."
                  />
                )}

                <MentalStateSection
                  daysInMonth={daysInMonth}
                  mood={safeMonthData.mood}
                  motivation={safeMonthData.motivation}
                  mentalStateData={mentalStateData}
                  onSetMentalMetric={setMentalMetric}
                  showChart
                  title="Mental State & Trend"
                  subtitle="Track your daily mood and motivation and review the monthly trend."
                />

                {showStreakLeaderboard ? (
                  analysisRows.length > 0 ? (
                    <StreakLeaderboardCard rows={analysisRows} />
                  ) : (
                    <DashboardStateCard
                      compact
                      title="No streak data yet"
                      description="Start checking off habits to build streak rankings."
                    />
                  )
                ) : null}

                {sortedActiveAnalysisRows.length > 0 ? (
                  <AnalysisPanel
                    totalGoal={totalGoal}
                    totalCompleted={totalCompleted}
                    totalLeft={totalLeft}
                    completionPercent={completionPercent}
                    analysisRows={sortedActiveAnalysisRows}
                  />
                ) : (
                  <DashboardStateCard
                    title="No analysis available yet"
                    description="Add active habits and start tracking them to unlock analysis and streak insights."
                  />
                )}

                {showYearlyOverview ? (
                  isYearlyOverviewLoading ? (
                    <DashboardLoadingCard
                      compact
                      title="Loading yearly overview"
                      lines={4}
                    />
                  ) : (
                    <YearlyOverviewCard
                      selectedYear={selectedYear}
                      yearlyData={yearlyOverviewData}
                      isLoading={false}
                    />
                  )
                ) : null}
              </section>

              <div className="space-y-4 xl:col-span-3">
                {showAdvancedAnalytics ? (
                  <>
                    <AnalyticsHighlightsCard
                      consistencyScore={consistencyScore}
                      bestDay={bestDaySummary}
                      strongestGoalType={strongestGoalType}
                      trendInsight={trendInsight}
                    />

                    <WeekdayPerformanceCard
                      rows={weekdayPerformance.rows}
                      bestWeekday={weekdayPerformance.bestWeekday}
                      weakestWeekday={weekdayPerformance.weakestWeekday}
                    />

                    <WeeklyMomentumCard
                      strongestWeek={weeklyMomentum.strongestWeek}
                      weakestWeek={weeklyMomentum.weakestWeek}
                      trend={weeklyMomentum.trend}
                    />
                  </>
                ) : null}

                {isPreviousMonthLoading ? (
                  <DashboardLoadingCard
                    compact
                    title="Loading previous month"
                    lines={3}
                  />
                ) : (
                  <MonthComparisonCard
                    currentSummary={monthlySummary}
                    previousSummary={previousMonthSummary}
                    previousLabel={previousMonthLabel}
                    isLoading={false}
                  />
                )}
              </div>
            </div>
          </div>

          <ToastNotice toast={toast} onClose={closeToast} />

          <CopyMonthModal
            isOpen={isCopyMonthModalOpen}
            currentYear={selectedYear}
            currentMonthIndex={selectedMonthIndex}
            targetYear={copyTargetYear}
            targetMonthIndex={copyTargetMonthIndex}
            yearOptions={YEAR_OPTIONS}
            monthOptions={MONTHS}
            isSubmitting={isSyncing}
            onChangeTargetYear={setCopyTargetYear}
            onChangeTargetMonthIndex={setCopyTargetMonthIndex}
            onClose={closeCopyMonthModal}
            onConfirm={copyCurrentMonthToSelectedMonth}
          />

          <EditHabitModal
            isOpen={Boolean(editingHabit)}
            habitName={editingHabitName}
            habitIcon={editingHabitIcon}
            habitTargetType={editingHabitTargetType}
            habitTargetValue={editingHabitTargetValue}
            errorMessage={editHabitError}
            isSaveDisabled={Boolean(editHabitError)}
            onChangeName={setEditingHabitName}
            onChangeIcon={setEditingHabitIcon}
            onChangeTargetType={setEditingHabitTargetType}
            onChangeTargetValue={setEditingHabitTargetValue}
            onClose={closeEditHabit}
            onSave={saveEditedHabit}
          />
        </div>
      );

      const notesReviewPage = (
        <div className="app-theme-bg min-h-screen p-4 md:p-8">
          <div className="mx-auto max-w-[1400px] space-y-6">
            <DashboardHeader
              title="Notes & Review"
              subtitle="Write your monthly review and monthly notes in one focused space."
              onExportCSV={exportMonthCSV}
              onExportJSON={exportMonthJSON}
              onExportFilteredCSV={exportFilteredCSV}
              onExportFilteredJSON={exportFilteredJSON}
              onExportAllMonths={exportAllMonthsJSON}
              onExportAccountData={exportFullAccountJSON}
              onImportAccountData={triggerImportFullAccount}
              onExportBackup={exportFullBackup}
              onImportBackup={importBackup}
              onExportPrintableHTML={exportPrintableHTMLReport}
              onExportPDF={exportPDFReport}
              onCopyToNextMonth={requestCopyToNextMonth}
              onOpenCopyToMonth={openCopyMonthModal}
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-neutral-400">
                  Logged in as {currentUser.username}
                </div>

                <SyncStatusBadge
                  syncStatus={syncStatus}
                  syncStatusText={syncStatusText}
                  onRetry={retrySaveNow}
                />
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                {pageTabs}
                {accountActions}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <section className="space-y-4 xl:col-span-4">
                <MonthlySummaryCard
                  selectedYear={selectedYear}
                  selectedMonthName={MONTHS[selectedMonthIndex]}
                  completionPercent={completionPercent}
                  moodAverage={average(safeMonthData.mood).toFixed(1)}
                  motivationAverage={average(safeMonthData.motivation).toFixed(
                    1,
                  )}
                  bestHabit={monthlyInsights.bestHabit}
                  needsAttentionHabit={monthlyInsights.needsAttentionHabit}
                  strongestCurrentStreakHabit={
                    monthlyInsights.strongestCurrentStreakHabit
                  }
                />

                {isPreviousMonthLoading ? (
                  <DashboardLoadingCard
                    compact
                    title="Loading previous month"
                    lines={3}
                  />
                ) : (
                  <MonthComparisonCard
                    currentSummary={monthlySummary}
                    previousSummary={previousMonthSummary}
                    previousLabel={previousMonthLabel}
                    isLoading={false}
                  />
                )}
              </section>

              <section className="space-y-4 xl:col-span-8">
                <MonthlyReviewCard
                  review={safeMonthData.review}
                  onChangeField={updateMonthlyReviewField}
                />

                <MonthlyNotesPanel
                  notes={safeMonthData.notes}
                  onChangeNotes={setMonthlyNotes}
                />
              </section>
            </div>
          </div>

          <ToastNotice toast={toast} onClose={closeToast} />

          <CopyMonthModal
            isOpen={isCopyMonthModalOpen}
            currentYear={selectedYear}
            currentMonthIndex={selectedMonthIndex}
            targetYear={copyTargetYear}
            targetMonthIndex={copyTargetMonthIndex}
            yearOptions={YEAR_OPTIONS}
            monthOptions={MONTHS}
            isSubmitting={isSyncing}
            onChangeTargetYear={setCopyTargetYear}
            onChangeTargetMonthIndex={setCopyTargetMonthIndex}
            onClose={closeCopyMonthModal}
            onConfirm={copyCurrentMonthToSelectedMonth}
          />

          <EditHabitModal
            isOpen={Boolean(editingHabit)}
            habitName={editingHabitName}
            habitIcon={editingHabitIcon}
            habitTargetType={editingHabitTargetType}
            habitTargetValue={editingHabitTargetValue}
            errorMessage={editHabitError}
            isSaveDisabled={Boolean(editHabitError)}
            onChangeName={setEditingHabitName}
            onChangeIcon={setEditingHabitIcon}
            onChangeTargetType={setEditingHabitTargetType}
            onChangeTargetValue={setEditingHabitTargetValue}
            onClose={closeEditHabit}
            onSave={saveEditedHabit}
          />
        </div>
      );

  return (
    <ErrorBoundary>
      <input
        ref={fullAccountImportInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await importFullAccountFromFile(file);
          }
          event.target.value = "";
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={dashboardPage} />
        <Route path="/analytics" element={analyticsPage} />
        <Route path="/notes-review" element={notesReviewPage} />
        <Route
          path="/profile"
          element={
            <ProfilePage
              currentUser={currentUser}
              onBack={() => navigate("/dashboard")}
              onGoToAnalytics={() => navigate("/analytics")}
              onLogout={handleLogout}
              onSaveProfile={handleSaveProfile}
              isSavingProfile={isSavingProfile}
              profileErrorMessage={profileErrorMessage}
              profileSuccessMessage={profileSuccessMessage}
              onExportAccountData={exportFullAccountJSON}
              onImportAccountData={triggerImportFullAccount}
              onChangePassword={handleChangePassword}
              isChangingPassword={isChangingPassword}
              onDeleteAccount={requestDeleteAccount}
              isDeleting={isDeletingAccount}
            />
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ConfirmActionModal
        isOpen={Boolean(confirmAction)}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        confirmLabel={confirmAction?.confirmLabel || "Confirm"}
        cancelLabel={confirmAction?.cancelLabel || "Cancel"}
        variant={confirmAction?.variant || "danger"}
        helperText={confirmAction?.helperText || ""}
        requireTypedConfirmation={confirmAction?.requireTypedConfirmation || ""}
        isSubmitting={isConfirmActionSubmitting}
        onConfirm={executeConfirmAction}
        onClose={closeConfirmModal}
      />
    </ErrorBoundary>
  );
}

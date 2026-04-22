import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { getMonthData, saveMonthData } from "./lib/api";
import defaultHabits from "./data/defaultHabits";
import {
  MONTHS,
  WEEKDAY_LABELS,
  createMonthKey,
  getDaysInMonth,
  getWeekRanges,
} from "./lib/date";
import { loadDashboardData, saveDashboardData } from "./lib/storage";
import { downloadBlob, toCSV } from "./lib/export";

import DashboardHeader from "./components/DashboardHeader";
import ProgressCharts from "./components/ProgressCharts";
import HabitGrid from "./components/HabitGrid";
import MentalStateSection from "./components/MentalStateSection";
import AnalysisPanel from "./components/AnalysisPanel";
import TopHabitsCard from "./components/TopHabitsCard";

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

export default function App() {
  const currentDate = new Date();

  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear()),
  );
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(
    currentDate.getMonth(),
  );
  const [db, setDb] = useState({ months: {} });
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("✅");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadedMonthKey, setLoadedMonthKey] = useState(null);

  const monthKey = createMonthKey(selectedYear, selectedMonthIndex);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);

  useEffect(() => {
    const data = loadDashboardData();
    setDb(data);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveDashboardData(db);
  }, [db, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (loadedMonthKey !== monthKey) return;

    const currentMonth = db.months?.[monthKey];
    if (!currentMonth) return;

    const timeoutId = setTimeout(async () => {
      try {
        setIsSyncing(true);

        await saveMonthData(
          Number(selectedYear),
          selectedMonthIndex + 1,
          ensureMonthShape(currentMonth, selectedYear, selectedMonthIndex),
        );
      } catch (error) {
        console.error("Failed to save month to API:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [
    db,
    isLoaded,
    loadedMonthKey,
    monthKey,
    selectedYear,
    selectedMonthIndex,
  ]);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    async function loadMonthFromApi() {
      try {
        setIsSyncing(true);

        const response = await getMonthData(
          Number(selectedYear),
          selectedMonthIndex + 1,
        );

        const nextMonthData = response?.data
          ? ensureMonthShape(response.data, selectedYear, selectedMonthIndex)
          : buildDefaultMonthData(selectedYear, selectedMonthIndex);

        if (cancelled) return;

        setDb((prev) => ({
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: nextMonthData,
          },
        }));

        setLoadedMonthKey(monthKey);
      } catch (error) {
        console.error("Failed to load month from API:", error);

        if (cancelled) return;

        setDb((prev) => ({
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: prev.months?.[monthKey]
              ? ensureMonthShape(
                  prev.months[monthKey],
                  selectedYear,
                  selectedMonthIndex,
                )
              : buildDefaultMonthData(selectedYear, selectedMonthIndex),
          },
        }));

        setLoadedMonthKey(monthKey);
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    }

    loadMonthFromApi();

    return () => {
      cancelled = true;
    };
  }, [monthKey, isLoaded, selectedYear, selectedMonthIndex]);

  const monthData = useMemo(() => {
    return ensureMonthShape(
      db.months?.[monthKey],
      selectedYear,
      selectedMonthIndex,
    );
  }, [db, monthKey, selectedYear, selectedMonthIndex]);

  const updateMonth = (updater) => {
    setDb((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [monthKey]: updater(
          ensureMonthShape(
            prev.months?.[monthKey],
            selectedYear,
            selectedMonthIndex,
          ),
        ),
      },
    }));
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

  const resetCurrentMonth = () => {
    setDb((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [monthKey]: buildDefaultMonthData(selectedYear, selectedMonthIndex),
      },
    }));
  };

  const analysisRows = useMemo(() => {
    const weekRanges = getWeekRanges(daysInMonth);

    return monthData.habits.map((habit) => {
      const actual = habit.checks.filter(Boolean).length;
      const goal = daysInMonth;
      const left = goal - actual;
      const progress = goal ? Math.round((actual / goal) * 100) : 0;

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
        weekly,
      };
    });
  }, [monthData, daysInMonth]);

  const dailyProgress = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const completed = monthData.habits.filter(
        (habit) => habit.checks[dayIndex],
      ).length;
      const total = monthData.habits.length || 1;

      return {
        day: dayIndex + 1,
        value: Math.round((completed / total) * 100),
      };
    });
  }, [monthData, daysInMonth]);

  const weeklyProgress = useMemo(() => {
    return getWeekRanges(daysInMonth).map(([start, end], idx) => {
      const slice = dailyProgress.slice(start, end);

      return {
        label: `Week ${idx + 1}`,
        value: Math.round(average(slice.map((item) => item.value))),
      };
    });
  }, [dailyProgress, daysInMonth]);

  const totalGoal = daysInMonth * monthData.habits.length;
  const totalCompleted = analysisRows.reduce((sum, row) => sum + row.actual, 0);
  const totalLeft = Math.max(totalGoal - totalCompleted, 0);
  const completionPercent = totalGoal
    ? Math.round((totalCompleted / totalGoal) * 100)
    : 0;

  const rankedHabits = [...analysisRows].sort(
    (a, b) => b.progress - a.progress,
  );

  const mentalStateData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, dayIndex) => ({
      day: dayIndex + 1,
      Mood: Number(monthData.mood[dayIndex] || 1),
      Motivation: Number(monthData.motivation[dayIndex] || 1),
    }));
  }, [monthData, daysInMonth]);

  const monthlySummary = {
    year: selectedYear,
    month: MONTHS[selectedMonthIndex],
    monthKey,
    daysInMonth,
    totalGoal,
    totalCompleted,
    totalLeft,
    completionPercent,
    moodAverage: average(monthData.mood).toFixed(1),
    motivationAverage: average(monthData.motivation).toFixed(1),
    habits: analysisRows,
    dailyProgress,
    weeklyProgress,
    mentalStateData,
    notes: monthData.notes,
  };

  const exportMonthJSON = () => {
    downloadBlob(
      `habit-tracker-${monthKey}.json`,
      JSON.stringify(monthlySummary, null, 2),
      "application/json",
    );
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
        monthData.mood[dayIndex],
        monthData.motivation[dayIndex],
        dailyProgress[dayIndex]?.value ?? 0,
      ]),
    ];

    downloadBlob(
      `habit-tracker-${monthKey}.csv`,
      toCSV(rows),
      "text/csv;charset=utf-8;",
    );
  };

  const exportFullBackup = () => {
    downloadBlob(
      "habit-tracker-full-backup.json",
      JSON.stringify(db, null, 2),
      "application/json",
    );
  };

  const importBackup = async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup file");
      }

      setDb(parsed);
    } catch (error) {
      alert("Backup file is not valid JSON.");
      console.error(error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-6 py-4 shadow-2xl">
          Loading Habit Tracker...
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
        />

        <div className="text-sm text-neutral-400">
          {isSyncing ? "Syncing with server..." : "Connected to PostgreSQL API"}
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
          </section>

          <section className="xl:col-span-6 space-y-4">
            <ProgressCharts
              dailyProgress={dailyProgress}
              weeklyProgress={weeklyProgress}
            />

            <HabitGrid
              habits={monthData.habits}
              daysInMonth={daysInMonth}
              weekdayLabels={WEEKDAY_LABELS}
              onToggleHabitDay={toggleHabitDay}
              onDeleteHabit={deleteHabit}
            />

            <MentalStateSection
              daysInMonth={daysInMonth}
              mood={monthData.mood}
              motivation={monthData.motivation}
              mentalStateData={mentalStateData}
              onSetMentalMetric={setMentalMetric}
            />
          </section>

          <AnalysisPanel
            totalGoal={totalGoal}
            totalCompleted={totalCompleted}
            totalLeft={totalLeft}
            completionPercent={completionPercent}
            analysisRows={analysisRows}
          />
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieChartIcon,
  Plus,
  Target,
  TrendingUp,
  Upload,
  Trash2,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const STORAGE_KEY = "mindform_dashboard_v1";
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAY_LABELS = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];
const DEFAULT_HABITS = [
  { id: "wake-6", name: "Wake up at 06:00", icon: "⏰" },
  { id: "meditation", name: "Meditation", icon: "🧘" },
  { id: "gym", name: "Gym", icon: "💪" },
  { id: "cold-shower", name: "Cold Shower", icon: "🚿" },
  { id: "work", name: "Work", icon: "🎯" },
  { id: "read", name: "Read 10 pages", icon: "📚" },
  { id: "learn", name: "Learn a skill", icon: "🧠" },
  { id: "no-sugar", name: "No sugar", icon: "🍓" },
  { id: "no-alcohol", name: "No alcohol", icon: "🍷" },
  { id: "social-media", name: "1h social media max", icon: "📱" },
  { id: "planning", name: "Planning", icon: "📝" },
  { id: "sleep-11", name: "Sleep before 11:00", icon: "🌙" },
];

function createMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

function getDaysInMonth(year, monthIndex) {
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

function buildDefaultMonthData(year, monthIndex) {
  const days = getDaysInMonth(year, monthIndex);
  return {
    habits: DEFAULT_HABITS.map((habit) => ({
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

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
        .join(","),
    )
    .join("\n");
}

function getWeekRanges(daysInMonth) {
  const ranges = [];
  for (let start = 0; start < daysInMonth; start += 7) {
    ranges.push([start, Math.min(start + 7, daysInMonth)]);
  }
  return ranges;
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function MindFormDashboardApp() {
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
  const importRef = useRef(null);

  const monthKey = createMonthKey(selectedYear, selectedMonthIndex);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonthIndex);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDb(parsed);
      }
    } catch (error) {
      console.error("Failed to load saved dashboard data", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (error) {
      console.error("Failed to save dashboard data", error);
    }
  }, [db, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    setDb((prev) => {
      if (prev.months?.[monthKey]) {
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: ensureMonthShape(
              prev.months[monthKey],
              selectedYear,
              selectedMonthIndex,
            ),
          },
        };
      }

      return {
        ...prev,
        months: {
          ...prev.months,
          [monthKey]: buildDefaultMonthData(selectedYear, selectedMonthIndex),
        },
      };
    });
  }, [monthKey, isLoaded, selectedMonthIndex, selectedYear]);

  const monthData = useMemo(() => {
    return ensureMonthShape(
      db.months?.[monthKey],
      selectedYear,
      selectedMonthIndex,
    );
  }, [db, monthKey, selectedMonthIndex, selectedYear]);

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

    const safeId = trimmed.toLowerCase().split(" ").join("-");

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
      `mindform-${monthKey}.json`,
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
      `mindform-${monthKey}.csv`,
      toCSV(rows),
      "text/csv;charset=utf-8;",
    );
  };

  const exportFullBackup = () => {
    downloadBlob(
      "mindform-full-backup.json",
      JSON.stringify(db, null, 2),
      "application/json",
    );
  };

  const importBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object")
        throw new Error("Invalid backup file");
      setDb(parsed);
    } catch (error) {
      alert("Backup file is not valid JSON.");
      console.error(error);
    } finally {
      event.target.value = "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-6 py-4 shadow-2xl">
          Loading MindForm dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importBackup}
      />

      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              MindForm Habit Dashboard
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-400">
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportMonthCSV}
              className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export CSV
            </button>
            <button
              onClick={exportMonthJSON}
              className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <FileText className="h-4 w-4" /> Export Month JSON
            </button>
            <button
              onClick={exportFullBackup}
              className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <Download className="h-4 w-4" /> Full Backup
            </button>
            <button
              onClick={() => importRef.current?.click()}
              className="rounded-2xl bg-white text-black hover:bg-neutral-200 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
            >
              <Upload className="h-4 w-4" /> Import Backup
            </button>
          </div>
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
                <CalendarDays className="h-4 w-4" /> Calendar Settings
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
                <Plus className="h-4 w-4" /> Add New Habit
              </button>
              <button
                onClick={resetCurrentMonth}
                className="w-full rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium"
              >
                Reset Current Month
              </button>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="text-sm font-semibold text-neutral-300 mb-4">
                Top Habits
              </div>
              <div className="space-y-3">
                {rankedHabits.slice(0, 10).map((habit, idx) => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between text-sm gap-3"
                  >
                    <div className="text-neutral-500 w-5">{idx + 1}</div>
                    <div className="flex-1 truncate">{habit.name}</div>
                    <div className="text-neutral-400">{habit.progress}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="xl:col-span-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold">Daily Progress</div>
                  <BarChart3 className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyProgress}>
                      <XAxis
                        dataKey="day"
                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        fill="#d4d4d4"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-semibold">Weekly Progress</div>
                  <TrendingUp className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyProgress}>
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#a3a3a3", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={35}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        radius={[8, 8, 0, 0]}
                        fill="#a3a3a3"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl overflow-x-auto">
              <div className="min-w-[980px] space-y-2">
                <div
                  className="grid gap-1 items-center"
                  style={{
                    gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
                  }}
                >
                  <div className="text-sm font-semibold text-neutral-300 px-2">
                    My Habits
                  </div>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-center text-neutral-500"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
                  }}
                >
                  <div></div>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <div
                      key={i}
                      className="text-[10px] text-center text-neutral-600"
                    >
                      {WEEKDAY_LABELS[i % 7]}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  {monthData.habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="grid gap-1 items-center"
                      style={{
                        gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
                      }}
                    >
                      <div className="px-3 py-2 rounded-xl bg-neutral-800 text-sm text-neutral-200 flex items-center justify-between gap-3">
                        <div className="truncate">
                          {habit.name}{" "}
                          <span className="ml-1">{habit.icon}</span>
                        </div>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-neutral-500 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {habit.checks.map((checked, dayIndex) => (
                        <button
                          key={dayIndex}
                          onClick={() => toggleHabitDay(habit.id, dayIndex)}
                          className={`h-7 w-7 rounded-md border flex items-center justify-center text-[11px] transition ${
                            checked
                              ? "bg-neutral-300 text-black border-neutral-300"
                              : "bg-neutral-950 text-neutral-700 border-neutral-800 hover:border-neutral-600"
                          }`}
                        >
                          {checked ? "✓" : ""}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Mental State</div>
                <FileText className="h-4 w-4 text-neutral-400" />
              </div>

              <div className="overflow-x-auto mb-5">
                <div className="min-w-[900px] space-y-2">
                  <div
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
                    }}
                  >
                    <div></div>
                    {Array.from({ length: daysInMonth }, (_, i) => (
                      <div
                        key={i}
                        className="text-[10px] text-center text-neutral-500"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <div
                    className="grid gap-1 items-center"
                    style={{
                      gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
                    }}
                  >
                    <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
                      Mood
                    </div>
                    {monthData.mood.map((value, dayIndex) => (
                      <input
                        key={dayIndex}
                        type="number"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) =>
                          setMentalMetric("mood", dayIndex, e.target.value)
                        }
                        className="h-10 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm outline-none"
                      />
                    ))}
                  </div>

                  <div
                    className="grid gap-1 items-center"
                    style={{
                      gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
                    }}
                  >
                    <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
                      Motivation
                    </div>
                    {monthData.motivation.map((value, dayIndex) => (
                      <input
                        key={dayIndex}
                        type="number"
                        min="1"
                        max="10"
                        value={value}
                        onChange={(e) =>
                          setMentalMetric(
                            "motivation",
                            dayIndex,
                            e.target.value,
                          )
                        }
                        className="h-10 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm outline-none"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                <div className="rounded-2xl bg-neutral-800 px-4 py-3">
                  <div className="text-neutral-500">Mood Average</div>
                  <div className="text-xl font-semibold mt-1">
                    {average(monthData.mood).toFixed(1)}
                  </div>
                </div>
                <div className="rounded-2xl bg-neutral-800 px-4 py-3">
                  <div className="text-neutral-500">Motivation Average</div>
                  <div className="text-xl font-semibold mt-1">
                    {average(monthData.motivation).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mentalStateData}>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "#a3a3a3", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 10]}
                      tick={{ fill: "#a3a3a3", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="Mood"
                      stroke="#e5e5e5"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Motivation"
                      stroke="#737373"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="xl:col-span-3 space-y-4">
            <div className="grid grid-cols-3 xl:grid-cols-1 gap-4">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  Goal
                </div>
                <div className="text-3xl font-semibold mt-2">{totalGoal}</div>
              </div>
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  Completed
                </div>
                <div className="text-3xl font-semibold mt-2">
                  {totalCompleted}
                </div>
              </div>
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
                <div className="text-xs uppercase tracking-wide text-neutral-500">
                  Left
                </div>
                <div className="text-3xl font-semibold mt-2">{totalLeft}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Overall Stats</div>
                <PieChartIcon className="h-4 w-4 text-neutral-400" />
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Completed", value: totalCompleted },
                        { name: "Left", value: totalLeft },
                      ]}
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      <Cell fill="#d4d4d4" />
                      <Cell fill="#404040" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-2">
                <div className="text-3xl font-semibold">
                  {completionPercent}%
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  Monthly completion rate
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="font-semibold mb-4">Analysis</div>
              <div className="space-y-3 max-h-[820px] overflow-y-auto pr-1">
                {analysisRows.map((row) => (
                  <div key={row.id} className="rounded-2xl bg-neutral-800 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="text-sm font-medium">{row.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          Goal {row.goal} • Actual {row.actual} • Left{" "}
                          {row.left}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {row.progress}%
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-neutral-700 overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-neutral-200"
                        style={{ width: `${row.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-[11px]">
                      {row.weekly.map((week) => (
                        <div
                          key={week.label}
                          className="rounded-xl bg-neutral-900 px-2 py-2 text-center"
                        >
                          <div className="text-neutral-500">{week.label}</div>
                          <div className="mt-1 font-medium">{week.value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-lg font-semibold">Project status</div>
              <div className="text-sm text-neutral-400 mt-1">
               
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm min-w-full lg:min-w-[650px]">
              <div className="rounded-2xl bg-neutral-800 px-4 py-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Local auto-save
              </div>
              <div className="rounded-2xl bg-neutral-800 px-4 py-3 flex items-center gap-2">
                <Target className="h-4 w-4" /> Per-habit analytics
              </div>
              <div className="rounded-2xl bg-neutral-800 px-4 py-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Export + backup ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

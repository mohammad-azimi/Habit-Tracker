import React, { useMemo } from "react";
import { Activity, Flame, Trophy } from "lucide-react";
import {
  formatGoalTypeShortLabel,
  formatGoalTypeLongLabel,
  getGoalTypeBadgeClasses,
} from "../lib/goalType";
import {
  getHabitStatus,
  getHabitStatusBadgeClasses,
  getHabitProgressBarClasses,
  getHabitProgressTextClasses,
} from "../lib/habitStatus";

function SummaryStat({ icon: Icon, label, value }) {
  return (
    <div className="theme-stat-tile px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        <Icon className="h-3.5 w-3.5 text-neutral-400" />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default function AnalysisPanel({
  totalGoal,
  totalCompleted,
  totalLeft,
  completionPercent,
  analysisRows,
}) {
  const summary = useMemo(() => {
    const averageProgress = analysisRows.length
      ? Math.round(
          analysisRows.reduce((sum, row) => sum + row.progress, 0) /
            analysisRows.length,
        )
      : 0;

    const bestCurrentStreak = analysisRows.length
      ? Math.max(...analysisRows.map((row) => row.currentStreak || 0))
      : 0;

    const bestStreakEver = analysisRows.length
      ? Math.max(...analysisRows.map((row) => row.bestStreak || 0))
      : 0;

    return {
      averageProgress,
      bestCurrentStreak,
      bestStreakEver,
    };
  }, [analysisRows]);

  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="theme-section-title">Analysis & Streaks</div>
          <div className="theme-section-subtitle">
            Per-habit performance and consistency
          </div>
        </div>

        <div className="theme-pill text-sm font-semibold">
          {completionPercent}%
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <SummaryStat
          icon={Activity}
          label="Avg Progress"
          value={`${summary.averageProgress}%`}
        />
        <SummaryStat
          icon={Flame}
          label="Best Current"
          value={summary.bestCurrentStreak}
        />
        <SummaryStat
          icon={Trophy}
          label="Best Ever"
          value={summary.bestStreakEver}
        />
      </div>

      <div className="space-y-3">
        {analysisRows.length === 0 ? (
          <div className="theme-summary-card p-4 text-sm text-neutral-400">
            No habit analysis available yet.
          </div>
        ) : (
          analysisRows.map((row) => {
            const status = getHabitStatus(row.progress);

            return (
              <div key={row.id} className="theme-summary-card p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">
                      {row.name} <span className="ml-1">{row.icon}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-neutral-500">
                      {formatGoalTypeLongLabel(row.targetType, row.targetValue)}{" "}
                      • {row.actual}/{row.goal} completed • {row.left} left
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${getGoalTypeBadgeClasses(
                          row.targetType,
                        )}`}
                      >
                        {formatGoalTypeShortLabel(
                          row.targetType,
                          row.targetValue,
                        )}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getHabitStatusBadgeClasses(
                          row.progress,
                        )}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`shrink-0 text-sm font-semibold ${getHabitProgressTextClasses(
                      row.progress,
                    )}`}
                  >
                    {row.progress}%
                  </div>
                </div>

                <div className="analytics-progress-track mb-4 h-2 w-full overflow-hidden rounded-full bg-neutral-700">
                  <div
                    className={`h-full rounded-full ${getHabitProgressBarClasses(
                      row.progress,
                    )}`}
                    style={{ width: `${row.progress}%` }}
                  />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="theme-card-muted px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Current Streak
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {row.currentStreak} day
                      {row.currentStreak === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="theme-card-muted px-3 py-3">
                    <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                      Best Streak
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {row.bestStreak} day{row.bestStreak === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 text-[11px]">
                  {row.weekly.map((week) => (
                    <div
                      key={week.label}
                      className="theme-card-muted px-2 py-2 text-center"
                    >
                      <div className="text-neutral-500">{week.label}</div>
                      <div className="mt-1 font-medium text-white">
                        {week.value}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

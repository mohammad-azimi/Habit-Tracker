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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-semibold">Analysis & Streaks</div>
          <div className="text-xs text-neutral-500 mt-1">
            Per-habit performance and consistency
          </div>
        </div>

        <div className="text-sm font-semibold text-neutral-300">
          {completionPercent}%
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl bg-neutral-800 px-3 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Activity className="h-3.5 w-3.5" />
            Avg Progress
          </div>
          <div className="text-xl font-semibold mt-2">
            {summary.averageProgress}%
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-3 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Flame className="h-3.5 w-3.5" />
            Best Current
          </div>
          <div className="text-xl font-semibold mt-2">
            {summary.bestCurrentStreak}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-3 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Trophy className="h-3.5 w-3.5" />
            Best Ever
          </div>
          <div className="text-xl font-semibold mt-2">
            {summary.bestStreakEver}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-[760px] overflow-y-auto pr-1">
        {analysisRows.length === 0 ? (
          <div className="rounded-2xl bg-neutral-800 p-4 text-sm text-neutral-400">
            No habit analysis available yet.
          </div>
        ) : (
          analysisRows.map((row) => {
            const status = getHabitStatus(row.progress);

            return (
              <div key={row.id} className="rounded-2xl bg-neutral-800 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
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
                    className={`text-sm font-semibold shrink-0 ${getHabitProgressTextClasses(
                      row.progress,
                    )}`}
                  >
                    {row.progress}%
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-neutral-700 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${getHabitProgressBarClasses(
                      row.progress,
                    )}`}
                    style={{ width: `${row.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-neutral-900 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                      Current Streak
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      {row.currentStreak} day
                      {row.currentStreak === 1 ? "" : "s"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-neutral-900 px-3 py-3">
                    <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                      Best Streak
                    </div>
                    <div className="text-lg font-semibold mt-2">
                      {row.bestStreak} day{row.bestStreak === 1 ? "" : "s"}
                    </div>
                  </div>
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
            );
          })
        )}
      </div>
    </div>
  );
}

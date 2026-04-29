import React from "react";
import { Brain, Flame, Sparkles, Target, TrendingUp } from "lucide-react";

export default function MonthlySummaryCard({
  selectedYear,
  selectedMonthName,
  completionPercent,
  moodAverage,
  motivationAverage,
  bestHabit,
  needsAttentionHabit,
  strongestCurrentStreakHabit,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Monthly Summary</div>
        <div className="text-xs text-neutral-500 mt-1">
          {selectedMonthName} {selectedYear} performance overview
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Target className="h-3.5 w-3.5" />
            Completion
          </div>
          <div className="text-2xl font-semibold mt-2">
            {completionPercent}%
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Flame className="h-3.5 w-3.5" />
            Best Current Streak
          </div>
          <div className="text-2xl font-semibold mt-2">
            {strongestCurrentStreakHabit?.currentStreak ?? 0}d
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Brain className="h-3.5 w-3.5" />
            Mood Avg
          </div>
          <div className="text-xl font-semibold mt-2">{moodAverage}</div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <TrendingUp className="h-3.5 w-3.5" />
            Motivation Avg
          </div>
          <div className="text-xl font-semibold mt-2">{motivationAverage}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Sparkles className="h-4 w-4" />
            Best Habit This Month
          </div>
          <div className="text-sm text-white">
            {bestHabit ? (
              <>
                {bestHabit.name} <span className="ml-1">{bestHabit.icon}</span>
                <span className="text-neutral-400 ml-2">
                  ({bestHabit.progress}%)
                </span>
              </>
            ) : (
              "No data"
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Target className="h-4 w-4" />
            Needs Attention
          </div>
          <div className="text-sm text-white">
            {needsAttentionHabit ? (
              <>
                {needsAttentionHabit.name}{" "}
                <span className="ml-1">{needsAttentionHabit.icon}</span>
                <span className="text-neutral-400 ml-2">
                  ({needsAttentionHabit.progress}%)
                </span>
              </>
            ) : (
              "No data"
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Flame className="h-4 w-4" />
            Streak Leader
          </div>
          <div className="text-sm text-white">
            {strongestCurrentStreakHabit ? (
              <>
                {strongestCurrentStreakHabit.name}
                <span className="ml-1">{strongestCurrentStreakHabit.icon}</span>
                <span className="text-neutral-400 ml-2">
                  ({strongestCurrentStreakHabit.currentStreak} days)
                </span>
              </>
            ) : (
              "No data"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

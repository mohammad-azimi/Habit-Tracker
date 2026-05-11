import React from "react";
import { BarChart3, CalendarDays, Target } from "lucide-react";

export default function AnalyticsHighlightsCard({
  consistencyScore,
  bestDay,
  strongestGoalType,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Analytics Highlights</div>
        <div className="text-xs text-neutral-500 mt-1">
          Deeper monthly performance insights
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <BarChart3 className="h-3.5 w-3.5" />
            Consistency Score
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="text-2xl font-semibold">{consistencyScore}%</div>
            <div className="text-xs text-neutral-400">
              Based on progress and activity coverage
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <CalendarDays className="h-3.5 w-3.5" />
            Best Day
          </div>
          <div className="mt-2 text-sm text-white">
            {bestDay ? (
              <>
                Day {bestDay.day}{" "}
                <span className="text-neutral-400">({bestDay.weekday})</span>
                <div className="mt-1 text-xs text-neutral-400">
                  {bestDay.completed}/{bestDay.total} habits completed •{" "}
                  {bestDay.percent}%
                </div>
              </>
            ) : (
              <span className="text-neutral-400">No daily activity yet</span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <Target className="h-3.5 w-3.5" />
            Strongest Goal Type
          </div>
          <div className="mt-2 text-sm text-white">
            {strongestGoalType ? (
              <>
                {strongestGoalType.label}
                <div className="mt-1 text-xs text-neutral-400">
                  {strongestGoalType.actual}/{strongestGoalType.goal} completed
                  • {strongestGoalType.progress}%
                </div>
              </>
            ) : (
              <span className="text-neutral-400">No goal type data yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

function getTrendIcon(trend) {
  if (trend === "improving") return TrendingUp;
  if (trend === "slowing") return TrendingDown;
  return Activity;
}

function getTrendLabel(trend) {
  if (trend === "improving") return "Improving";
  if (trend === "slowing") return "Slowing";
  return "Stable";
}

function getTrendDescription(trend) {
  if (trend === "improving") {
    return "Your weekly performance is getting stronger over time.";
  }

  if (trend === "slowing") {
    return "Your recent weeks are weaker than your earlier weeks.";
  }

  return "Your weekly performance is relatively balanced.";
}

export default function WeeklyMomentumCard({
  strongestWeek,
  weakestWeek,
  trend,
}) {
  const TrendIcon = getTrendIcon(trend);

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Weekly Momentum</div>
        <div className="text-xs text-neutral-500 mt-1">
          Track how your weekly rhythm changes across the month
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-800 px-4 py-3 mb-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
          <TrendIcon className="h-3.5 w-3.5" />
          Trend
        </div>
        <div className="mt-2 text-sm font-medium text-white">
          {getTrendLabel(trend)}
        </div>
        <div className="mt-1 text-xs leading-5 text-neutral-400">
          {getTrendDescription(trend)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Strongest Week
          </div>
          <div className="mt-2 text-sm text-white">
            {strongestWeek ? strongestWeek.label : "No data"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {strongestWeek
              ? `${strongestWeek.value}% completion`
              : "No weekly data yet"}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Weakest Week
          </div>
          <div className="mt-2 text-sm text-white">
            {weakestWeek ? weakestWeek.label : "No data"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {weakestWeek
              ? `${weakestWeek.value}% completion`
              : "No weekly data yet"}
          </div>
        </div>
      </div>
    </div>
  );
}

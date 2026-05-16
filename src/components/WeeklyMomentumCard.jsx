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

function WeekCard({ label, week, details }) {
  return (
    <div className="theme-stat-tile px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-sm text-white">{week}</div>
      <div className="mt-1 text-xs text-neutral-400">{details}</div>
    </div>
  );
}

export default function WeeklyMomentumCard({
  strongestWeek,
  weakestWeek,
  trend,
}) {
  const TrendIcon = getTrendIcon(trend);

  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title text-lg">Weekly Momentum</div>
        <div className="theme-section-subtitle text-xs">
          Track how your weekly rhythm changes across the month
        </div>
      </div>

      <div className="theme-summary-card mb-4 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          <TrendIcon className="h-3.5 w-3.5 text-neutral-400" />
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
        <WeekCard
          label="Strongest Week"
          week={strongestWeek ? strongestWeek.label : "No data"}
          details={
            strongestWeek
              ? `${strongestWeek.value}% completion`
              : "No weekly data yet"
          }
        />

        <WeekCard
          label="Weakest Week"
          week={weakestWeek ? weakestWeek.label : "No data"}
          details={
            weakestWeek
              ? `${weakestWeek.value}% completion`
              : "No weekly data yet"
          }
        />
      </div>
    </div>
  );
}

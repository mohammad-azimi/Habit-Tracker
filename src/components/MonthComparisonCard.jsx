import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Minus,
} from "lucide-react";

function DeltaBadge({ delta, suffix = "", digits = 0 }) {
  if (delta === null || Number.isNaN(delta)) {
    return (
      <div className="inline-flex items-center gap-1 rounded-xl bg-neutral-800 px-2 py-1 text-xs text-neutral-400">
        <Minus className="h-3.5 w-3.5" />
        No data
      </div>
    );
  }

  const rounded = Number(delta.toFixed(digits));
  const isNeutral = rounded === 0;
  const isPositive = rounded > 0;

  const toneClass = isNeutral
    ? "bg-neutral-800 text-neutral-300"
    : isPositive
      ? "bg-emerald-950/60 text-emerald-300"
      : "bg-red-950/60 text-red-300";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium ${toneClass}`}
    >
      {isNeutral ? (
        <Minus className="h-3.5 w-3.5" />
      ) : isPositive ? (
        <ArrowUpRight className="h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="h-3.5 w-3.5" />
      )}
      {isNeutral ? "0" : `${rounded > 0 ? "+" : ""}${rounded}${suffix}`}
    </div>
  );
}

function ComparisonMetric({
  label,
  currentValue,
  previousValue,
  delta,
  suffix = "",
  digits = 0,
}) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-semibold">
            {currentValue}
            {suffix}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Previous: {previousValue ?? "—"}
            {previousValue !== null ? suffix : ""}
          </div>
        </div>

        <DeltaBadge delta={delta} suffix={suffix} digits={digits} />
      </div>
    </div>
  );
}

export default function MonthComparisonCard({
  currentSummary,
  previousSummary,
  previousLabel,
  isLoading,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">Month Comparison</div>
          <div className="text-xs text-neutral-500 mt-1">
            Compare this month with {previousLabel}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 p-2">
          <CalendarRange className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
          Loading previous month data...
        </div>
      ) : !previousSummary ? (
        <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
          No saved data found for {previousLabel}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ComparisonMetric
            label="Completion Rate"
            currentValue={currentSummary.completionPercent}
            previousValue={previousSummary.completionPercent}
            delta={
              currentSummary.completionPercent -
              previousSummary.completionPercent
            }
            suffix="%"
          />

          <ComparisonMetric
            label="Completed"
            currentValue={currentSummary.totalCompleted}
            previousValue={previousSummary.totalCompleted}
            delta={
              currentSummary.totalCompleted - previousSummary.totalCompleted
            }
          />

          <ComparisonMetric
            label="Mood Average"
            currentValue={currentSummary.moodAverage}
            previousValue={previousSummary.moodAverage}
            delta={
              Number(currentSummary.moodAverage) -
              Number(previousSummary.moodAverage)
            }
            digits={1}
          />

          <ComparisonMetric
            label="Motivation Avg"
            currentValue={currentSummary.motivationAverage}
            previousValue={previousSummary.motivationAverage}
            delta={
              Number(currentSummary.motivationAverage) -
              Number(previousSummary.motivationAverage)
            }
            digits={1}
          />
        </div>
      )}
    </div>
  );
}

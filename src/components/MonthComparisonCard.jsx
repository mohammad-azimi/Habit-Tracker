import React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

function getDeltaMeta(delta) {
  if (delta === null || Number.isNaN(delta)) {
    return {
      toneClass: "bg-neutral-800 text-neutral-400",
      Icon: Minus,
      label: "No change data",
      direction: "none",
    };
  }

  if (delta > 0) {
    return {
      toneClass: "bg-emerald-950/60 text-emerald-300",
      Icon: ArrowUpRight,
      label: "Improved",
      direction: "up",
    };
  }

  if (delta < 0) {
    return {
      toneClass: "bg-red-950/60 text-red-300",
      Icon: ArrowDownRight,
      label: "Dropped",
      direction: "down",
    };
  }

  return {
    toneClass: "bg-neutral-800 text-neutral-300",
    Icon: Minus,
    label: "No change",
    direction: "flat",
  };
}

function formatDelta(delta, digits = 0, suffix = "") {
  if (delta === null || Number.isNaN(delta)) return "No data";
  const rounded = Number(delta.toFixed(digits));
  if (rounded === 0) return `0${suffix}`;
  return `${rounded > 0 ? "+" : ""}${rounded}${suffix}`;
}

function buildComparisonSentence(label, delta, suffix = "", digits = 0) {
  if (delta === null || Number.isNaN(delta)) {
    return `No previous data available for ${label.toLowerCase()}.`;
  }

  const rounded = Number(delta.toFixed(digits));

  if (rounded > 0) {
    return `${label} increased by ${rounded}${suffix} compared with last month.`;
  }

  if (rounded < 0) {
    return `${label} decreased by ${Math.abs(rounded)}${suffix} compared with last month.`;
  }

  return `${label} stayed the same as last month.`;
}

function DeltaBadge({ delta, suffix = "", digits = 0 }) {
  const meta = getDeltaMeta(delta);
  const Icon = meta.Icon;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium ${meta.toneClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {formatDelta(delta, digits, suffix)}
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
  const meta = getDeltaMeta(delta);
  const TrendIcon =
    meta.direction === "up"
      ? TrendingUp
      : meta.direction === "down"
        ? TrendingDown
        : Minus;

  const currentDisplay =
    currentValue === null || currentValue === undefined
      ? "—"
      : `${currentValue}${suffix}`;

  const previousDisplay =
    previousValue === null || previousValue === undefined
      ? "—"
      : `${previousValue}${suffix}`;

  return (
    <div className="rounded-2xl bg-neutral-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            {label}
          </div>

          <div className="mt-3 text-2xl font-semibold">{currentDisplay}</div>

          <div className="mt-1 text-xs text-neutral-500">
            Previous: {previousDisplay}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-xl bg-neutral-900 p-2">
            <TrendIcon className="h-4 w-4 text-neutral-300" />
          </div>
          <DeltaBadge delta={delta} suffix={suffix} digits={digits} />
        </div>
      </div>

      <div className="mt-3 text-xs text-neutral-400 leading-5">
        {buildComparisonSentence(label, delta, suffix, digits)}
      </div>
    </div>
  );
}

function ComparisonSummary({ deltas }) {
  const validDeltas = deltas.filter(
    (item) => item.delta !== null && !Number.isNaN(item.delta),
  );

  const improvedCount = validDeltas.filter((item) => item.delta > 0).length;
  const declinedCount = validDeltas.filter((item) => item.delta < 0).length;

  let title = "Mixed month-over-month movement";
  let description =
    "Some indicators improved while others moved down compared with last month.";
  let tone = "border-neutral-800 bg-neutral-800/80 text-neutral-300";

  if (validDeltas.length === 0) {
    title = "No previous comparison data";
    description =
      "Save more monthly history to unlock trend-based comparison insights.";
    tone = "border-neutral-800 bg-neutral-800/80 text-neutral-400";
  } else if (improvedCount === validDeltas.length) {
    title = "Everything improved";
    description =
      "All tracked comparison indicators moved upward versus the previous month.";
    tone = "border-emerald-900/40 bg-emerald-950/30 text-emerald-300";
  } else if (declinedCount === validDeltas.length) {
    title = "Overall decline detected";
    description =
      "All tracked comparison indicators moved downward versus the previous month.";
    tone = "border-red-900/40 bg-red-950/30 text-red-300";
  } else if (improvedCount > declinedCount) {
    title = "Mostly positive month-over-month";
    description =
      "More indicators improved than declined compared with the previous month.";
    tone = "border-emerald-900/30 bg-emerald-950/20 text-emerald-300";
  } else if (declinedCount > improvedCount) {
    title = "Mostly negative month-over-month";
    description =
      "More indicators declined than improved compared with the previous month.";
    tone = "border-red-900/30 bg-red-950/20 text-red-300";
  }

  return (
    <div className={`rounded-2xl border px-4 py-4 ${tone}`}>
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-1 text-xs leading-5 opacity-90">{description}</div>
    </div>
  );
}

export default function MonthComparisonCard({
  currentSummary,
  previousSummary,
  previousLabel,
  isLoading,
}) {
  const comparisonItems = previousSummary
    ? [
        {
          label: "Completion Rate",
          delta:
            currentSummary.completionPercent -
            previousSummary.completionPercent,
        },
        {
          label: "Completed",
          delta: currentSummary.totalCompleted - previousSummary.totalCompleted,
        },
        {
          label: "Mood Average",
          delta:
            Number(currentSummary.moodAverage) -
            Number(previousSummary.moodAverage),
        },
        {
          label: "Motivation Avg",
          delta:
            Number(currentSummary.motivationAverage) -
            Number(previousSummary.motivationAverage),
        },
      ]
    : [];

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
        <div className="space-y-3">
          <ComparisonSummary deltas={comparisonItems} />

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
        </div>
      )}
    </div>
  );
}

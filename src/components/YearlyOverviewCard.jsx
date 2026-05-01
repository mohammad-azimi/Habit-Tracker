import React from "react";
import {
  BarChart3,
  CalendarRange,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function StatBox({ label, value, sublabel }) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {sublabel ? (
        <div className="mt-1 text-xs text-neutral-500">{sublabel}</div>
      ) : null}
    </div>
  );
}

export default function YearlyOverviewCard({
  selectedYear,
  yearlyData,
  isLoading,
}) {
  const bestMonth =
    yearlyData.length > 0
      ? [...yearlyData].sort(
          (a, b) => b.completionPercent - a.completionPercent,
        )[0]
      : null;

  const worstMonth =
    yearlyData.length > 0
      ? [...yearlyData].sort(
          (a, b) => a.completionPercent - b.completionPercent,
        )[0]
      : null;

  const averageCompletion =
    yearlyData.length > 0
      ? Math.round(
          yearlyData.reduce((sum, item) => sum + item.completionPercent, 0) /
            yearlyData.length,
        )
      : 0;

  const averageMood =
    yearlyData.length > 0
      ? (
          yearlyData.reduce((sum, item) => sum + Number(item.moodAverage), 0) /
          yearlyData.length
        ).toFixed(1)
      : "0.0";

  const averageMotivation =
    yearlyData.length > 0
      ? (
          yearlyData.reduce(
            (sum, item) => sum + Number(item.motivationAverage),
            0,
          ) / yearlyData.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">Yearly Overview</div>
          <div className="text-xs text-neutral-500 mt-1">
            12-month performance summary for {selectedYear}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 p-2">
          <CalendarRange className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
          Loading yearly analytics...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <StatBox
              label="Average Completion"
              value={`${averageCompletion}%`}
              sublabel="Across available months"
            />
            <StatBox
              label="Average Mood"
              value={averageMood}
              sublabel="Year-wide mood average"
            />
            <StatBox
              label="Average Motivation"
              value={averageMotivation}
              sublabel="Year-wide motivation average"
            />
            <div className="rounded-2xl bg-neutral-800 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <TrendingUp className="h-4 w-4 text-neutral-400" />
                Best Month
              </div>
              <div className="text-lg font-semibold">
                {bestMonth
                  ? `${bestMonth.month} • ${bestMonth.completionPercent}%`
                  : "No data"}
              </div>

              <div className="flex items-center gap-2 text-sm text-neutral-300 pt-2">
                <TrendingDown className="h-4 w-4 text-neutral-400" />
                Worst Month
              </div>
              <div className="text-lg font-semibold">
                {worstMonth
                  ? `${worstMonth.month} • ${worstMonth.completionPercent}%`
                  : "No data"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-neutral-200">
                Monthly Completion Trend
              </div>
              <BarChart3 className="h-4 w-4 text-neutral-400" />
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <XAxis
                    dataKey="shortMonth"
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
                    dataKey="completionPercent"
                    radius={[8, 8, 0, 0]}
                    fill="#d4d4d4"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

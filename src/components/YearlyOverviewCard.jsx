import React from "react";
import {
  BarChart3,
  CalendarRange,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

function StatBox({ label, value, sublabel }) {
  return (
    <div className="theme-stat-tile p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {sublabel ? (
        <div className="mt-1 text-xs text-neutral-500">{sublabel}</div>
      ) : null}
    </div>
  );
}

function YearlyTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const row = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-white/5 bg-neutral-900/95 px-3 py-2 shadow-xl backdrop-blur">
      <div className="text-sm font-medium text-white">{label}</div>

      {row?.isEmpty ? (
        <div className="mt-1 text-xs text-neutral-400">No saved data</div>
      ) : (
        <div className="mt-2 space-y-1 text-xs text-neutral-300">
          <div>Completion: {row.completionPercent}%</div>
          <div>Mood: {row.moodAverage}</div>
          <div>Motivation: {row.motivationAverage}</div>
        </div>
      )}
    </div>
  );
}

function renderTrendDot(props) {
  const { cx, cy, payload } = props;

  if (payload?.isEmpty || cx == null || cy == null) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#fafafa"
      stroke="#171717"
      strokeWidth={2}
    />
  );
}

function buildChartDomain(activeMonths) {
  if (!activeMonths.length) return [0, 100];

  const values = activeMonths.map(
    (item) => Number(item.completionPercent) || 0,
  );
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [Math.max(0, min - 10), Math.min(100, max + 10)];
  }

  const spread = max - min;
  const padding = spread < 15 ? 8 : 5;

  return [Math.max(0, min - padding), Math.min(100, max + padding)];
}

export default function YearlyOverviewCard({
  selectedYear,
  yearlyData,
  isLoading,
}) {
  const activeMonths = yearlyData.filter((item) => !item.isEmpty);

  const bestMonth =
    activeMonths.length > 0
      ? [...activeMonths].sort(
          (a, b) => b.completionPercent - a.completionPercent,
        )[0]
      : null;

  const worstMonth =
    activeMonths.length > 0
      ? [...activeMonths].sort(
          (a, b) => a.completionPercent - b.completionPercent,
        )[0]
      : null;

  const averageCompletion =
    activeMonths.length > 0
      ? Math.round(
          activeMonths.reduce((sum, item) => sum + item.completionPercent, 0) /
            activeMonths.length,
        )
      : 0;

  const averageMood =
    activeMonths.length > 0
      ? (
          activeMonths.reduce(
            (sum, item) => sum + Number(item.moodAverage),
            0,
          ) / activeMonths.length
        ).toFixed(1)
      : "0.0";

  const averageMotivation =
    activeMonths.length > 0
      ? (
          activeMonths.reduce(
            (sum, item) => sum + Number(item.motivationAverage),
            0,
          ) / activeMonths.length
        ).toFixed(1)
      : "0.0";

  const chartData = yearlyData.map((item) => ({
    ...item,
    chartValue: item.isEmpty ? null : item.completionPercent,
  }));

  const yDomain = buildChartDomain(activeMonths);

  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="theme-section-title">Yearly Overview</div>
          <div className="theme-section-subtitle">
            12-month performance summary for {selectedYear}
          </div>
        </div>

        <div className="theme-card-muted p-2">
          <CalendarRange className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="theme-summary-card px-4 py-4 text-sm text-neutral-400">
          Loading yearly analytics...
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <StatBox
              label="Average Completion"
              value={`${averageCompletion}%`}
              sublabel="Across saved months"
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
            <div className="theme-summary-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-neutral-300">
                <TrendingUp className="h-4 w-4 text-neutral-400" />
                Best Month
              </div>
              <div className="text-lg font-semibold text-white">
                {bestMonth
                  ? `${bestMonth.month} • ${bestMonth.completionPercent}%`
                  : "No data"}
              </div>

              <div className="flex items-center gap-2 pt-2 text-sm text-neutral-300">
                <TrendingDown className="h-4 w-4 text-neutral-400" />
                Worst Month
              </div>
              <div className="text-lg font-semibold text-white">
                {worstMonth
                  ? `${worstMonth.month} • ${worstMonth.completionPercent}%`
                  : "No data"}
              </div>
            </div>
          </div>

          <div className="theme-chart-panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-neutral-200">
                  Monthly Completion Trend
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Saved months are highlighted. Empty months are muted.
                </div>
              </div>
              <div className="theme-card-muted p-2">
                <BarChart3 className="h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 16, right: 12, left: -8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="#26262a"
                    strokeDasharray="2 5"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="shortMonth"
                    tick={{ fill: "#a3a3a3", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={yDomain}
                    tick={{ fill: "#a3a3a3", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    allowDecimals={false}
                  />

                  <Tooltip content={<YearlyTooltip />} />

                  <Bar dataKey="chartValue" radius={[8, 8, 0, 0]} barSize={18}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isEmpty ? "#404040" : "#a78bfa"}
                        fillOpacity={entry.isEmpty ? 0.25 : 0.95}
                      />
                    ))}
                    <LabelList
                      dataKey="chartValue"
                      position="top"
                      formatter={(value) =>
                        value === null || value === undefined ? "" : `${value}%`
                      }
                      style={{ fill: "#d4d4d8", fontSize: 10, fontWeight: 500 }}
                    />
                  </Bar>

                  <Line
                    type="monotone"
                    dataKey="chartValue"
                    stroke="#fafafa"
                    strokeWidth={2.5}
                    dot={renderTrendDot}
                    activeDot={{
                      r: 5,
                      fill: "#fafafa",
                      stroke: "#171717",
                      strokeWidth: 2,
                    }}
                    connectNulls={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

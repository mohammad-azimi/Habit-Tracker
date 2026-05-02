import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function DailyPaceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 shadow-xl">
      <div className="text-sm font-medium text-white">Day {label}</div>
      <div className="mt-2 space-y-1 text-xs text-neutral-300">
        <div>Pace: {item?.value ?? 0}%</div>
        <div>Completed so far: {item?.completedSoFar ?? 0}</div>
        <div>Expected by now: {item?.expectedSoFar ?? 0}</div>
      </div>
      <div className="mt-2 text-[11px] text-neutral-500">
        Shows how on-track you are against your monthly flexible goals.
      </div>
    </div>
  );
}

function WeeklyPaceTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 shadow-xl">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="mt-2 space-y-1 text-xs text-neutral-300">
        <div>Pace: {item?.value ?? 0}%</div>
        <div>Completed in week: {item?.completedInWeek ?? 0}</div>
        <div>Expected in week: {item?.expectedInWeek ?? 0}</div>
      </div>
      <div className="mt-2 text-[11px] text-neutral-500">
        Compares the week’s completed check-offs with the expected share of your
        monthly flexible goals.
      </div>
    </div>
  );
}

export default function ProgressCharts({ dailyProgress, weeklyProgress }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Daily Goal Pace</div>
            <div className="mt-1 text-xs text-neutral-500">
              Progress pace against your flexible monthly goals
            </div>
          </div>
          <BarChart3 className="h-4 w-4 text-neutral-400" />
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyProgress}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#262626"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
                domain={[0, 100]}
              />
              <Tooltip content={<DailyPaceTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#d4d4d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">Weekly Goal Pace</div>
            <div className="mt-1 text-xs text-neutral-500">
              Weekly pace versus expected completion target
            </div>
          </div>
          <TrendingUp className="h-4 w-4 text-neutral-400" />
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyProgress}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#262626"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#a3a3a3", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
                domain={[0, 100]}
              />
              <Tooltip content={<WeeklyPaceTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#a3a3a3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

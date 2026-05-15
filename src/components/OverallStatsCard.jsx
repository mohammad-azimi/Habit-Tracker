import React, { useMemo } from "react";
import { CheckCircle2, CircleDashed, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

function StatMiniCard({ icon: Icon, label, value, accentClass }) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-800/80 px-4 py-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.9)] ${accentClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-900">
          <Icon className="h-5 w-5 text-neutral-300" />
        </div>

        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
    </div>
  );
}

function StatsTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="text-xs uppercase tracking-[0.18em] text-neutral-500">
        {item?.name}
      </div>
      <div className="mt-1 text-lg font-semibold text-white">{item?.value}</div>
    </div>
  );
}

export default function OverallStatsCard({
  totalGoal,
  totalCompleted,
  totalLeft,
  completionPercent,
}) {
  const chartData = useMemo(
    () => [
      { name: "Completed", value: Number(totalCompleted || 0) },
      { name: "Left", value: Number(totalLeft || 0) },
    ],
    [totalCompleted, totalLeft],
  );

  return (
    <div className="rounded-3xl border border-neutral-800 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_28%),linear-gradient(180deg,#171717_0%,#101010_100%)] p-5 shadow-2xl">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-white">Overall Stats</div>
          <div className="mt-1 text-xs text-neutral-500">
            Monthly habit completion overview
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatMiniCard
          icon={Target}
          label="Goal"
          value={totalGoal}
          accentClass="shadow-[0_0_0_1px_rgba(139,92,246,0.18)]"
        />
        <StatMiniCard
          icon={CheckCircle2}
          label="Completed"
          value={totalCompleted}
          accentClass=""
        />
        <StatMiniCard
          icon={CircleDashed}
          label="Left"
          value={totalLeft}
          accentClass=""
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative h-[270px] w-full max-w-[320px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient
                  id="overallStatsGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={74}
                outerRadius={104}
                startAngle={90}
                endAngle={-270}
                stroke="#0b0b0c"
                strokeWidth={3}
                paddingAngle={1.5}
              >
                <Cell fill="url(#overallStatsGradient)" />
                <Cell fill="#3a3a3d" />
              </Pie>

              <Tooltip content={<StatsTooltip />} cursor={false} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-semibold tracking-tight text-white">
              {completionPercent}%
            </div>
            <div className="mt-2 text-center text-sm leading-5 text-neutral-400">
              Monthly completion
              <br />
              rate
            </div>
          </div>
        </div>

        <div className="w-full max-w-[280px] space-y-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-800/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Progress Summary
            </div>
            <div className="mt-2 text-sm text-neutral-300">
              You have completed{" "}
              <span className="font-semibold text-white">{totalCompleted}</span>{" "}
              out of{" "}
              <span className="font-semibold text-white">{totalGoal}</span>{" "}
              planned habit actions this month.
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-800/80 px-4 py-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Remaining
            </div>
            <div className="mt-2 text-sm text-neutral-300">
              <span className="font-semibold text-white">{totalLeft}</span>{" "}
              actions are still left to reach your monthly target.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

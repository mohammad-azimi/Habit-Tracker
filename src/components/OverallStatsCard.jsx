import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function OverallStatsCard({
  totalGoal,
  totalCompleted,
  totalLeft,
  completionPercent,
}) {
  const chartData = [
    { name: "Completed", value: totalCompleted },
    { name: "Left", value: totalLeft },
  ];

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="font-semibold mb-4">Overall Stats</div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Goal
          </div>
          <div className="text-2xl font-semibold mt-2">{totalGoal}</div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Completed
          </div>
          <div className="text-2xl font-semibold mt-2">{totalCompleted}</div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">
            Left
          </div>
          <div className="text-2xl font-semibold mt-2">{totalLeft}</div>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              <Cell fill="#d4d4d4" />
              <Cell fill="#404040" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-center -mt-2">
        <div className="text-3xl font-semibold">{completionPercent}%</div>
        <div className="text-sm text-neutral-500 mt-1">
          Monthly completion rate
        </div>
      </div>
    </div>
  );
}

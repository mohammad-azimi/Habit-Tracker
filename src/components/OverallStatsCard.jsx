import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { CheckCircle2, CircleDashed, Target } from "lucide-react";

function StatMiniCard({ icon: Icon, label, value }) {
  return (
    <div className="theme-stat-tile px-4 py-3.5">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-white/90" />
      </div>

      <div className="text-[10px] tracking-[0.20em] text-neutral-500">
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold text-white">{value}</div>
    </div>
  );
}

function SummaryCard({ title, children }) {
  return (
    <div className="theme-summary-card p-4">
      <div className="text-[10px] tracking-[0.18em] text-neutral-500">
        {title}
      </div>
      <div className="mt-3 text-[15px] leading-7 text-neutral-200">
        {children}
      </div>
    </div>
  );
}

export default function OverallStatsCard({
  totalGoal,
  totalCompleted,
  totalLeft,
  completionPercent,
}) {
  const safeGoal = Number(totalGoal || 0);
  const safeCompleted = Number(totalCompleted || 0);
  const safeLeft = Math.max(Number(totalLeft || 0), 0);
  const safePercent = Number(completionPercent || 0);

  const chartData = [
    { name: "Completed", value: safeCompleted },
    { name: "Left", value: safeLeft > 0 ? safeLeft : 0.0001 },
  ];

  return (
    <div className="theme-card p-5">
      <div>
        <div className="theme-section-title text-[28px]">Overall Stats</div>
        <div className="theme-section-subtitle">
          Monthly habit completion overview
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <StatMiniCard icon={Target} label="GOAL" value={safeGoal} />
        <StatMiniCard
          icon={CheckCircle2}
          label="COMPLETED"
          value={safeCompleted}
        />
        <StatMiniCard icon={CircleDashed} label="LEFT" value={safeLeft} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="theme-chart-panel p-4">
          <div className="relative mx-auto aspect-square w-full max-w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={68}
                  outerRadius={104}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={4}
                  cornerRadius={10}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={2}
                >
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#3f3f46" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[52px] font-bold leading-none tracking-tight text-white">
                {safePercent}%
              </div>
              <div className="mt-2 max-w-[140px] text-[13px] leading-5 text-neutral-300">
                Monthly completion rate
              </div>
            </div>
          </div>
        </div>

        <SummaryCard title="PROGRESS SUMMARY">
          You have completed{" "}
          <span className="font-semibold text-white">{safeCompleted}</span> out
          of <span className="font-semibold text-white"> {safeGoal}</span>{" "}
          planned habit actions this month.
        </SummaryCard>

        <SummaryCard title="REMAINING">
          <span className="font-semibold text-white">{safeLeft}</span> actions
          are still left to reach your monthly target.
        </SummaryCard>
      </div>
    </div>
  );
}

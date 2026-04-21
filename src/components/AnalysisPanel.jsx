import { PieChart as PieChartIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import StatCard from "./StatCard";

export default function AnalysisPanel({
  totalGoal,
  totalCompleted,
  totalLeft,
  completionPercent,
  analysisRows,
}) {
  return (
    <section className="xl:col-span-3 space-y-4">
      <div className="grid grid-cols-3 xl:grid-cols-1 gap-4">
        <StatCard label="Goal" value={totalGoal} />
        <StatCard label="Completed" value={totalCompleted} />
        <StatCard label="Left" value={totalLeft} />
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Overall Stats</div>
          <PieChartIcon className="h-4 w-4 text-neutral-400" />
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: "Completed", value: totalCompleted },
                  { name: "Left", value: totalLeft },
                ]}
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
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

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="font-semibold mb-4">Analysis</div>

        <div className="space-y-3 max-h-[820px] overflow-y-auto pr-1">
          {analysisRows.map((row) => (
            <div key={row.id} className="rounded-2xl bg-neutral-800 p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="text-sm font-medium">{row.name}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Goal {row.goal} • Actual {row.actual} • Left {row.left}
                  </div>
                </div>
                <div className="text-sm font-semibold">{row.progress}%</div>
              </div>

              <div className="h-2 w-full rounded-full bg-neutral-700 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-neutral-200"
                  style={{ width: `${row.progress}%` }}
                />
              </div>

              <div className="grid grid-cols-5 gap-2 text-[11px]">
                {row.weekly.map((week) => (
                  <div
                    key={week.label}
                    className="rounded-xl bg-neutral-900 px-2 py-2 text-center"
                  >
                    <div className="text-neutral-500">{week.label}</div>
                    <div className="mt-1 font-medium">{week.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

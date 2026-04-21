import { BarChart3, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ProgressCharts({ dailyProgress, weeklyProgress }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Daily Progress</div>
          <BarChart3 className="h-4 w-4 text-neutral-400" />
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyProgress}>
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
              />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#d4d4d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">Weekly Progress</div>
          <TrendingUp className="h-4 w-4 text-neutral-400" />
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyProgress}>
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
              />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#a3a3a3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

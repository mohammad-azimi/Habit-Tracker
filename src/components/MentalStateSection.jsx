import { FileText } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default function MentalStateSection({
  daysInMonth,
  mood,
  motivation,
  mentalStateData,
  onSetMentalMetric,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold">Mental State</div>
        <FileText className="h-4 w-4 text-neutral-400" />
      </div>

      <div className="overflow-x-auto mb-5">
        <div className="min-w-[900px] space-y-2">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div></div>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <div key={i} className="text-[10px] text-center text-neutral-500">
                {i + 1}
              </div>
            ))}
          </div>

          <div
            className="grid gap-1 items-center"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
              Mood
            </div>
            {mood.map((value, dayIndex) => (
              <input
                key={dayIndex}
                type="number"
                min="1"
                max="10"
                value={value}
                onChange={(e) =>
                  onSetMentalMetric("mood", dayIndex, e.target.value)
                }
                className="h-10 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm outline-none"
              />
            ))}
          </div>

          <div
            className="grid gap-1 items-center"
            style={{
              gridTemplateColumns: `120px repeat(${daysInMonth}, minmax(42px, 1fr))`,
            }}
          >
            <div className="rounded-xl bg-neutral-800 px-3 py-2 text-sm">
              Motivation
            </div>
            {motivation.map((value, dayIndex) => (
              <input
                key={dayIndex}
                type="number"
                min="1"
                max="10"
                value={value}
                onChange={(e) =>
                  onSetMentalMetric("motivation", dayIndex, e.target.value)
                }
                className="h-10 rounded-xl bg-neutral-950 border border-neutral-800 text-center text-sm outline-none"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-neutral-500">Mood Average</div>
          <div className="text-xl font-semibold mt-1">
            {average(mood).toFixed(1)}
          </div>
        </div>
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="text-neutral-500">Motivation Average</div>
          <div className="text-xl font-semibold mt-1">
            {average(motivation).toFixed(1)}
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mentalStateData}>
            <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 10]}
              tick={{ fill: "#a3a3a3", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="Mood"
              stroke="#e5e5e5"
              strokeWidth={3}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Motivation"
              stroke="#737373"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

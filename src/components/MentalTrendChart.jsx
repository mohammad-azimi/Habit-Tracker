import React, { useMemo } from "react";
import { Brain, Zap } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function average(values) {
  if (!values?.length) return 0;
  return (
    values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
  );
}

function AvgCard({ icon: Icon, label, value, iconClass, valueClass }) {
  return (
    <div className="theme-stat-tile p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/35 ring-1 ring-white/10">
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>

        <div>
          <div className="text-sm text-neutral-400">{label}</div>
          <div className={`mt-1 text-[24px] font-semibold ${valueClass}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function MentalTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const moodItem = payload.find((item) => item.dataKey === "Mood");
  const motivationItem = payload.find((item) => item.dataKey === "Motivation");

  return (
    <div className="rounded-2xl border border-white/5 bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur">
      <div className="text-[11px] tracking-[0.18em] text-neutral-500">
        DAY {label}
      </div>

      <div className="mt-2 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-200">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
          Mood:
          <span className="font-semibold text-white">{moodItem?.value}</span>
        </div>

        <div className="flex items-center gap-2 text-neutral-200">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
          Motivation:
          <span className="font-semibold text-white">
            {motivationItem?.value}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MentalTrendChart({
  mood,
  motivation,
  mentalStateData,
}) {
  const moodAverage = useMemo(() => average(mood).toFixed(1), [mood]);
  const motivationAverage = useMemo(
    () => average(motivation).toFixed(1),
    [motivation],
  );

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AvgCard
          icon={Brain}
          label="Mood Average"
          value={moodAverage}
          iconClass="text-violet-400"
          valueClass="text-violet-300"
        />

        <AvgCard
          icon={Zap}
          label="Motivation Average"
          value={motivationAverage}
          iconClass="text-sky-400"
          valueClass="text-sky-300"
        />
      </div>

      <div className="theme-chart-panel p-4">
        <div className="mb-4">
          <div className="theme-section-title text-lg">Mental Trend</div>
          <div className="theme-section-subtitle text-sm">
            Mood and motivation across the month
          </div>
        </div>

        <div className="h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mentalStateData}
              margin={{ top: 16, right: 14, left: -18, bottom: 6 }}
            >
              <defs>
                <linearGradient
                  id="moodLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>

                <linearGradient
                  id="motivationLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#26262a"
                strokeDasharray="2 5"
                vertical={true}
                horizontal={true}
              />

              <XAxis
                dataKey="day"
                stroke="#737373"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                interval="preserveStartEnd"
                minTickGap={18}
              />

              <YAxis
                domain={[1, 10]}
                ticks={[1, 4, 7, 10]}
                stroke="#737373"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />

              <Tooltip
                content={<MentalTooltip />}
                cursor={{ stroke: "#52525b", strokeDasharray: "4 4" }}
              />

              <Line
                type="monotone"
                dataKey="Mood"
                stroke="url(#moodLineGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: "#18181b",
                  strokeWidth: 2,
                  fill: "#a855f7",
                }}
              />

              <Line
                type="monotone"
                dataKey="Motivation"
                stroke="url(#motivationLineGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  stroke: "#18181b",
                  strokeWidth: 2,
                  fill: "#60a5fa",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-5 border-t border-white/5 pt-3 text-xs text-neutral-400">
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            Mood
          </div>

          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            Motivation
          </div>
        </div>
      </div>
    </div>
  );
}

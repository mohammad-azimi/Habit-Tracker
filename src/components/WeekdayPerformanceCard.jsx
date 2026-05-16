import React from "react";
import { CalendarRange } from "lucide-react";

function SummaryCard({ label, day, details }) {
  return (
    <div className="theme-stat-tile px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        <CalendarRange className="h-3.5 w-3.5 text-neutral-400" />
        {label}
      </div>
      <div className="mt-2 text-sm text-white">{day}</div>
      <div className="mt-1 text-xs text-neutral-400">{details}</div>
    </div>
  );
}

export default function WeekdayPerformanceCard({
  rows,
  bestWeekday,
  weakestWeekday,
}) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title text-lg">Weekday Performance</div>
        <div className="theme-section-subtitle text-xs">
          See which weekday works best for your habits
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <SummaryCard
          label="Best Day"
          day={bestWeekday ? bestWeekday.label : "No data"}
          details={
            bestWeekday
              ? `${bestWeekday.completed}/${bestWeekday.total} completed • ${bestWeekday.percent}%`
              : "No weekday data yet"
          }
        />

        <SummaryCard
          label="Weakest Day"
          day={weakestWeekday ? weakestWeekday.label : "No data"}
          details={
            weakestWeekday
              ? `${weakestWeekday.completed}/${weakestWeekday.total} completed • ${weakestWeekday.percent}%`
              : "No weekday data yet"
          }
        />
      </div>

      <div className="space-y-2">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div key={row.label} className="theme-summary-card px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white">{row.label}</div>
                <div className="text-xs font-medium text-neutral-300">
                  {row.percent}%
                </div>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-700">
                <div
                  className="h-full rounded-full bg-violet-300"
                  style={{ width: `${row.percent}%` }}
                />
              </div>

              <div className="mt-2 text-[11px] text-neutral-500">
                {row.completed}/{row.total} completed
              </div>
            </div>
          ))
        ) : (
          <div className="theme-summary-card px-4 py-4 text-sm text-neutral-400">
            No weekday data yet.
          </div>
        )}
      </div>
    </div>
  );
}

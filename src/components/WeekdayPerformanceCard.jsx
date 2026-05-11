import React from "react";
import { CalendarRange } from "lucide-react";

export default function WeekdayPerformanceCard({
  rows,
  bestWeekday,
  weakestWeekday,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Weekday Performance</div>
        <div className="text-xs text-neutral-500 mt-1">
          See which weekday works best for your habits
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <CalendarRange className="h-3.5 w-3.5" />
            Best Day
          </div>
          <div className="mt-2 text-sm text-white">
            {bestWeekday ? bestWeekday.label : "No data"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {bestWeekday
              ? `${bestWeekday.completed}/${bestWeekday.total} completed • ${bestWeekday.percent}%`
              : "No weekday data yet"}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-neutral-500">
            <CalendarRange className="h-3.5 w-3.5" />
            Weakest Day
          </div>
          <div className="mt-2 text-sm text-white">
            {weakestWeekday ? weakestWeekday.label : "No data"}
          </div>
          <div className="mt-1 text-xs text-neutral-400">
            {weakestWeekday
              ? `${weakestWeekday.completed}/${weakestWeekday.total} completed • ${weakestWeekday.percent}%`
              : "No weekday data yet"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div
              key={row.label}
              className="rounded-2xl bg-neutral-800 px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-white">{row.label}</div>
                <div className="text-xs font-medium text-neutral-300">
                  {row.percent}%
                </div>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-700">
                <div
                  className="h-full rounded-full bg-neutral-200"
                  style={{ width: `${row.percent}%` }}
                />
              </div>

              <div className="mt-2 text-[11px] text-neutral-500">
                {row.completed}/{row.total} completed
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
            No weekday data yet.
          </div>
        )}
      </div>
    </div>
  );
}

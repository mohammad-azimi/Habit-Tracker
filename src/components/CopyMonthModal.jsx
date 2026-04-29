import React from "react";
import { CalendarDays, Copy, X } from "lucide-react";

export default function CopyMonthModal({
  isOpen,
  currentYear,
  currentMonthIndex,
  targetYear,
  targetMonthIndex,
  yearOptions,
  monthOptions,
  isSubmitting,
  onChangeTargetYear,
  onChangeTargetMonthIndex,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const isSameMonth =
    Number(currentYear) === Number(targetYear) &&
    currentMonthIndex === targetMonthIndex;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-neutral-800 p-2">
              <CalendarDays className="h-5 w-5 text-neutral-300" />
            </div>

            <div>
              <div className="text-lg font-semibold">
                Copy to Selected Month
              </div>
              <div className="text-sm text-neutral-400 mt-1">
                Copy this month’s habit setup into another month
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-2">
              Target Year
            </label>
            <select
              value={targetYear}
              onChange={(e) => onChangeTargetYear(e.target.value)}
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-2">
              Target Month
            </label>
            <select
              value={targetMonthIndex}
              onChange={(e) => onChangeTargetMonthIndex(Number(e.target.value))}
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
            >
              {monthOptions.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {isSameMonth ? (
            <div className="rounded-2xl border border-amber-800 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
              Target month cannot be the same as the current month.
            </div>
          ) : (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-800 px-4 py-3 text-sm text-neutral-300">
              This will copy habits, order, and archive state. Daily progress,
              mood, motivation, and notes will be reset.
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting || isSameMonth}
            className="flex-1 rounded-2xl bg-white text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Copy className="h-4 w-4" />
            {isSubmitting ? "Copying..." : "Copy Month"}
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="theme-card w-full max-w-md p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="theme-card-muted p-2">
              <CalendarDays className="h-5 w-5 text-neutral-300" />
            </div>

            <div>
              <div className="text-lg font-semibold text-white">
                Copy to Selected Month
              </div>
              <div className="mt-1 text-sm text-neutral-400">
                Copy this month’s habit setup into another month
              </div>
            </div>
          </div>

          <button onClick={onClose} className="theme-button-secondary p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Target Year
            </label>
            <select
              value={targetYear}
              onChange={(e) => onChangeTargetYear(e.target.value)}
              className="theme-select px-4 py-3"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Target Month
            </label>
            <select
              value={targetMonthIndex}
              onChange={(e) => onChangeTargetMonthIndex(Number(e.target.value))}
              className="theme-select px-4 py-3"
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
            <div className="theme-summary-card px-4 py-3 text-sm text-neutral-300">
              This will copy habits, order, and archive state. Daily progress,
              mood, motivation, and notes will be reset.
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="theme-button-secondary flex-1">
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting || isSameMonth}
            className="theme-button-primary flex-1 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            <Copy className="h-4 w-4" />
            {isSubmitting ? "Copying..." : "Copy Month"}
          </button>
        </div>
      </div>
    </div>
  );
}

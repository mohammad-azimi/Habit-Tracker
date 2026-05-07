import React from "react";
import { X } from "lucide-react";

export default function ActiveHabitFilters({ chips }) {
  if (!chips?.length) return null;

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-300">
            Active Filters
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            Click × to remove any individual filter
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700"
            >
              <span>{chip.label}</span>
              <X className="h-4 w-4 text-neutral-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { X, SlidersHorizontal } from "lucide-react";

export default function ActiveHabitFilters({ chips }) {
  if (!chips?.length) return null;

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-4 py-3 shadow-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-neutral-300 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
          <span>Active Filters</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-700 transition"
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

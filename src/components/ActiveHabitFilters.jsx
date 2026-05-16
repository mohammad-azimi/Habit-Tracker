import React from "react";
import { X, SlidersHorizontal } from "lucide-react";

export default function ActiveHabitFilters({ chips }) {
  if (!chips?.length) return null;

  return (
    <div className="theme-card px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="shrink-0 flex items-center gap-2 text-sm font-medium text-neutral-300">
          <SlidersHorizontal className="h-4 w-4 text-neutral-400" />
          <span>Active Filters</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.onRemove}
              className="theme-button-secondary px-3 py-2 text-sm text-neutral-200"
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

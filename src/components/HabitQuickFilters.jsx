import React from "react";

const quickFilters = [
  { key: "all", label: "All" },
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "completed", label: "Completed" },
  { key: "needs-focus", label: "Needs Focus" },
];

export default function HabitQuickFilters({ activeFilter, onApplyFilter }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
      <div className="mb-3">
        <div className="text-sm font-semibold text-neutral-300">
          Quick Filters
        </div>
        <div className="text-xs text-neutral-500 mt-1">
          One-click shortcuts for common habit views
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((item) => {
          const isActive = activeFilter === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onApplyFilter(item.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

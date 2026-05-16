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
    <div className="theme-card p-4">
      <div className="mb-3">
        <div className="theme-section-title text-lg">Quick Filters</div>
        <div className="theme-section-subtitle text-xs">
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
              className={
                isActive
                  ? "theme-button-primary px-4 py-2 text-sm"
                  : "theme-button-secondary px-4 py-2 text-sm text-neutral-300"
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

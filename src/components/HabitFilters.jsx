import React from "react";
import { Filter, Search, Target, RotateCcw } from "lucide-react";

export default function HabitFilters({
  searchTerm,
  onChangeSearchTerm,
  filterMode,
  onChangeFilterMode,
  goalTypeFilter,
  onChangeGoalTypeFilter,
  filteredCount,
  totalCount,
  onResetFilters,
}) {
  const fieldClass =
    "w-full rounded-2xl border border-neutral-700 bg-neutral-800 text-sm text-white outline-none transition duration-150 hover:border-neutral-600 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/15";

  return (
    <div className="theme-card p-4 shadow-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="font-semibold text-white">
            Search &amp; Filter Habits
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Quickly find habits by name, status, or goal type
          </div>
        </div>

        <div className="theme-pill w-fit px-3 py-2 text-xs text-neutral-300">
          Showing {filteredCount} of {totalCount} habits
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto]">
        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={searchTerm}
            onChange={(e) => onChangeSearchTerm(e.target.value)}
            placeholder="Search habits..."
            className={`${fieldClass} py-2.5 pl-10 pr-4`}
          />
        </div>

        <div className="relative min-w-0">
          <Filter className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <select
            value={filterMode}
            onChange={(e) => onChangeFilterMode(e.target.value)}
            className={`${fieldClass} appearance-none py-2.5 pl-10 pr-8`}
          >
            <option value="all">All habits</option>
            <option value="completed">Completed only</option>
            <option value="in-progress">In progress only</option>
            <option value="not-started">Not started only</option>
          </select>
        </div>

        <div className="relative min-w-0">
          <Target className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <select
            value={goalTypeFilter}
            onChange={(e) => onChangeGoalTypeFilter(e.target.value)}
            className={`${fieldClass} appearance-none py-2.5 pl-10 pr-8`}
          >
            <option value="all">All goal types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button
          onClick={onResetFilters}
          className="theme-button-secondary px-4 py-2.5 text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}

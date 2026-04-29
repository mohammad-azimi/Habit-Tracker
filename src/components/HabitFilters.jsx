import React from "react";
import { Filter, Search } from "lucide-react";

export default function HabitFilters({
  searchTerm,
  onChangeSearchTerm,
  filterMode,
  onChangeFilterMode,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold">Search & Filter Habits</div>
          <div className="text-xs text-neutral-500 mt-1">
            Quickly find habits by name or status
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative">
            <Search className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => onChangeSearchTerm(e.target.value)}
              placeholder="Search habits..."
              className="w-full md:w-64 rounded-2xl bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div className="relative">
            <Filter className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={filterMode}
              onChange={(e) => onChangeFilterMode(e.target.value)}
              className="w-full md:w-48 rounded-2xl bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-2.5 text-sm outline-none appearance-none"
            >
              <option value="all">All habits</option>
              <option value="completed">Completed only</option>
              <option value="in-progress">In progress only</option>
              <option value="not-started">Not started only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

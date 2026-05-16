import React from "react";
import { ArchiveRestore } from "lucide-react";

export default function ArchivedHabitsPanel({
  archivedHabits,
  onRestoreHabit,
}) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title text-lg">Archived Habits</div>
        <div className="theme-section-subtitle text-xs">
          Hidden habits can be restored anytime
        </div>
      </div>

      {archivedHabits.length === 0 ? (
        <div className="theme-summary-card px-4 py-4 text-sm text-neutral-400">
          No archived habits yet.
        </div>
      ) : (
        <div className="space-y-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="theme-summary-card px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  {habit.name} <span className="ml-1">{habit.icon}</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Progress {habit.progress}% • Best streak{" "}
                  {habit.bestStreak ?? 0}d
                </div>
              </div>

              <button
                onClick={() => onRestoreHabit(habit.id)}
                className="theme-button-primary shrink-0 px-3 py-2 text-xs font-medium"
              >
                <ArchiveRestore className="h-4 w-4" />
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";
import { ArchiveRestore, ArchiveX } from "lucide-react";

export default function ArchivedHabitsPanel({
  archivedHabits,
  onRestoreHabit,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Archived Habits</div>
        <div className="text-xs text-neutral-500 mt-1">
          Hidden habits can be restored anytime
        </div>
      </div>

      {archivedHabits.length === 0 ? (
        <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
          No archived habits yet.
        </div>
      ) : (
        <div className="space-y-3">
          {archivedHabits.map((habit) => (
            <div
              key={habit.id}
              className="rounded-2xl bg-neutral-800 px-4 py-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {habit.name} <span className="ml-1">{habit.icon}</span>
                </div>
                <div className="text-xs text-neutral-500 mt-1">
                  Progress {habit.progress}% • Best streak{" "}
                  {habit.bestStreak ?? 0}d
                </div>
              </div>

              <button
                onClick={() => onRestoreHabit(habit.id)}
                className="rounded-2xl bg-white text-black hover:bg-neutral-200 px-3 py-2 text-xs font-medium inline-flex items-center gap-2 shrink-0"
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

import {
  getHabitStatus,
  getHabitStatusBadgeClasses,
  getHabitProgressTextClasses,
} from "../lib/habitStatus";

function getSortModeLabel(sortMode) {
  switch (sortMode) {
    case "current-streak-desc":
      return "Sorted by current streak";
    case "best-streak-desc":
      return "Sorted by best streak";
    case "completed-desc":
      return "Sorted by completed count";
    case "name-asc":
      return "Sorted alphabetically";
    case "progress-desc":
    default:
      return "Sorted by progress";
  }
}

export default function TopHabitsCard({ habits, sortMode }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="text-sm font-semibold text-neutral-300 mb-1">
        Top Habits
      </div>
      <div className="text-xs text-neutral-500 mb-4">
        {getSortModeLabel(sortMode)}
      </div>

      <div className="space-y-3">
        {habits.slice(0, 10).map((habit, idx) => {
          const status = getHabitStatus(habit.progress);

          return (
            <div
              key={habit.id}
              className="rounded-2xl bg-neutral-800 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="text-neutral-500 w-5 shrink-0">{idx + 1}</div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white font-medium">
                      {habit.name}
                      <span className="ml-1">{habit.icon}</span>
                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getHabitStatusBadgeClasses(
                          habit.progress,
                        )}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`text-sm font-semibold shrink-0 ${getHabitProgressTextClasses(
                    habit.progress,
                  )}`}
                >
                  {habit.progress}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

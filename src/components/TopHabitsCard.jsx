import {
  formatGoalTypeShortLabel,
  formatGoalTypeLongLabel,
  getGoalTypeBadgeClasses,
} from "../lib/goalType";
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
    <div className="theme-card p-5">
      <div className="theme-section-title text-lg">Top Habits</div>
      <div className="theme-section-subtitle text-xs mb-4">
        {getSortModeLabel(sortMode)}
      </div>

      <div className="space-y-3">
        {habits.slice(0, 10).map((habit, idx) => {
          const status = getHabitStatus(habit.progress);

          return (
            <div key={habit.id} className="theme-summary-card px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-black/30 text-sm font-semibold text-neutral-400 ring-1 ring-white/5">
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">
                      {habit.name}
                      <span className="ml-1">{habit.icon}</span>
                    </div>

                    <div className="mt-1 text-[11px] text-neutral-400">
                      {formatGoalTypeLongLabel(
                        habit.targetType,
                        habit.targetValue,
                      )}{" "}
                      • {habit.actual}/{habit.goal}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getGoalTypeBadgeClasses(
                          habit.targetType,
                        )}`}
                      >
                        {formatGoalTypeShortLabel(
                          habit.targetType,
                          habit.targetValue,
                        )}
                      </span>

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
                  className={`shrink-0 text-sm font-semibold ${getHabitProgressTextClasses(
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

function formatGoalTypeLabel(targetType, targetValue) {
  const safeType = targetType || "daily";
  const safeValue = Math.max(1, Number(targetValue || 1));

  if (safeType === "daily") {
    return `${safeValue}x/day`;
  }

  if (safeType === "weekly") {
    return `${safeValue}x/week`;
  }

  if (safeType === "monthly") {
    return `${safeValue}x/month`;
  }

  return `${safeValue}x/day`;
}

export default function TopHabitsCard({ habits }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="text-sm font-semibold text-neutral-300 mb-4">
        Top Habits
      </div>

      <div className="space-y-3">
        {habits.slice(0, 10).map((habit, idx) => (
          <div key={habit.id} className="rounded-2xl bg-neutral-800 px-3 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="text-neutral-500 w-5 shrink-0">{idx + 1}</div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-white">
                    {habit.name} <span className="ml-1">{habit.icon}</span>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center rounded-full bg-neutral-900 px-2.5 py-1 border border-neutral-700 text-neutral-300">
                      {formatGoalTypeLabel(habit.targetType, habit.targetValue)}
                    </span>

                    <span>
                      {habit.actual}/{habit.goal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm font-semibold text-neutral-300 shrink-0">
                {habit.progress}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

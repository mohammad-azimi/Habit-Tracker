import { Trash2 } from "lucide-react";

export default function HabitGrid({
  habits,
  daysInMonth,
  weekdayLabels,
  onToggleHabitDay,
  onDeleteHabit,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl overflow-x-auto">
      <div className="min-w-[980px] space-y-2">
        <div
          className="grid gap-1 items-center"
          style={{
            gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
          }}
        >
          <div className="text-sm font-semibold text-neutral-300 px-2">
            My Habits
          </div>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="text-[10px] text-center text-neutral-500">
              {i + 1}
            </div>
          ))}
        </div>

        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
          }}
        >
          <div></div>
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="text-[10px] text-center text-neutral-600">
              {weekdayLabels[i % 7]}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="grid gap-1 items-center"
              style={{
                gridTemplateColumns: `300px repeat(${daysInMonth}, minmax(28px, 1fr))`,
              }}
            >
              <div className="px-3 py-2 rounded-xl bg-neutral-800 text-sm text-neutral-200 flex items-center justify-between gap-3">
                <div className="truncate">
                  {habit.name} <span className="ml-1">{habit.icon}</span>
                </div>

                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="text-neutral-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {habit.checks.map((checked, dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => onToggleHabitDay(habit.id, dayIndex)}
                  className={`h-7 w-7 rounded-md border flex items-center justify-center text-[11px] transition ${
                    checked
                      ? "bg-neutral-300 text-black border-neutral-300"
                      : "bg-neutral-950 text-neutral-700 border-neutral-800 hover:border-neutral-600"
                  }`}
                >
                  {checked ? "✓" : ""}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

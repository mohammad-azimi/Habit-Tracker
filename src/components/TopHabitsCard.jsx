export default function TopHabitsCard({ habits }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="text-sm font-semibold text-neutral-300 mb-4">
        Top Habits
      </div>
      <div className="space-y-3">
        {habits.slice(0, 10).map((habit, idx) => (
          <div
            key={habit.id}
            className="flex items-center justify-between text-sm gap-3"
          >
            <div className="text-neutral-500 w-5">{idx + 1}</div>
            <div className="flex-1 truncate">{habit.name}</div>
            <div className="text-neutral-400">{habit.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

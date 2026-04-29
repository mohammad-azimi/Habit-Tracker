import React from "react";
import {
  ArchiveX,
  ArrowDown,
  ArrowUp,
  Flame,
  GripVertical,
  Pencil,
  Trash2,
  Trophy,
} from "lucide-react";

export default function HabitGrid({
  habits,
  daysInMonth,
  weekdayLabels,
  draggedHabitId,
  onToggleHabitDay,
  onRequestDeleteHabit,
  onStartEditHabit,
  onMoveHabitUp,
  onMoveHabitDown,
  onRequestArchiveHabit,
  onHabitDragStart,
  onHabitDragOver,
  onHabitDrop,
  onHabitDragEnd,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl overflow-x-auto">
      <div className="min-w-[450px] sm:min-w-[1080px]">
        <div className="grid grid-cols-[450px_repeat(31,minmax(26px,1fr))] gap-1 items-center mb-2">
          <div className="text-sm font-semibold text-neutral-300 px-2">
            My Habits
          </div>

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="text-[10px] text-center text-neutral-500">
              {i + 1}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[450px_repeat(31,minmax(26px,1fr))] gap-1 mb-1">
          <div></div>

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="text-[10px] text-center text-neutral-600">
              {weekdayLabels[i % 7]}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {habits.map((habit, habitIndex) => (
            <div
              key={habit.id}
              className="grid grid-cols-[450px_repeat(31,minmax(26px,1fr))] gap-1 items-center"
            >
              <div
                draggable
                onDragStart={() => onHabitDragStart(habit.id)}
                onDragOver={(event) => onHabitDragOver(event)}
                onDrop={() => onHabitDrop(habit.id)}
                onDragEnd={onHabitDragEnd}
                className={`px-2 py-2 rounded-xl text-sm text-neutral-200 flex items-center justify-between gap-2 transition ${
                  draggedHabitId === habit.id
                    ? "bg-neutral-700 opacity-60"
                    : "bg-neutral-800"
                }`}
              >
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="mt-1 text-neutral-500 cursor-grab">
                    <GripVertical className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">
                      {habit.name} <span className="ml-1">{habit.icon}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-2 py-1 text-[11px] text-neutral-300">
                        <Flame className="h-3.5 w-3.5 text-neutral-400" />
                        Current: {habit.currentStreak ?? 0}d
                      </div>

                      <div className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-2 py-1 text-[11px] text-neutral-300">
                        <Trophy className="h-3.5 w-3.5 text-neutral-400" />
                        Best: {habit.bestStreak ?? 0}d
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onMoveHabitUp(habit.id)}
                    disabled={habitIndex === 0}
                    className="rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed p-1.5"
                    title="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onMoveHabitDown(habit.id)}
                    disabled={habitIndex === habits.length - 1}
                    className="rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed p-1.5"
                    title="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onStartEditHabit(habit)}
                    className="rounded-lg bg-neutral-700 hover:bg-neutral-600 p-1.5"
                    title="Edit habit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onRequestArchiveHabit(habit)}
                    className="rounded-lg bg-neutral-700 hover:bg-amber-700 p-1.5"
                    title="Archive habit"
                  >
                    <ArchiveX className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => onRequestDeleteHabit(habit)}
                    className="rounded-lg bg-neutral-700 hover:bg-red-700 p-1.5"
                    title="Delete habit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {habit.checks.map((checked, idx) => (
                <button
                  key={idx}
                  onClick={() => onToggleHabitDay(habit.id, idx)}
                  className={`h-6 w-6 rounded-md border flex items-center justify-center text-[11px] ${
                    checked
                      ? "bg-neutral-300 text-black border-neutral-300"
                      : "bg-neutral-950 text-neutral-700 border-neutral-800"
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

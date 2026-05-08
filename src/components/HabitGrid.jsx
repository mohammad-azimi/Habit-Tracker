import React, { useEffect, useRef } from "react";
import {
  ArchiveX,
  ArrowDown,
  ArrowUp,
  Flame,
  GripVertical,
  Pencil,
  Target,
  Trash2,
  Trophy,
} from "lucide-react";
import {
  formatGoalTypeShortLabel,
  getGoalTypeBadgeClasses,
} from "../lib/goalType";
import {
  getHabitStatus,
  getHabitStatusBadgeClasses,
  getHabitProgressTextClasses,
} from "../lib/habitStatus";

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
  todayIndex,
  isManualSort,
}) {
  const scrollContainerRef = useRef(null);
  const todayCellRef = useRef(null);
  const stickyColumnRef = useRef(null);
  const canReorder = isManualSort === true;

  useEffect(() => {
    if (todayIndex === null || todayIndex < 0) return;
    if (!scrollContainerRef.current) return;
    if (!todayCellRef.current) return;
    if (!stickyColumnRef.current) return;

    const container = scrollContainerRef.current;
    const target = todayCellRef.current;
    const stickyColumn = stickyColumnRef.current;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const stickyRect = stickyColumn.getBoundingClientRect();

    const currentScrollLeft = container.scrollLeft;
    const targetLeftInsideContainer =
      targetRect.left - containerRect.left + currentScrollLeft;

    const stickyWidth = stickyRect.width;
    const safeOffset = stickyWidth + 24;

    const nextScrollLeft = targetLeftInsideContainer - safeOffset;

    container.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior: "smooth",
    });
  }, [todayIndex, daysInMonth, habits.length]);

  return (
    <div
      ref={scrollContainerRef}
      className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl overflow-x-auto"
    >
      <div className="min-w-[520px] sm:min-w-[1150px]">
        <div className="grid grid-cols-[520px_repeat(31,minmax(26px,1fr))] gap-1 items-center mb-2">
          <div
            ref={stickyColumnRef}
            className="sticky left-0 z-30 bg-neutral-900 px-2"
          >
            <div className="text-sm font-semibold text-neutral-300">
              My Habits
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              {isManualSort
                ? "Manual reorder is enabled"
                : "Switch sort mode to Manual Order to reorder habits"}
            </div>
          </div>

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div
              key={i}
              ref={i === todayIndex ? todayCellRef : null}
              className={`text-[10px] text-center rounded-md py-1 ${
                i === todayIndex
                  ? "bg-white text-black font-semibold"
                  : "text-neutral-500"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[520px_repeat(31,minmax(26px,1fr))] gap-1 mb-1">
          <div className="sticky left-0 z-20 bg-neutral-900"></div>

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div
              key={i}
              className={`text-[10px] text-center rounded-md py-1 ${
                i === todayIndex
                  ? "bg-neutral-800 text-neutral-200 font-medium"
                  : "text-neutral-600"
              }`}
            >
              {weekdayLabels[i % 7]}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {habits.map((habit, habitIndex) => {
            const status = getHabitStatus(habit.progress);

            return (
              <div
                key={habit.id}
                className="grid grid-cols-[520px_repeat(31,minmax(26px,1fr))] gap-1 items-center"
              >
                <div
                  draggable={canReorder}
                  onDragStart={() => canReorder && onHabitDragStart(habit.id)}
                  onDragOver={(event) => canReorder && onHabitDragOver(event)}
                  onDrop={() => canReorder && onHabitDrop(habit.id)}
                  onDragEnd={() => canReorder && onHabitDragEnd()}
                  className={`sticky left-0 z-20 px-3 py-3 rounded-xl text-sm text-neutral-200 transition ${
                    draggedHabitId === habit.id && canReorder
                      ? "bg-neutral-700 opacity-60"
                      : "bg-neutral-800"
                  } shadow-[8px_0_18px_-12px_rgba(0,0,0,0.9)]`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-1 shrink-0 ${
                        canReorder
                          ? "text-neutral-500 cursor-grab"
                          : "text-neutral-700 cursor-not-allowed opacity-50"
                      }`}
                      title={
                        canReorder
                          ? "Drag to reorder"
                          : "Enable Manual Order to reorder"
                      }
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-[15px]">
                            {habit.name}
                            <span className="ml-1">{habit.icon}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <div
                              className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-medium ${getGoalTypeBadgeClasses(
                                habit.targetType,
                              )}`}
                            >
                              <Target className="h-3.5 w-3.5" />
                              {formatGoalTypeShortLabel(
                                habit.targetType,
                                habit.targetValue,
                              )}
                            </div>

                            <div className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-2 py-1 text-[11px] text-neutral-300">
                              {habit.actual}/{habit.goal}
                            </div>

                            <div
                              className={`inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-2 py-1 text-[11px] font-medium ${getHabitProgressTextClasses(
                                habit.progress,
                              )}`}
                            >
                              {habit.progress}%
                            </div>

                            <div
                              className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium ${getHabitStatusBadgeClasses(
                                habit.progress,
                              )}`}
                            >
                              {status.label}
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
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

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onMoveHabitUp(habit.id)}
                            disabled={!canReorder || habitIndex === 0}
                            className="rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed p-1.5"
                            title={
                              canReorder
                                ? "Move up"
                                : "Available only in Manual Order"
                            }
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => onMoveHabitDown(habit.id)}
                            disabled={
                              !canReorder || habitIndex === habits.length - 1
                            }
                            className="rounded-lg bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed p-1.5"
                            title={
                              canReorder
                                ? "Move down"
                                : "Available only in Manual Order"
                            }
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
                    </div>
                  </div>
                </div>

                {habit.checks.map((checked, idx) => (
                  <button
                    key={idx}
                    onClick={() => onToggleHabitDay(habit.id, idx)}
                    className={`h-6 w-6 rounded-md border flex items-center justify-center text-[11px] transition ${
                      checked
                        ? idx === todayIndex
                          ? "bg-white text-black border-white ring-1 ring-white"
                          : "bg-neutral-300 text-black border-neutral-300"
                        : idx === todayIndex
                          ? "bg-neutral-900 text-neutral-300 border-neutral-500 ring-1 ring-neutral-500"
                          : "bg-neutral-950 text-neutral-700 border-neutral-800"
                    }`}
                  >
                    {checked ? "✓" : ""}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

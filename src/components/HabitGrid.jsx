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
  autoScrollToToday = true,
}) {
  const scrollContainerRef = useRef(null);
  const todayCellRef = useRef(null);
  const stickyColumnRef = useRef(null);
  const canReorder = isManualSort === true;

  const gridCols =
    "grid-cols-[220px_repeat(31,32px)] sm:grid-cols-[420px_repeat(31,34px)] lg:grid-cols-[520px_repeat(31,minmax(32px,1fr))]";

  const getDayButtonClasses = (checked, idx) => {
    const isToday = idx === todayIndex;

    if (checked && isToday) {
      return "border-white bg-white text-black ring-1 ring-white shadow-[0_0_0_1px_rgba(255,255,255,0.12)]";
    }

    if (checked) {
      return "border-violet-300 bg-violet-300 text-black hover:bg-white";
    }

    if (isToday) {
      return "border-neutral-500 bg-neutral-900 text-neutral-200 ring-1 ring-neutral-500 hover:bg-neutral-800";
    }

    return "border-white/5 bg-black/25 text-neutral-700 hover:border-white/10 hover:bg-white/[0.04]";
  };

  const getDayButtonLabel = (habitName, idx, checked) => {
    const dayNumber = idx + 1;
    const todayText = idx === todayIndex ? " (today)" : "";
    const statusText = checked ? "completed" : "not completed";
    return `${habitName} - day ${dayNumber}${todayText} - ${statusText}`;
  };

  useEffect(() => {
    if (!autoScrollToToday) return;
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
    const safeOffset = stickyWidth + 20;

    const nextScrollLeft = targetLeftInsideContainer - safeOffset;

    container.scrollTo({
      left: Math.max(0, nextScrollLeft),
      behavior: "smooth",
    });
  }, [todayIndex, daysInMonth, habits.length, autoScrollToToday]);

  return (
    <div
      ref={scrollContainerRef}
      className="theme-card habit-grid-scroll overflow-x-auto p-3 pb-4 sm:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-3 md:hidden">
        <div>
          <div className="text-sm font-semibold text-white">Habit Grid</div>
          <div className="mt-1 text-xs text-neutral-500">
            Swipe sideways to track all days.
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/[0.04] px-3 py-2 text-[11px] text-neutral-400">
          {daysInMonth} days
        </div>
      </div>

      <div className="w-max min-w-full">
        <div className={`mb-2 grid ${gridCols} items-center gap-1`}>
          <div
            ref={stickyColumnRef}
            className="sticky left-0 z-30 rounded-2xl border border-white/5 bg-[linear-gradient(180deg,#1b1b1f_0%,#121216_100%)] px-3 py-2.5 shadow-[12px_0_30px_-18px_rgba(0,0,0,0.85)]"
          >
            <div className="text-xs font-semibold text-white sm:text-sm">
              My Habits
            </div>
            <div className="mt-1 line-clamp-2 text-[10px] leading-4 text-neutral-500 sm:text-[11px]">
              {isManualSort
                ? "Manual reorder is enabled"
                : "Switch sort mode to Manual Order to reorder habits"}
            </div>
          </div>

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div
              key={i}
              ref={i === todayIndex ? todayCellRef : null}
              className={`rounded-md py-1 text-center text-[10px] transition ${
                i === todayIndex
                  ? "bg-white font-semibold text-black shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <div className={`mb-1 grid ${gridCols} gap-1`}>
          <div className="sticky left-0 z-20 rounded-2xl bg-[linear-gradient(180deg,#16161a_0%,#111115_100%)] shadow-[12px_0_30px_-18px_rgba(0,0,0,0.85)]" />

          {Array.from({ length: daysInMonth }, (_, i) => (
            <div
              key={i}
              className={`rounded-md py-1 text-center text-[10px] transition ${
                i === todayIndex
                  ? "bg-white/[0.08] font-medium text-neutral-100"
                  : "text-neutral-600"
              }`}
            >
              {weekdayLabels[i % 7]}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {habits.map((habit, habitIndex) => {
            const status = getHabitStatus(habit.progress);

            return (
              <div
                key={habit.id}
                className={`grid ${gridCols} items-center gap-1`}
              >
                <div
                  draggable={canReorder}
                  onDragStart={() => canReorder && onHabitDragStart(habit.id)}
                  onDragOver={(event) => canReorder && onHabitDragOver(event)}
                  onDrop={() => canReorder && onHabitDrop(habit.id)}
                  onDragEnd={() => canReorder && onHabitDragEnd()}
                  className={`sticky left-0 z-20 overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(34,34,39,0.98)_0%,rgba(21,21,25,0.98)_100%)] px-2 py-2.5 text-sm text-neutral-200 shadow-[12px_0_30px_-18px_rgba(0,0,0,0.92)] transition duration-150 sm:px-3 sm:py-3 ${
                    draggedHabitId === habit.id && canReorder
                      ? "opacity-60"
                      : "hover:border-white/10"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-2 sm:gap-3">
                    <div
                      className={`mt-1 shrink-0 ${
                        canReorder
                          ? "cursor-grab text-neutral-500"
                          : "cursor-not-allowed text-neutral-700 opacity-50"
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
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="line-clamp-2 text-[13px] font-medium leading-5 text-white sm:text-[15px]">
                            {habit.name}
                            <span className="ml-1">{habit.icon}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <div
                              className={`inline-flex items-center gap-1 rounded-xl border px-2 py-1 text-[10px] font-medium sm:text-[11px] ${getGoalTypeBadgeClasses(
                                habit.targetType,
                              )}`}
                            >
                              <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              {formatGoalTypeShortLabel(
                                habit.targetType,
                                habit.targetValue,
                              )}
                            </div>

                            <div className="inline-flex items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-[10px] text-neutral-300 ring-1 ring-white/5 sm:text-[11px]">
                              {habit.actual}/{habit.goal}
                            </div>

                            <div
                              className={`inline-flex items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-[10px] font-medium ring-1 ring-white/5 sm:text-[11px] ${getHabitProgressTextClasses(
                                habit.progress,
                              )}`}
                            >
                              {habit.progress}%
                            </div>

                            <div
                              className={`inline-flex items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-medium sm:text-[11px] ${getHabitStatusBadgeClasses(
                                habit.progress,
                              )}`}
                            >
                              {status.label}
                            </div>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <div className="inline-flex items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-[10px] text-neutral-300 ring-1 ring-white/5 sm:text-[11px]">
                              <Flame className="h-3 w-3 text-neutral-400 sm:h-3.5 sm:w-3.5" />
                              Current: {habit.currentStreak ?? 0}d
                            </div>

                            <div className="inline-flex items-center gap-1 rounded-xl bg-black/25 px-2 py-1 text-[10px] text-neutral-300 ring-1 ring-white/5 sm:text-[11px]">
                              <Trophy className="h-3 w-3 text-neutral-400 sm:h-3.5 sm:w-3.5" />
                              Best: {habit.bestStreak ?? 0}d
                            </div>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-1 sm:flex-nowrap">
                          <button
                            onClick={() => onMoveHabitUp(habit.id)}
                            disabled={!canReorder || habitIndex === 0}
                            className="rounded-lg bg-black/25 p-1 text-neutral-200 ring-1 ring-white/5 transition duration-150 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5"
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
                            className="rounded-lg bg-black/25 p-1 text-neutral-200 ring-1 ring-white/5 transition duration-150 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40 sm:p-1.5"
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
                            className="rounded-lg bg-black/25 p-1 text-neutral-200 ring-1 ring-white/5 transition duration-150 hover:bg-white/[0.08] sm:p-1.5"
                            title="Edit habit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => onRequestArchiveHabit(habit)}
                            className="rounded-lg bg-black/25 p-1 text-neutral-200 ring-1 ring-white/5 transition duration-150 hover:bg-amber-900/40 sm:p-1.5"
                            title="Archive habit"
                          >
                            <ArchiveX className="h-3.5 w-3.5" />
                          </button>

                          <button
                            onClick={() => onRequestDeleteHabit(habit)}
                            className="rounded-lg bg-black/25 p-1 text-neutral-200 ring-1 ring-white/5 transition duration-150 hover:bg-red-900/40 sm:p-1.5"
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
                    type="button"
                    onClick={() => onToggleHabitDay(habit.id, idx)}
                    aria-label={getDayButtonLabel(habit.name, idx, checked)}
                    title={getDayButtonLabel(habit.name, idx, checked)}
                    className={`flex h-8 w-8 touch-manipulation items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 active:scale-95 sm:h-7 sm:w-7 sm:text-[11px] ${getDayButtonClasses(
                      checked,
                      idx,
                    )}`}
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

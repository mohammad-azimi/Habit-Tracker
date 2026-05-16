import React from "react";
import { Brain, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
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

function HabitMeta({ habit, streakMode = false }) {
  if (!habit) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white">
        {habit.name}
        <span className="ml-1">{habit.icon}</span>
        <span className={`ml-2 ${getHabitProgressTextClasses(habit.progress)}`}>
          ({habit.progress}%)
        </span>
      </div>

      <div className="text-[11px] text-neutral-400">
        {formatGoalTypeLongLabel(habit.targetType, habit.targetValue)}
        {!streakMode ? ` • ${habit.actual}/${habit.goal}` : ""}
        {streakMode ? ` • ${habit.currentStreak ?? 0} days current streak` : ""}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getGoalTypeBadgeClasses(
            habit.targetType,
          )}`}
        >
          {formatGoalTypeShortLabel(habit.targetType, habit.targetValue)}
        </span>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${getHabitStatusBadgeClasses(
            habit.progress,
          )}`}
        >
          {getHabitStatus(habit.progress).label}
        </span>
      </div>
    </div>
  );
}

function MiniStatCard({ icon: Icon, label, value }) {
  return (
    <div className="theme-stat-tile px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        <Icon className="h-3.5 w-3.5 text-neutral-400" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function DetailCard({ icon: Icon, title, children }) {
  return (
    <div className="theme-summary-card px-4 py-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
        <Icon className="h-4 w-4 text-neutral-400" />
        {title}
      </div>

      <div className="text-sm text-white">{children}</div>
    </div>
  );
}

export default function MonthlySummaryCard({
  selectedYear,
  selectedMonthName,
  completionPercent,
  moodAverage,
  motivationAverage,
  bestHabit,
  needsAttentionHabit,
  strongestCurrentStreakHabit,
}) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title">Monthly Summary</div>
        <div className="theme-section-subtitle">
          {selectedMonthName} {selectedYear} performance overview
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <MiniStatCard
          icon={Target}
          label="Completion"
          value={`${completionPercent}%`}
        />
        <MiniStatCard
          icon={Flame}
          label="Best Streak"
          value={`${strongestCurrentStreakHabit?.currentStreak ?? 0}d`}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <MiniStatCard icon={Brain} label="Mood Avg" value={moodAverage} />
        <MiniStatCard
          icon={TrendingUp}
          label="Motivation Avg"
          value={motivationAverage}
        />
      </div>

      <div className="space-y-3">
        <DetailCard icon={Sparkles} title="Best Habit This Month">
          {bestHabit ? <HabitMeta habit={bestHabit} /> : "No data"}
        </DetailCard>

        <DetailCard icon={Target} title="Needs Attention">
          {needsAttentionHabit ? (
            <HabitMeta habit={needsAttentionHabit} />
          ) : (
            "No data"
          )}
        </DetailCard>

        <DetailCard icon={Flame} title="Streak Leader">
          {strongestCurrentStreakHabit ? (
            <HabitMeta habit={strongestCurrentStreakHabit} streakMode />
          ) : (
            "No data"
          )}
        </DetailCard>
      </div>
    </div>
  );
}

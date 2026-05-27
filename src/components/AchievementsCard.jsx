import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  Brain,
  CalendarCheck2,
  Clock3,
  Flame,
  History,
  Lock,
  Medal,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

const ACHIEVEMENT_HISTORY_KEY = "habit-tracker-achievement-history";

function clampProgress(value, target) {
  if (!target) return 0;
  return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

function loadAchievementHistory() {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(ACHIEVEMENT_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to load achievement history:", error);
    return {};
  }
}

function saveAchievementHistory(history) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ACHIEVEMENT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save achievement history:", error);
  }
}

function formatUnlockDate(value) {
  if (!value) return "Not unlocked yet";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function buildAchievements(stats) {
  const {
    totalCompleted = 0,
    completionPercent = 0,
    activeHabitsCount = 0,
    completedHabitsCount = 0,
    bestCurrentStreak = 0,
    bestOverallStreak = 0,
    moodAverage = 0,
    motivationAverage = 0,
  } = stats || {};

  return [
    {
      id: "first-win",
      title: "First Win",
      description: "Complete your first habit action.",
      icon: Sparkles,
      value: `${totalCompleted}/1`,
      progress: clampProgress(totalCompleted, 1),
      unlocked: totalCompleted >= 1,
    },
    {
      id: "daily-starter",
      title: "Daily Starter",
      description: "Complete 10 habit actions this month.",
      icon: CalendarCheck2,
      value: `${totalCompleted}/10`,
      progress: clampProgress(totalCompleted, 10),
      unlocked: totalCompleted >= 10,
    },
    {
      id: "consistency-builder",
      title: "Consistency Builder",
      description: "Reach 50% monthly completion.",
      icon: Target,
      value: `${completionPercent}%/50%`,
      progress: clampProgress(completionPercent, 50),
      unlocked: completionPercent >= 50,
    },
    {
      id: "monthly-champion",
      title: "Monthly Champion",
      description: "Reach 80% monthly completion.",
      icon: Trophy,
      value: `${completionPercent}%/80%`,
      progress: clampProgress(completionPercent, 80),
      unlocked: completionPercent >= 80,
    },
    {
      id: "perfect-habit",
      title: "Perfect Habit",
      description: "Finish at least one habit at 100%.",
      icon: BadgeCheck,
      value: `${completedHabitsCount}/1`,
      progress: clampProgress(completedHabitsCount, 1),
      unlocked: completedHabitsCount >= 1,
    },
    {
      id: "habit-master",
      title: "Habit Master",
      description: "Finish 3 habits at 100%.",
      icon: Medal,
      value: `${completedHabitsCount}/3`,
      progress: clampProgress(completedHabitsCount, 3),
      unlocked: completedHabitsCount >= 3,
    },
    {
      id: "streak-spark",
      title: "Streak Spark",
      description: "Build a 3-day current streak.",
      icon: Flame,
      value: `${bestCurrentStreak}/3 days`,
      progress: clampProgress(bestCurrentStreak, 3),
      unlocked: bestCurrentStreak >= 3,
    },
    {
      id: "streak-legend",
      title: "Streak Legend",
      description: "Reach a 7-day best streak.",
      icon: Award,
      value: `${bestOverallStreak}/7 days`,
      progress: clampProgress(bestOverallStreak, 7),
      unlocked: bestOverallStreak >= 7,
    },
    {
      id: "mind-balance",
      title: "Mind Balance",
      description: "Keep mood average at 7.0 or higher.",
      icon: Brain,
      value: `${moodAverage}/7.0`,
      progress: clampProgress(moodAverage, 7),
      unlocked: moodAverage >= 7,
    },
    {
      id: "motivation-boost",
      title: "Motivation Boost",
      description: "Keep motivation average at 7.0 or higher.",
      icon: Zap,
      value: `${motivationAverage}/7.0`,
      progress: clampProgress(motivationAverage, 7),
      unlocked: motivationAverage >= 7,
    },
    {
      id: "full-roster",
      title: "Full Roster",
      description: "Track at least 5 active habits this month.",
      icon: Target,
      value: `${activeHabitsCount}/5`,
      progress: clampProgress(activeHabitsCount, 5),
      unlocked: activeHabitsCount >= 5,
    },
  ].map((achievement) => ({
    ...achievement,
    locked: !achievement.unlocked,
  }));
}

export default function AchievementsCard({ stats }) {
  const [history, setHistory] = useState(() => loadAchievementHistory());

  const achievements = useMemo(() => buildAchievements(stats), [stats]);

  useEffect(() => {
    const unlockedAchievements = achievements.filter((item) => item.unlocked);

    if (!unlockedAchievements.length) return;

    let changed = false;
    const nextHistory = { ...history };

    unlockedAchievements.forEach((achievement) => {
      if (!nextHistory[achievement.id]) {
        nextHistory[achievement.id] = {
          id: achievement.id,
          title: achievement.title,
          unlockedAt: new Date().toISOString(),
        };

        changed = true;
      }
    });

    if (changed) {
      setHistory(nextHistory);
      saveAchievementHistory(nextHistory);
    }
  }, [achievements, history]);

  const achievementsWithHistory = achievements.map((achievement) => ({
    ...achievement,
    unlockedAt: history[achievement.id]?.unlockedAt || null,
  }));

  const unlockedAchievements = achievementsWithHistory.filter(
    (item) => item.unlocked,
  );

  const lockedAchievements = achievementsWithHistory.filter(
    (item) => !item.unlocked,
  );

  const unlockedCount = unlockedAchievements.length;
  const latestUnlocked = [...unlockedAchievements]
    .filter((item) => item.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))[0];

  return (
    <div className="theme-card p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="theme-section-title">Achievements</div>
          <div className="theme-section-subtitle">
            Unlock badges based on your monthly progress, streaks, and mental
            check-ins.
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-2xl border border-violet-900/40 bg-violet-950/25 px-3 py-2 text-xs font-medium text-violet-200">
          <Trophy className="h-4 w-4" />
          {unlockedCount}/{achievements.length} unlocked
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Trophy className="h-4 w-4 text-violet-300" />
            Unlocked
          </div>
          <div className="text-2xl font-semibold text-white">
            {unlockedCount}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Lock className="h-4 w-4 text-violet-300" />
            Locked
          </div>
          <div className="text-2xl font-semibold text-white">
            {lockedAchievements.length}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
            <Clock3 className="h-4 w-4 text-violet-300" />
            Latest
          </div>
          <div className="truncate text-sm font-semibold text-white">
            {latestUnlocked?.title || "No unlock yet"}
          </div>
          <div className="mt-1 truncate text-[11px] text-neutral-500">
            {latestUnlocked?.unlockedAt
              ? formatUnlockDate(latestUnlocked.unlockedAt)
              : "Complete habits to unlock badges."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {achievementsWithHistory.map((achievement) => {
          const Icon = achievement.unlocked ? achievement.icon : Lock;

          return (
            <div
              key={achievement.id}
              className={`rounded-3xl border p-4 transition duration-150 ${
                achievement.unlocked
                  ? "border-violet-800/40 bg-violet-950/20 shadow-[0_14px_34px_rgba(139,92,246,0.10)]"
                  : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${
                    achievement.unlocked
                      ? "bg-violet-400/15 text-violet-200 ring-violet-700/40"
                      : "bg-neutral-900 text-neutral-600 ring-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div
                        className={`text-sm font-semibold ${
                          achievement.unlocked
                            ? "text-white"
                            : "text-neutral-400"
                        }`}
                      >
                        {achievement.title}
                      </div>

                      <div className="mt-1 text-xs leading-5 text-neutral-500">
                        {achievement.description}
                      </div>
                    </div>

                    <div
                      className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-medium ${
                        achievement.unlocked
                          ? "bg-violet-300 text-black"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>{achievement.value}</span>
                      <span>{achievement.progress}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          achievement.unlocked
                            ? "bg-violet-300"
                            : "bg-neutral-600"
                        }`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
                    <History className="h-3.5 w-3.5" />
                    {achievement.unlocked
                      ? `Unlocked: ${formatUnlockDate(achievement.unlockedAt)}`
                      : "Not unlocked yet"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {unlockedAchievements.length > 0 ? (
        <div className="mt-5 rounded-3xl border border-white/5 bg-black/10 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <History className="h-4 w-4 text-violet-300" />
            Achievement History
          </div>

          <div className="space-y-2">
            {[...unlockedAchievements]
              .filter((item) => item.unlockedAt)
              .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
              .map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    key={`history-${achievement.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-violet-400/10 text-violet-200 ring-1 ring-violet-800/30">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-neutral-200">
                        {achievement.title}
                      </div>
                      <div className="truncate text-[11px] text-neutral-500">
                        {formatUnlockDate(achievement.unlockedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

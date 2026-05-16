import React, { useMemo, useState } from "react";
import { Flame, Trophy } from "lucide-react";

function LeaderboardRow({ rank, row, metricKey, accent = "orange" }) {
  const value = row?.[metricKey] ?? 0;

  const accentClass =
    accent === "yellow"
      ? "bg-yellow-950/40 text-yellow-300 border-yellow-900/40"
      : "bg-orange-950/40 text-orange-300 border-orange-900/40";

  return (
    <div className="theme-summary-card px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/30 text-sm font-semibold text-neutral-400 ring-1 ring-white/5">
            {rank}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {row?.name || "Unknown habit"}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              Progress {row?.progress ?? 0}%
            </div>
          </div>
        </div>

        <div
          className={`shrink-0 rounded-xl border px-3 py-1.5 text-sm font-semibold ${accentClass}`}
        >
          {value} days
        </div>
      </div>
    </div>
  );
}

function LeaderStatCard({ label, value, sublabel }) {
  return (
    <div className="theme-stat-tile p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        {label}
      </div>
      <div className="mt-2 truncate text-lg font-semibold text-white">
        {value}
      </div>
      <div className="mt-1 text-sm text-neutral-400">{sublabel}</div>
    </div>
  );
}

export default function StreakLeaderboardCard({ rows = [] }) {
  const [mode, setMode] = useState("current");

  const activeRows = useMemo(() => {
    return rows.filter((row) => !row.archived);
  }, [rows]);

  const currentRanked = useMemo(() => {
    return [...activeRows]
      .sort(
        (a, b) =>
          (b.currentStreak || 0) - (a.currentStreak || 0) ||
          (b.progress || 0) - (a.progress || 0),
      )
      .slice(0, 5);
  }, [activeRows]);

  const bestRanked = useMemo(() => {
    return [...activeRows]
      .sort(
        (a, b) =>
          (b.bestStreak || 0) - (a.bestStreak || 0) ||
          (b.progress || 0) - (a.progress || 0),
      )
      .slice(0, 5);
  }, [activeRows]);

  const leaderCurrent = currentRanked[0] || null;
  const leaderBest = bestRanked[0] || null;

  const displayRows = mode === "current" ? currentRanked : bestRanked;
  const metricKey = mode === "current" ? "currentStreak" : "bestStreak";

  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="theme-section-title">Streak Leaderboard</div>
          <div className="theme-section-subtitle">
            Track the strongest current and all-time streaks
          </div>
        </div>

        <div className="theme-card-muted p-2">
          <Flame className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <LeaderStatCard
          label="Current Leader"
          value={leaderCurrent ? leaderCurrent.name : "No data"}
          sublabel={
            leaderCurrent ? `${leaderCurrent.currentStreak || 0} days` : "—"
          }
        />

        <LeaderStatCard
          label="Best Streak Leader"
          value={leaderBest ? leaderBest.name : "No data"}
          sublabel={leaderBest ? `${leaderBest.bestStreak || 0} days` : "—"}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("current")}
          className={
            mode === "current"
              ? "theme-button-primary w-full"
              : "theme-button-secondary w-full"
          }
        >
          <span className="inline-flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Current Streak
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("best")}
          className={
            mode === "best"
              ? "theme-button-primary w-full"
              : "theme-button-secondary w-full"
          }
        >
          <span className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Best Streak
          </span>
        </button>
      </div>

      <div className="space-y-2">
        {displayRows.length === 0 ? (
          <div className="theme-summary-card px-4 py-4 text-sm text-neutral-400">
            No streak data available yet.
          </div>
        ) : (
          displayRows.map((row, index) => (
            <LeaderboardRow
              key={`${mode}-${row.id}`}
              rank={index + 1}
              row={row}
              metricKey={metricKey}
              accent={mode === "best" ? "yellow" : "orange"}
            />
          ))
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Flame, Trophy } from "lucide-react";

function LeaderboardRow({ rank, row, metricKey, accent = "orange" }) {
  const value = row?.[metricKey] ?? 0;

  const accentClass =
    accent === "yellow"
      ? "bg-yellow-950/40 text-yellow-300 border-yellow-900/40"
      : "bg-orange-950/40 text-orange-300 border-orange-900/40";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-800 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 text-sm text-neutral-500">{rank}</div>

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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">Streak Leaderboard</div>
          <div className="text-xs text-neutral-500 mt-1">
            Track the strongest current and all-time streaks
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 p-2">
          <Flame className="h-4 w-4 text-neutral-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Current Leader
          </div>
          <div className="mt-2 text-lg font-semibold truncate">
            {leaderCurrent ? leaderCurrent.name : "No data"}
          </div>
          <div className="mt-1 text-sm text-neutral-400">
            {leaderCurrent ? `${leaderCurrent.currentStreak || 0} days` : "—"}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 p-4">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            Best Streak Leader
          </div>
          <div className="mt-2 text-lg font-semibold truncate">
            {leaderBest ? leaderBest.name : "No data"}
          </div>
          <div className="mt-1 text-sm text-neutral-400">
            {leaderBest ? `${leaderBest.bestStreak || 0} days` : "—"}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode("current")}
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            mode === "current"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Current Streak
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMode("best")}
          className={`rounded-2xl px-4 py-3 text-sm font-medium ${
            mode === "best"
              ? "bg-white text-black"
              : "bg-neutral-800 text-white hover:bg-neutral-700"
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Best Streak
          </span>
        </button>
      </div>

      <div className="space-y-2">
        {displayRows.length === 0 ? (
          <div className="rounded-2xl bg-neutral-800 px-4 py-4 text-sm text-neutral-400">
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

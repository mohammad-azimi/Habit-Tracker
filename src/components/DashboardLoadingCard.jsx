import React from "react";

export default function DashboardLoadingCard({
  title = "Loading...",
  lines = 3,
  compact = false,
}) {
  return (
    <div
      className={`rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="h-4 w-36 animate-pulse rounded bg-neutral-800" />
      <div className="mt-2 h-3 w-52 animate-pulse rounded bg-neutral-800" />

      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="rounded-2xl bg-neutral-800 p-3">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-700" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-neutral-700" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-neutral-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

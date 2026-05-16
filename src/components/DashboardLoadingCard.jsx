import React from "react";

export default function DashboardLoadingCard({
  title = "Loading...",
  lines = 3,
  compact = false,
}) {
  return (
    <div className={`theme-card ${compact ? "p-4" : "p-5"}`}>
      <div className="h-4 w-36 animate-pulse rounded bg-white/[0.08]" />
      <div className="mt-2 h-3 w-52 animate-pulse rounded bg-white/[0.06]" />

      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }, (_, index) => (
          <div key={index} className="theme-summary-card p-3">
            <div className="h-3 w-24 animate-pulse rounded bg-white/[0.08]" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-white/[0.06]" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import { BarChart3, CalendarDays, Target } from "lucide-react";

function InsightCard({ icon: Icon, label, children }) {
  return (
    <div className="theme-summary-card px-4 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
        <Icon className="h-3.5 w-3.5 text-neutral-400" />
        {label}
      </div>
      <div className="mt-2 text-sm text-white">{children}</div>
    </div>
  );
}

export default function AnalyticsHighlightsCard({
  consistencyScore,
  bestDay,
  strongestGoalType,
  trendInsight,
}) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title text-lg">Analytics Highlights</div>
        <div className="theme-section-subtitle text-xs">
          Deeper monthly performance insights
        </div>
      </div>

      <div className="mb-3 rounded-2xl border border-white/5 bg-white/[0.05] px-4 py-3">
        <div className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
          Trend Insight
        </div>
        <div className="mt-2 text-sm font-medium text-white">
          {trendInsight?.title || "No trend yet"}
        </div>
        <div className="mt-1 text-xs leading-5 text-neutral-400">
          {trendInsight?.description ||
            "Track a few days to unlock monthly trend insights."}
        </div>
      </div>

      <div className="space-y-3">
        <InsightCard icon={BarChart3} label="Consistency Score">
          <div className="flex items-end justify-between gap-3">
            <div className="text-2xl font-semibold text-white">
              {consistencyScore}%
            </div>
            <div className="text-xs text-neutral-400">
              Based on progress and activity coverage
            </div>
          </div>
        </InsightCard>

        <InsightCard icon={CalendarDays} label="Best Day">
          {bestDay ? (
            <>
              Day {bestDay.day}{" "}
              <span className="text-neutral-400">({bestDay.weekday})</span>
              <div className="mt-1 text-xs text-neutral-400">
                {bestDay.completed}/{bestDay.total} habits completed •{" "}
                {bestDay.percent}%
              </div>
            </>
          ) : (
            <span className="text-neutral-400">No daily activity yet</span>
          )}
        </InsightCard>

        <InsightCard icon={Target} label="Strongest Goal Type">
          {strongestGoalType ? (
            <>
              {strongestGoalType.label}
              <div className="mt-1 text-xs text-neutral-400">
                {strongestGoalType.actual}/{strongestGoalType.goal} completed •{" "}
                {strongestGoalType.progress}%
              </div>
            </>
          ) : (
            <span className="text-neutral-400">No goal type data yet</span>
          )}
        </InsightCard>
      </div>
    </div>
  );
}

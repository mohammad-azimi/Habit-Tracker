import React from "react";
import { Settings2 } from "lucide-react";

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <div className="theme-summary-card flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition duration-200 active:scale-[0.96] ${
          checked ? "bg-white" : "bg-neutral-700"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full transition ${
            checked ? "left-6 bg-black" : "left-1 bg-white"
          }`}
        />
      </button>
    </div>
  );
}

export default function DashboardPreferencesCard({
  autoScrollToToday,
  onToggleAutoScrollToToday,
  showArchivedHabits,
  onToggleShowArchivedHabits,
  showAdvancedAnalytics,
  onToggleShowAdvancedAnalytics,
  showTodayProgress,
  onToggleShowTodayProgress,
  showTopHabits,
  onToggleShowTopHabits,
  showYearlyOverview,
  onToggleShowYearlyOverview,
  showStreakLeaderboard,
  onToggleShowStreakLeaderboard,
  showMonthlyReview,
  onToggleShowMonthlyReview,
  onResetPreferences,
}) {
  return (
    <div className="theme-card p-5 space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Settings2 className="h-4 w-4 text-neutral-400" />
          Dashboard Preferences
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Choose how your dashboard looks and behaves
        </div>
      </div>

      <PreferenceToggle
        label="Auto-scroll to today"
        description="When the habit grid opens, jump directly near today's column."
        checked={autoScrollToToday}
        onChange={onToggleAutoScrollToToday}
      />

      <PreferenceToggle
        label="Show archived habits"
        description="Display the archived habits panel in the sidebar."
        checked={showArchivedHabits}
        onChange={onToggleShowArchivedHabits}
      />

      <PreferenceToggle
        label="Show advanced analytics"
        description="Display deeper analytics cards like trend, weekday performance, and momentum."
        checked={showAdvancedAnalytics}
        onChange={onToggleShowAdvancedAnalytics}
      />

      <PreferenceToggle
        label="Show today progress"
        description="Display the Today Progress card in the dashboard."
        checked={showTodayProgress}
        onChange={onToggleShowTodayProgress}
      />

      <PreferenceToggle
        label="Show top habits"
        description="Display the Top Habits card in the sidebar."
        checked={showTopHabits}
        onChange={onToggleShowTopHabits}
      />

      <PreferenceToggle
        label="Show yearly overview"
        description="Display the yearly overview section in the dashboard."
        checked={showYearlyOverview}
        onChange={onToggleShowYearlyOverview}
      />

      <PreferenceToggle
        label="Show streak leaderboard"
        description="Display the streak leaderboard card."
        checked={showStreakLeaderboard}
        onChange={onToggleShowStreakLeaderboard}
      />

      <PreferenceToggle
        label="Show monthly review"
        description="Display the monthly review section."
        checked={showMonthlyReview}
        onChange={onToggleShowMonthlyReview}
      />

      <button
        type="button"
        onClick={onResetPreferences}
        className="theme-button-secondary w-full"
      >
        Reset dashboard preferences
      </button>
    </div>
  );
}

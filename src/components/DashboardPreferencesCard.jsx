import React from "react";
import { Settings2 } from "lucide-react";

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-neutral-800 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="mt-1 text-xs leading-5 text-neutral-500">
          {description}
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
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
  onResetPreferences,
}) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Settings2 className="h-4 w-4" />
          Dashboard Preferences
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Personalize how your dashboard behaves
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

      <button
        type="button"
        onClick={onResetPreferences}
        className="w-full rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Reset Preferences
      </button>
    </div>
  );
}

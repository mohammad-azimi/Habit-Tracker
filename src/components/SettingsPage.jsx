import React, { useState } from "react";
import {
  ArrowLeft,
  BellRing,
  DatabaseBackup,
  Download,
  LayoutDashboard,
  Lock,
  LogOut,
  MonitorSmartphone,
  Moon,
  Paintbrush,
  Settings,
  SlidersHorizontal,
  Sun,
  Upload,
} from "lucide-react";
import DashboardPreferencesCard from "./DashboardPreferencesCard";
import ReminderSettingsCard from "./ReminderSettingsCard";
import PwaInstallCard from "./PwaInstallCard";
import BackendHealthCard from "./BackendHealthCard";
import ChangePasswordCard from "./ChangePasswordCard";
import DeleteAccountCard from "./DeleteAccountCard";

const settingSections = [
  {
    id: "appearance",
    label: "Appearance",
    icon: Paintbrush,
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: BellRing,
  },
  {
    id: "app",
    label: "App & System",
    icon: MonitorSmartphone,
  },
  {
    id: "account",
    label: "Account Data",
    icon: DatabaseBackup,
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
  },
];

function SettingsSectionTabs({ activeSection, onChangeSection }) {
  return (
    <div className="theme-card p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {settingSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChangeSection(section.id)}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                isActive
                  ? "bg-violet-300 text-black"
                  : "border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeOptionCard({
  title,
  description,
  icon: Icon,
  isActive,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-5 text-left transition active:scale-[0.99] ${
        isActive
          ? "border-violet-400 bg-violet-300/20 ring-2 ring-violet-300/30"
          : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
          <Icon className="h-5 w-5 text-violet-300" />
        </div>

        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            isActive
              ? "bg-violet-300 text-black"
              : "bg-white/[0.06] text-neutral-400"
          }`}
        >
          {isActive ? "Selected" : "Choose"}
        </div>
      </div>

      <div className="text-base font-semibold text-white">{title}</div>
      <div className="mt-2 text-sm leading-6 text-neutral-500">
        {description}
      </div>
    </button>
  );
}

export default function SettingsPage({
  currentUser,
  appTheme = "dark",
  onChangeAppTheme,
  onBack,
  onLogout,

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
  onResetPreferences,

  onExportAccountData,
  onImportAccountData,
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeleting,
}) {
  const [activeSection, setActiveSection] = useState("appearance");

  return (
    <div className="app-theme-bg safe-bottom-padding min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-[1200px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
                <Settings className="h-6 w-6 text-violet-300" />
              </div>

              <div>
                <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Settings
                </div>
                <div className="mt-2 text-sm leading-6 text-neutral-400">
                  Manage app preferences, notifications, installation, system
                  status, backups, and account security.
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-neutral-500">
              Logged in as {currentUser?.username || "User"}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onBack}
              className="theme-button-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="theme-button-secondary"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <SettingsSectionTabs
          activeSection={activeSection}
          onChangeSection={setActiveSection}
        />

        {activeSection === "appearance" ? (
          <div className="space-y-4">
            <div className="theme-card p-5">
              <div className="mb-4">
                <div className="theme-section-title text-lg">Appearance</div>
                <div className="theme-section-subtitle text-xs">
                  Choose between the current dark dashboard style and a soft
                  light theme inspired by modern mobile fitness apps.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <ThemeOptionCard
                  title="Dark Theme"
                  description="The original black and violet dashboard theme for focused night use."
                  icon={Moon}
                  isActive={appTheme === "dark"}
                  onClick={() => onChangeAppTheme?.("dark")}
                />

                <ThemeOptionCard
                  title="Light Theme"
                  description="A clean white, lavender, and violet interface similar to the reference mobile design."
                  icon={Sun}
                  isActive={appTheme === "light"}
                  onClick={() => onChangeAppTheme?.("light")}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-neutral-500">
                Your choice is saved on this device and will be applied
                automatically the next time you open the app.
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "preferences" ? (
          <div className="space-y-4">
            <DashboardPreferencesCard
              autoScrollToToday={autoScrollToToday}
              onToggleAutoScrollToToday={onToggleAutoScrollToToday}
              showArchivedHabits={showArchivedHabits}
              onToggleShowArchivedHabits={onToggleShowArchivedHabits}
              showAdvancedAnalytics={showAdvancedAnalytics}
              onToggleShowAdvancedAnalytics={onToggleShowAdvancedAnalytics}
              showTodayProgress={showTodayProgress}
              onToggleShowTodayProgress={onToggleShowTodayProgress}
              showTopHabits={showTopHabits}
              onToggleShowTopHabits={onToggleShowTopHabits}
              showYearlyOverview={showYearlyOverview}
              onToggleShowYearlyOverview={onToggleShowYearlyOverview}
              showStreakLeaderboard={showStreakLeaderboard}
              onToggleShowStreakLeaderboard={onToggleShowStreakLeaderboard}
              onResetPreferences={onResetPreferences}
            />
          </div>
        ) : null}

        {activeSection === "notifications" ? (
          <div className="space-y-4">
            <ReminderSettingsCard />
          </div>
        ) : null}

        {activeSection === "app" ? (
          <div className="space-y-4">
            <PwaInstallCard />

            <BackendHealthCard />
          </div>
        ) : null}

        {activeSection === "account" ? (
          <div className="space-y-4">
            <div className="theme-card p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                  <DatabaseBackup className="h-4 w-4 text-violet-300" />
                  Account Data
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-500">
                  Export your full account data or restore it from a previous
                  full account backup.
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onExportAccountData}
                  className="theme-button-secondary w-full"
                >
                  <Download className="h-4 w-4" />
                  Export Account Data
                </button>

                <button
                  type="button"
                  onClick={onImportAccountData}
                  className="theme-button-secondary w-full"
                >
                  <Upload className="h-4 w-4" />
                  Import Account Data
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-neutral-500">
                Full account export includes your profile data and all saved
                month records. Password is not included. Importing an account
                backup requires confirmation before restore.
              </div>
            </div>
          </div>
        ) : null}

        {activeSection === "security" ? (
          <div className="space-y-4">
            <ChangePasswordCard
              onSubmit={onChangePassword}
              isSubmitting={isChangingPassword}
            />

            <DeleteAccountCard
              onDeleteAccount={onDeleteAccount}
              isDeleting={isDeleting}
            />
          </div>
        ) : null}

        <div className="theme-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-neutral-300">
                Workspace shortcut
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Return to your main habit workspace.
              </div>
            </div>

            <button
              type="button"
              onClick={onBack}
              className="theme-button-secondary"
            >
              <LayoutDashboard className="h-4 w-4" />
              Open Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

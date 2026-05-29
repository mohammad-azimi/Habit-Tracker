import React, { useState } from "react";
import {
  ArrowLeft,
  BellRing,
  DatabaseBackup,
  Download,
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
    <div className="settings-tabs-card theme-card p-2.5">
      <div className="settings-tabs-scroll flex gap-2 overflow-x-auto">
        {settingSections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChangeSection(section.id)}
              className={`settings-tab-button ${
                isActive ? "settings-tab-button-active" : ""
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
      className={`settings-theme-option ${
        isActive ? "settings-theme-option-active" : ""
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="settings-icon-tile">
          <Icon className="h-5 w-5 text-violet-300" />
        </div>

        <div
          className={`settings-choice-badge ${
            isActive ? "settings-choice-badge-active" : ""
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

function SettingsInfoNote({ children }) {
  return (
    <div className="settings-info-note text-xs leading-5 text-neutral-500">
      {children}
    </div>
  );
}

function AccountDataSection({ onExportAccountData, onImportAccountData }) {
  return (
    <div className="theme-card p-5">
      <div className="mb-5 flex items-start gap-3">
        <div className="settings-icon-tile shrink-0">
          <DatabaseBackup className="h-5 w-5 text-violet-300" />
        </div>

        <div>
          <div className="theme-section-title text-lg">Account Data</div>
          <div className="theme-section-subtitle text-xs">
            Export your full account data or restore it from a previous full
            account backup.
          </div>
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

      <SettingsInfoNote>
        Full account export includes your profile data and all saved month
        records. Password is not included. Importing an account backup requires
        confirmation before restore.
      </SettingsInfoNote>
    </div>
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
      <div className="mx-auto max-w-[1180px] space-y-5 md:space-y-6">
        <div className="settings-page-header flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="settings-header-icon">
                <Settings className="h-6 w-6 text-violet-300" />
              </div>

              <div>
                <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Settings
                </div>
                <div className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
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

        <div className="settings-content-stack">
          {activeSection === "appearance" ? (
            <div className="theme-card p-5">
              <div className="mb-5">
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

              <SettingsInfoNote>
                Your choice is saved on this device and will be applied
                automatically the next time you open the app.
              </SettingsInfoNote>
            </div>
          ) : null}

          {activeSection === "preferences" ? (
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
          ) : null}

          {activeSection === "notifications" ? <ReminderSettingsCard /> : null}

          {activeSection === "app" ? (
            <>
              <PwaInstallCard />
              <BackendHealthCard />
            </>
          ) : null}

          {activeSection === "account" ? (
            <AccountDataSection
              onExportAccountData={onExportAccountData}
              onImportAccountData={onImportAccountData}
            />
          ) : null}

          {activeSection === "security" ? (
            <>
              <ChangePasswordCard
                onSubmit={onChangePassword}
                isSubmitting={isChangingPassword}
              />

              <DeleteAccountCard
                onDeleteAccount={onDeleteAccount}
                isDeleting={isDeleting}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

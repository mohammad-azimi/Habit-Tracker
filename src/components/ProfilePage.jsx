import React from "react";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  CalendarCheck,
  Download,
  Flame,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Target,
  Trophy,
  Upload,
  UserCircle,
} from "lucide-react";
import UserProfileCard from "./UserProfileCard";
import ChangePasswordCard from "./ChangePasswordCard";
import DeleteAccountCard from "./DeleteAccountCard";

function ProfileStatTile({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-500">
        <Icon className="h-4 w-4 text-violet-300" />
        {label}
      </div>

      <div className="text-2xl font-semibold text-white">{value}</div>

      {helper ? (
        <div className="mt-1 text-xs leading-5 text-neutral-500">{helper}</div>
      ) : null}
    </div>
  );
}

export default function ProfilePage({
  currentUser,
  profileStats = {},
  onBack,
  onGoToAnalytics,
  onLogout,
  onSaveProfile,
  isSavingProfile,
  profileErrorMessage,
  profileSuccessMessage,
  onExportAccountData,
  onImportAccountData,
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeleting,
}) {
  const avatarUrl = currentUser?.avatarUrl || "";

  return (
    <div className="app-theme-bg safe-bottom-padding min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Profile & Security
            </div>
            <div className="mt-2 text-sm leading-6 text-neutral-400">
              Manage your account information, password, and account security in
              one place.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onBack} className="theme-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            {typeof onGoToAnalytics === "function" ? (
              <button
                onClick={onGoToAnalytics}
                className="theme-button-secondary"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </button>
            ) : null}

            <button onClick={onLogout} className="theme-button-secondary">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="space-y-4 xl:col-span-4">
            <div className="theme-card p-5">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="theme-card-muted flex h-14 w-14 items-center justify-center">
                    <UserCircle className="h-8 w-8 text-neutral-300" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-white">
                    {currentUser?.username || "User"}
                  </div>
                  <div className="truncate text-sm text-neutral-500">
                    {currentUser?.email || "No email"}
                  </div>
                </div>
              </div>
            </div>

            <UserProfileCard
              user={currentUser}
              onSaveProfile={onSaveProfile}
              isSaving={isSavingProfile}
              errorMessage={profileErrorMessage}
              successMessage={profileSuccessMessage}
            />

            <div className="theme-card p-5">
              <div className="mb-4">
                <div className="theme-section-title text-lg">
                  Profile Snapshot
                </div>
                <div className="theme-section-subtitle text-xs">
                  A quick summary of your current habit performance and account
                  activity.
                </div>
              </div>

              <div className="mb-4 rounded-3xl border border-violet-900/30 bg-violet-950/15 px-4 py-3">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-200">
                  <CalendarCheck className="h-4 w-4" />
                  Current workspace
                </div>

                <div className="mt-1 text-lg font-semibold text-white">
                  {profileStats.monthLabel || "Current month"}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProfileStatTile
                  icon={Target}
                  label="Active Habits"
                  value={profileStats.activeHabitsCount ?? 0}
                  helper="Habits currently visible in your dashboard."
                />

                <ProfileStatTile
                  icon={Archive}
                  label="Archived"
                  value={profileStats.archivedHabitsCount ?? 0}
                  helper="Habits saved outside the main list."
                />

                <ProfileStatTile
                  icon={Trophy}
                  label="Completed"
                  value={profileStats.completedHabitsCount ?? 0}
                  helper="Habits that reached 100% this month."
                />

                <ProfileStatTile
                  icon={Flame}
                  label="Best Streak"
                  value={`${profileStats.bestOverallStreak ?? 0} days`}
                  helper="Your strongest streak among active habits."
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/5 bg-black/10 p-4">
                  <div className="text-xs text-neutral-500">Completion</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {profileStats.completionPercent ?? 0}%
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-black/10 p-4">
                  <div className="text-xs text-neutral-500">Mood Avg</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {profileStats.moodAverage ?? 0}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/5 bg-black/10 p-4">
                  <div className="text-xs text-neutral-500">Motivation Avg</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {profileStats.motivationAverage ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card p-5">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                  <ShieldCheck className="h-4 w-4 text-neutral-400" />
                  Account Data
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-500">
                  Export your full account data or restore it from a previous
                  full account backup.
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onExportAccountData}
                  className="theme-button-secondary w-full justify-start"
                >
                  <Download className="h-4 w-4" />
                  Export Account Data
                </button>

                <button
                  onClick={onImportAccountData}
                  className="theme-button-secondary w-full justify-start"
                >
                  <Upload className="h-4 w-4" />
                  Import Account Data
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-neutral-500">
                Full account export includes your profile data and all saved
                month records. Password is not included. Importing an account
                backup now requires confirmation before restore.
              </div>
            </div>

            <div className="theme-card p-5">
              <div className="mb-4">
                <div className="theme-section-title text-lg">Workspace</div>
                <div className="theme-section-subtitle text-xs">
                  Quickly move between your main work areas.
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onBack}
                  className="theme-button-secondary w-full justify-start"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Open Dashboard
                </button>

                {typeof onGoToAnalytics === "function" ? (
                  <button
                    onClick={onGoToAnalytics}
                    className="theme-button-secondary w-full justify-start"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Open Analytics
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4 xl:col-span-8">
            <ChangePasswordCard
              onSubmit={onChangePassword}
              isSubmitting={isChangingPassword}
            />

            <DeleteAccountCard
              onDeleteAccount={onDeleteAccount}
              isDeleting={isDeleting}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

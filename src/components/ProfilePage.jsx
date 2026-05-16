import React from "react";
import {
  ArrowLeft,
  BarChart3,
  LayoutDashboard,
  LogOut,
  UserCircle,
} from "lucide-react";
import UserProfileCard from "./UserProfileCard";
import ChangePasswordCard from "./ChangePasswordCard";
import DeleteAccountCard from "./DeleteAccountCard";

export default function ProfilePage({
  currentUser,
  onBack,
  onGoToAnalytics,
  onLogout,
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeleting,
}) {
  return (
    <div className="app-theme-bg min-h-screen p-4 md:p-8">
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
                <div className="theme-card-muted p-3">
                  <UserCircle className="h-8 w-8 text-neutral-300" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-lg font-semibold text-white">
                    {currentUser?.username || "User"}
                  </div>
                  <div className="text-sm text-neutral-500">
                    Account overview
                  </div>
                </div>
              </div>
            </div>

            <UserProfileCard user={currentUser} />

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

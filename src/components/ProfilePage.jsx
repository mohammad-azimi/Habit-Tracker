import React from "react";
import { ArrowLeft, LogOut, UserCircle } from "lucide-react";
import UserProfileCard from "./UserProfileCard";
import ChangePasswordCard from "./ChangePasswordCard";
import DeleteAccountCard from "./DeleteAccountCard";

export default function ProfilePage({
  currentUser,
  onBack,
  onLogout,
  onChangePassword,
  isChangingPassword,
  onDeleteAccount,
  isDeleting,
}) {
  return (
    <div className="app-theme-bg min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Profile & Security
            </div>
            <div className="mt-2 text-sm text-neutral-400">
              Manage your account information, password, and account settings.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={onBack} className="theme-button-secondary">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

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

                <div>
                  <div className="text-lg font-semibold text-white">
                    {currentUser?.username || "User"}
                  </div>
                  <div className="text-sm text-neutral-500">
                    Account overview
                  </div>
                </div>
              </div>
            </div>

            <UserProfileCard user={currentUser} />
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

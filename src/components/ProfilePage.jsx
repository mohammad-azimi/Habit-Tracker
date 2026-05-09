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
  isDeletingAccount,
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-3xl md:text-4xl font-bold tracking-tight">
              Profile & Security
            </div>
            <div className="mt-2 text-sm text-neutral-400">
              Manage your account information, password, and account settings.
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onBack}
              className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <button
              onClick={onLogout}
              className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <section className="xl:col-span-4 space-y-4">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-neutral-800 p-3">
                  <UserCircle className="h-8 w-8 text-neutral-300" />
                </div>

                <div>
                  <div className="text-lg font-semibold">
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

          <section className="xl:col-span-8 space-y-4">
            <ChangePasswordCard
              onSubmit={onChangePassword}
              isSubmitting={isChangingPassword}
            />

            <DeleteAccountCard
              onDeleteAccount={onDeleteAccount}
              isDeleting={isDeletingAccount}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { KeyRound, LockKeyhole, Save } from "lucide-react";

export default function ChangePasswordCard({ onSubmit, isSubmitting }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setLocalError("New password must be different from current password.");
      return;
    }

    const result = await onSubmit({
      currentPassword,
      newPassword,
    });

    if (result?.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLocalError("");
    } else if (result?.message) {
      setLocalError(result.message);
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Change Password</div>
        <div className="text-xs text-neutral-500 mt-1">
          Update your account password securely
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-2">
            Current Password
          </label>
          <div className="relative">
            <LockKeyhole className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-2">
            New Password
          </label>
          <div className="relative">
            <KeyRound className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-neutral-500 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <KeyRound className="h-4 w-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 pl-10 pr-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        {localError ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {localError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-white text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

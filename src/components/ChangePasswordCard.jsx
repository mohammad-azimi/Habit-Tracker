import React, { useState } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole, Save } from "lucide-react";

export default function ChangePasswordCard({ onSubmit, isSubmitting }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } else if (result?.message) {
      setLocalError(result.message);
    }
  };

  const renderVisibilityButton = (visible, onToggle, label) => (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title">Change Password</div>
        <div className="theme-section-subtitle">
          Update your account password securely
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs text-neutral-500">
            Current Password
          </label>

          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 py-3 pl-12 pr-12 text-sm text-white outline-none"
            />
            {renderVisibilityButton(
              showCurrentPassword,
              () => setShowCurrentPassword((prev) => !prev),
              "Toggle current password visibility",
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-neutral-500">
            New Password
          </label>

          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 py-3 pl-12 pr-12 text-sm text-white outline-none"
            />
            {renderVisibilityButton(
              showNewPassword,
              () => setShowNewPassword((prev) => !prev),
              "Toggle new password visibility",
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-neutral-500">
            Confirm New Password
          </label>

          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 py-3 pl-12 pr-12 text-sm text-white outline-none"
            />
            {renderVisibilityButton(
              showConfirmPassword,
              () => setShowConfirmPassword((prev) => !prev),
              "Toggle confirm password visibility",
            )}
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
          className="theme-button-primary w-full disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

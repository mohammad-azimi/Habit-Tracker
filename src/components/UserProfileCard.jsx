import React, { useEffect, useRef, useState } from "react";
import { Camera, Mail, Save, ShieldCheck, Trash2, User } from "lucide-react";

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="theme-summary-card px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-xs text-neutral-500">
        <Icon className="h-4 w-4 text-neutral-400" />
        {label}
      </div>
      <div className="break-all text-sm text-white">{value}</div>
    </div>
  );
}

function getEmailError(email) {
  const trimmedEmail = String(email || "").trim();

  if (!trimmedEmail) {
    return "Email cannot be empty.";
  }

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  if (!isValidEmail) {
    return "Enter a valid email address.";
  }

  return "";
}

function getUsernameError(username) {
  const trimmedUsername = String(username || "")
    .trim()
    .replace(/\s+/g, " ");

  if (!trimmedUsername) {
    return "Username cannot be empty.";
  }

  if (trimmedUsername.length < 2) {
    return "Username must be at least 2 characters.";
  }

  if (trimmedUsername.length > 40) {
    return "Username must be 40 characters or less.";
  }

  return "";
}

export default function UserProfileCard({
  user,
  onSaveProfile,
  isSaving = false,
  errorMessage = "",
  successMessage = "",
}) {
  const fileInputRef = useRef(null);

  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setSelectedAvatarFile(null);
    setAvatarPreviewUrl("");
    setRemoveAvatar(false);
  }, [user?.id, user?.username, user?.email, user?.avatarUrl]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const trimmedUsername = String(username || "")
    .trim()
    .replace(/\s+/g, " ");
  const trimmedEmail = String(email || "").trim();

  const usernameError = getUsernameError(trimmedUsername);
  const emailError = getEmailError(trimmedEmail);
  const validationMessage = usernameError || emailError;

  const initialUsername = String(user?.username || "")
    .trim()
    .replace(/\s+/g, " ");
  const initialEmail = String(user?.email || "").trim();
  const initialAvatarUrl = String(user?.avatarUrl || "").trim();

  const hasProfileTextChanges =
    trimmedUsername !== initialUsername ||
    trimmedEmail.toLowerCase() !== initialEmail.toLowerCase();

  const hasAvatarChanges =
    Boolean(selectedAvatarFile) || (removeAvatar && Boolean(initialAvatarUrl));

  const canSave =
    typeof onSaveProfile === "function" &&
    !isSaving &&
    !validationMessage &&
    (hasProfileTextChanges || hasAvatarChanges);

  const resolvedAvatarUrl = removeAvatar
    ? ""
    : avatarPreviewUrl || initialAvatarUrl || "";

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!file.type?.startsWith("image/")) return;

    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);

    setAvatarPreviewUrl(nextPreviewUrl);
    setSelectedAvatarFile(file);
    setRemoveAvatar(false);
    event.target.value = "";
  };

  const handleRemoveAvatar = () => {
    if (avatarPreviewUrl && avatarPreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    setAvatarPreviewUrl("");
    setSelectedAvatarFile(null);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    if (!canSave) return;

    await onSaveProfile({
      username: trimmedUsername,
      email: trimmedEmail,
      avatarFile: selectedAvatarFile,
      removeAvatar,
    });
  };

  return (
    <div className="theme-card p-5 space-y-4">
      <div>
        <div className="theme-section-title text-lg">Profile</div>
        <div className="theme-section-subtitle text-xs">
          Update your avatar, username, and email
        </div>
      </div>

      <div className="theme-summary-card px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {resolvedAvatarUrl ? (
                <img
                  src={resolvedAvatarUrl}
                  alt="Profile avatar"
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="theme-card-muted flex h-16 w-16 items-center justify-center rounded-2xl">
                  <User className="h-7 w-7 text-neutral-200" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="truncate text-base font-medium text-white">
                {trimmedUsername || "Unknown user"}
              </div>
              <div className="mt-1 truncate text-xs text-neutral-400">
                @{user?.id || "unknown"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              onClick={handleOpenFilePicker}
              className="theme-button-secondary"
            >
              <Camera className="h-4 w-4" />
              Upload photo
            </button>

            {(resolvedAvatarUrl || initialAvatarUrl) && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-300 transition duration-150 hover:bg-red-950/35"
              >
                <Trash2 className="h-4 w-4" />
                Remove photo
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 text-xs text-neutral-500">
          Recommended: square image, JPG/PNG/WEBP.
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-2 block text-xs text-neutral-500">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="theme-input"
            placeholder="Your username"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-neutral-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="theme-input"
            placeholder="you@example.com"
          />
        </div>
      </div>

      {validationMessage ? (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-300">
          {validationMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="theme-button-primary w-full disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save profile changes"}
      </button>

      <div className="space-y-3">
        <InfoCard
          icon={Mail}
          label="Current email"
          value={user?.email || "No email"}
        />

        <InfoCard
          icon={ShieldCheck}
          label="Session"
          value="Authenticated with JWT"
        />
      </div>
    </div>
  );
}

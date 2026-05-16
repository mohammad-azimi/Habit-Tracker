import React from "react";
import { Mail, User, ShieldCheck } from "lucide-react";

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

export default function UserProfileCard({ user }) {
  return (
    <div className="theme-card p-5 space-y-4">
      <div>
        <div className="theme-section-title text-lg">Profile</div>
        <div className="theme-section-subtitle text-xs">
          Signed in account information
        </div>
      </div>

      <div className="theme-summary-card px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="theme-card-muted flex h-11 w-11 items-center justify-center">
            <User className="h-5 w-5 text-neutral-200" />
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">
              {user?.username || "Unknown user"}
            </div>
            <div className="mt-1 truncate text-xs text-neutral-400">
              @{user?.id || "unknown"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <InfoCard icon={Mail} label="Email" value={user?.email || "No email"} />

        <InfoCard
          icon={ShieldCheck}
          label="Session"
          value="Authenticated with JWT"
        />
      </div>
    </div>
  );
}

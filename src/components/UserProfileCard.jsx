import React from "react";
import { Mail, User, ShieldCheck } from "lucide-react";

export default function UserProfileCard({ user }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-4">
      <div>
        <div className="text-sm font-semibold text-neutral-300">Profile</div>
        <div className="text-xs text-neutral-500 mt-1">
          Signed in account information
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-neutral-700 flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-200" />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.username || "Unknown user"}
            </div>
            <div className="text-xs text-neutral-400 truncate mt-1">
              @{user?.id || "unknown"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <Mail className="h-4 w-4" />
            Email
          </div>
          <div className="text-sm text-white break-all">
            {user?.email || "No email"}
          </div>
        </div>

        <div className="rounded-2xl bg-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
            <ShieldCheck className="h-4 w-4" />
            Session
          </div>
          <div className="text-sm text-white">Authenticated with JWT</div>
        </div>
      </div>
    </div>
  );
}

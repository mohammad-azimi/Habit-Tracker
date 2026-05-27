import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

export default function NetworkStatusBanner({
  syncStatus,
  syncErrorMessage,
  onRetry,
}) {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const hasSyncError = syncStatus === "error";

  if (isOnline && !hasSyncError) {
    return null;
  }

  const title = !isOnline ? "You are offline" : "Sync problem detected";

  const message = !isOnline
    ? "Your changes may not sync until your internet connection is back."
    : syncErrorMessage || "Habit Tracker could not sync with the server.";

  return (
    <div
      className={`rounded-3xl border px-4 py-3 ${
        !isOnline
          ? "border-amber-900/40 bg-amber-950/20 text-amber-100"
          : "border-red-900/40 bg-red-950/20 text-red-100"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-2xl p-2 ${
              !isOnline ? "bg-amber-950/40" : "bg-red-950/40"
            }`}
          >
            {!isOnline ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
          </div>

          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs leading-5 opacity-75">{message}</div>
          </div>
        </div>

        {isOnline && typeof onRetry === "function" ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15 active:scale-[0.98]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry Sync
          </button>
        ) : null}
      </div>
    </div>
  );
}

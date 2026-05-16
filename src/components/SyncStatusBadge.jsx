import React from "react";

export default function SyncStatusBadge({
  syncStatus,
  syncStatusText,
  onRetry,
}) {
  const isError = syncStatus === "error";
  const isBusy = syncStatus === "saving" || syncStatus === "loading";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${
          isError
            ? "border-red-900/40 bg-red-950/30 text-red-300"
            : isBusy
              ? "border-amber-900/40 bg-amber-950/30 text-amber-300"
              : "border-emerald-900/40 bg-emerald-950/30 text-emerald-300"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isError ? "bg-red-400" : isBusy ? "bg-amber-400" : "bg-emerald-400"
          }`}
        />
        {syncStatusText}
      </div>

      {isError ? (
        <button
          onClick={onRetry}
          className="theme-button-secondary px-3 py-2 text-xs font-medium"
        >
          Retry save
        </button>
      ) : null}
    </div>
  );
}

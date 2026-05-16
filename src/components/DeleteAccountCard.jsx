import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function DeleteAccountCard({ onDeleteAccount, isDeleting }) {
  const [confirmationText, setConfirmationText] = useState("");
  const [localError, setLocalError] = useState("");

  const handleDelete = async () => {
    setLocalError("");

    if (confirmationText.trim() !== "DELETE") {
      setLocalError("Type DELETE to confirm account removal.");
      return;
    }

    const result = await onDeleteAccount();

    if (!result?.ok && result?.message) {
      setLocalError(result.message);
    }
  };

  return (
    <div className="rounded-[30px] border border-red-900/30 bg-[linear-gradient(180deg,rgba(69,10,10,0.45)_0%,rgba(33,12,12,0.28)_100%)] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
      <div className="mb-4">
        <div className="text-lg font-semibold text-red-200">Delete Account</div>
        <div className="mt-1 text-xs text-red-300/70">
          This will permanently remove your account and all saved monthly data.
        </div>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-900/30 bg-red-950/25 px-4 py-3 text-sm text-red-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          This action cannot be undone. To confirm, type{" "}
          <span className="font-semibold">DELETE</span> below.
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder='Type "DELETE" to confirm'
          className="w-full rounded-2xl border border-red-900/35 bg-neutral-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-red-200/35 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10"
        />

        {localError ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {localError}
          </div>
        ) : null}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition duration-150 hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}

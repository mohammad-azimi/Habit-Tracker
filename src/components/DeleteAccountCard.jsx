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
    <div className="rounded-3xl border border-red-900/40 bg-red-950/20 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold text-red-200">Delete Account</div>
        <div className="text-xs text-red-300/70 mt-1">
          This will permanently remove your account and all saved monthly data.
        </div>
      </div>

      <div className="rounded-2xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-100 flex items-start gap-3 mb-4">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
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
          className="w-full rounded-2xl bg-neutral-900 border border-red-900/40 px-4 py-3 text-sm outline-none text-white"
        />

        {localError ? (
          <div className="rounded-2xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
            {localError}
          </div>
        ) : null}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="w-full rounded-2xl bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}

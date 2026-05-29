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
    <div className="theme-danger-card delete-account-card p-5">
      <div className="mb-4">
        <div className="delete-account-title">Delete Account</div>
        <div className="delete-account-subtitle">
          This will permanently remove your account and all saved monthly data.
        </div>
      </div>

      <div className="delete-account-warning">
        <AlertTriangle className="delete-account-warning-icon" />
        <div>
          This action cannot be undone. To confirm, type{" "}
          <span className="delete-account-strong">DELETE</span> below.
        </div>
      </div>

      <div className="space-y-3">
        <input
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          placeholder='Type "DELETE" to confirm'
          className="delete-account-input"
        />

        {localError ? (
          <div className="delete-account-error">{localError}</div>
        ) : null}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="delete-account-button"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-950/40 p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <div className="text-lg font-semibold">{title}</div>
              <div className="text-sm text-neutral-400 mt-1">{message}</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-600 text-white hover:bg-red-500 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

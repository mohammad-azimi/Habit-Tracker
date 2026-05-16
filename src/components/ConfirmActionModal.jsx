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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="theme-card w-full max-w-md p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-950/40 p-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <div className="text-lg font-semibold text-white">{title}</div>
              <div className="mt-1 text-sm text-neutral-400">{message}</div>
            </div>
          </div>

          <button onClick={onClose} className="theme-button-secondary p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="theme-button-secondary flex-1">
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition duration-150 hover:bg-red-500 active:scale-[0.98]"
          >
            <Trash2 className="h-4 w-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

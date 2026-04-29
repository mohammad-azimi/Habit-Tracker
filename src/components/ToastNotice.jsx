import React from "react";
import { AlertCircle, CheckCircle2, Info, RotateCcw, X } from "lucide-react";

export default function ToastNotice({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success: {
      wrapper: "border-emerald-700/50 bg-emerald-950/90 text-emerald-100",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    },
    error: {
      wrapper: "border-red-700/50 bg-red-950/90 text-red-100",
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
    },
    info: {
      wrapper: "border-neutral-700 bg-neutral-900/95 text-neutral-100",
      icon: <Info className="h-5 w-5 text-neutral-300" />,
    },
  };

  const current = styles[toast.type] || styles.info;

  return (
    <div className="fixed top-4 right-4 z-[100] w-full max-w-sm px-4">
      <div
        className={`rounded-2xl border shadow-2xl backdrop-blur-md ${current.wrapper}`}
      >
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="shrink-0 mt-0.5">{current.icon}</div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{toast.message}</div>

            {toast.actionLabel && typeof toast.onAction === "function" ? (
              <button
                onClick={toast.onAction}
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium hover:bg-white/10"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {toast.actionLabel}
              </button>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-xl p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

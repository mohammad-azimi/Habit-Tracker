import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

const VARIANT_CONFIG = {
  danger: {
    icon: ShieldAlert,
    iconWrap: "bg-red-950/40 ring-red-900/40",
    iconClass: "text-red-400",
    confirmButton:
      "bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-400/50",
    badge: "border-red-900/40 bg-red-950/20 text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-amber-950/40 ring-amber-900/40",
    iconClass: "text-amber-400",
    confirmButton:
      "bg-amber-500 text-black hover:bg-amber-400 focus-visible:ring-amber-300/50",
    badge: "border-amber-900/40 bg-amber-950/20 text-amber-300",
  },
  info: {
    icon: Info,
    iconWrap: "bg-violet-950/40 ring-violet-900/40",
    iconClass: "text-violet-300",
    confirmButton:
      "bg-violet-300 text-black hover:bg-violet-200 focus-visible:ring-violet-300/50",
    badge: "border-violet-900/40 bg-violet-950/20 text-violet-200",
  },
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-950/40 ring-emerald-900/40",
    iconClass: "text-emerald-300",
    confirmButton:
      "bg-emerald-400 text-black hover:bg-emerald-300 focus-visible:ring-emerald-300/50",
    badge: "border-emerald-900/40 bg-emerald-950/20 text-emerald-300",
  },
};

function getConfirmIcon(confirmLabel, variant) {
  const normalizedLabel = String(confirmLabel || "").toLowerCase();

  if (
    normalizedLabel.includes("restore") ||
    normalizedLabel.includes("reset")
  ) {
    return RotateCcw;
  }

  if (
    variant === "danger" ||
    normalizedLabel.includes("delete") ||
    normalizedLabel.includes("remove")
  ) {
    return Trash2;
  }

  if (variant === "success") {
    return CheckCircle2;
  }

  if (variant === "info") {
    return Info;
  }

  return AlertTriangle;
}

export default function ConfirmActionModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  helperText = "",
  requireTypedConfirmation = "",
  isSubmitting = false,
  onConfirm,
  onClose,
}) {
  const [typedValue, setTypedValue] = useState("");

  const safeVariant = VARIANT_CONFIG[variant] ? variant : "danger";
  const config = VARIANT_CONFIG[safeVariant];

  const MainIcon = config.icon;
  const ConfirmIcon = useMemo(
    () => getConfirmIcon(confirmLabel, safeVariant),
    [confirmLabel, safeVariant],
  );

  const normalizedRequiredText = String(requireTypedConfirmation || "").trim();
  const mustTypeText = Boolean(normalizedRequiredText);

  const isTypedConfirmationValid = !mustTypeText
    ? true
    : typedValue.trim() === normalizedRequiredText;

  const isConfirmDisabled = isSubmitting || !isTypedConfirmationValid;

  useEffect(() => {
    if (!isOpen) {
      setTypedValue("");
      return;
    }

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
    >
      <div className="theme-card w-full max-w-lg p-0 shadow-2xl">
        <div className="border-b border-white/5 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`shrink-0 rounded-2xl p-2 ring-1 ${config.iconWrap}`}
              >
                <MainIcon className={`h-5 w-5 ${config.iconClass}`} />
              </div>

              <div className="min-w-0">
                <div
                  id="confirm-action-title"
                  className="text-lg font-semibold text-white"
                >
                  {title}
                </div>

                <div className="mt-2 text-sm leading-6 text-neutral-400">
                  {message}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-2 text-neutral-300 transition duration-150 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Close confirmation modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          {helperText ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-xs leading-5 ${config.badge}`}
            >
              {helperText}
            </div>
          ) : null}

          {mustTypeText ? (
            <div>
              <label className="mb-2 block text-xs text-neutral-500">
                Type{" "}
                <span className="font-semibold text-neutral-300">
                  {normalizedRequiredText}
                </span>{" "}
                to confirm
              </label>

              <input
                value={typedValue}
                onChange={(event) => setTypedValue(event.target.value)}
                disabled={isSubmitting}
                className="theme-input"
                placeholder={normalizedRequiredText}
              />
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="theme-button-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition duration-150 focus:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:hover:bg-neutral-700 ${config.confirmButton}`}
            >
              <ConfirmIcon className="h-4 w-4" />
              {isSubmitting ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

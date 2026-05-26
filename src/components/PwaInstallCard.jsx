import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Info,
  MonitorSmartphone,
  Share2,
  Smartphone,
} from "lucide-react";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function getBrowserHint() {
  if (typeof window === "undefined")
    return "Install support depends on your browser.";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "On iPhone/iPad: tap Share, then choose Add to Home Screen.";
  }

  if (/android/.test(userAgent)) {
    return "On Android: use the Install button or the browser menu.";
  }

  return "On desktop: use the Install button or the browser install icon in the address bar.";
}

export default function PwaInstallCard() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());
  const [statusMessage, setStatusMessage] = useState("");

  const browserHint = useMemo(() => getBrowserHint(), []);

  const canInstall = Boolean(installPrompt) && !isInstalled;

  const handleInstall = async () => {
    if (!installPrompt) {
      setStatusMessage(
        "Install prompt is not available yet. Try the browser menu or refresh the page.",
      );
      return;
    }

    installPrompt.prompt();

    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setStatusMessage("Habit Tracker installation started.");
    } else {
      setStatusMessage("Installation was dismissed.");
    }

    setInstallPrompt(null);
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setStatusMessage("");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setStatusMessage("Habit Tracker is installed.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");

    const handleDisplayModeChange = () => {
      setIsInstalled(isStandaloneMode());
    };

    mediaQuery?.addEventListener?.("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery?.removeEventListener?.("change", handleDisplayModeChange);
    };
  }, []);

  return (
    <div className="theme-card p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="theme-section-title">Install App</div>
          <div className="theme-section-subtitle">
            Add Habit Tracker to your device for a more app-like experience.
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${
            isInstalled
              ? "border-emerald-900/40 bg-emerald-950/20 text-emerald-200"
              : "border-violet-900/40 bg-violet-950/20 text-violet-200"
          }`}
        >
          {isInstalled ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <MonitorSmartphone className="h-4 w-4" />
          )}
          {isInstalled ? "Installed" : "PWA Ready"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Smartphone className="h-4 w-4 text-violet-300" />
            App installation
          </div>

          <button
            type="button"
            onClick={handleInstall}
            disabled={!canInstall}
            className="theme-button-primary w-full disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            <Download className="h-4 w-4" />
            {isInstalled ? "Already Installed" : "Install Habit Tracker"}
          </button>

          <div className="mt-3 rounded-2xl border border-white/5 bg-black/10 px-3 py-3 text-xs leading-5 text-neutral-500">
            <div className="mb-1 flex items-center gap-2 font-medium text-neutral-300">
              <Info className="h-4 w-4 text-violet-300" />
              Install note
            </div>
            {canInstall
              ? "Your browser says Habit Tracker can be installed."
              : browserHint}
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Share2 className="h-4 w-4 text-violet-300" />
            Mobile tip
          </div>

          <div className="text-xs leading-5 text-neutral-500">
            If the install button is disabled on mobile, open the browser menu
            and choose{" "}
            <span className="text-neutral-300">Add to Home Screen</span>.
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-violet-900/40 bg-violet-950/20 px-4 py-3 text-xs leading-5 text-violet-200">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}

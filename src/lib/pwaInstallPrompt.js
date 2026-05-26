let deferredInstallPrompt = null;
let isInstalled = false;
const listeners = new Set();

function checkStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

function notifyListeners() {
  const snapshot = getPwaInstallSnapshot();

  listeners.forEach((listener) => {
    listener(snapshot);
  });
}

export function getPwaInstallSnapshot() {
  isInstalled = checkStandaloneMode();

  return {
    installPrompt: deferredInstallPrompt,
    isInstalled,
    canInstall: Boolean(deferredInstallPrompt) && !isInstalled,
  };
}

export function subscribePwaInstallPrompt(listener) {
  listeners.add(listener);

  listener(getPwaInstallSnapshot());

  return () => {
    listeners.delete(listener);
  };
}

export function initPwaInstallPrompt() {
  if (typeof window === "undefined") return;

  isInstalled = checkStandaloneMode();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    isInstalled = true;
    deferredInstallPrompt = null;
    notifyListeners();
  });

  const mediaQuery = window.matchMedia?.("(display-mode: standalone)");

  mediaQuery?.addEventListener?.("change", () => {
    isInstalled = checkStandaloneMode();

    if (isInstalled) {
      deferredInstallPrompt = null;
    }

    notifyListeners();
  });
}

export async function triggerPwaInstallPrompt() {
  if (!deferredInstallPrompt) {
    throw new Error("Install prompt is not available.");
  }

  deferredInstallPrompt.prompt();

  const choice = await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;
  notifyListeners();

  return choice;
}

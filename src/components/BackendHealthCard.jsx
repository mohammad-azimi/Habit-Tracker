import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Server } from "lucide-react";
import { checkApiHealth } from "../lib/api";

export default function BackendHealthCard() {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking backend connection...");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const checkHealth = async () => {
    try {
      setStatus("checking");
      setMessage("Checking backend connection...");

      const response = await checkApiHealth();

      setStatus("online");
      setMessage(response?.message || "Backend is running.");
      setLastCheckedAt(new Date());
    } catch (error) {
      console.error("Backend health check failed:", error);
      setStatus("offline");
      setMessage(
        "Backend is not responding. If the app is hosted on Render, it may be waking up.",
      );
      setLastCheckedAt(new Date());
    }
  };

  useEffect(() => {
    checkHealth();

    const intervalId = window.setInterval(() => {
      checkHealth();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const isOnline = status === "online";
  const isChecking = status === "checking";

  return (
    <div className="theme-card p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="theme-section-title text-lg">Backend Status</div>
          <div className="theme-section-subtitle text-xs">
            Checks if the API server is reachable.
          </div>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${
            isOnline
              ? "border-emerald-900/40 bg-emerald-950/20 text-emerald-200"
              : isChecking
                ? "border-violet-900/40 bg-violet-950/20 text-violet-200"
                : "border-red-900/40 bg-red-950/20 text-red-200"
          }`}
        >
          {isOnline ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isChecking ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}

          {isOnline ? "Online" : isChecking ? "Checking" : "Offline"}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Server className="h-4 w-4 text-violet-300" />
            API Connection
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/10 px-4 py-3">
            <div className="text-sm text-neutral-300">{message}</div>

            {lastCheckedAt ? (
              <div className="mt-2 text-xs text-neutral-600">
                Last checked: {lastCheckedAt.toLocaleTimeString()}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={checkHealth}
          disabled={isChecking}
          className="theme-button-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
          />
          Check Again
        </button>
      </div>
    </div>
  );
}

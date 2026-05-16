import React, { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";

export default function AuthScreen({
  onLogin,
  onRegister,
  isSubmitting,
  errorMessage,
}) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSwitchMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "login") {
      await onLogin({
        identifier,
        password,
      });
      return;
    }

    await onRegister({
      username,
      email,
      password,
    });
  };

  return (
    <div className="app-theme-bg flex min-h-screen items-center justify-center p-6">
      <div className="theme-card w-full max-w-md p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Habit Tracker
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in or create your account to load your personal dashboard.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={
              mode === "login"
                ? "theme-button-primary w-full"
                : "theme-button-secondary w-full"
            }
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("register")}
            className={
              mode === "register"
                ? "theme-button-primary w-full"
                : "theme-button-secondary w-full"
            }
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <>
              <div>
                <label className="mb-2 block text-xs text-neutral-500">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="theme-input px-4 py-3"
                  placeholder="mohammad"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-neutral-500">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="theme-input px-4 py-3"
                  placeholder="mohammad@example.com"
                  required
                />
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="mb-2 block text-xs text-neutral-500">
                Username or Email
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="theme-input px-4 py-3"
                placeholder="mohammad or mohammad@example.com"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Password
            </label>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                className="theme-input px-4 py-3 pr-12"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1 text-neutral-400 transition hover:bg-white/5 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="theme-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

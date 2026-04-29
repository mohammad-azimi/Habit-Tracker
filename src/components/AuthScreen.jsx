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
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Habit Tracker
          </h1>
          <p className="text-sm text-neutral-400 mt-2">
            Sign in or create your account to load your personal dashboard.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6">
          <button
            type="button"
            onClick={() => handleSwitchMode("login")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              mode === "login"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode("register")}
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              mode === "register"
                ? "bg-white text-black"
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
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
                <label className="block text-xs text-neutral-500 mb-2">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
                  placeholder="mohammad"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-2">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
                  placeholder="mohammad@example.com"
                  required
                />
              </div>
            </>
          )}

          {mode === "login" && (
            <div>
              <label className="block text-xs text-neutral-500 mb-2">
                Username or Email
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
                placeholder="mohammad or mohammad@example.com"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-neutral-500 mb-2">
              Password
            </label>

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 pr-12 py-3 text-sm outline-none"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-1 text-neutral-400 hover:bg-white/5 hover:text-white"
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
            <div className="rounded-2xl bg-red-950/40 border border-red-900 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-white text-black hover:bg-neutral-200 disabled:opacity-60 px-4 py-3 text-sm font-medium"
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

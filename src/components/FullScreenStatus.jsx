import React from "react";

export default function FullScreenStatus({ message }) {
  return (
    <div className="app-theme-bg flex min-h-screen items-center justify-center px-4">
      <div className="theme-card px-6 py-4 text-center text-white">
        {message}
      </div>
    </div>
  );
}

import React from "react";

export default function FullScreenStatus({ message }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 px-6 py-4 shadow-2xl">
        {message}
      </div>
    </div>
  );
}

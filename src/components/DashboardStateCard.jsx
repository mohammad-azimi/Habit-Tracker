import React from "react";
import { Inbox } from "lucide-react";

export default function DashboardStateCard({
  title,
  description,
  compact = false,
}) {
  return (
    <div
      className={`rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl text-center ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800">
        <Inbox className="h-5 w-5 text-neutral-400" />
      </div>

      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-2 text-xs leading-5 text-neutral-500">
        {description}
      </div>
    </div>
  );
}

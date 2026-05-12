import React from "react";
import { Sparkles } from "lucide-react";

export default function HabitTemplatesCard({ templates, onApplyTemplate }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
          <Sparkles className="h-4 w-4" />
          Habit Templates
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Quickly add a ready-made habit set to this month
        </div>
      </div>

      <div className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-800/60 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white">
                  {template.title}
                </div>
                <div className="mt-1 text-xs leading-5 text-neutral-500">
                  {template.description}
                </div>
                <div className="mt-2 text-[11px] text-neutral-400">
                  {template.habits.length} habits
                </div>
              </div>

              <button
                onClick={() => onApplyTemplate(template)}
                className="shrink-0 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-200"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import {
  BookmarkPlus,
  Download,
  FolderUp,
  Sparkles,
  Trash2,
} from "lucide-react";

export default function HabitTemplatesCard({
  templates,
  onApplyTemplate,
  onSaveCurrentTemplate,
  onDeleteTemplate,
  onExportCustomTemplates,
  onImportCustomTemplates,
}) {
  return (
    <div className="theme-card p-5 space-y-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Sparkles className="h-4 w-4 text-neutral-400" />
            Habit Templates
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Quickly add a ready-made habit set to this month
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSaveCurrentTemplate}
            className="theme-button-primary px-3 py-2 text-xs font-medium"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save Current
          </button>

          <button
            onClick={onExportCustomTemplates}
            className="theme-button-secondary px-3 py-2 text-xs font-medium"
          >
            <Download className="h-3.5 w-3.5" />
            Export Custom
          </button>

          <button
            onClick={onImportCustomTemplates}
            className="theme-button-secondary px-3 py-2 text-xs font-medium"
          >
            <FolderUp className="h-3.5 w-3.5" />
            Import Custom
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              className="theme-summary-card p-4 transition duration-150 hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium text-white">
                      {template.title}
                    </div>

                    <div
                      className={`rounded-xl border px-2 py-1 text-[10px] font-medium ${
                        template.isCustom
                          ? "border-blue-900/40 bg-blue-950/40 text-blue-300"
                          : "border-white/5 bg-black/25 text-neutral-400"
                      }`}
                    >
                      {template.isCustom ? "Custom" : "Built-in"}
                    </div>
                  </div>

                  <div className="mt-1 text-xs leading-5 text-neutral-500">
                    {template.description}
                  </div>

                  <div className="mt-2 text-[11px] text-neutral-400">
                    {template.habits.length} habits
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {template.isCustom ? (
                    <button
                      onClick={() => onDeleteTemplate?.(template.id)}
                      className="rounded-2xl bg-black/30 p-2 text-neutral-300 transition hover:bg-red-900 hover:text-white"
                      title="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <button
                    onClick={() => onApplyTemplate(template)}
                    className="theme-button-primary shrink-0 px-3 py-2 text-xs font-medium"
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="theme-summary-card p-4 text-sm text-neutral-400">
            No templates available yet
          </div>
        )}
      </div>
    </div>
  );
}

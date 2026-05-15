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
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl space-y-3">
      <div className="flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
            <Sparkles className="h-4 w-4" />
            Habit Templates
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Quickly add a ready-made habit set to this month
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSaveCurrentTemplate}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-200 active:scale-[0.98] transition duration-150"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save Current
          </button>

          <button
            onClick={onExportCustomTemplates}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-neutral-800 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-700 active:scale-[0.98] transition duration-150"
          >
            <Download className="h-3.5 w-3.5" />
            Export Custom
          </button>

          <button
            onClick={onImportCustomTemplates}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-neutral-800 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-700 active:scale-[0.98] transition duration-150"
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
              className="rounded-2xl border border-neutral-800 bg-neutral-800/60 p-4 transition duration-150 hover:border-neutral-700 hover:bg-neutral-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-medium text-white">
                      {template.title}
                    </div>

                    <div
                      className={`rounded-xl px-2 py-1 text-[10px] font-medium ${
                        template.isCustom
                          ? "bg-blue-950/40 text-blue-300 border border-blue-900/40"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
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
                      className="rounded-2xl bg-neutral-900 p-2 text-neutral-300 hover:bg-red-900 hover:text-white"
                      title="Delete template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}

                  <button
                    onClick={() => onApplyTemplate(template)}
                    className="shrink-0 rounded-2xl bg-white px-3 py-2 text-xs font-medium text-black hover:bg-neutral-200 active:scale-[0.98] transition duration-150"
                  >
                    Use
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-800/60 p-4 text-sm text-neutral-400">
            No templates available yet
          </div>
        )}
      </div>
    </div>
  );
}

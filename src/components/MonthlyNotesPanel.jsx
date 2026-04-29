import React from "react";
import { NotebookPen } from "lucide-react";

export default function MonthlyNotesPanel({ notes, onChangeNotes }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="flex items-center gap-2 mb-4">
        <NotebookPen className="h-4 w-4 text-neutral-400" />
        <div>
          <div className="font-semibold">Monthly Notes</div>
          <div className="text-xs text-neutral-500 mt-1">
            Write reflections, wins, problems, or ideas for the next month
          </div>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        placeholder="Write your notes for this month..."
        className="w-full min-h-[180px] rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white outline-none resize-y"
      />

      <div className="mt-3 text-xs text-neutral-500">
        These notes are saved automatically with your monthly dashboard.
      </div>
    </div>
  );
}

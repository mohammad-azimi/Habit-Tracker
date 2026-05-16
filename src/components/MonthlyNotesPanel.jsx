import React from "react";
import { NotebookPen } from "lucide-react";

export default function MonthlyNotesPanel({ notes, onChangeNotes }) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="theme-card-muted p-2">
          <NotebookPen className="h-4 w-4 text-neutral-400" />
        </div>

        <div>
          <div className="theme-section-title text-lg">Monthly Notes</div>
          <div className="theme-section-subtitle text-xs">
            Write reflections, wins, problems, or ideas for the next month
          </div>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => onChangeNotes(e.target.value)}
        placeholder="Write your notes for this month..."
        className="theme-textarea min-h-[180px] resize-y"
      />

      <div className="mt-3 text-xs text-neutral-500">
        These notes are saved automatically with your monthly dashboard.
      </div>
    </div>
  );
}

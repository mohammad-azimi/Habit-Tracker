import React from "react";
import { Flag, Target, TriangleAlert } from "lucide-react";

function ReviewField({ icon, label, value, placeholder, onChange }) {
  return (
    <div className="rounded-2xl bg-neutral-800 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-neutral-200 mb-3">
        {icon}
        {label}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-2xl bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm outline-none resize-none"
      />
    </div>
  );
}

export default function MonthlyReviewCard({ review, onChangeField }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
      <div className="mb-4">
        <div className="font-semibold">Monthly Review</div>
        <div className="text-xs text-neutral-500 mt-1">
          Capture wins, blockers, and your focus for next month
        </div>
      </div>

      <div className="space-y-3">
        <ReviewField
          icon={<Flag className="h-4 w-4 text-neutral-400" />}
          label="Wins"
          value={review?.wins || ""}
          placeholder="What went well this month?"
          onChange={(value) => onChangeField("wins", value)}
        />

        <ReviewField
          icon={<TriangleAlert className="h-4 w-4 text-neutral-400" />}
          label="Blockers"
          value={review?.blockers || ""}
          placeholder="What held you back this month?"
          onChange={(value) => onChangeField("blockers", value)}
        />

        <ReviewField
          icon={<Target className="h-4 w-4 text-neutral-400" />}
          label="Next Month Focus"
          value={review?.nextFocus || ""}
          placeholder="What should you focus on next month?"
          onChange={(value) => onChangeField("nextFocus", value)}
        />
      </div>
    </div>
  );
}

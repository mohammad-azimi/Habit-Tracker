import React from "react";
import { Flag, Target, TriangleAlert } from "lucide-react";

function ReviewField({ icon, label, value, placeholder, onChange }) {
  return (
    <div className="theme-summary-card p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-200">
        {icon}
        {label}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="theme-textarea resize-none"
      />
    </div>
  );
}

export default function MonthlyReviewCard({ review, onChangeField }) {
  return (
    <div className="theme-card p-5">
      <div className="mb-4">
        <div className="theme-section-title text-lg">Monthly Review</div>
        <div className="theme-section-subtitle text-xs">
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

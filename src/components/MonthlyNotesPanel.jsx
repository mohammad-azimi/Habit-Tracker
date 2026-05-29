import React, { useMemo, useState } from "react";
import {
  Code2,
  Edit3,
  Eye,
  FileText,
  Heading1,
  Image,
  Link,
  ListChecks,
  Quote,
  Table2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const markdownTips = [
  {
    icon: Heading1,
    label: "# Heading",
  },
  {
    icon: ListChecks,
    label: "- [ ] Task",
  },
  {
    icon: Quote,
    label: "> Quote",
  },
  {
    icon: Code2,
    label: "`code`",
  },
  {
    icon: Link,
    label: "[link](url)",
  },
  {
    icon: Image,
    label: "![image](url)",
  },
  {
    icon: Table2,
    label: "Tables",
  },
];

function getPreviewText(notes) {
  const value = String(notes || "").trim();

  if (value) return value;

  return `# Monthly Notes

Write your notes using **Markdown**.

## Ideas

- What went well?
- What should improve next month?
- Which habits need more focus?

## Task list

- [ ] Review weak habits
- [ ] Plan next month
- [ ] Update habit goals

> Your markdown preview will appear here.`;
}

export default function MonthlyNotesPanel({ notes, onChangeNotes }) {
  const [mode, setMode] = useState("edit");

  const previewText = useMemo(() => getPreviewText(notes), [notes]);

  return (
    <div className="theme-card p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="theme-card-muted p-2">
            <FileText className="h-4 w-4 text-violet-300" />
          </div>

          <div>
            <div className="theme-section-title text-lg">Monthly Notes</div>
            <div className="theme-section-subtitle text-xs">
              Write reflections, wins, problems, or ideas using Markdown.
            </div>
          </div>
        </div>

        <div className="inline-flex w-fit rounded-2xl border border-white/5 bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              mode === "edit"
                ? "bg-violet-300 text-black"
                : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition ${
              mode === "preview"
                ? "bg-violet-300 text-black"
                : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {markdownTips.map((tip) => {
          const Icon = tip.icon;

          return (
            <div
              key={tip.label}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-neutral-400"
            >
              <Icon className="h-3.5 w-3.5 text-violet-300" />
              {tip.label}
            </div>
          );
        })}
      </div>

      {mode === "edit" ? (
        <div>
          <textarea
            value={notes || ""}
            onChange={(event) => onChangeNotes(event.target.value)}
            placeholder={`# Monthly Notes

Write your notes here...

## Wins
- 

## Problems
- 

## Next Month
- [ ] `}
            className="theme-textarea min-h-[320px] w-full resize-y font-mono text-sm leading-6"
          />

          <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-xs leading-5 text-neutral-500">
            Supports GitHub-style Markdown: headings, bold text, links, lists,
            checkboxes, tables, quotes, and code blocks.
          </div>
        </div>
      ) : (
        <div className="markdown-preview rounded-3xl border border-white/5 bg-white/[0.03] px-5 py-5">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {previewText}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

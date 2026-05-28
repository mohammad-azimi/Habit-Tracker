import React from "react";
import {
  Archive,
  CalendarDays,
  ClipboardList,
  Grid3X3,
  LayoutTemplate,
} from "lucide-react";

const sections = [
  {
    id: "today",
    label: "Today",
    icon: CalendarDays,
  },
  {
    id: "habits",
    label: "Habits",
    icon: Grid3X3,
  },
  {
    id: "planning",
    label: "Planning",
    icon: ClipboardList,
  },
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
  },
];

export default function DashboardSectionTabs({
  activeSection,
  onChangeSection,
}) {
  return (
    <div className="theme-card p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChangeSection(section.id)}
              className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] ${
                isActive
                  ? "bg-violet-300 text-black"
                  : "border border-neutral-700 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

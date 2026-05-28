import React from "react";
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  LineChart,
  Server,
  Target,
} from "lucide-react";

const sections = [
  {
    id: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    id: "progress",
    label: "Progress",
    icon: LineChart,
  },
  {
    id: "habits",
    label: "Habits",
    icon: Target,
  },
  {
    id: "mental",
    label: "Mental",
    icon: Brain,
  },
  {
    id: "achievements",
    label: "Badges",
    icon: Award,
  },
  {
    id: "reminders",
    label: "Reminders",
    icon: Activity,
  },
  {
    id: "system",
    label: "System",
    icon: Server,
  },
];

export default function AnalyticsSectionTabs({
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

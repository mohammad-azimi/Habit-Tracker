import React, { useEffect, useRef, useState } from "react";
import {
  CalendarPlus,
  ChevronDown,
  Copy,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FolderUp,
} from "lucide-react";

export default function DashboardHeader({
  onExportCSV,
  onExportJSON,
  onExportBackup,
  onImportBackup,
  onExportPrintableHTML,
  onExportPDF,
  onCopyToNextMonth,
  onOpenCopyToMonth,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    closeMenu();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (file && onImportBackup) {
      await onImportBackup(file);
    }
    event.target.value = "";
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menuSections = [
    {
      title: "Export",
      items: [
        {
          label: "Export CSV",
          icon: FileSpreadsheet,
          onClick: () => {
            onExportCSV?.();
            closeMenu();
          },
        },
        {
          label: "Export JSON",
          icon: FileJson,
          onClick: () => {
            onExportJSON?.();
            closeMenu();
          },
        },
        {
          label: "Printable HTML",
          icon: FileText,
          onClick: () => {
            onExportPrintableHTML?.();
            closeMenu();
          },
        },
        {
          label: "Export PDF",
          icon: Download,
          onClick: () => {
            onExportPDF?.();
            closeMenu();
          },
        },
        {
          label: "Backup JSON",
          icon: Database,
          onClick: () => {
            onExportBackup?.();
            closeMenu();
          },
        },
      ],
    },
    {
      title: "Actions",
      items: [
        {
          label: "Copy to Next Month",
          icon: Copy,
          onClick: () => {
            onCopyToNextMonth?.();
            closeMenu();
          },
        },
        {
          label: "Copy to Any Month",
          icon: CalendarPlus,
          onClick: () => {
            onOpenCopyToMonth?.();
            closeMenu();
          },
        },
        {
          label: "Import Backup",
          icon: FolderUp,
          onClick: handleImportClick,
        },
      ],
    },
  ];

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Habit Tracker Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-base text-neutral-400">
          Track habits, analyze progress, and export monthly reports.
        </p>
      </div>

      <div className="relative self-start" ref={menuRef}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={toggleMenu}
          className="inline-flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm font-medium hover:bg-neutral-700"
        >
          <Download className="h-4 w-4" />
          Export & Actions
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="border-b border-neutral-800 px-4 py-3">
              <div className="text-sm font-semibold text-white">
                Export & Actions
              </div>
              <div className="mt-1 text-xs text-neutral-500">
                Choose a report format or manage monthly data.
              </div>
            </div>

            <div className="py-2">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {sectionIndex > 0 && (
                    <div className="mx-3 my-2 h-px bg-neutral-800" />
                  )}

                  <div className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {section.title}
                  </div>

                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-neutral-200 transition hover:bg-neutral-800"
                      >
                        <Icon className="h-4 w-4 text-neutral-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

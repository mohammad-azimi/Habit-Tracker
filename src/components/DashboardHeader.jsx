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
  onExportFilteredCSV,
  onExportFilteredJSON,
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
          label: "Export PDF",
          description: "Download the styled monthly report as PDF.",
          icon: Download,
          onClick: () => {
            onExportPDF?.();
            closeMenu();
          },
        },
        {
          label: "Export CSV",
          description: "Download habit performance as spreadsheet data.",
          icon: FileSpreadsheet,
          onClick: () => {
            onExportCSV?.();
            closeMenu();
          },
        },
        {
          label: "Export JSON",
          description: "Download the current monthly report as raw JSON.",
          icon: FileJson,
          onClick: () => {
            onExportJSON?.();
            closeMenu();
          },
        },
        {
          label: "Export Filtered CSV",
          description:
            "Download only the habits shown in your current filtered view.",
          icon: FileSpreadsheet,
          onClick: () => {
            onExportFilteredCSV?.();
            closeMenu();
          },
        },
        {
          label: "Export Filtered JSON",
          description:
            "Download only the habits shown in your current filtered view.",
          icon: FileJson,
          onClick: () => {
            onExportFilteredJSON?.();
            closeMenu();
          },
        },
        {
          label: "Printable HTML",
          description: "Open a print-friendly HTML version of the report.",
          icon: FileText,
          onClick: () => {
            onExportPrintableHTML?.();
            closeMenu();
          },
        },
        {
          label: "Backup JSON",
          description: "Save a backup of your current dashboard data.",
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
          description: "Duplicate your current setup into the next month.",
          icon: Copy,
          onClick: () => {
            onCopyToNextMonth?.();
            closeMenu();
          },
        },
        {
          label: "Copy to Any Month",
          description: "Copy your current setup into a chosen month.",
          icon: CalendarPlus,
          onClick: () => {
            onOpenCopyToMonth?.();
            closeMenu();
          },
        },
        {
          label: "Import Backup",
          description: "Restore dashboard data from a backup file.",
          icon: FolderUp,
          onClick: handleImportClick,
        },
      ],
    },
  ];

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between overflow-visible">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Habit Tracker Dashboard
        </h1>
        <p className="mt-3 max-w-xl text-base text-neutral-400">
          Track your habits, review progress, and export monthly reports.
        </p>
      </div>

      <div className="relative self-start overflow-visible" ref={menuRef}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileChange}
        />

        <button onClick={toggleMenu} className="theme-button-secondary">
          <Download className="h-4 w-4" />
          Export & Actions
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen && (
          <div className="theme-card fixed inset-x-4 top-24 z-[100] max-h-[70vh] overflow-y-auto p-0 shadow-2xl transition duration-150 animate-[fadeIn_.15s_ease-out] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[24rem] sm:max-h-[32rem]">
            <div className="border-b border-white/5 px-5 py-4">
              <div className="theme-section-title text-base">
                Export & Actions
              </div>
              <div className="theme-section-subtitle text-xs leading-5">
                Export reports, manage backups, and reuse your monthly setup.
              </div>
            </div>

            <div className="py-2">
              {menuSections.map((section, sectionIndex) => (
                <div key={section.title}>
                  {sectionIndex > 0 && (
                    <div className="mx-4 my-2 h-px bg-white/5" />
                  )}

                  <div className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    {section.title}
                  </div>

                  {section.items.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="flex w-full items-start gap-3 px-5 py-3 text-left text-sm text-neutral-200 transition duration-150 hover:bg-white/[0.04] active:scale-[0.995]"
                      >
                        <div className="theme-card-muted mt-0.5 shrink-0 p-2">
                          <Icon className="h-4 w-4 text-neutral-300" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-white">
                            {item.label}
                          </div>
                          <div className="mt-1 text-xs leading-5 text-neutral-500">
                            {item.description}
                          </div>
                        </div>
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

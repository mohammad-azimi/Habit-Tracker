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
  ShieldCheck,
  X,
} from "lucide-react";

export default function DashboardHeader({
  title = "Habit Tracker Dashboard",
  subtitle = "Track your habits, review progress, and export monthly reports.",
  actionButtonLabel = "Export & Actions",
  onExportCSV,
  onExportJSON,
  onExportFilteredCSV,
  onExportFilteredJSON,
  onExportAllMonths,
  onExportAccountData,
  onImportAccountData,
  onExportBackup,
  onImportBackup,
  onExportPrintableHTML,
  onExportPDF,
  onCopyToNextMonth,
  onOpenCopyToMonth,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const backupFileInputRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleImportBackupClick = () => {
    backupFileInputRef.current?.click();
    closeMenu();
  };

  const handleBackupFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (file && onImportBackup) {
      await onImportBackup(file);
    }

    event.target.value = "";
  };

  const handleImportAccountClick = () => {
    onImportAccountData?.();
    closeMenu();
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
          label: "Export All Months",
          description:
            "Download all saved months from your account as one JSON file.",
          icon: Database,
          onClick: () => {
            onExportAllMonths?.();
            closeMenu();
          },
        },
        {
          label: "Export Account Data",
          description:
            "Download your full account data including profile and all months.",
          icon: ShieldCheck,
          onClick: () => {
            onExportAccountData?.();
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
          label: "Import Account Data",
          description:
            "Restore profile and month data from a full account export file.",
          icon: ShieldCheck,
          onClick: handleImportAccountClick,
        },
        {
          label: "Import Backup",
          description: "Restore dashboard data from a backup file.",
          icon: FolderUp,
          onClick: handleImportBackupClick,
        },
      ],
    },
  ];

  return (
    <div className="mb-4 flex flex-col gap-4 overflow-visible sm:mb-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl">
          {title}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-400 sm:mt-3 sm:text-base sm:leading-7">
          {subtitle}
        </p>
      </div>

      <div
        className="relative w-full self-start overflow-visible sm:w-auto"
        ref={menuRef}
      >
        <input
          ref={backupFileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleBackupFileChange}
        />

        <button
          type="button"
          onClick={toggleMenu}
          className="theme-button-secondary w-full justify-between whitespace-nowrap sm:w-auto sm:justify-center"
          aria-expanded={isMenuOpen}
        >
          <span className="inline-flex items-center gap-2">
            <Download className="h-4 w-4" />
            {actionButtonLabel}
          </span>

          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen ? (
          <>
            <button
              type="button"
              aria-label="Close export menu"
              onClick={closeMenu}
              className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-sm sm:hidden"
            />

            <div className="theme-card fixed inset-x-3 bottom-24 z-[100] max-h-[72vh] overflow-hidden p-0 shadow-2xl transition duration-150 animate-[fadeIn_.15s_ease-out] sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[24rem] sm:max-h-[32rem]">
              <div className="flex items-start justify-between gap-3 border-b border-white/5 px-5 py-4">
                <div>
                  <div className="theme-section-title text-base">
                    Export & Actions
                  </div>
                  <div className="theme-section-subtitle text-xs leading-5">
                    Export reports, manage backups, and reuse your monthly
                    setup.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMenu}
                  className="rounded-2xl bg-white/[0.04] p-2 text-neutral-400 ring-1 ring-white/5 transition hover:bg-white/[0.08] hover:text-white sm:hidden"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[calc(72vh-88px)] overflow-y-auto py-2 sm:max-h-[26rem]">
                {menuSections.map((section, sectionIndex) => (
                  <div key={section.title}>
                    {sectionIndex > 0 ? (
                      <div className="mx-4 my-2 h-px bg-white/5" />
                    ) : null}

                    <div className="px-5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      {section.title}
                    </div>

                    {section.items.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
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
          </>
        ) : null}
      </div>
    </div>
  );
}

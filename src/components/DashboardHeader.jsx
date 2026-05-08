import React, { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FolderUp,
  Copy,
  CalendarPlus,
  Database,
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

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      label: "Export CSV",
      icon: <FileSpreadsheet className="h-4 w-4" />,
      onClick: () => {
        onExportCSV();
        closeMenu();
      },
    },
    {
      label: "Export JSON",
      icon: <FileJson className="h-4 w-4" />,
      onClick: () => {
        onExportJSON();
        closeMenu();
      },
    },
    {
      label: "Printable HTML",
      icon: <FileText className="h-4 w-4" />,
      onClick: () => {
        onExportPrintableHTML();
        closeMenu();
      },
    },
    {
      label: "Export PDF",
      icon: <Download className="h-4 w-4" />,
      onClick: () => {
        onExportPDF();
        closeMenu();
      },
    },
    {
      label: "Copy to Next Month",
      icon: <Copy className="h-4 w-4" />,
      onClick: () => {
        onCopyToNextMonth();
        closeMenu();
      },
    },
    {
      label: "Copy to Any Month",
      icon: <CalendarPlus className="h-4 w-4" />,
      onClick: () => {
        onOpenCopyToMonth();
        closeMenu();
      },
    },
    {
      label: "Backup JSON",
      icon: <Database className="h-4 w-4" />,
      onClick: () => {
        onExportBackup();
        closeMenu();
      },
    },
    {
      label: "Import Backup",
      icon: <FolderUp className="h-4 w-4" />,
      onClick: handleImportClick,
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
          Habit Tracker Dashboard
        </h1>
        <p className="mt-3 text-base text-neutral-400 max-w-xl">
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
          className="inline-flex items-center gap-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium border border-neutral-700"
        >
          <Download className="h-4 w-4" />
          Export & Actions
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden z-50">
            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 border-b border-neutral-800">
              Export & Actions
            </div>

            <div className="py-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-neutral-200 hover:bg-neutral-800 transition"
                >
                  <span className="text-neutral-400">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

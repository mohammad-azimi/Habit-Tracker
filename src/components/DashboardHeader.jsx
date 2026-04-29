import React, { useRef } from "react";
import {
  CalendarDays,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  HardDriveUpload,
  Printer,
} from "lucide-react";

export default function DashboardHeader({
  onExportCSV,
  onExportJSON,
  onExportBackup,
  onImportBackup,
  onExportPrintableHTML,
  onCopyToNextMonth,
  onOpenCopyToMonth,
}) {
  const fileInputRef = useRef(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onImportBackup(file);
    event.target.value = "";
  };

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Habit Tracker Dashboard
        </h1>
        <p className="text-sm md:text-base text-neutral-400 mt-2">
          Track habits, analyze progress, and export monthly reports.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExportCSV}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export CSV
        </button>

        <button
          onClick={onExportJSON}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <FileText className="h-4 w-4" />
          Export JSON
        </button>

        <button
          onClick={onExportPrintableHTML}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <Printer className="h-4 w-4" />
          Printable HTML
        </button>

        <button
          onClick={onCopyToNextMonth}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <Copy className="h-4 w-4" />
          Copy to Next Month
        </button>

        <button
          onClick={onOpenCopyToMonth}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <CalendarDays className="h-4 w-4" />
          Copy to Any Month
        </button>

        <button
          onClick={onExportBackup}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <Download className="h-4 w-4" />
          Backup JSON
        </button>

        <button
          onClick={handlePickFile}
          className="rounded-2xl bg-white text-black hover:bg-neutral-200 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <HardDriveUpload className="h-4 w-4" />
          Import Backup
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

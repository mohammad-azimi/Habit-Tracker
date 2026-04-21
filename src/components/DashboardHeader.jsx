import React, { useRef } from "react";
import { Download, FileSpreadsheet, FileText, Upload } from "lucide-react";

export default function DashboardHeader({
  onExportCSV,
  onExportJSON,
  onExportBackup,
  onImportBackup,
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onImportBackup(file);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Habit Tracker
        </h1>
        <p className="mt-2 text-sm md:text-base text-neutral-400">
          Interactive monthly tracking, analytics, and export-ready reports.
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
          Export Month JSON
        </button>

        <button
          onClick={onExportBackup}
          className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <Download className="h-4 w-4" />
          Full Backup
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl bg-white text-black hover:bg-neutral-200 px-4 py-3 text-sm font-medium flex items-center gap-2 shadow-lg"
        >
          <Upload className="h-4 w-4" />
          Import Backup
        </button>
      </div>
    </div>
  );
}

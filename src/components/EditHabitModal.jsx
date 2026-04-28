import React from "react";
import { Pencil, Save, X } from "lucide-react";

export default function EditHabitModal({
  isOpen,
  habitName,
  habitIcon,
  onChangeName,
  onChangeIcon,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-lg font-semibold flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Habit
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              Change the habit name and icon
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-neutral-800 hover:bg-neutral-700 p-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-2">
              Habit Name
            </label>
            <input
              value={habitName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Habit name"
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-2">
              Habit Icon
            </label>
            <input
              value={habitIcon}
              onChange={(e) => onChangeIcon(e.target.value)}
              placeholder="Icon, e.g. ✅"
              className="w-full rounded-2xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-neutral-800 hover:bg-neutral-700 px-4 py-3 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="flex-1 rounded-2xl bg-white text-black hover:bg-neutral-200 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

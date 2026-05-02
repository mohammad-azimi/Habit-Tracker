import React from "react";
import { Pencil, Save, X } from "lucide-react";

export default function EditHabitModal({
  isOpen,
  habitName,
  habitIcon,
  habitTargetType,
  habitTargetValue,
  onChangeName,
  onChangeIcon,
  onChangeTargetType,
  onChangeTargetValue,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Pencil className="h-5 w-5" />
              Edit Habit
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              Change the habit name, icon, and flexible goal settings
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-neutral-800 p-2 hover:bg-neutral-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Habit Name
            </label>
            <input
              value={habitName}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="Habit name"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Habit Icon
            </label>
            <input
              value={habitIcon}
              onChange={(e) => onChangeIcon(e.target.value)}
              placeholder="Icon, e.g. ✅"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Target Type
            </label>
            <select
              value={habitTargetType}
              onChange={(e) => onChangeTargetType(e.target.value)}
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Target Value
            </label>
            <input
              type="number"
              min="1"
              value={habitTargetValue}
              onChange={(e) => onChangeTargetValue(e.target.value)}
              placeholder="1"
              className="w-full rounded-2xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-neutral-800 px-4 py-3 text-sm font-medium hover:bg-neutral-700"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black hover:bg-neutral-200"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

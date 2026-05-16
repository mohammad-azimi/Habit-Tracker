import React from "react";
import { Pencil, Save, X } from "lucide-react";

export default function EditHabitModal({
  isOpen,
  habitName,
  habitIcon,
  habitTargetType,
  habitTargetValue,
  errorMessage,
  isSaveDisabled,
  onChangeName,
  onChangeIcon,
  onChangeTargetType,
  onChangeTargetValue,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="theme-card w-full max-w-md p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              <Pencil className="h-5 w-5" />
              Edit Habit
            </div>
            <div className="mt-1 text-sm text-neutral-400">
              Change the habit name, icon, and flexible goal settings
            </div>
          </div>

          <button onClick={onClose} className="theme-button-secondary p-2">
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
              className="theme-input px-4 py-3"
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
              className="theme-input px-4 py-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs text-neutral-500">
              Target Type
            </label>
            <select
              value={habitTargetType}
              onChange={(e) => onChangeTargetType(e.target.value)}
              className="theme-select px-4 py-3"
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
              className="theme-input px-4 py-3"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-900/40 bg-red-950/20 px-4 py-3 text-xs text-red-300">
            {errorMessage}
          </div>
        ) : (
          <div className="mt-4 text-xs text-neutral-500">
            Use a unique habit name and a target value of at least 1.
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="theme-button-secondary flex-1">
            Cancel
          </button>

          <button
            onClick={onSave}
            disabled={isSaveDisabled}
            className="theme-button-primary flex-1 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

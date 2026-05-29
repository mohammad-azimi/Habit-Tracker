export function getHabitStatus(progress) {
  const safeProgress = Number(progress) || 0;

  if (safeProgress >= 80) {
    return {
      label: "Excellent",
      tone: "excellent",
    };
  }

  if (safeProgress >= 40) {
    return {
      label: "In Progress",
      tone: "progress",
    };
  }

  return {
    label: "Needs Focus",
    tone: "focus",
  };
}

export function getHabitStatusBadgeClasses(progress) {
  const { tone } = getHabitStatus(progress);

  if (tone === "excellent") {
    return "border border-emerald-500/35 bg-emerald-500/15 text-emerald-300";
  }

  if (tone === "progress") {
    return "border border-orange-500/35 bg-orange-500/15 text-orange-300";
  }

  return "border border-red-500/35 bg-red-500/15 text-red-300";
}

export function getHabitProgressBarClasses(progress) {
  const { tone } = getHabitStatus(progress);

  if (tone === "excellent") {
    return "bg-emerald-300";
  }

  if (tone === "progress") {
    return "bg-orange-300";
  }

  return "bg-red-300";
}

export function getHabitProgressTextClasses(progress) {
  const { tone } = getHabitStatus(progress);

  if (tone === "excellent") {
    return "text-emerald-300";
  }

  if (tone === "progress") {
    return "text-orange-300";
  }

  return "text-red-300";
}

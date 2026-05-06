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
    return "bg-green-500/15 text-green-300 border border-green-500/30";
  }

  if (tone === "progress") {
    return "bg-orange-500/15 text-orange-300 border border-orange-500/30";
  }

  return "bg-red-500/15 text-red-300 border border-red-500/30";
}

export function getHabitProgressBarClasses(progress) {
  const { tone } = getHabitStatus(progress);

  if (tone === "excellent") {
    return "bg-green-300";
  }

  if (tone === "progress") {
    return "bg-orange-300";
  }

  return "bg-red-300";
}

export function getHabitProgressTextClasses(progress) {
  const { tone } = getHabitStatus(progress);

  if (tone === "excellent") {
    return "text-green-300";
  }

  if (tone === "progress") {
    return "text-orange-300";
  }

  return "text-red-300";
}

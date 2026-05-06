export function normalizeGoalType(targetType) {
  const safeType = String(targetType || "daily").toLowerCase();

  if (safeType === "weekly" || safeType === "monthly") {
    return safeType;
  }

  return "daily";
}

export function normalizeGoalValue(targetValue) {
  return Math.max(1, Number(targetValue || 1));
}

export function formatGoalTypeLabel(targetType, targetValue) {
  const safeType = normalizeGoalType(targetType);
  const safeValue = normalizeGoalValue(targetValue);

  if (safeType === "daily") {
    return `Daily • ${safeValue}x/day`;
  }

  if (safeType === "weekly") {
    return `Weekly • ${safeValue}x/week`;
  }

  return `Monthly • ${safeValue}x/month`;
}

export function formatGoalTypeShortLabel(targetType, targetValue) {
  const safeType = normalizeGoalType(targetType);
  const safeValue = normalizeGoalValue(targetValue);

  if (safeType === "daily") {
    return `${safeValue}x/day`;
  }

  if (safeType === "weekly") {
    return `${safeValue}x/week`;
  }

  return `${safeValue}x/month`;
}

export function getGoalTypeBadgeClasses(targetType) {
  const safeType = normalizeGoalType(targetType);

  if (safeType === "daily") {
    return "border-emerald-700/60 bg-emerald-950/40 text-emerald-300";
  }

  if (safeType === "weekly") {
    return "border-sky-700/60 bg-sky-950/40 text-sky-300";
  }

  return "border-violet-700/60 bg-violet-950/40 text-violet-300";
}

export function formatGoalTypeLongLabel(targetType, targetValue) {
  const safeType = String(targetType || "daily").toLowerCase();
  const safeValue = Math.max(1, Number(targetValue || 1));

  if (safeType === "daily") {
    return `${safeValue} time${safeValue === 1 ? "" : "s"} per day`;
  }

  if (safeType === "weekly") {
    return `${safeValue} time${safeValue === 1 ? "" : "s"} per week`;
  }

  if (safeType === "monthly") {
    return `${safeValue} time${safeValue === 1 ? "" : "s"} per month`;
  }

  return `${safeValue} time${safeValue === 1 ? "" : "s"} per day`;
}
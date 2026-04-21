export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAY_LABELS = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];

export function createMonthKey(year, monthIndex) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export function getDaysInMonth(year, monthIndex) {
  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

export function getWeekRanges(daysInMonth) {
  const ranges = [];
  for (let start = 0; start < daysInMonth; start += 7) {
    ranges.push([start, Math.min(start + 7, daysInMonth)]);
  }
  return ranges;
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function pdfSafeText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\uFE0F]/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[\u2600-\u27BF]/g, "")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfSafeHabitName(name) {
  return pdfSafeText(name || "Untitled Habit");
}

function drawCard(
  doc,
  {
    x,
    y,
    w,
    h,
    title,
    value,
    subtitle = "",
    fillColor = [250, 250, 250],
    borderColor = [229, 231, 235],
    titleColor = [107, 114, 128],
    valueColor = [17, 24, 39],
  },
) {
  const safeTitle = pdfSafeText(title);
  const safeValue = pdfSafeText(value);
  const safeSubtitle = pdfSafeText(subtitle);

  doc.setFillColor(...fillColor);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...titleColor);
  doc.text(safeTitle, x + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...valueColor);
  doc.text(safeValue, x + 4, y + 13);

  if (safeSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const lines = doc.splitTextToSize(safeSubtitle, w - 8);
    doc.text(lines.slice(0, 2), x + 4, y + 18);
  }
}

function drawSectionTitle(doc, title, subtitle, y, pageWidth, margin) {
  const safeTitle = pdfSafeText(title);
  const safeSubtitle = pdfSafeText(subtitle);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text(safeTitle, margin, y);

  if (safeSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(safeSubtitle, pageWidth - margin, y, { align: "right" });
  }

  return y + 4;
}

function drawProgressBar(doc, x, y, w, h, label, value) {
  const safeLabel = pdfSafeText(label);
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  doc.text(safeLabel, x, y - 1);

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");

  doc.setFillColor(17, 24, 39);
  doc.roundedRect(x, y, (w * safeValue) / 100, h, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`${safeValue}%`, x + w, y + h - 0.5, { align: "right" });
}

function getBestHabit(habits) {
  if (!habits?.length) return null;
  return [...habits].sort((a, b) => b.progress - a.progress)[0];
}

function getWeakestHabit(habits) {
  if (!habits?.length) return null;
  return [...habits].sort((a, b) => a.progress - b.progress)[0];
}

function getBestWeek(weeklyProgress) {
  if (!weeklyProgress?.length) return null;
  return [...weeklyProgress].sort((a, b) => b.value - a.value)[0];
}

function ensurePageSpace(doc, currentY, neededHeight, margin = 12) {
  const pageHeight = doc.internal.pageSize.getHeight();

  if (currentY + neededHeight > pageHeight - margin) {
    doc.addPage();
    return margin;
  }

  return currentY;
}

export function exportDashboardPdf(summary) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const gap = 4;
  const contentWidth = pageWidth - margin * 2;

  let y = 14;

  const habits = summary.habits || [];
  const weeklyProgress = summary.weeklyProgress || [];

  const bestHabit = getBestHabit(habits);
  const weakestHabit = getWeakestHabit(habits);
  const bestWeek = getBestWeek(weeklyProgress);

  const safeMonth = pdfSafeText(summary.month);
  const safeYear = pdfSafeText(summary.year);
  const safeMonthKey = pdfSafeText(summary.monthKey);

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text("Habit Tracker Report", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`${safeMonth} ${safeYear} - ${safeMonthKey}`, margin, y + 6);
  doc.text(
    `Generated: ${pdfSafeText(new Date().toLocaleDateString())}`,
    pageWidth - margin,
    y + 6,
    {
      align: "right",
    },
  );

  y += 12;

  // Top summary cards
  const cardW = (contentWidth - gap * 2) / 3;
  const cardH = 22;

  const cards = [
    {
      title: "Completion",
      value: `${summary.completionPercent}%`,
      subtitle: `${summary.totalCompleted}/${summary.totalGoal} completed`,
    },
    {
      title: "Monthly Goal",
      value: summary.totalGoal,
      subtitle: "Total target check-offs",
    },
    {
      title: "Completed",
      value: summary.totalCompleted,
      subtitle: "Successful check-offs",
    },
    {
      title: "Left",
      value: summary.totalLeft,
      subtitle: "Remaining this month",
    },
    {
      title: "Mood Average",
      value: summary.moodAverage,
      subtitle: "Average mood / 10",
    },
    {
      title: "Motivation Avg",
      value: summary.motivationAverage,
      subtitle: "Average motivation / 10",
    },
  ];

  cards.forEach((card, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;

    drawCard(doc, {
      x: margin + col * (cardW + gap),
      y: y + row * (cardH + gap),
      w: cardW,
      h: cardH,
      ...card,
    });
  });

  y += cardH * 2 + gap + 8;

  // Highlights
  y = drawSectionTitle(
    doc,
    "Monthly Highlights",
    "Visual summary inspired by your sample report",
    y,
    pageWidth,
    margin,
  );

  const highlightH = 24;

  drawCard(doc, {
    x: margin,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Habit",
    value: bestHabit ? pdfSafeHabitName(bestHabit.name) : "-",
    subtitle: bestHabit
      ? `${bestHabit.actual}/${bestHabit.goal} completed - ${bestHabit.progress}%`
      : "No habit data available",
  });

  drawCard(doc, {
    x: margin + cardW + gap,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Needs Attention",
    value: weakestHabit ? pdfSafeHabitName(weakestHabit.name) : "-",
    subtitle: weakestHabit
      ? `${weakestHabit.actual}/${weakestHabit.goal} completed - ${weakestHabit.progress}%`
      : "No habit data available",
  });

  drawCard(doc, {
    x: margin + (cardW + gap) * 2,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Week",
    value: bestWeek ? pdfSafeText(bestWeek.label) : "-",
    subtitle: bestWeek
      ? `${bestWeek.value}% average completion`
      : "No weekly data available",
  });

  y += highlightH + 12;

  // Weekly progress
  y = drawSectionTitle(
    doc,
    "Weekly Progress",
    "Quick month overview",
    y,
    pageWidth,
    margin,
  );

  let weeklyY = y + 4;
  weeklyProgress.forEach((week) => {
    drawProgressBar(
      doc,
      margin,
      weeklyY,
      contentWidth,
      5,
      week.label,
      week.value,
    );
    weeklyY += 10;
  });

  y = weeklyY + 2;

  // Habit table
  y = ensurePageSpace(doc, y, 75, margin);

  y = drawSectionTitle(
    doc,
    "Habit Breakdown",
    "Detailed performance per habit",
    y,
    pageWidth,
    margin,
  );

  autoTable(doc, {
    startY: y + 4,
    head: [["Habit", "Goal", "Completed", "Left", "Progress"]],
    body: habits.map((habit) => [
      pdfSafeHabitName(habit.name),
      String(habit.goal),
      String(habit.actual),
      String(habit.left),
      `${habit.progress}%`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [17, 24, 39],
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: margin, right: margin },
  });

  y = doc.lastAutoTable.finalY + 8;

  // Notes
  y = ensurePageSpace(doc, y, 35, margin);

  y = drawSectionTitle(doc, "Monthly Notes", "", y, pageWidth, margin);

  const notes = summary.notes?.trim()
    ? pdfSafeText(summary.notes)
    : "No notes were added for this month.";

  const noteLines = doc.splitTextToSize(notes, contentWidth - 8);
  const notesHeight = Math.max(20, noteLines.length * 4 + 8);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, y + 4, contentWidth, notesHeight, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text(noteLines, margin + 4, y + 10);

  // Footer
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Habit Tracker - Dashboard-style monthly report",
    margin,
    pageHeight - 8,
  );
  doc.text("Page 1", pageWidth - margin, pageHeight - 8, { align: "right" });

  doc.save(`habit-tracker-${safeMonthKey}.pdf`);
}

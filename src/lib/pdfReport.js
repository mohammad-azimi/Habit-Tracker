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

function averageNumber(values) {
  if (!values?.length) return 0;
  return (
    values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
  );
}

function getProgressTheme(progress) {
  if (progress >= 80) {
    return {
      fill: [236, 253, 245],
      border: [167, 243, 208],
      accent: [22, 163, 74],
      badgeFill: [34, 197, 94],
      badgeText: [255, 255, 255],
      label: "Excellent",
    };
  }

  if (progress >= 40) {
    return {
      fill: [255, 247, 237],
      border: [254, 215, 170],
      accent: [234, 88, 12],
      badgeFill: [249, 115, 22],
      badgeText: [255, 255, 255],
      label: "In Progress",
    };
  }

  return {
    fill: [254, 242, 242],
    border: [252, 165, 165],
    accent: [220, 38, 38],
    badgeFill: [239, 68, 68],
    badgeText: [255, 255, 255],
    label: "Needs Focus",
  };
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
  const theme = getProgressTheme(safeValue);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  doc.text(safeLabel, x, y - 1);

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");

  doc.setFillColor(...theme.accent);
  doc.roundedRect(x, y, (w * safeValue) / 100, h, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`${safeValue}%`, x + w, y + h - 0.5, { align: "right" });
}

function drawBadge(doc, x, y, text, fillColor, textColor) {
  const safeText = pdfSafeText(text);
  const paddingX = 3.2;
  const badgeH = 6.2;
  const textWidth = doc.getTextWidth(safeText);
  const badgeW = textWidth + paddingX * 2;

  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, badgeW, badgeH, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...textColor);
  doc.text(safeText, x + paddingX, y + 4.1);

  return badgeW;
}

function drawHighlightCard(
  doc,
  { x, y, w, h, title, habitName, subtitle, progress },
) {
  const theme = getProgressTheme(progress ?? 0);

  doc.setFillColor(...theme.fill);
  doc.setDrawColor(...theme.border);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(pdfSafeText(title), x + 4, y + 5);

  drawBadge(doc, x + 4, y + 8, theme.label, theme.badgeFill, theme.badgeText);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(pdfSafeHabitName(habitName), w - 8);
  doc.text(titleLines.slice(0, 2), x + 4, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const subtitleLines = doc.splitTextToSize(pdfSafeText(subtitle), w - 8);
  doc.text(subtitleLines.slice(0, 2), x + 4, y + h - 4);
}

function drawSparklineCard(doc, { x, y, w, h, title, data }) {
  const safeTitle = pdfSafeText(title);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(safeTitle, x + 4, y + 5);

  if (!data?.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No daily trend data available", x + 4, y + 15);
    return;
  }

  const chartX = x + 4;
  const chartY = y + 10;
  const chartW = w - 8;
  const chartH = h - 18;

  // Grid
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 4; i += 1) {
    const gridY = chartY + (chartH / 3) * i;
    doc.line(chartX, gridY, chartX + chartW, gridY);
  }

  const values = data.map((item) =>
    Math.max(0, Math.min(100, Number(item.value) || 0)),
  );

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const stepX = values.length > 1 ? chartW / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const px = chartX + stepX * index;
    const py = chartY + chartH - ((value - minValue) / range) * chartH;
    return { x: px, y: py, value };
  });

  doc.setDrawColor(17, 24, 39);
  doc.setLineWidth(0.8);
  for (let i = 0; i < points.length - 1; i += 1) {
    doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
  }

  const lastPoint = points[points.length - 1];
  if (lastPoint) {
    doc.setFillColor(17, 24, 39);
    doc.circle(lastPoint.x, lastPoint.y, 1.2, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Start", chartX, y + h - 4);
  doc.text("End", chartX + chartW, y + h - 4, { align: "right" });
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

function getTrendStats(dailyProgress) {
  if (!dailyProgress?.length) {
    return {
      startAvg: 0,
      endAvg: 0,
      delta: 0,
      bestDay: null,
    };
  }

  const startSlice = dailyProgress.slice(0, Math.min(7, dailyProgress.length));
  const endSlice = dailyProgress.slice(Math.max(0, dailyProgress.length - 7));
  const bestDay =
    [...dailyProgress].sort((a, b) => b.value - a.value)[0] || null;

  const startAvg = Math.round(
    averageNumber(startSlice.map((item) => item.value)),
  );
  const endAvg = Math.round(averageNumber(endSlice.map((item) => item.value)));

  return {
    startAvg,
    endAvg,
    delta: endAvg - startAvg,
    bestDay,
  };
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
  const dailyProgress = summary.dailyProgress || [];

  const bestHabit = getBestHabit(habits);
  const weakestHabit = getWeakestHabit(habits);
  const bestWeek = getBestWeek(weeklyProgress);
  const trendStats = getTrendStats(dailyProgress);

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
    { align: "right" },
  );

  y += 12;

  // Summary cards
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

  const highlightH = 28;

  drawHighlightCard(doc, {
    x: margin,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Habit",
    habitName: bestHabit ? bestHabit.name : "-",
    subtitle: bestHabit
      ? `${bestHabit.actual}/${bestHabit.goal} completed - ${bestHabit.progress}%`
      : "No habit data available",
    progress: bestHabit?.progress ?? 0,
  });

  drawHighlightCard(doc, {
    x: margin + cardW + gap,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Needs Attention",
    habitName: weakestHabit ? weakestHabit.name : "-",
    subtitle: weakestHabit
      ? `${weakestHabit.actual}/${weakestHabit.goal} completed - ${weakestHabit.progress}%`
      : "No habit data available",
    progress: weakestHabit?.progress ?? 0,
  });

  drawHighlightCard(doc, {
    x: margin + (cardW + gap) * 2,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Week",
    habitName: bestWeek ? bestWeek.label : "-",
    subtitle: bestWeek
      ? `${bestWeek.value}% average completion`
      : "No weekly data available",
    progress: bestWeek?.value ?? 0,
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

  // Trend section
  y = ensurePageSpace(doc, y, 72, margin);

  y = drawSectionTitle(
    doc,
    "Monthly Trend",
    "Daily completion flow across the month",
    y,
    pageWidth,
    margin,
  );

  drawSparklineCard(doc, {
    x: margin,
    y: y + 3,
    w: contentWidth,
    h: 36,
    title: "Daily Completion Trend",
    data: dailyProgress,
  });

  const miniCardY = y + 43;
  const miniCardH = 18;

  drawCard(doc, {
    x: margin,
    y: miniCardY,
    w: cardW,
    h: miniCardH,
    title: "First 7 Days Avg",
    value: `${trendStats.startAvg}%`,
    subtitle: "Opening momentum",
  });

  drawCard(doc, {
    x: margin + cardW + gap,
    y: miniCardY,
    w: cardW,
    h: miniCardH,
    title: "Last 7 Days Avg",
    value: `${trendStats.endAvg}%`,
    subtitle: `Delta ${trendStats.delta >= 0 ? "+" : ""}${trendStats.delta}%`,
  });

  drawCard(doc, {
    x: margin + (cardW + gap) * 2,
    y: miniCardY,
    w: cardW,
    h: miniCardH,
    title: "Best Day",
    value: trendStats.bestDay ? `Day ${trendStats.bestDay.day}` : "-",
    subtitle: trendStats.bestDay
      ? `${trendStats.bestDay.value}% completion`
      : "No data available",
  });

  y = miniCardY + miniCardH + 10;

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

  // Footer for all pages
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Habit Tracker - Dashboard-style monthly report",
      margin,
      pageHeight - 8,
    );
    doc.text(`Page ${page}`, pageWidth - margin, pageHeight - 8, {
      align: "right",
    });
  }

  doc.save(`habit-tracker-${safeMonthKey}.pdf`);
}

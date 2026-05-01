import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function averageNumber(values) {
  if (!values?.length) return 0;
  return (
    values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length
  );
}

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

function getProgressTheme(progress) {
  const safeProgress = Number(progress) || 0;

  if (safeProgress >= 80) {
    return {
      fill: [236, 253, 245],
      border: [167, 243, 208],
      accent: [22, 163, 74],
      badgeFill: [220, 252, 231],
      badgeText: [22, 101, 52],
      label: "Excellent",
    };
  }

  if (safeProgress >= 40) {
    return {
      fill: [255, 247, 237],
      border: [254, 215, 170],
      accent: [234, 88, 12],
      badgeFill: [255, 237, 213],
      badgeText: [194, 65, 12],
      label: "In Progress",
    };
  }

  return {
    fill: [254, 242, 242],
    border: [252, 165, 165],
    accent: [220, 38, 38],
    badgeFill: [254, 226, 226],
    badgeText: [185, 28, 28],
    label: "Needs Focus",
  };
}

function getHighlightCardTheme(progress) {
  const safeProgress = Number(progress) || 0;

  if (safeProgress >= 80) {
    return {
      statusLabel: "Excellent",
      borderColor: [187, 247, 208],
      badgeFill: [220, 252, 231],
      badgeText: [22, 101, 52],
      backgroundColor: [245, 252, 247],
    };
  }

  if (safeProgress >= 40) {
    return {
      statusLabel: "In Progress",
      borderColor: [253, 186, 116],
      badgeFill: [255, 237, 213],
      badgeText: [194, 65, 12],
      backgroundColor: [255, 250, 245],
    };
  }

  return {
    statusLabel: "Needs Focus",
    borderColor: [252, 165, 165],
    badgeFill: [254, 226, 226],
    badgeText: [185, 28, 28],
    backgroundColor: [255, 247, 247],
  };
}

function getScaleStatus(value, targetLow, targetHigh) {
  if (value < targetLow) {
    return {
      label: "Below Target",
      textColor: [220, 38, 38],
    };
  }

  if (value <= targetHigh) {
    return {
      label: "On Target",
      textColor: [22, 163, 74],
    };
  }

  return {
    label: "Above Target",
    textColor: [234, 88, 12],
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

  const isCompact = h <= 18;
  const titleY = y + 4.8;
  const valueY = isCompact ? y + 11.2 : y + 13;
  const subtitleY = y + h - 2.8;
  const valueFont = isCompact ? 13 : 15;
  const subtitleFont = isCompact ? 6.8 : 7.5;

  doc.setFillColor(...fillColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...titleColor);
  doc.text(safeTitle, x + 4, titleY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(valueFont);
  doc.setTextColor(...valueColor);
  doc.text(safeValue, x + 4, valueY);

  if (safeSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(subtitleFont);
    doc.setTextColor(100, 116, 139);
    const lines = doc.splitTextToSize(safeSubtitle, w - 8);
    doc.text(lines.slice(0, 1), x + 4, subtitleY);
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
  const safeValue = clampNumber(value, 0, 100);
  const theme = getProgressTheme(safeValue);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(55, 65, 81);
  doc.text(safeLabel, x, y - 1);

  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(243, 244, 246);
  doc.roundedRect(x, y, w, h, 2, 2, "FD");

  doc.setFillColor(...theme.accent);
  const filledWidth = (w * safeValue) / 100;
  if (filledWidth > 0) {
    doc.roundedRect(x, y, filledWidth, h, 2, 2, "F");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(17, 24, 39);
  doc.text(`${safeValue}%`, x + w, y + h - 0.5, { align: "right" });
}

function drawStatusPill(doc, x, y, text, fillColor, textColor) {
  const safeText = pdfSafeText(text);
  const paddingX = 4.5;
  const pillH = 7;
  const textWidth = doc.getTextWidth(safeText);
  const pillW = textWidth + paddingX * 2;

  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, pillW, pillH, 3.5, 3.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...textColor);
  doc.text(safeText, x + paddingX, y + 4.8);

  return pillW;
}

function drawHighlightCard(
  doc,
  {
    x,
    y,
    w,
    h,
    title,
    mainValue,
    subtitle,
    statusLabel,
    borderColor = [229, 231, 235],
    badgeFill = [255, 237, 213],
    badgeText = [194, 65, 12],
    backgroundColor = [255, 255, 255],
  },
) {
  const safeTitle = pdfSafeText(title);
  const safeMainValue = pdfSafeHabitName(mainValue);
  const safeSubtitle = pdfSafeText(subtitle);
  const safeStatusLabel = pdfSafeText(statusLabel);

  const padX = 6;

  doc.setFillColor(...backgroundColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(x, y, w, h, 5, 5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(107, 114, 128);
  doc.text(safeTitle, x + padX, y + 7);

  const pillW = doc.getTextWidth(safeStatusLabel) + 9;
  const pillX = x + w - pillW - padX;
  drawStatusPill(doc, pillX, y + 4.5, safeStatusLabel, badgeFill, badgeText);

  let mainFontSize = 16;
  if (safeMainValue.length > 18) mainFontSize = 14;
  if (safeMainValue.length > 28) mainFontSize = 12.5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(mainFontSize);
  doc.setTextColor(17, 24, 39);

  const mainLines = doc
    .splitTextToSize(safeMainValue, w - padX * 2)
    .slice(0, 2);

  doc.text(mainLines, x + padX, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const subtitleLines = doc
    .splitTextToSize(safeSubtitle, w - padX * 2)
    .slice(0, 1);

  doc.text(subtitleLines, x + padX, y + h - 5.5);
}

function formatDeltaText(delta, digits = 0, suffix = "") {
  if (delta === null || Number.isNaN(delta)) return "No data";

  const rounded = Number(delta.toFixed(digits));

  if (rounded === 0) {
    return `0${suffix}`;
  }

  return `${rounded > 0 ? "+" : ""}${rounded}${suffix}`;
}

function getDeltaTheme(delta) {
  if (delta === null || Number.isNaN(delta)) {
    return {
      fill: [250, 250, 250],
      border: [229, 231, 235],
      deltaFill: [245, 245, 245],
      deltaText: [82, 82, 91],
    };
  }

  if (delta > 0) {
    return {
      fill: [245, 252, 247],
      border: [187, 247, 208],
      deltaFill: [220, 252, 231],
      deltaText: [22, 101, 52],
    };
  }

  if (delta < 0) {
    return {
      fill: [255, 247, 247],
      border: [252, 165, 165],
      deltaFill: [254, 226, 226],
      deltaText: [185, 28, 28],
    };
  }

  return {
    fill: [250, 250, 250],
    border: [229, 231, 235],
    deltaFill: [245, 245, 245],
    deltaText: [82, 82, 91],
  };
}

function drawComparisonMetricCard(
  doc,
  {
    x,
    y,
    w,
    h,
    title,
    currentValue,
    previousValue,
    delta,
    suffix = "",
    digits = 0,
  },
) {
  const theme = getDeltaTheme(delta);

  const safeTitle = pdfSafeText(title);
  const safeCurrentValue = pdfSafeText(
    `${currentValue}${currentValue !== null && currentValue !== undefined ? suffix : ""}`,
  );

  const safePreviousValue =
    previousValue === null || previousValue === undefined
      ? "Previous: No data"
      : pdfSafeText(`Previous: ${previousValue}${suffix}`);

  const safeDeltaText = pdfSafeText(formatDeltaText(delta, digits, suffix));

  const padX = 6;

  doc.setFillColor(...theme.fill);
  doc.setDrawColor(...theme.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  // title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(safeTitle, x + padX, y + 6);

  // delta badge
  const pillW = doc.getTextWidth(safeDeltaText) + 10;
  const pillH = 7;
  const pillX = x + w - pillW - padX;
  const pillY = y + 4;

  doc.setFillColor(...theme.deltaFill);
  doc.roundedRect(pillX, pillY, pillW, pillH, 3.5, 3.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...theme.deltaText);
  doc.text(safeDeltaText, pillX + 5, pillY + 4.8);

  // main value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(safeCurrentValue, x + padX, y + 16);

  // previous value
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(safePreviousValue, x + padX, y + h - 4);

  // bottom divider-like visual balance
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.15);
}

function drawYearlyMiniBarChart(doc, { x, y, w, h, data, currentMonth }) {
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Yearly Completion Trend", x + 4, y + 6);

  if (!data?.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No yearly data available", x + 4, y + 16);
    return;
  }

  const visibleData = data.slice(0, 12);
  const activeMonths = visibleData.filter((item) => !item.isEmpty);

  if (!activeMonths.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No saved month data available", x + 4, y + 16);
    return;
  }

  const values = activeMonths.map((item) =>
    Math.max(0, Math.min(100, Number(item.completionPercent) || 0)),
  );

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  let domainMin = 0;
  let domainMax = 100;

  if (minValue === maxValue) {
    domainMin = Math.max(0, minValue - 10);
    domainMax = Math.min(100, maxValue + 10);
  } else {
    const spread = maxValue - minValue;
    const padding = spread < 15 ? 8 : 5;
    domainMin = Math.max(0, minValue - padding);
    domainMax = Math.min(100, maxValue + padding);
  }

  const range = Math.max(domainMax - domainMin, 1);

  const bestMonth = [...activeMonths].sort(
    (a, b) => b.completionPercent - a.completionPercent,
  )[0];

  const worstMonth = [...activeMonths].sort(
    (a, b) => a.completionPercent - b.completionPercent,
  )[0];

  const chartX = x + 8;
  const chartY = y + 12;
  const chartW = w - 16;
  const chartH = h - 22;

  // grid + y labels
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);

  const gridValues = [
    domainMin,
    Math.round(domainMin + range / 3),
    Math.round(domainMin + (2 * range) / 3),
    domainMax,
  ];

  for (let i = 0; i < 4; i += 1) {
    const gridY = chartY + (chartH / 3) * i;
    doc.line(chartX, gridY, chartX + chartW, gridY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`${gridValues[i]}%`, chartX - 2, gridY + 1.5, { align: "right" });
  }

  const barGap = 2.2;
  const barW = Math.max(
    (chartW - barGap * (visibleData.length - 1)) / visibleData.length,
    4,
  );

  const points = [];

  visibleData.forEach((item, index) => {
    const value = Math.max(
      0,
      Math.min(100, Number(item.completionPercent) || 0),
    );

    const normalized = item.isEmpty ? 0 : (value - domainMin) / range;
    const barHeight = item.isEmpty ? 2 : Math.max(4, normalized * chartH);

    const barX = chartX + index * (barW + barGap);
    const barY = chartY + chartH - barHeight;

    const isBest = !item.isEmpty && item.month === bestMonth?.month;
    const isWorst = !item.isEmpty && item.month === worstMonth?.month;
    const isCurrent = !item.isEmpty && item.month === currentMonth;

    if (item.isEmpty) {
      doc.setFillColor(212, 212, 212);
      doc.setFillColor(212, 212, 212);
      doc.roundedRect(barX, barY, barW, barHeight, 1.5, 1.5, "F");
    } else if (isBest) {
      doc.setFillColor(34, 197, 94);
      doc.roundedRect(barX, barY, barW, barHeight, 1.5, 1.5, "F");
    } else if (isWorst) {
      doc.setFillColor(239, 68, 68);
      doc.roundedRect(barX, barY, barW, barHeight, 1.5, 1.5, "F");
    } else if (isCurrent) {
      doc.setFillColor(17, 24, 39);
      doc.roundedRect(barX, barY, barW, barHeight, 1.5, 1.5, "F");
    } else {
      doc.setFillColor(163, 163, 163);
      doc.roundedRect(barX, barY, barW, barHeight, 1.5, 1.5, "F");
    }

    if (!item.isEmpty) {
      points.push({
        x: barX + barW / 2,
        y: barY,
        value,
        month: item.month,
        shortMonth: item.shortMonth,
        isBest,
        isWorst,
        isCurrent,
      });
    }

    // month labels
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      pdfSafeText(item.shortMonth || "").slice(0, 3),
      barX + barW / 2,
      y + h - 4,
      { align: "center" },
    );
  });

  // trend line
  if (points.length > 1) {
    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.9);

    for (let i = 0; i < points.length - 1; i += 1) {
      doc.line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    }
  }

  // dots + value labels for key months
  points.forEach((point) => {
    if (point.isBest) {
      doc.setFillColor(34, 197, 94);
    } else if (point.isWorst) {
      doc.setFillColor(239, 68, 68);
    } else if (point.isCurrent) {
      doc.setFillColor(17, 24, 39);
    } else {
      doc.setFillColor(250, 250, 250);
    }

    doc.setDrawColor(17, 24, 39);
    doc.setLineWidth(0.5);
    doc.circle(point.x, point.y, 1.4, "FD");

    if (point.isBest || point.isWorst || point.isCurrent) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(55, 65, 81);
      doc.text(`${point.value}%`, point.x, point.y - 3, { align: "center" });
    }
  });
}

function getYearlyOverviewStats(yearlyOverviewData = []) {
  const activeMonths = yearlyOverviewData.filter((item) => !item.isEmpty);

  if (!activeMonths.length) {
    return {
      averageCompletion: 0,
      averageMood: "0.0",
      averageMotivation: "0.0",
      bestMonth: null,
      worstMonth: null,
    };
  }

  const bestMonth = [...activeMonths].sort(
    (a, b) => b.completionPercent - a.completionPercent,
  )[0];

  const worstMonth = [...activeMonths].sort(
    (a, b) => a.completionPercent - b.completionPercent,
  )[0];

  const averageCompletion = Math.round(
    activeMonths.reduce(
      (sum, item) => sum + Number(item.completionPercent || 0),
      0,
    ) / activeMonths.length,
  );

  const averageMood = (
    activeMonths.reduce((sum, item) => sum + Number(item.moodAverage || 0), 0) /
    activeMonths.length
  ).toFixed(1);

  const averageMotivation = (
    activeMonths.reduce(
      (sum, item) => sum + Number(item.motivationAverage || 0),
      0,
    ) / activeMonths.length
  ).toFixed(1);

  return {
    averageCompletion,
    averageMood,
    averageMotivation,
    bestMonth,
    worstMonth,
  };
}

function drawSparklineCard(doc, { x, y, w, h, title, data }) {
  const safeTitle = pdfSafeText(title);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
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

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.2);
  for (let i = 0; i < 4; i += 1) {
    const gridY = chartY + (chartH / 3) * i;
    doc.line(chartX, gridY, chartX + chartW, gridY);
  }

  const values = data.map((item) => clampNumber(item.value, 0, 100));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const stepX = values.length > 1 ? chartW / (values.length - 1) : 0;

  const points = values.map((value, index) => {
    const px = chartX + stepX * index;
    const py = chartY + chartH - ((value - minValue) / range) * chartH;
    return { x: px, y: py };
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

function drawStatusScaleCard(
  doc,
  {
    x,
    y,
    w,
    h,
    title,
    displayValue,
    value,
    scaleMin,
    scaleMax,
    targetLow,
    targetHigh,
    lowLabel,
    midLabel,
    highLabel,
  },
) {
  const safeTitle = pdfSafeText(title);
  const safeDisplayValue = pdfSafeText(displayValue);
  const safeLowLabel = pdfSafeText(lowLabel);
  const safeMidLabel = pdfSafeText(midLabel);
  const safeHighLabel = pdfSafeText(highLabel);

  const status = getScaleStatus(value, targetLow, targetHigh);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(safeTitle, x + 4, y + 5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...status.textColor);
  doc.text(pdfSafeText(status.label), x + w - 4, y + 5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(17, 24, 39);
  doc.text(safeDisplayValue, x + 4, y + 13);

  const barX = x + 4;
  const barY = y + h - 12;
  const barW = w - 8;
  const barH = 3.6;

  const totalRange = Math.max(scaleMax - scaleMin, 1);
  const lowRatio = clampNumber((targetLow - scaleMin) / totalRange, 0, 1);
  const midRatio = clampNumber((targetHigh - targetLow) / totalRange, 0, 1);
  const highRatio = clampNumber(1 - lowRatio - midRatio, 0, 1);

  const lowW = barW * lowRatio;
  const midW = barW * midRatio;
  const highW = barW * highRatio;

  doc.setFillColor(248, 113, 113);
  if (lowW > 0) {
    doc.roundedRect(barX, barY, lowW, barH, 1.5, 1.5, "F");
  }

  doc.setFillColor(34, 197, 94);
  if (midW > 0) {
    doc.roundedRect(barX + lowW, barY, midW, barH, 1.5, 1.5, "F");
  }

  doc.setFillColor(251, 146, 60);
  if (highW > 0) {
    doc.roundedRect(barX + lowW + midW, barY, highW, barH, 1.5, 1.5, "F");
  }

  const clampedValue = clampNumber(value, scaleMin, scaleMax);
  const markerRatio = (clampedValue - scaleMin) / totalRange;
  const markerX = barX + barW * markerRatio;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...status.textColor);
  doc.setLineWidth(0.8);
  doc.circle(markerX, barY + barH / 2, 1.5, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(safeLowLabel, barX, barY + 7);
  doc.text(safeMidLabel, barX + barW / 2, barY + 7, { align: "center" });
  doc.text(safeHighLabel, barX + barW, barY + 7, { align: "right" });
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

function drawReviewBox(doc, { x, y, w, h, title, text }) {
  const safeTitle = pdfSafeText(title);
  const safeTextValue = pdfSafeText(text || "No entry");

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(17, 24, 39);
  doc.text(safeTitle, x + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);

  const lines = doc.splitTextToSize(safeTextValue, w - 8);
  doc.text(lines.slice(0, 5), x + 4, y + 12);
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
  const yearlyOverviewData = summary.yearlyOverviewData || [];

  const bestHabit = getBestHabit(habits);
  const weakestHabit = getWeakestHabit(habits);
  const bestWeek = getBestWeek(weeklyProgress);
  const trendStats = getTrendStats(dailyProgress);
  const yearlyStats = getYearlyOverviewStats(yearlyOverviewData);
  const previousMonthSummary = summary.previousMonthSummary || null;
  const previousMonthLabel = pdfSafeText(
    summary.previousMonthLabel || "previous month",
  );

  const safeMonth = pdfSafeText(summary.month);
  const safeYear = pdfSafeText(summary.year);
  const safeMonthKey = pdfSafeText(summary.monthKey);

  const weeklyConsistency = Math.round(
    averageNumber(weeklyProgress.map((week) => week.value)),
  );

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

  y = drawSectionTitle(
    doc,
    "Monthly Highlights",
    "Visual summary inspired by your sample report",
    y,
    pageWidth,
    margin,
  );

  const highlightH = 30;

  const bestHabitTheme = getHighlightCardTheme(bestHabit?.progress ?? 0);
  const weakestHabitTheme = getHighlightCardTheme(weakestHabit?.progress ?? 0);
  const bestWeekTheme = getHighlightCardTheme(bestWeek?.value ?? 0);

  drawHighlightCard(doc, {
    x: margin,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Habit",
    mainValue: bestHabit ? bestHabit.name : "-",
    subtitle: bestHabit
      ? `${bestHabit.actual}/${bestHabit.goal} completed • ${bestHabit.progress}%`
      : "No habit data available",
    ...bestHabitTheme,
  });

  drawHighlightCard(doc, {
    x: margin + cardW + gap,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Needs Attention",
    mainValue: weakestHabit ? weakestHabit.name : "-",
    subtitle: weakestHabit
      ? `${weakestHabit.actual}/${weakestHabit.goal} completed • ${weakestHabit.progress}%`
      : "No habit data available",
    ...weakestHabitTheme,
  });

  drawHighlightCard(doc, {
    x: margin + (cardW + gap) * 2,
    y: y + 3,
    w: cardW,
    h: highlightH,
    title: "Best Week",
    mainValue: bestWeek ? bestWeek.label : "-",
    subtitle: bestWeek
      ? `${bestWeek.value}% average completion`
      : "No weekly data available",
    ...bestWeekTheme,
  });

  y += highlightH + 10;

  y = ensurePageSpace(doc, y, 48, margin);

  y = drawSectionTitle(
    doc,
    "Month Comparison",
    `Compared with ${previousMonthLabel}`,
    y,
    pageWidth,
    margin,
  );

  const comparisonCardW = (contentWidth - gap) / 2;
  const comparisonCardH = 24;

  if (!previousMonthSummary) {
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(229, 231, 235);
    doc.roundedRect(margin, y + 3, contentWidth, 16, 4, 4, "FD");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `No saved data found for ${previousMonthLabel}.`,
      margin + 4,
      y + 13,
    );

    y += 23;
  } else {
    drawComparisonMetricCard(doc, {
      x: margin,
      y: y + 3,
      w: comparisonCardW,
      h: comparisonCardH,
      title: "Completion Rate",
      currentValue: summary.completionPercent,
      previousValue: previousMonthSummary.completionPercent,
      delta: summary.completionPercent - previousMonthSummary.completionPercent,
      suffix: "%",
    });

    drawComparisonMetricCard(doc, {
      x: margin + comparisonCardW + gap,
      y: y + 3,
      w: comparisonCardW,
      h: comparisonCardH,
      title: "Completed",
      currentValue: summary.totalCompleted,
      previousValue: previousMonthSummary.totalCompleted,
      delta: summary.totalCompleted - previousMonthSummary.totalCompleted,
    });

    drawComparisonMetricCard(doc, {
      x: margin,
      y: y + 3 + comparisonCardH + gap,
      w: comparisonCardW,
      h: comparisonCardH,
      title: "Mood Average",
      currentValue: summary.moodAverage,
      previousValue: previousMonthSummary.moodAverage,
      delta:
        Number(summary.moodAverage) - Number(previousMonthSummary.moodAverage),
      digits: 1,
    });

    drawComparisonMetricCard(doc, {
      x: margin + comparisonCardW + gap,
      y: y + 3 + comparisonCardH + gap,
      w: comparisonCardW,
      h: comparisonCardH,
      title: "Motivation Avg",
      currentValue: summary.motivationAverage,
      previousValue: previousMonthSummary.motivationAverage,
      delta:
        Number(summary.motivationAverage) -
        Number(previousMonthSummary.motivationAverage),
      digits: 1,
    });

    y += comparisonCardH * 2 + gap + 10;
  }

  y = ensurePageSpace(doc, y, 78, margin);

  y = drawSectionTitle(
    doc,
    "Yearly Overview",
    `12-month summary for ${pdfSafeText(summary.year)}`,
    y,
    pageWidth,
    margin,
  );

  const yearlyCardW = (contentWidth - gap) / 2;
  const yearlyCardH = 18;

  drawCard(doc, {
    x: margin,
    y: y + 3,
    w: yearlyCardW,
    h: yearlyCardH,
    title: "Average Completion",
    value: `${yearlyStats.averageCompletion}%`,
    subtitle: "Across saved months",
  });

  drawCard(doc, {
    x: margin + yearlyCardW + gap,
    y: y + 3,
    w: yearlyCardW,
    h: yearlyCardH,
    title: "Average Mood",
    value: yearlyStats.averageMood,
    subtitle: "Year-wide mood average",
  });

  drawCard(doc, {
    x: margin,
    y: y + 3 + yearlyCardH + gap,
    w: yearlyCardW,
    h: yearlyCardH,
    title: "Average Motivation",
    value: yearlyStats.averageMotivation,
    subtitle: "Year-wide motivation average",
  });

  drawCard(doc, {
    x: margin + yearlyCardW + gap,
    y: y + 3 + yearlyCardH + gap,
    w: yearlyCardW,
    h: yearlyCardH,
    title: "Best / Worst Month",
    value: yearlyStats.bestMonth
      ? `${pdfSafeText(yearlyStats.bestMonth.month)} ${yearlyStats.bestMonth.completionPercent}%`
      : "-",
    subtitle: yearlyStats.worstMonth
      ? `Worst: ${pdfSafeText(yearlyStats.worstMonth.month)} ${yearlyStats.worstMonth.completionPercent}%`
      : "No yearly data available",
  });

  drawYearlyMiniBarChart(doc, {
    x: margin,
    y: y + 3 + yearlyCardH * 2 + gap + 4,
    w: contentWidth,
    h: 42,
    data: yearlyOverviewData,
    currentMonth: summary.month,
  });

  y += yearlyCardH * 2 + gap + 50;

  y = ensurePageSpace(doc, y, 70, margin);

  y = drawSectionTitle(
    doc,
    "Status Overview",
    "Range-style indicators similar to visual body reports",
    y,
    pageWidth,
    margin,
  );

  const statusCardW = (contentWidth - gap) / 2;
  const statusCardH = 28;

  const statusCards = [
    {
      title: "Completion Rate",
      displayValue: `${summary.completionPercent}%`,
      value: Number(summary.completionPercent),
      scaleMin: 0,
      scaleMax: 100,
      targetLow: 65,
      targetHigh: 85,
      lowLabel: "<65",
      midLabel: "65-85",
      highLabel: ">85",
    },
    {
      title: "Mood Average",
      displayValue: `${summary.moodAverage}/10`,
      value: Number(summary.moodAverage),
      scaleMin: 0,
      scaleMax: 10,
      targetLow: 6,
      targetHigh: 8,
      lowLabel: "<6",
      midLabel: "6-8",
      highLabel: ">8",
    },
    {
      title: "Motivation Avg",
      displayValue: `${summary.motivationAverage}/10`,
      value: Number(summary.motivationAverage),
      scaleMin: 0,
      scaleMax: 10,
      targetLow: 6,
      targetHigh: 8,
      lowLabel: "<6",
      midLabel: "6-8",
      highLabel: ">8",
    },
    {
      title: "Weekly Consistency",
      displayValue: `${weeklyConsistency}%`,
      value: weeklyConsistency,
      scaleMin: 0,
      scaleMax: 100,
      targetLow: 60,
      targetHigh: 80,
      lowLabel: "<60",
      midLabel: "60-80",
      highLabel: ">80",
    },
  ];

  statusCards.forEach((card, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;

    drawStatusScaleCard(doc, {
      x: margin + col * (statusCardW + gap),
      y: y + 3 + row * (statusCardH + gap),
      w: statusCardW,
      h: statusCardH,
      ...card,
    });
  });

  y += statusCardH * 2 + gap + 10;

  y = ensurePageSpace(doc, y, 56, margin);

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

  y = ensurePageSpace(doc, y, 72, margin);

  y = drawSectionTitle(
    doc,
    "Monthly Trend",
    "Daily completion flow across the month",
    y,
    pageWidth,
    margin,
  );

  y = ensurePageSpace(doc, y, 52, margin);

  y = drawSectionTitle(
    doc,
    "Monthly Review",
    "Structured reflection for the month",
    y,
    pageWidth,
    margin,
  );

  const reviewCardW = (contentWidth - gap * 2) / 3;
  const reviewCardH = 34;

  drawReviewBox(doc, {
    x: margin,
    y: y + 3,
    w: reviewCardW,
    h: reviewCardH,
    title: "Wins",
    text: summary.review?.wins || "",
  });

  drawReviewBox(doc, {
    x: margin + reviewCardW + gap,
    y: y + 3,
    w: reviewCardW,
    h: reviewCardH,
    title: "Blockers",
    text: summary.review?.blockers || "",
  });

  drawReviewBox(doc, {
    x: margin + (reviewCardW + gap) * 2,
    y: y + 3,
    w: reviewCardW,
    h: reviewCardH,
    title: "Next Focus",
    text: summary.review?.nextFocus || "",
  });

  y += reviewCardH + 10;

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

import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

function parseYearMonth(yearParam, monthParam) {
  const year = Number(yearParam);
  const month = Number(monthParam);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return null;
  }

  if (month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function createMonthKey(year, month) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

router.get("/", async (req, res) => {
  try {
    const records = await prisma.dashboardMonth.findMany({
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get("/:year/:month", async (req, res) => {
  try {
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    const record = await prisma.dashboardMonth.findUnique({
      where: { monthKey },
    });

    if (!record) {
      return res.json({
        year: parsed.year,
        month: parsed.month,
        monthKey,
        data: null,
      });
    }

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch month data" });
  }
});

router.put("/:year/:month", async (req, res) => {
  try {
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const { data } = req.body;

    if (!data || typeof data !== "object") {
      return res
        .status(400)
        .json({ error: "Body must contain a valid data object" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    const record = await prisma.dashboardMonth.upsert({
      where: { monthKey },
      create: {
        year: parsed.year,
        month: parsed.month,
        monthKey,
        data,
      },
      update: {
        data,
      },
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save month data" });
  }
});

router.delete("/:year/:month", async (req, res) => {
  try {
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    await prisma.dashboardMonth.delete({
      where: { monthKey },
    });

    res.json({ message: "Month deleted successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Month not found" });
    }

    res.status(500).json({ error: "Failed to delete month data" });
  }
});

export default router;

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

function buildAllMonthsExportPayload(records) {
  return {
    metadata: {
      exportType: "all-months",
      exportedAt: new Date().toISOString(),
      totalMonths: records.length,
    },
    months: records.map((record) => ({
      id: record.id,
      year: record.year,
      month: record.month,
      monthKey: record.monthKey,
      data: record.data,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })),
  };
}

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await prisma.dashboardMonth.findMany({
      where: { userId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    res.json(records);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

router.get("/export/all", async (req, res) => {
  try {
    const userId = req.user.id;

    const records = await prisma.dashboardMonth.findMany({
      where: { userId },
      orderBy: [{ year: "asc" }, { month: "asc" }],
    });

    const payload = buildAllMonthsExportPayload(records);

    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to export all months" });
  }
});

router.get("/deleted-backups", async (req, res) => {
  try {
    const userId = req.user.id;

    const backups = await prisma.deletedMonthBackup.findMany({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    res.json({
      metadata: {
        totalBackups: backups.length,
      },
      backups: backups.map((backup) => ({
        id: backup.id,
        year: backup.year,
        month: backup.month,
        monthKey: backup.monthKey,
        deletedAt: backup.deletedAt,
        createdAt: backup.createdAt,
        updatedAt: backup.updatedAt,
        originalCreatedAt: backup.originalCreatedAt,
        originalUpdatedAt: backup.originalUpdatedAt,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch deleted month backups" });
  }
});

router.post("/restore/:year/:month", async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    const restoredRecord = await prisma.$transaction(async (tx) => {
      const backup = await tx.deletedMonthBackup.findUnique({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
      });

      if (!backup) {
        throw new Error("BACKUP_NOT_FOUND");
      }

      const record = await tx.dashboardMonth.upsert({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
        create: {
          userId,
          year: backup.year,
          month: backup.month,
          monthKey: backup.monthKey,
          data: backup.data,
        },
        update: {
          year: backup.year,
          month: backup.month,
          data: backup.data,
        },
      });

      await tx.deletedMonthBackup.delete({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
      });

      return record;
    });

    res.json({
      message: "Month restored successfully",
      record: restoredRecord,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "BACKUP_NOT_FOUND") {
      return res.status(404).json({ error: "Deleted month backup not found" });
    }

    res.status(500).json({ error: "Failed to restore deleted month backup" });
  }
});

router.delete("/deleted-backups/:year/:month", async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    await prisma.deletedMonthBackup.delete({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
    });

    res.json({ message: "Deleted month backup removed successfully" });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Deleted month backup not found" });
    }

    res.status(500).json({ error: "Failed to delete month backup" });
  }
});

router.get("/:year/:month", async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    const record = await prisma.dashboardMonth.findUnique({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
    });

    if (!record) {
      return res.json({
        userId,
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
    const userId = req.user.id;
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

    const record = await prisma.$transaction(async (tx) => {
      const savedRecord = await tx.dashboardMonth.upsert({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
        create: {
          userId,
          year: parsed.year,
          month: parsed.month,
          monthKey,
          data,
        },
        update: {
          data,
        },
      });

      await tx.deletedMonthBackup.deleteMany({
        where: {
          userId,
          monthKey,
        },
      });

      return savedRecord;
    });

    res.json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save month data" });
  }
});

router.delete("/:year/:month", async (req, res) => {
  try {
    const userId = req.user.id;
    const parsed = parseYearMonth(req.params.year, req.params.month);

    if (!parsed) {
      return res.status(400).json({ error: "Invalid year or month" });
    }

    const monthKey = createMonthKey(parsed.year, parsed.month);

    await prisma.$transaction(async (tx) => {
      const existingMonth = await tx.dashboardMonth.findUnique({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
      });

      if (!existingMonth) {
        throw new Error("MONTH_NOT_FOUND");
      }

      await tx.deletedMonthBackup.upsert({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
        create: {
          userId,
          year: existingMonth.year,
          month: existingMonth.month,
          monthKey: existingMonth.monthKey,
          data: existingMonth.data,
          originalCreatedAt: existingMonth.createdAt,
          originalUpdatedAt: existingMonth.updatedAt,
        },
        update: {
          year: existingMonth.year,
          month: existingMonth.month,
          data: existingMonth.data,
          originalCreatedAt: existingMonth.createdAt,
          originalUpdatedAt: existingMonth.updatedAt,
          deletedAt: new Date(),
        },
      });

      await tx.dashboardMonth.delete({
        where: {
          userId_monthKey: {
            userId,
            monthKey,
          },
        },
      });
    });

    res.json({ message: "Month deleted successfully and backup created" });
  } catch (error) {
    console.error(error);

    if (error.message === "MONTH_NOT_FOUND") {
      return res.status(404).json({ error: "Month not found" });
    }

    res.status(500).json({ error: "Failed to delete month data" });
  }
});

export default router;

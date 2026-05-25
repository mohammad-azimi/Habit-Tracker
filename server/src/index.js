import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard.js";
import authRoutes from "./routes/auth.js";
import pushRoutes from "./routes/push.js";
import { requireAuth } from "./middleware/requireAuth.js";
import { startReminderScheduler } from "./jobs/reminderScheduler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
    "https://mohammad-azimi.github.io",
    process.env.CLIENT_URL,
    process.env.PRODUCTION_CLIENT_URL,
  ].filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests from tools like Postman, curl, server-to-server, or Vite proxy.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "2mb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl} from ${req.headers.origin}`);
  next();
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Habit Tracker API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/push", requireAuth, pushRoutes);

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  if (error.message?.startsWith("CORS blocked")) {
    return res.status(403).json({
      error: error.message,
    });
  }

  return res.status(500).json({
    error: error.message || "Internal server error",
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);

  if (process.env.ENABLE_REMINDER_SCHEDULER === "true") {
    startReminderScheduler();
  } else {
    console.log("Reminder scheduler is disabled");
  }
});

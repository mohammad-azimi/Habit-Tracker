import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/dashboard.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
  }),
);

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Habit Tracker API is running",
  });
});

app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// src/index.ts
// Express app bootstrap

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import dashboardRoutes from "./routes/dashboard.routes";
import environmentalRoutes from "./routes/environmental.routes";
import socialRoutes from "./routes/social.routes";
import governanceRoutes from "./routes/governance.routes";
import gamificationRoutes from "./routes/gamification.routes";
import reportsRoutes from "./routes/reports.routes";
import settingsRoutes from "./routes/settings.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/environmental", environmentalRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;

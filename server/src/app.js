import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import timerRoutes from "./routes/timer.routes.js";
import summaryRoutes from "./routes/summary.routes.js";
import { openapi } from "./docs/openapi.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
if (env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "focusflow-api", timestamp: new Date().toISOString() });
});
app.get("/api/docs.json", (_req, res) => res.json(openapi));

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }),
  authRoutes,
);
app.use("/api/tasks", requireAuth, taskRoutes);
app.use("/api/time", requireAuth, timerRoutes);
app.use("/api/summary", requireAuth, summaryRoutes);

app.use(notFound);
app.use(errorHandler);

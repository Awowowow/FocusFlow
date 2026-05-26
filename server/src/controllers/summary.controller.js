import { todaySummary, weeklySummary } from "../services/summary.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const today = asyncHandler(async (req, res) => {
  res.json({ summary: await todaySummary(req.user) });
});

export const weekly = asyncHandler(async (req, res) => {
  res.json({ summary: await weeklySummary(req.user) });
});


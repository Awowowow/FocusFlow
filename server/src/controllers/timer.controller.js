import * as timerService from "../services/timer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const active = asyncHandler(async (req, res) => {
  res.json({ activeTimer: await timerService.activeTimer(req.user.id) });
});

export const start = asyncHandler(async (req, res) => {
  res.status(201).json({ timeLog: await timerService.startTimer(req.user.id, req.params.taskId) });
});

export const stop = asyncHandler(async (req, res) => {
  res.json({ timeLog: await timerService.stopTimer(req.user.id, req.params.taskId) });
});

export const logs = asyncHandler(async (req, res) => {
  res.json({ timeLogs: await timerService.listLogs(req.user.id, req.query) });
});


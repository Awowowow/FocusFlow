import * as taskService from "../services/task.service.js";
import { suggestTask } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ tasks: await taskService.listTasks(req.user.id, req.query) });
});

export const detail = asyncHandler(async (req, res) => {
  res.json({ task: await taskService.getTask(req.user.id, req.params.taskId) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ task: await taskService.createTask(req.user.id, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ task: await taskService.updateTask(req.user.id, req.params.taskId, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.user.id, req.params.taskId);
  res.status(204).send();
});

export const suggest = asyncHandler(async (req, res) => {
  res.json({ suggestion: await suggestTask(req.body.input) });
});


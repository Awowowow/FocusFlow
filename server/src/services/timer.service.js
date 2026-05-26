import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { ensureTask } from "./task.service.js";

export const activeTimer = async (userId) => {
  return prisma.timeLog.findFirst({
    where: { userId, endedAt: null },
    include: { task: { select: { id: true, title: true, status: true } } },
  });
};

export const startTimer = async (userId, taskId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const task = await ensureTask(userId, taskId, tx);
      const current = await tx.timeLog.findFirst({ where: { userId, endedAt: null } });
      if (current) {
        throw new AppError(409, "A timer is already running. Stop it before starting another.", "TIMER_ALREADY_RUNNING", { timeLogId: current.id });
      }
      const log = await tx.timeLog.create({
        data: { userId, taskId },
        include: { task: { select: { id: true, title: true, status: true } } },
      });
      if (task.status !== "IN_PROGRESS") {
        await tx.task.update({ where: { id: taskId }, data: { status: "IN_PROGRESS", completedAt: null } });
      }
      return log;
    }, { isolationLevel: "Serializable" });
  } catch (error) {
    if (error.code === "P2034" || error.code === "P2002") {
      throw new AppError(409, "A timer is already running. Stop it before starting another.", "TIMER_ALREADY_RUNNING");
    }
    throw error;
  }
};

export const stopTimer = async (userId, taskId) => {
  return prisma.$transaction(async (tx) => {
    await ensureTask(userId, taskId, tx);
    const active = await tx.timeLog.findFirst({ where: { userId, taskId, endedAt: null } });
    if (!active) throw new AppError(409, "This task does not have an active timer.", "NO_ACTIVE_TIMER");
    const endedAt = new Date();
    const durationSeconds = Math.max(1, Math.floor((endedAt - active.startedAt) / 1000));
    return tx.timeLog.update({
      where: { id: active.id },
      data: { endedAt, durationSeconds },
      include: { task: { select: { id: true, title: true, status: true } } },
    });
  });
};

export const listLogs = async (userId, input) => {
  return prisma.timeLog.findMany({
    where: { userId, ...(input.taskId && { taskId: input.taskId }) },
    include: { task: { select: { id: true, title: true, status: true } } },
    orderBy: { startedAt: "desc" },
    take: input.limit,
  });
};

export const createLog = async (userId, input) => {
  return prisma.$transaction(async (tx) => {
    await ensureTask(userId, input.taskId, tx);
    const startedAt = new Date(input.startedAt);
    const endedAt = new Date(input.endedAt);
    await ensureNoOverlap(tx, userId, startedAt, endedAt);
    return tx.timeLog.create({
      data: {
        userId,
        taskId: input.taskId,
        startedAt,
        endedAt,
        durationSeconds: durationSeconds(startedAt, endedAt),
        note: input.note,
      },
      include: { task: { select: { id: true, title: true, status: true } } },
    });
  });
};

export const updateLog = async (userId, logId, input) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.timeLog.findFirst({ where: { id: logId, userId } });
    if (!existing) throw new AppError(404, "Time log not found.", "TIME_LOG_NOT_FOUND");
    if (!existing.endedAt) throw new AppError(409, "Stop an active timer before editing it.", "ACTIVE_TIMER");
    const startedAt = new Date(input.startedAt);
    const endedAt = new Date(input.endedAt);
    await ensureNoOverlap(tx, userId, startedAt, endedAt, logId);
    return tx.timeLog.update({
      where: { id: logId },
      data: { startedAt, endedAt, durationSeconds: durationSeconds(startedAt, endedAt), note: input.note },
      include: { task: { select: { id: true, title: true, status: true } } },
    });
  });
};

export const deleteLog = async (userId, logId) => {
  const existing = await prisma.timeLog.findFirst({ where: { id: logId, userId } });
  if (!existing) throw new AppError(404, "Time log not found.", "TIME_LOG_NOT_FOUND");
  if (!existing.endedAt) throw new AppError(409, "Stop an active timer before deleting it.", "ACTIVE_TIMER");
  await prisma.timeLog.delete({ where: { id: logId } });
};

const durationSeconds = (startedAt, endedAt) => {
  return Math.max(1, Math.floor((endedAt - startedAt) / 1000));
};

const ensureNoOverlap = async (tx, userId, startedAt, endedAt, excludedId) => {
  const conflicting = await tx.timeLog.findFirst({
    where: {
      userId,
      ...(excludedId && { id: { not: excludedId } }),
      startedAt: { lt: endedAt },
      OR: [{ endedAt: null }, { endedAt: { gt: startedAt } }],
    },
  });
  if (conflicting) {
    throw new AppError(409, "This session overlaps an existing time log.", "TIME_LOG_OVERLAP");
  }
};

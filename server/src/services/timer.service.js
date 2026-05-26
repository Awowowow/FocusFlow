import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { ensureTask } from "./task.service.js";

export async function activeTimer(userId) {
  return prisma.timeLog.findFirst({
    where: { userId, endedAt: null },
    include: { task: { select: { id: true, title: true, status: true } } },
  });
}

export async function startTimer(userId, taskId) {
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
}

export async function stopTimer(userId, taskId) {
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
}

export async function listLogs(userId, input) {
  return prisma.timeLog.findMany({
    where: { userId, ...(input.taskId && { taskId: input.taskId }) },
    include: { task: { select: { id: true, title: true, status: true } } },
    orderBy: { startedAt: "desc" },
    take: input.limit,
  });
}

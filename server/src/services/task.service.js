import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { taskWithTrackedTime } from "../utils/presenters.js";

const timeSelection = { id: true, startedAt: true, endedAt: true, durationSeconds: true };

export async function listTasks(userId, query) {
  const orderBy = query.sort === "oldest" ? { createdAt: "asc" } : query.sort === "updated" ? { updatedAt: "desc" } : { createdAt: "desc" };
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    },
    include: { timeLogs: { select: timeSelection } },
    orderBy,
  });
  return tasks.map((task) => taskWithTrackedTime(task));
}

export async function getTask(userId, taskId) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    include: { timeLogs: { orderBy: { startedAt: "desc" } } },
  });
  if (!task) throw new AppError(404, "Task not found.", "TASK_NOT_FOUND");
  return taskWithTrackedTime(task);
}

export async function createTask(userId, input) {
  const task = await prisma.task.create({
    data: { ...input, dueDate: input.dueDate ? new Date(input.dueDate) : null, userId },
    include: { timeLogs: { select: timeSelection } },
  });
  return taskWithTrackedTime(task);
}

export async function updateTask(userId, taskId, input) {
  await ensureTask(userId, taskId);
  const data = {
    ...input,
    ...(Object.hasOwn(input, "dueDate") && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
    ...(input.status === "COMPLETED" && { completedAt: new Date() }),
    ...(input.status && input.status !== "COMPLETED" && { completedAt: null }),
  };
  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: { timeLogs: { select: timeSelection } },
  });
  return taskWithTrackedTime(task);
}

export async function deleteTask(userId, taskId) {
  await ensureTask(userId, taskId);
  const activeLog = await prisma.timeLog.findFirst({ where: { taskId, userId, endedAt: null } });
  if (activeLog) throw new AppError(409, "Stop the active timer before deleting this task.", "ACTIVE_TIMER");
  await prisma.task.delete({ where: { id: taskId } });
}

async function ensureTask(userId, taskId, client = prisma) {
  const task = await client.task.findFirst({ where: { id: taskId, userId } });
  if (!task) throw new AppError(404, "Task not found.", "TASK_NOT_FOUND");
  return task;
}

export { ensureTask };


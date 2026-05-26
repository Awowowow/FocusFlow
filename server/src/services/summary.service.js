import { prisma } from "../config/prisma.js";
import { dayBounds, lastSevenDayRanges, overlapSeconds } from "../utils/dates.js";

const overlappingLogs = async (userId, start, end) => {
  return prisma.timeLog.findMany({
    where: { userId, startedAt: { lt: end }, OR: [{ endedAt: null }, { endedAt: { gt: start } }] },
    include: { task: { select: { id: true, title: true, status: true } } },
  });
};

export const todaySummary = async (user) => {
  const { start, end } = dayBounds(user.timezone);
  const [logs, completedToday, openTasks, reminders] = await Promise.all([
    overlappingLogs(user.id, start, end),
    prisma.task.count({ where: { userId: user.id, status: "COMPLETED", completedAt: { gte: start, lt: end } } }),
    prisma.task.count({ where: { userId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] } } }),
    prisma.task.findMany({
      where: { userId: user.id, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { not: null } },
      select: { id: true, title: true, status: true, dueDate: true, priority: true },
      orderBy: { dueDate: "asc" },
      take: 4,
    }),
  ]);
  const workedOn = new Map();
  let trackedSeconds = 0;
  logs.forEach((log) => {
    const seconds = overlapSeconds(log, start, end);
    trackedSeconds += seconds;
    const entry = workedOn.get(log.taskId) ?? { ...log.task, trackedSeconds: 0 };
    entry.trackedSeconds += seconds;
    workedOn.set(log.taskId, entry);
  });
  return {
    date: start.toISOString(),
    timezone: user.timezone,
    trackedSeconds,
    tasksWorkedOn: [...workedOn.values()].sort((a, b) => b.trackedSeconds - a.trackedSeconds),
    completedToday,
    openTasks,
    reminders,
  };
};

export const weeklySummary = async (user) => {
  const ranges = lastSevenDayRanges(user.timezone);
  const logs = await overlappingLogs(user.id, ranges[0].start, ranges[6].end);
  return {
    timezone: user.timezone,
    days: ranges.map((range) => ({
      date: range.date,
      label: range.label,
      trackedSeconds: logs.reduce((seconds, log) => seconds + overlapSeconds(log, range.start, range.end), 0),
    })),
  };
};

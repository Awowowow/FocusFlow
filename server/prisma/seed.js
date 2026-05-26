import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@focusflow.app";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User",
      email,
      passwordHash: await bcrypt.hash("Focusflow123", 12),
      timezone: "Asia/Kolkata",
    },
  });

  await prisma.timeLog.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });

  const tasks = await Promise.all([
    prisma.task.create({ data: { userId: user.id, title: "Review backend API structure", description: "Verify authorization rules and response conventions before submission.", status: "IN_PROGRESS", priority: "HIGH" } }),
    prisma.task.create({ data: { userId: user.id, title: "Polish dashboard UI", description: "Refine spacing, empty states, and mobile layout behavior.", status: "PENDING", priority: "MEDIUM" } }),
    prisma.task.create({ data: { userId: user.id, title: "Write deployment notes", description: "Document environment variables and production verification steps.", status: "COMPLETED", priority: "LOW", completedAt: new Date() } }),
  ]);

  const now = new Date();
  const completedSessions = [
    { taskId: tasks[0].id, hoursAgo: 1, durationSeconds: 3840 },
    { taskId: tasks[2].id, hoursAgo: 4, durationSeconds: 1920 },
    { taskId: tasks[1].id, hoursAgo: 27, durationSeconds: 2700 },
    { taskId: tasks[0].id, hoursAgo: 51, durationSeconds: 3180 },
  ];

  await prisma.timeLog.createMany({
    data: completedSessions.map(({ taskId, hoursAgo, durationSeconds }) => {
      const endedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
      return {
        userId: user.id,
        taskId,
        startedAt: new Date(endedAt.getTime() - durationSeconds * 1000),
        endedAt,
        durationSeconds,
      };
    }),
  });

  console.log("Seeded demo@focusflow.app / Focusflow123");
}

main().finally(() => prisma.$disconnect());


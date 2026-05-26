import { z } from "zod";

const timezone = z.string().trim().min(1).max(60).refine((value) => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: value });
    return true;
  } catch {
    return false;
  }
}, "Enter a valid timezone.");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(72).regex(/[A-Za-z]/, "Password needs a letter").regex(/[0-9]/, "Password needs a number"),
  timezone: timezone.default("Asia/Kolkata"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const optionalText = (maximum) => z.string().trim().max(maximum).nullable().optional();

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: optionalText(1000),
  originalInput: optionalText(500),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.iso.datetime().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
});

export const suggestionSchema = z.object({
  input: z.string().trim().min(3).max(500),
});

export const queryTasksSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  search: z.string().trim().max(100).optional(),
  sort: z.enum(["newest", "oldest", "updated"]).default("newest"),
});

export const logsQuerySchema = z.object({
  taskId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

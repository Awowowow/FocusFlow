import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export async function createAccount(input) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, "An account with this email already exists.", "EMAIL_IN_USE");
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: { name: input.name, email: input.email, timezone: input.timezone, passwordHash },
  });
}

export async function authenticate(input) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(401, "Incorrect email or password.", "INVALID_CREDENTIALS");
  }
  return user;
}


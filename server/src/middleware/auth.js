import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const headerToken = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const token = req.cookies[env.COOKIE_NAME] || headerToken;
  if (!token) throw new AppError(401, "Authentication required.", "UNAUTHENTICATED");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, "Your session is invalid or expired.", "UNAUTHENTICATED");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new AppError(401, "Account not found.", "UNAUTHENTICATED");
  req.user = user;
  next();
});


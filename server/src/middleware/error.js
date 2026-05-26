import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export const notFound = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found.`, "NOT_FOUND"));
};

export const errorHandler = (error, _req, res, _next) => {
  let normalized = error;
  if (error.code === "P2002") normalized = new AppError(409, "That value is already in use.", "CONFLICT");
  if (!(normalized instanceof AppError)) {
    console.error(error);
    normalized = new AppError(500, "Something went wrong on the server.", "INTERNAL_ERROR");
  }
  res.status(normalized.statusCode).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details && { details: normalized.details }),
      ...(env.NODE_ENV === "development" && error.stack && { stack: error.stack }),
    },
  });
};

import { AppError } from "../utils/AppError.js";

export const validate = (schema, source = "body") => (req, _res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    return next(new AppError(400, "Please check the submitted information.", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors));
  }
  req[source] = parsed.data;
  next();
};


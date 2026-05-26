import { Router } from "express";
import { active, logs } from "../controllers/timer.controller.js";
import { validate } from "../middleware/validate.js";
import { logsQuerySchema } from "../validators/schemas.js";

const router = Router();
router.get("/active", active);
router.get("/logs", validate(logsQuerySchema, "query"), logs);

export default router;


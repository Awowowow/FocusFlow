import { Router } from "express";
import { active, createLog, deleteLog, logs, updateLog } from "../controllers/timer.controller.js";
import { validate } from "../middleware/validate.js";
import { createLogSchema, logsQuerySchema, updateLogSchema } from "../validators/schemas.js";

const router = Router();
router.get("/active", active);
router.get("/logs", validate(logsQuerySchema, "query"), logs);
router.post("/logs", validate(createLogSchema), createLog);
router.patch("/logs/:logId", validate(updateLogSchema), updateLog);
router.delete("/logs/:logId", deleteLog);

export default router;

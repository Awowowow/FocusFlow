import { Router } from "express";
import * as tasks from "../controllers/task.controller.js";
import * as timers from "../controllers/timer.controller.js";
import { validate } from "../middleware/validate.js";
import { createTaskSchema, queryTasksSchema, suggestionSchema, updateTaskSchema } from "../validators/schemas.js";

const router = Router();
router.get("/", validate(queryTasksSchema, "query"), tasks.list);
router.post("/suggest", validate(suggestionSchema), tasks.suggest);
router.post("/", validate(createTaskSchema), tasks.create);
router.get("/:taskId", tasks.detail);
router.patch("/:taskId", validate(updateTaskSchema), tasks.update);
router.delete("/:taskId", tasks.remove);
router.post("/:taskId/timer/start", timers.start);
router.post("/:taskId/timer/stop", timers.stop);

export default router;


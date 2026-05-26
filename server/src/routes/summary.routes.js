import { Router } from "express";
import { today, weekly } from "../controllers/summary.controller.js";

const router = Router();
router.get("/today", today);
router.get("/weekly", weekly);

export default router;


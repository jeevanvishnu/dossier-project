import { Router } from "express";
import { getStats } from "../controller/stats.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);
router.use(authorize("superadmin"));

router.get("/stats", getStats);

export default router;

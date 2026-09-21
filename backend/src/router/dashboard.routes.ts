import { Router } from "express";
import { getCompanyStats } from "../controller/dashboard.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/stats", getCompanyStats);

export default router;

import { Router } from "express";
import { signIn, refreshAccessToken, logout, getMe } from "../controller/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
router.post("/signin",  signIn);
router.post("/refresh", refreshAccessToken);
router.post("/logout",  logout);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.get("/me", protect, getMe);

export default router;

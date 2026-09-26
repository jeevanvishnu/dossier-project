import { Router } from "express";
import { signIn, refreshAccessToken, logout, getMe, changePassword, forgotPassword, resetPassword } from "../controller/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { authLimiter, logoutLimiter, changePasswordLimiter, forgotPasswordLimiter, resetPasswordLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

// ─── Public Routes ───────────────────────────────────────────────────────────
router.post("/signin", authLimiter, signIn);
router.post("/refresh", authLimiter, refreshAccessToken);
router.post("/logout", logoutLimiter, logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePasswordLimiter, changePassword);

export default router;



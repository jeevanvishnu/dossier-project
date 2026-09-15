import { Router } from "express";
import { signIn, refreshAccessToken, logout, getMe, changePassword } from "../controller/auth.controller";
import { protect } from "../middleware/auth.middleware";
import { createRateLimiter } from "../middleware/rateLimiter.middleware";
import { csrfCheck } from "../middleware/csrf.middleware";

const router = Router();

// ─── Rate Limiters ───────────────────────────────────────────────────────────
// Known single-instance limiters (see rateLimiter.middleware.ts)
const signInRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 signin attempts per 15 min
  message: "Too many sign-in attempts. Please try again after 15 minutes.",
  name: "signin",
});

const refreshRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30, // Max 30 refresh requests per 15 min
  message: "Too many refresh attempts. Please try again later.",
  name: "refresh",
});

const changePasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 password changes per hour
  message: "Too many password change attempts. Please try again later.",
  name: "change-password",
});

// ─── Public Routes ───────────────────────────────────────────────────────────
router.post("/signin", signInRateLimiter, csrfCheck, signIn);
router.post("/refresh", refreshRateLimiter, csrfCheck, refreshAccessToken);
router.post("/logout", csrfCheck, logout);

// ─── Protected Routes ────────────────────────────────────────────────────────
router.get("/me", protect, getMe);
router.post("/change-password", protect, changePasswordRateLimiter, csrfCheck, changePassword);

export default router;

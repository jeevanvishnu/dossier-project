import { Router } from "express";
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controller/user.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Apply Authentication Guard to all endpoints
router.use(protect);

// ─── Read Endpoints (Admin & SuperAdmin Only) ──────────────────────────────────
router.get("/users", authorize("admin", "superadmin"), listUsers);
router.get("/users/:id", authorize("admin", "superadmin"), getUserById);

// ─── Admin-Only Mutation Endpoints ─────────────────────────────────────────────
router.post("/users", authorize("admin", "superadmin"), createUser);
router.patch("/users/:id", authorize("admin", "superadmin"), updateUser);
router.patch("/users/:id/block", authorize("admin", "superadmin"), blockUser);
router.patch("/users/:id/unblock", authorize("admin", "superadmin"), unblockUser);
router.delete("/users/:id", authorize("admin", "superadmin"), deleteUser);

export default router;

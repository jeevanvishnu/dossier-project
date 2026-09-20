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

// Apply Authentication & Admin Authorization Guard to all endpoints
router.use(protect);
router.use(authorize("admin", "superadmin"));

// ─── Admin User Management Endpoints ──────────────────────────────────────────
router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

export default router;

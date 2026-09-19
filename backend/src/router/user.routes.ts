import { Router } from "express";
import {
  createUser,
  createBulkUsers,
  listUsers,
  getUserById,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
} from "../controller/user.controller";
import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// Apply Authentication Guard and Admin Role Guard to all admin user routes
router.use(protect);
router.use(authorize("admin", "superadmin"));

// ─── User Management Endpoints ────────────────────────────────────────────────
router.post("/users", createUser);
router.post("/users/bulk", createBulkUsers);
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.patch("/users/:id/block", blockUser);
router.patch("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

export default router;

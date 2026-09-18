import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { addProjectMember, getProjectMembers, removeProjectMember } from "../controller/member.controller";

const router = Router();

// Get project members
router.get("/:id/members", protect, getProjectMembers);

// Add or update project member role (Requires owner)
router.post("/:id/members", protect, addProjectMember);

// Remove member from project (Requires owner)
router.delete("/:id/members/:memberId", protect, removeProjectMember);

export default router;

import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { checkProjectRole } from "../middleware/projectAuth.middleware";
import { getPackageArchives, compileProjectPackage } from "../controller/compilation.controller";

const router = Router();

// Fetch compiled package archives for a project
router.get("/:id/packages", protect, checkProjectRole("owner", "editor", "viewer"), getPackageArchives);

// Trigger eCTD XML backbone & ZIP compilation (Requires owner or editor)
router.post("/:id/compile", protect, checkProjectRole("owner", "editor"), compileProjectPackage);

export default router;

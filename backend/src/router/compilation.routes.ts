import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { getPackageArchives, compileProjectPackage } from "../controller/compilation.controller";

const router = Router();

// Fetch compiled package archives for a project
router.get("/:id/packages", protect, getPackageArchives);

// Trigger eCTD XML backbone & ZIP compilation (Requires owner or editor)
router.post("/:id/compile", protect, compileProjectPackage);

export default router;

import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import { checkProjectRole } from "../middleware/projectAuth.middleware";
import { getProjects, createProject, getDossierData, updateDossierData } from "../controller/project.controller";

const router = Router();

// Get all projects
router.get("/", protect, getProjects);

// Create new project dossier
router.post("/", protect, authorize("admin", "user", "superadmin"), createProject);

// Get dossier project metadata
router.get("/:id/dossier-data", protect, checkProjectRole("owner", "editor", "viewer"), getDossierData);

// Update dossier project metadata
router.put("/:id/dossier-data", protect, checkProjectRole("owner", "editor"), updateDossierData);

export default router;

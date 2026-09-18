import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import {
  getProjects,
  createProject,
  getDossierData,
  updateDossierData,
  updateProject,
  deleteProject,
  deleteDossierConfig,
} from "../controller/project.controller";

const router = Router();

// Get all projects
router.get("/", protect, getProjects);

// Create new project dossier
router.post("/", protect, authorize("admin", "user", "superadmin"), createProject);

// Get dossier project metadata
router.get("/:id/dossier-data", protect, getDossierData);

// Update dossier project metadata
router.put("/:id/dossier-data", protect, updateDossierData);

// Delete (reset) dossier configuration only
router.delete("/:id/dossier-config/:dossierConfigId", protect, deleteDossierConfig);
router.delete("/:id/dossier-config", protect, deleteDossierConfig);

// Update project details directly
router.put("/:id", protect, updateProject);

// Delete project and all associated records
router.delete("/:id", protect, deleteProject);

export default router;

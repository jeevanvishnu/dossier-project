import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { checkProjectRole } from "../middleware/projectAuth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import {
  uploadDocument,
  getDocumentByNode,
  deleteDocumentByNode,
  seedSorbitDossier,
  updateDocumentDates,
} from "../controller/document.controller";

const router = Router();

// Upload document for a specific nodeId (Requires owner or editor)
router.post(
  "/:id/documents/:nodeId",
  protect,
  checkProjectRole("owner", "editor"),
  uploadMiddleware,
  uploadDocument
);

// View document metadata & ImageKit URL for a specific nodeId
router.get(
  "/:id/documents/:nodeId",
  protect,
  checkProjectRole("owner", "editor", "viewer"),
  getDocumentByNode
);

// Update document issue and expiration dates (Requires owner or editor)
router.put(
  "/:id/documents/:nodeId/dates",
  protect,
  checkProjectRole("owner", "editor"),
  updateDocumentDates
);

// Delete document at a specific nodeId (Requires owner or editor)
router.delete(
  "/:id/documents/:nodeId",
  protect,
  checkProjectRole("owner", "editor"),
  deleteDocumentByNode
);

// Seed project with Russian client Sorbit dossier documents
router.post(
  "/:id/seed-sorbit",
  protect,
  checkProjectRole("owner", "editor"),
  seedSorbitDossier
);

export default router;

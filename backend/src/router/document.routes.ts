import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import {
  uploadDocument,
  getDocumentByNode,
  getAllProjectDocuments,
  deleteDocumentByNode,
  seedSorbitDossier,
  updateDocumentDates,
} from "../controller/document.controller";

const router = Router();

// View all active documents for a project (Requires owner, editor, or viewer)
router.get(
  "/:id/documents",
  protect,
  getAllProjectDocuments
);

// Upload document for a specific nodeId (Requires owner or editor)
router.post(
  "/:id/documents/:nodeId",
  protect,
  uploadMiddleware,
  uploadDocument
);

// View document metadata & ImageKit URL for a specific nodeId
router.get(
  "/:id/documents/:nodeId",
  protect,
  getDocumentByNode
);

// Update document issue and expiration dates (Requires owner or editor)
router.put(
  "/:id/documents/:nodeId/dates",
  protect,
  updateDocumentDates
);

// Delete document at a specific nodeId (Requires owner or editor)
router.delete(
  "/:id/documents/:nodeId",
  protect,
  deleteDocumentByNode
);

// Seed project with Russian client Sorbit dossier documents
router.post(
  "/:id/seed-sorbit",
  protect,
  seedSorbitDossier
);

export default router;

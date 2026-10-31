import { Router } from "express";
import { protect, authorize } from "../middleware/auth.middleware";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimiter.middleware";
import {
  uploadDocument,
  getDocumentByNode,
  getAllProjectDocuments,
  deleteDocumentByNode,
  seedSorbitDossier,
  updateDocumentDates,
  getDocumentPresignedUrl,
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
  uploadLimiter,
  uploadMiddleware,
  uploadDocument
);

// View document metadata for a specific nodeId
router.get(
  "/:id/documents/:nodeId",
  protect,
  getDocumentByNode
);

// Get presigned R2 download URL by docId or nodeId
router.get(
  "/:id/documents/url/:docId",
  protect,
  getDocumentPresignedUrl
);

router.get(
  "/:id/documents/:nodeId/url",
  protect,
  getDocumentPresignedUrl
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

// Seed project with Russian client Sorbit dossier documents (SuperAdmin only)
router.post(
  "/:id/seed-sorbit",
  protect,
  authorize("superadmin"),
  seedSorbitDossier
);

export default router;

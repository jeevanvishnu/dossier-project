import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { uploadLimiter } from "../middleware/rateLimiter.middleware";
import {
  initiateUpload,
  completeUpload,
  abortUpload,
  getDocumentPresignedUrlDirect,
} from "../controller/upload.controller";

const router = Router();

router.post("/initiate", protect, uploadLimiter, initiateUpload);
router.post("/complete", protect, completeUpload);
router.post("/abort", protect, abortUpload);
router.get("/url/:docId", protect, getDocumentPresignedUrlDirect);

export default router;


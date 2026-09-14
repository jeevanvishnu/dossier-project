import multer from "multer";
import { Request, Response, NextFunction } from "express";

const singleUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Limit
}).single("file");

/**
 * Multer parses file names from the HTTP Content-Disposition header as Latin-1 (ISO-8859-1).
 * This wrapper re-decodes req.file.originalname as UTF-8 so that non-ASCII names
 * (Cyrillic, Chinese, etc.) are stored correctly instead of appearing garbled.
 */
export function uploadMiddleware(req: Request, res: Response, next: NextFunction): void {
  singleUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          success: false,
          message: "Payload Too Large: Uploaded file exceeds maximum allowed limit of 50MB.",
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
      });
      return;
    } else if (err) {
      res.status(500).json({
        success: false,
        message: `Server error processing file upload: ${err.message}`,
      });
      return;
    }

    // Re-decode filename: multer reads Content-Disposition as Latin-1; convert to UTF-8
    if (req.file) {
      req.file.originalname = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    }

    next();
  });
}


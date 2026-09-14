import ImageKit from "imagekit";
import axios from "axios";

// ─── Dynamic ImageKit Initialization ────────────────────────────────────────
function getImageKitClient(): ImageKit {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "[ImageKit Service] Missing configuration. Ensure IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, and IMAGEKIT_URL_ENDPOINT are set in .env"
    );
  }

  return new ImageKit({
    publicKey,
    privateKey,
    urlEndpoint,
  });
}

/**
 * Uploads an in-memory file Buffer to ImageKit.
 * Zero-Disk architecture: directly stream/upload buffer.
 */
export async function uploadToImageKit(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "/ectd-dossiers"
): Promise<{ url: string; fileId: string }> {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error("[ImageKit Service] Provided file buffer is empty or invalid.");
  }

  const imagekit = getImageKitClient();
  const filePayload = Buffer.isBuffer(fileBuffer) ? fileBuffer.toString("base64") : fileBuffer;

  const result = await imagekit.upload({
    file: filePayload,
    fileName: fileName || "document.pdf",
    folder,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
}

/**
 * Deletes a file from ImageKit given its fileId.
 * Used for document deletion and distributed rollback error handling.
 */
export async function deleteFromImageKit(fileId: string): Promise<void> {
  const imagekit = getImageKitClient();
  await new Promise<void>((resolve, reject) => {
    imagekit.deleteFile(fileId, (error, result) => {
      if (error) {
        console.error(`[ImageKit Service] Delete failed for fileId: ${fileId}`, error);
        return reject(error);
      }
      resolve();
    });
  });
}

/**
 * Downloads a file from an ImageKit URL directly into memory as a Buffer.
 */
export async function downloadFileBuffer(fileUrl: string): Promise<Buffer> {
  const response = await axios.get(fileUrl, {
    responseType: "arraybuffer",
    timeout: 30000,
  });
  return Buffer.from(response.data);
}

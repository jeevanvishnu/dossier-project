import crypto from "crypto";

/**
 * Calculates MD5 checksum of a Buffer or string.
 * @param data Buffer | string
 * @returns 32-character hexadecimal MD5 hash
 */
export function calculateMD5(data: Buffer | string): string {
  return crypto.createHash("md5").update(data).digest("hex");
}

import crypto from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("FATAL: ACCESS_TOKEN_SECRET (or JWT_ACCESS_SECRET) environment variable is missing!");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("FATAL: REFRESH_TOKEN_SECRET (or JWT_REFRESH_SECRET) environment variable is missing!");
}

// ─── SHA-256 Token Hashing Helper ──────────────────────────────────────────
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Access Token  (short-lived: 15 min) ───────────────────────────────────
export function generateAccessToken(payload: {
  id: number;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET!, { expiresIn: "15m" } as SignOptions);
}

// ─── Refresh Token  (long-lived: 7 days) ───────────────────────────────────
export function generateRefreshToken(payload: {
  id: number;
  familyId: string;
  sessionId: number;
}): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET!, { expiresIn: "7d" } as SignOptions);
}

// ─── Verify Access Token ────────────────────────────────────────────────────
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET!);
}

// ─── Verify Refresh Token ───────────────────────────────────────────────────
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET!);
}


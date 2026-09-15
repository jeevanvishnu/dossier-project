import crypto from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";

function getAccessTokenSecret(): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("FATAL: ACCESS_TOKEN_SECRET (or JWT_ACCESS_SECRET) environment variable is missing!");
  }
  return secret;
}

function getRefreshTokenSecret(): string {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("FATAL: REFRESH_TOKEN_SECRET (or JWT_REFRESH_SECRET) environment variable is missing!");
  }
  return secret;
}

// ─── SHA-256 Token Hashing Helper ──────────────────────────────────────────
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Access Token (short-lived: 15 min) ───────────────────────────────────
export function generateAccessToken(payload: {
  id: number;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, getAccessTokenSecret(), { expiresIn: "15m" } as SignOptions);
}

// ─── Refresh Token (long-lived: 7 days) ───────────────────────────────────
export function generateRefreshToken(payload: {
  id: number;
  familyId: string;
  sessionId: number;
}): string {
  return jwt.sign(payload, getRefreshTokenSecret(), { expiresIn: "7d" } as SignOptions);
}

// ─── Verify Access Token ────────────────────────────────────────────────────
export function verifyAccessToken(token: string) {
  return jwt.verify(token, getAccessTokenSecret());
}

// ─── Verify Refresh Token ───────────────────────────────────────────────────
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, getRefreshTokenSecret());
}

import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET  = process.env.JWT_ACCESS_SECRET  || "change_me_access";
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || "change_me_refresh";

// ─── Access Token  (short-lived: 15 min) ───────────────────────────────────
export function generateAccessToken(payload: {
  id: number;
  email: string;
  role: string;
}): string {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" } as SignOptions);
}

// ─── Refresh Token  (long-lived: 7 days) ───────────────────────────────────
export function generateRefreshToken(payload: { id: number }): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" } as SignOptions);
}

// ─── Verify Access Token ────────────────────────────────────────────────────
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

// ─── Verify Refresh Token ───────────────────────────────────────────────────
export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}

import { z } from "zod";

// ─────────────────────────────────────────────
//  Sign-in Validation Schema  (Zod v4 API)
// ─────────────────────────────────────────────
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long"),
});

// ─────────────────────────────────────────────
//  Inferred TypeScript Types
// ─────────────────────────────────────────────
export type SignInInput = z.infer<typeof signInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


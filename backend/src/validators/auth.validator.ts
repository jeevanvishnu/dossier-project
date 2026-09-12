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

// ─────────────────────────────────────────────
//  Inferred TypeScript Types
// ─────────────────────────────────────────────
export type SignInInput = z.infer<typeof signInSchema>;


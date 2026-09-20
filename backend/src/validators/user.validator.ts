import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
  role: z.enum(["user", "admin", "superadmin"]).default("user"),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .optional(),
  role: z.enum(["user", "admin", "superadmin"]).optional(),
});

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  role: z.enum(["user", "admin", "superadmin"]).optional(),
  isBlocked: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQueryInput = z.infer<typeof listUsersQuerySchema>;

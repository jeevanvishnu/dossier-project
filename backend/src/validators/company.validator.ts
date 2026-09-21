import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").max(255),
  email: z.string().email("Invalid email format").max(255),
  mobile: z.string().max(50).optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createCompanyMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format").max(255),
  companyId: z.number().int().positive("Invalid company ID"),
  maxUsers: z.number().int().min(1).default(10),
  storageGb: z.number().int().min(1).default(5),
  imageBase64: z.string().optional().nullable(),
});

export const updateCompanyMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  email: z.string().email("Invalid email format").max(255).optional(),
  companyId: z.number().int().positive("Invalid company ID").optional(),
  maxUsers: z.number().int().min(1).optional(),
  storageGb: z.number().int().min(1).optional(),
  imageBase64: z.string().optional().nullable(),
});


import { z } from "zod";

export const createProjectSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  dosageForm: z.string().optional(),
  productType: z.string().optional(),
  manufacturer: z.string().optional(),
  mahHolder: z.string().optional(),
  responsibleUser: z.string().optional(),
  tariff: z.string().optional(),
  additionalFeature: z.string().optional(),
  // dossier_config optional overrides on create
  submissionCountry: z.string().optional().default("KAZAKHSTAN"),
  role: z.string().optional(),
  procedureType: z.string().optional(),
  typeOfProcedure: z.string().optional(),
  applicationNumber: z.string().optional(),
  dossierSequence: z.string().optional().default("Sequence 0000"),
});

export const updateDossierDataSchema = z.object({
  version: z.number().int().optional(),
  productName: z.string().min(1, "Product name cannot be empty").optional(),
  dosageForm: z.string().optional(),
  productType: z.string().optional(),
  manufacturer: z.string().optional(),
  mahHolder: z.string().optional(),
  responsibleUser: z.string().optional(),
  tariff: z.string().optional(),
  additionalFeature: z.string().optional(),
  status: z.string().optional(),
  // dossier_config fields
  submissionCountry: z.string().optional(),
  role: z.string().optional(),
  procedureType: z.string().optional(),
  typeOfProcedure: z.string().optional(),
  applicationNumber: z.string().optional(),
  dossierSequence: z.string().optional(),
  dossierDetails: z.any().optional(),
});

export const addMemberSchema = z.object({
  userId: z.number().int().positive("Valid userId is required"),
  role: z.enum(["owner", "editor", "viewer"]).default("editor"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateDossierDataInput = z.infer<typeof updateDossierDataSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;

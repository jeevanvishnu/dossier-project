import { z } from "zod";

export const uploadDocumentParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
  nodeId: z.string().min(1, "Node ID is required (e.g. 1.2.1-01002)"),
});

export const documentNodeParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
  nodeId: z.string().min(1, "Node ID is required"),
});

export type UploadDocumentParams = z.infer<typeof uploadDocumentParamsSchema>;

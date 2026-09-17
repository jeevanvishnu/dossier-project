import { Request, Response } from "express";
import { db } from "../db/db";
import { projects, dossierConfig, projectMembers, auditLogs, packageArchives, projectDocuments } from "../db/schema";
import { createProjectSchema, updateDossierDataSchema } from "../validators/project.validator";
import { parseIdParam, resolveProjectId } from "../utils/params.util";
import { deleteFromImageKit } from "../services/imagekit.service";
import { eq, and, desc, isNotNull, sql } from "drizzle-orm";

import crypto from "crypto";

function generateProjectCode(): string {
  return crypto.randomUUID();
}

/**
 * GET /api/projects
 * Fetch all projects from database.
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;

    const projectsList = await db.query.projects.findMany({
      with: { dossierConfig: true },
      orderBy: [desc(projects.createdAt)],
      limit,
      offset,
    });

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(projects);
    const totalCount = Number(countResult[0]?.count || 0);

    res.status(200).json({
      success: true,
      count: projectsList.length,
      data: projectsList,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: any) {
    console.error("[Get Projects Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
}

/**
 * POST /api/projects
 * Create a new project, auto-generate a unique project code, initialize a default dossier_config row ('Sequence 0000'),
 * assign creator as owner, and log audit entry.
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.flatten() });
      return;
    }

    const input = parseResult.data;
    const projectCode = generateProjectCode();
    const currentUser = req.user;

    const result = await db.transaction(async (tx) => {
      const [newProject] = await tx
        .insert(projects)
        .values({
          projectCode,
          productName: input.productName,
          dosageForm: input.dosageForm,
          productType: input.productType,
          manufacturer: input.manufacturer,
          mahHolder: input.mahHolder,
          responsibleUser: input.responsibleUser || currentUser?.email || "System User",
          tariff: input.tariff || "Tariff OWN",
          additionalFeature: input.additionalFeature || "Standard",
          status: "Active",
          isProjectSaved: true,
        })
        .returning();

      const [newConfig] = await tx
        .insert(dossierConfig)
        .values({
          projectId: newProject.id,
          submissionCountry: input.submissionCountry || "KAZAKHSTAN",
          role: input.role,
          procedureType: input.procedureType,
          typeOfProcedure: input.typeOfProcedure,
          applicationNumber: input.applicationNumber || "",
          dossierSequence: input.dossierSequence || "Sequence 0000",
          isDossierSaved: false,
        })
        .returning();

      if (currentUser?.id) {
        await tx.insert(projectMembers).values({
          projectId: newProject.id,
          userId: currentUser.id,
          role: "owner",
        });
      }

      await tx.insert(auditLogs).values({
        projectId: newProject.id,
        logType: "SUCCESS",
        message: `Project ${projectCode} (${input.productName}) created and dossier sequence initialized to '${newConfig.dossierSequence}'.`,
        userCredentials: currentUser ? `${currentUser.email} (${currentUser.role})` : "System",
      });

      return { project: newProject, config: newConfig };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: "Project created successfully",
    });
  } catch (error: any) {
    console.error("[Create Project Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create project" });
  }
}

/**
 * GET /api/projects/:id/dossier-data
 */
export async function getDossierData(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID or code" });
      return;
    }

    const projectData = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        dossierConfig: true,
        documents: true,
        members: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!projectData) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    const allConfigs = await db.query.dossierConfig.findMany({
      where: eq(dossierConfig.projectId, projectId),
    });

    const { dossierConfig: config, documents, ...project } = projectData;

    const totalFileSize = (documents || []).reduce((sum: number, doc: any) => sum + (doc.fileSize || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        project,
        dossierConfig: allConfigs[0] || config || null,
        dossierConfigs: allConfigs,
        dossierSize: totalFileSize,
      },
    });
  } catch (error: any) {
    console.error("[Get Dossier Data Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch dossier data" });
  }
}

/**
 * PUT /api/projects/:id/dossier-data & PUT /api/projects/:id
 */
export async function updateDossierData(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID or code" });
      return;
    }

    const parseResult = updateDossierDataSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.flatten() });
      return;
    }

    const input = parseResult.data;
    const currentUser = req.user;

    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: { dossierConfig: true },
    });

    if (!existingProject) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Optimistic Concurrency Control Check
    if (input.version !== undefined && existingProject.version !== input.version) {
      res.status(409).json({
        success: false,
        message: "Conflict: Dossier metadata has been modified by another team member. Please refresh and try again.",
        currentVersion: existingProject.version,
      });
      return;
    }

    const nextVersion = existingProject.version + 1;

    const updatedData = await db.transaction(async (tx) => {
      // Build dynamic project update payload
      const projectPayload: Record<string, any> = {
        version: nextVersion,
        updatedAt: new Date(),
      };
      if (input.productName !== undefined) projectPayload.productName = input.productName;
      if (input.dosageForm !== undefined) projectPayload.dosageForm = input.dosageForm;
      if (input.productType !== undefined) projectPayload.productType = input.productType;
      if (input.manufacturer !== undefined) projectPayload.manufacturer = input.manufacturer;
      if (input.mahHolder !== undefined) projectPayload.mahHolder = input.mahHolder;
      if (input.responsibleUser !== undefined) projectPayload.responsibleUser = input.responsibleUser;
      if (input.tariff !== undefined) projectPayload.tariff = input.tariff;
      if (input.additionalFeature !== undefined) projectPayload.additionalFeature = input.additionalFeature;
      if (input.status !== undefined) projectPayload.status = input.status;

      const hasProjectFields =
        input.productName !== undefined ||
        input.dosageForm !== undefined ||
        input.productType !== undefined ||
        input.manufacturer !== undefined ||
        input.mahHolder !== undefined ||
        input.responsibleUser !== undefined ||
        input.tariff !== undefined ||
        input.additionalFeature !== undefined;

      if (hasProjectFields) {
        projectPayload.isProjectSaved = true;
      }

      const [updatedProject] = await tx
        .update(projects)
        .set(projectPayload)
        .where(eq(projects.id, projectId))
        .returning();

      // Check if dossier config fields are provided
      const hasConfigFields =
        input.submissionCountry !== undefined ||
        input.role !== undefined ||
        input.procedureType !== undefined ||
        input.typeOfProcedure !== undefined ||
        input.applicationNumber !== undefined ||
        input.dossierSequence !== undefined ||
        input.dossierDetails !== undefined;

      let updatedConfig = existingProject.dossierConfig || null;

      if (hasConfigFields) {
        let existingConfigForId = null;
        if (input.dossierConfigId) {
          existingConfigForId = await tx.query.dossierConfig.findFirst({
            where: and(eq(dossierConfig.id, input.dossierConfigId), eq(dossierConfig.projectId, projectId)),
          });
        } else if (!input.createNewDossier && existingProject.dossierConfig) {
          existingConfigForId = existingProject.dossierConfig;
        }

        const mergedDetails = input.dossierDetails !== undefined
          ? {
            ...((existingConfigForId?.dossierDetails as Record<string, any>) || {}),
            ...input.dossierDetails,
          }
          : undefined;

        const configFields: Record<string, any> = {
          isDossierSaved: true,
          ...(input.submissionCountry !== undefined ? { submissionCountry: input.submissionCountry } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.procedureType !== undefined ? { procedureType: input.procedureType } : {}),
          ...(input.typeOfProcedure !== undefined ? { typeOfProcedure: input.typeOfProcedure } : {}),
          ...(input.applicationNumber !== undefined ? { applicationNumber: input.applicationNumber } : {}),
          ...(input.dossierSequence !== undefined ? { dossierSequence: input.dossierSequence } : {}),
          ...(mergedDetails !== undefined ? { dossierDetails: mergedDetails } : {}),
        };

        if (!input.createNewDossier && existingConfigForId) {
          const [conf] = await tx
            .update(dossierConfig)
            .set(configFields)
            .where(eq(dossierConfig.id, existingConfigForId.id))
            .returning();
          updatedConfig = conf;
        } else {
          const [conf] = await tx
            .insert(dossierConfig)
            .values({
              projectId,
              submissionCountry: input.submissionCountry || "KAZAKHSTAN",
              role: input.role || "Reference Member State (RMS)",
              procedureType: input.procedureType || "Mutual Recognition (MRP)",
              typeOfProcedure: input.typeOfProcedure || "Bringing into conformity",
              applicationNumber: input.applicationNumber || "",
              dossierSequence: input.dossierSequence || "Sequence 0000",
              isDossierSaved: true,
              dossierDetails: input.dossierDetails || mergedDetails || null,
            })
            .returning();
          updatedConfig = conf;
        }
      }

      const allConfigs = await tx.query.dossierConfig.findMany({
        where: eq(dossierConfig.projectId, projectId),
      });

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Project & Dossier metadata updated to version ${nextVersion}.`,
        userCredentials: currentUser ? `${currentUser.email} (${currentUser.role})` : "System",
      });

      return { project: updatedProject, dossierConfig: updatedConfig, dossierConfigs: allConfigs };
    });

    res.status(200).json({
      success: true,
      data: updatedData,
      message: "Dossier data updated successfully",
    });
  } catch (error: any) {
    console.error("[Update Dossier Data Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update project" });
  }
}

export const updateProject = updateDossierData;

/**
 * DELETE /api/projects/:id
 * Deletes a project and all associated cascade records:
 * - Product Metadata (projects table)
 * - Dossier Data & Configuration (dossier_config table)
 * - Dossier History (audit_logs table)
 * - XML Creation History (package_archives table)
 * - Project Documents & ImageKit Cloud Assets (project_documents table)
 * - Project Team Members (project_members table)
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID or code" });
      return;
    }

    // Check if project exists
    const existingProject = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
    });

    if (!existingProject) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Collect any ImageKit asset IDs before deleting project document records
    const docRecords = await db.query.projectDocuments.findMany({
      where: eq(projectDocuments.projectId, projectId),
      columns: { imageKitFileId: true },
    });
    const imageKitFileIds = docRecords
      .map((d) => d.imageKitFileId)
      .filter((id): id is string => Boolean(id));

    // Perform full atomic transaction across all associated tables
    const deletedProject = await db.transaction(async (tx) => {
      // 1. Delete Dossier History (audit_logs)
      await tx.delete(auditLogs).where(eq(auditLogs.projectId, projectId));

      // 2. Delete XML Creation History (package_archives)
      await tx.delete(packageArchives).where(eq(packageArchives.projectId, projectId));

      // 3. Delete Project Documents (project_documents)
      await tx.delete(projectDocuments).where(eq(projectDocuments.projectId, projectId));

      // 4. Delete Dossier Data & Configuration (dossier_config)
      await tx.delete(dossierConfig).where(eq(dossierConfig.projectId, projectId));

      // 5. Delete Project Team Members (project_members)
      await tx.delete(projectMembers).where(eq(projectMembers.projectId, projectId));

      // 6. Delete Project & Product Metadata (projects)
      const [deleted] = await tx
        .delete(projects)
        .where(eq(projects.id, projectId))
        .returning();

      return deleted;
    });

    // Asynchronously delete cloud storage assets (ImageKit) without blocking response
    if (imageKitFileIds.length > 0) {
      Promise.allSettled(imageKitFileIds.map((fileId) => deleteFromImageKit(fileId))).catch((err) => {
        console.warn("[Delete Project] Cloud asset cleanup warning:", err);
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: deletedProject.id,
        projectCode: deletedProject.projectCode,
        productName: deletedProject.productName,
      },
      message: `Project ${deletedProject.productName} (${deletedProject.projectCode}) and all associated product metadata, dossier data, configuration, dossier history, and XML creation history were deleted successfully.`,
    });
  } catch (error: any) {
    console.error("[Delete Project Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete project" });
  }
}

/**
 * DELETE /api/projects/:id/dossier-config
 * Resets (clears) the dossier configuration for a project back to defaults.
 * This does not delete the project itself — only wipes the dossier metadata.
 */
export async function deleteDossierConfig(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID or code" });
      return;
    }

    const currentUser = req.user;
    const rawTargetId = req.params.dossierConfigId || (typeof req.query.dossierConfigId === "string" ? req.query.dossierConfigId : null) || req.body?.dossierConfigId;
    const targetConfigId = rawTargetId ? parseInt(String(rawTargetId)) : null;

    if (targetConfigId) {
      await db
        .delete(dossierConfig)
        .where(and(eq(dossierConfig.id, targetConfigId), eq(dossierConfig.projectId, projectId)));
    } else {
      const existingConfig = await db.query.dossierConfig.findFirst({
        where: eq(dossierConfig.projectId, projectId),
      });
      if (existingConfig) {
        await db.delete(dossierConfig).where(eq(dossierConfig.id, existingConfig.id));
      }
    }

    const remainingConfigs = await db.query.dossierConfig.findMany({
      where: eq(dossierConfig.projectId, projectId),
    });

    await db.insert(auditLogs).values({
      projectId,
      logType: "WARNING",
      message: `Dossier configuration was deleted.`,
      userCredentials: currentUser ? `${currentUser.email} (${currentUser.role})` : "System",
    });

    res.status(200).json({
      success: true,
      data: { remainingConfigs },
      message: "Dossier configuration deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete Dossier Config Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete dossier configuration" });
  }
}


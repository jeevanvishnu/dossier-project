import { Request, Response } from "express";
import { db } from "../db/db";
import { projects, dossierConfig, projectMembers, auditLogs } from "../db/schema";
import { createProjectSchema, updateDossierDataSchema } from "../validators/project.validator";
import { parseIdParam, resolveProjectId } from "../utils/params.util";
import { eq, desc } from "drizzle-orm";

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
    
    // Fallback count query since count() can be tricky across different drizzle versions
    const allProjects = await db.query.projects.findMany({ columns: { id: true } });
    const totalCount = allProjects.length;

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
          isProjectSaved: false,
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
          applicationNumber: input.applicationNumber || projectCode,
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

    const { dossierConfig: config, ...project } = projectData;

    res.status(200).json({
      success: true,
      data: {
        project,
        dossierConfig: config || null,
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
        input.dossierSequence !== undefined;

      let updatedConfig = existingProject.dossierConfig || null;

      if (hasConfigFields) {
        const configFields = {
          isDossierSaved: true,
          ...(input.submissionCountry !== undefined ? { submissionCountry: input.submissionCountry } : {}),
          ...(input.role !== undefined ? { role: input.role } : {}),
          ...(input.procedureType !== undefined ? { procedureType: input.procedureType } : {}),
          ...(input.typeOfProcedure !== undefined ? { typeOfProcedure: input.typeOfProcedure } : {}),
          ...(input.applicationNumber !== undefined ? { applicationNumber: input.applicationNumber } : {}),
          ...(input.dossierSequence !== undefined ? { dossierSequence: input.dossierSequence } : {}),
        };

        if (existingProject.dossierConfig) {
          const [conf] = await tx
            .update(dossierConfig)
            .set(configFields)
            .where(eq(dossierConfig.projectId, projectId))
            .returning();
          updatedConfig = conf;
        } else {
          const [conf] = await tx
            .insert(dossierConfig)
            .values({
              projectId,
              submissionCountry: input.submissionCountry || "KAZAKHSTAN",
              role: input.role,
              procedureType: input.procedureType,
              typeOfProcedure: input.typeOfProcedure,
              applicationNumber: input.applicationNumber || existingProject.projectCode,
              dossierSequence: input.dossierSequence || "Sequence 0000",
              isDossierSaved: true,
            })
            .returning();
          updatedConfig = conf;
        }
      }

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Project & Dossier metadata updated to version ${nextVersion}.`,
        userCredentials: currentUser ? `${currentUser.email} (${currentUser.role})` : "System",
      });

      return { project: updatedProject, dossierConfig: updatedConfig };
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
 * Deletes a project and all associated cascade records (dossier_config, members, documents, audit_logs, package_archives).
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) {
      res.status(400).json({ success: false, message: "Invalid project ID or code" });
      return;
    }

    const [deleted] = await db
      .delete(projects)
      .where(eq(projects.id, projectId))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { id: deleted.id, projectCode: deleted.projectCode, productName: deleted.productName },
      message: `Project ${deleted.productName} (${deleted.projectCode}) deleted successfully`,
    });
  } catch (error: any) {
    console.error("[Delete Project Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete project" });
  }
}


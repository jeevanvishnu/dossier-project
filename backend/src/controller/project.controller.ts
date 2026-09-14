import { Request, Response } from "express";
import { db } from "../db/db";
import { projects, dossierConfig, projectMembers, auditLogs } from "../db/schema";
import { createProjectSchema, updateDossierDataSchema } from "../validators/project.validator";
import { parseIdParam } from "../utils/params.util";
import { eq, desc } from "drizzle-orm";

function generateProjectCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PRJ-${dateStr}-${randomSuffix}`;
}

/**
 * GET /api/projects
 * Fetch all projects from database.
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    const projectsList = await db.query.projects.findMany({
      with: { dossierConfig: true },
      orderBy: [desc(projects.createdAt)],
    });

    res.status(200).json({
      success: true,
      count: projectsList.length,
      data: projectsList,
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
          tariff: input.tariff,
          status: "Active",
        })
        .returning();

      const [newConfig] = await tx
        .insert(dossierConfig)
        .values({
          projectId: newProject.id,
          submissionCountry: input.submissionCountry || "US",
          role: input.role,
          procedureType: input.procedureType,
          typeOfProcedure: input.typeOfProcedure,
          applicationNumber: input.applicationNumber || projectCode,
          dossierSequence: input.dossierSequence || "Sequence 0000",
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
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
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

    res.status(200).json({
      success: true,
      data: projectData,
    });
  } catch (error: any) {
    console.error("[Get Dossier Data Error]", error);
    res.status(500).json({ success: false, message: "Failed to fetch dossier data" });
  }
}

/**
 * PUT /api/projects/:id/dossier-data
 */
export async function updateDossierData(req: Request, res: Response): Promise<void> {
  try {
    const projectId = parseIdParam(req.params.id);
    if (isNaN(projectId)) {
      res.status(400).json({ success: false, message: "Invalid project ID" });
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
      const [updatedProject] = await tx
        .update(projects)
        .set({
          productName: input.productName,
          dosageForm: input.dosageForm,
          productType: input.productType,
          manufacturer: input.manufacturer,
          mahHolder: input.mahHolder,
          responsibleUser: input.responsibleUser,
          tariff: input.tariff,
          version: nextVersion,
          updatedAt: new Date(),
          ...(input.status ? { status: input.status } : {}),
        })
        .where(eq(projects.id, projectId))
        .returning();

      const [updatedConfig] = await tx
        .update(dossierConfig)
        .set({
          submissionCountry: input.submissionCountry,
          role: input.role,
          procedureType: input.procedureType,
          typeOfProcedure: input.typeOfProcedure,
          applicationNumber: input.applicationNumber,
          dossierSequence: input.dossierSequence,
        })
        .where(eq(dossierConfig.projectId, projectId))
        .returning();

      await tx.insert(auditLogs).values({
        projectId,
        logType: "SUCCESS",
        message: `Project & Dossier metadata updated to version ${nextVersion} for project ID ${projectId}.`,
        userCredentials: currentUser ? `${currentUser.email} (${currentUser.role})` : "System",
      });

      return { project: updatedProject, config: updatedConfig };
    });

    res.status(200).json({
      success: true,
      data: updatedData,
      message: "Dossier metadata updated successfully",
    });
  } catch (error: any) {
    console.error("[Update Dossier Data Error]", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update dossier metadata" });
  }
}

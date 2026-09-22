import { Request, Response } from "express";
import { db } from "../db/db";
import { companies, companyMembers, users } from "../db/schema";
import { eq, sql, and } from "drizzle-orm";
import { parseIdParam } from "../utils/params.util";
import {
  createCompanySchema,
  updateCompanySchema,
  createCompanyMemberSchema,
  updateCompanyMemberSchema,
} from "../validators/company.validator";
import { UserManagementService } from "../services/user.service";
import { uploadToImageKit, deleteFromImageKit } from "../services/imagekit.service";
import bcrypt from "bcrypt";
import { getResendClient } from "../services/email.service";

export async function createCompany(req: Request, res: Response): Promise<void> {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const [newCompany] = await db
      .insert(companies)
      .values(parsed.data)
      .returning();

    // Send welcome email via Resend if singleton client is available
    const resend = getResendClient();
    if (resend) {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: newCompany.email,
        subject: `Welcome to eCTD Portal - ${newCompany.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
              <div style="background-color: #0f172a; padding: 24px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">Welcome to eCTD Portal</h1>
              </div>
              <div style="padding: 32px 24px; color: #334155;">
                <p style="font-size: 16px; margin-top: 0;">Dear Team at <strong>${newCompany.name}</strong>,</p>
                <p style="font-size: 14px; line-height: 1.6;">We are thrilled to welcome your organization to the <strong>eCTD Management Portal</strong>. Your company account has been successfully registered and configured.</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1e293b;">Registered Company Details:</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;"><strong>Company Name:</strong> ${newCompany.name}</p>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;"><strong>Contact Email:</strong> ${newCompany.email}</p>
                  ${newCompany.mobile ? `<p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;"><strong>Phone:</strong> ${newCompany.mobile}</p>` : ""}
                </div>
                <p style="font-size: 14px; line-height: 1.6;">Your administrator account access will be set up shortly. If you have any questions or require support, please feel free to reach out to our team.</p>
                <p style="font-size: 14px; margin-bottom: 0;">Best regards,<br><strong>The eCTD Team</strong></p>
              </div>
              <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} eCTD Portal. All rights reserved.
              </div>
            </div>
          </div>
        `,
      });
      
      if (error) {
        console.error("[COMPANY_CONTROLLER] Failed to send welcome email:", error);
      } else {
        console.log("[COMPANY_CONTROLLER] Welcome email sent successfully:", data);
      }
    }

    res.status(201).json({
      success: true,
      data: newCompany,
      message: "Company created successfully",
    });
  } catch (error: any) {
    console.error("[COMPANY_CONTROLLER] Error creating company:", error);
    res.status(500).json({ success: false, message: "Failed to create company" });
  }
}

export async function listCompanies(req: Request, res: Response): Promise<void> {
  try {
    const allCompanies = await db.select().from(companies).orderBy(companies.createdAt);
    res.status(200).json({
      success: true,
      data: allCompanies,
    });
  } catch (error: any) {
    console.error("[COMPANY_CONTROLLER] Error listing companies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch companies" });
  }
}

export async function updateCompany(req: Request, res: Response): Promise<void> {
  const companyId = parseIdParam(req.params.id);
  if (isNaN(companyId)) {
    res.status(400).json({ success: false, message: "Invalid company ID" });
    return;
  }

  const parsed = updateCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(companies.id, companyId))
      .returning();

    if (!updatedCompany) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedCompany,
      message: "Company updated successfully",
    });
  } catch (error: any) {
    console.error(`[COMPANY_CONTROLLER] Error updating company ${companyId}:`, error);
    res.status(500).json({ success: false, message: "Failed to update company" });
  }
}

export async function deleteCompany(req: Request, res: Response): Promise<void> {
  const companyId = parseIdParam(req.params.id);
  if (isNaN(companyId)) {
    res.status(400).json({ success: false, message: "Invalid company ID" });
    return;
  }

  try {
    const [deletedCompany] = await db
      .delete(companies)
      .where(eq(companies.id, companyId))
      .returning();

    if (!deletedCompany) {
      res.status(404).json({ success: false, message: "Company not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedCompany,
      message: "Company deleted successfully",
    });
  } catch (error: any) {
    console.error(`[COMPANY_CONTROLLER] Error deleting company ${companyId}:`, error);
    res.status(500).json({ success: false, message: "Failed to delete company" });
  }
}

// -- Company Members (Admins) --

export async function createCompanyMember(req: Request, res: Response): Promise<void> {
  const parsed = createCompanyMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, email, companyId, maxUsers, storageGb, imageBase64 } = parsed.data;

  try {
    // 0. Perform company user limit & existing user check inside DB transaction
    await db.transaction(async (tx) => {
      const countResult = await tx
        .select({ count: sql<number>`count(*)` })
        .from(companyMembers)
        .where(
          and(
            eq(companyMembers.companyId, companyId),
            eq(companyMembers.role, "user")
          )
        );
      const currentCount = Number(countResult[0]?.count || 0);

      const [existingMember] = await tx
        .select({ maxUsers: companyMembers.maxUsers })
        .from(companyMembers)
        .where(eq(companyMembers.companyId, companyId))
        .limit(1);

      const limitToCheck = existingMember ? existingMember.maxUsers : maxUsers;

      if (currentCount >= limitToCheck) {
        throw new Error(`Company user limit reached. Max users allowed: ${limitToCheck}`);
      }

      const [existingUser] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser) {
        throw new Error("Email is already existing");
      }
    });

    // 2. Upload avatar to ImageKit if provided
    let imageUrl: string | null = null;
    let imageKitFileId: string | null = null;

    if (imageBase64 && imageBase64.trim()) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        const fileName = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
        const ikResult = await uploadToImageKit(buffer, fileName, "/company-admins");
        imageUrl = ikResult.url;
        imageKitFileId = ikResult.fileId;
      } catch (uploadError: any) {
        console.error("[COMPANY_CONTROLLER] Failed to upload admin avatar:", uploadError);
      }
    }

    // 3. Create new user using the centralized UserManagementService
    const { user } = await UserManagementService.createUser({
      name,
      email,
      role: "admin",
      imageUrl,
      imageKitFileId,
    });

    // 4. Link user to company
    const [newMember] = await db.insert(companyMembers).values({
      companyId,
      userId: user.id,
      maxUsers,
      storageGb,
      role: "admin",
    }).returning();

    res.status(201).json({
      success: true,
      message: "Company Admin created and linked successfully",
      data: newMember,
    });
  } catch (error: any) {
    console.error("[COMPANY_CONTROLLER] Error creating company member:", error);
    const isDuplicate = error.message?.toLowerCase().includes("already exist");
    res.status(isDuplicate ? 409 : 400).json({
      success: false,
      message: error.message || "Failed to add company admin",
    });
  }
}

export async function listCompanyMembers(req: Request, res: Response): Promise<void> {
  try {
    const members = await db
      .select({
        id: companyMembers.id,
        role: companyMembers.role,
        maxUsers: companyMembers.maxUsers,
        storageGb: companyMembers.storageGb,
        createdAt: companyMembers.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          imageUrl: users.imageUrl,
        },
        company: {
          id: companies.id,
          name: companies.name,
        }
      })
      .from(companyMembers)
      .innerJoin(users, eq(companyMembers.userId, users.id))
      .innerJoin(companies, eq(companyMembers.companyId, companies.id))
      .where(eq(companyMembers.role, "admin"))
      .orderBy(companyMembers.createdAt);

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    console.error("[COMPANY_CONTROLLER] Error listing company members:", error);
    res.status(500).json({ success: false, message: "Failed to fetch company members" });
  }
}

export async function updateCompanyMember(req: Request, res: Response): Promise<void> {
  const memberId = parseIdParam(req.params.id);
  if (isNaN(memberId)) {
    res.status(400).json({ success: false, message: "Invalid member ID" });
    return;
  }

  const parsed = updateCompanyMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    // 1. Find existing member & user
    const [existingMember] = await db
      .select({
        id: companyMembers.id,
        userId: companyMembers.userId,
        companyId: companyMembers.companyId,
        maxUsers: companyMembers.maxUsers,
        storageGb: companyMembers.storageGb,
        userEmail: users.email,
        userImageKitFileId: users.imageKitFileId,
        userImageUrl: users.imageUrl,
      })
      .from(companyMembers)
      .innerJoin(users, eq(companyMembers.userId, users.id))
      .where(eq(companyMembers.id, memberId));

    if (!existingMember) {
      res.status(404).json({ success: false, message: "Company admin not found" });
      return;
    }

    const { name, email, companyId, maxUsers, storageGb, imageBase64 } = parsed.data;

    // 2. If email is changing, verify uniqueness
    if (email && email.toLowerCase() !== existingMember.userEmail.toLowerCase()) {
      const [emailUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (emailUser && emailUser.id !== existingMember.userId) {
        res.status(409).json({ success: false, message: "Email is already in use by another user" });
        return;
      }
    }

    // 3. Handle image upload if a new base64 image is provided
    let newImageUrl: string | undefined = undefined;
    let newImageKitFileId: string | undefined = undefined;

    if (imageBase64 && imageBase64.trim()) {
      try {
        // Delete old image from ImageKit if it exists
        if (existingMember.userImageKitFileId) {
          deleteFromImageKit(existingMember.userImageKitFileId).catch((err) =>
            console.warn("[COMPANY_CONTROLLER] Error deleting old admin avatar:", err?.message)
          );
        }

        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        const fileName = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
        const ikResult = await uploadToImageKit(buffer, fileName, "/company-admins");
        newImageUrl = ikResult.url;
        newImageKitFileId = ikResult.fileId;
      } catch (uploadError: any) {
        console.error("[COMPANY_CONTROLLER] Failed to upload updated admin avatar:", uploadError);
      }
    }

    // 4. Update user fields if provided
    if (name || email || newImageUrl !== undefined) {
      const userUpdates: Partial<typeof users.$inferInsert> = { updatedAt: new Date() };
      if (name) userUpdates.name = name;
      if (email) userUpdates.email = email;
      if (newImageUrl !== undefined) {
        userUpdates.imageUrl = newImageUrl;
        userUpdates.imageKitFileId = newImageKitFileId;
      }

      await db.update(users).set(userUpdates).where(eq(users.id, existingMember.userId));
    }

    // 5. Update member fields if provided
    if (companyId !== undefined || maxUsers !== undefined || storageGb !== undefined) {
      const memberUpdates: Partial<typeof companyMembers.$inferInsert> = {};
      if (companyId !== undefined) memberUpdates.companyId = companyId;
      if (maxUsers !== undefined) memberUpdates.maxUsers = maxUsers;
      if (storageGb !== undefined) memberUpdates.storageGb = storageGb;

      await db.update(companyMembers).set(memberUpdates).where(eq(companyMembers.id, memberId));
    }

    // 6. Fetch updated record
    const [updated] = await db
      .select({
        id: companyMembers.id,
        role: companyMembers.role,
        maxUsers: companyMembers.maxUsers,
        storageGb: companyMembers.storageGb,
        createdAt: companyMembers.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          imageUrl: users.imageUrl,
        },
        company: {
          id: companies.id,
          name: companies.name,
        }
      })
      .from(companyMembers)
      .innerJoin(users, eq(companyMembers.userId, users.id))
      .innerJoin(companies, eq(companyMembers.companyId, companies.id))
      .where(eq(companyMembers.id, memberId));

    res.status(200).json({
      success: true,
      message: "Company admin updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error(`[COMPANY_CONTROLLER] Error updating company member ${memberId}:`, error);
    res.status(500).json({ success: false, message: "Failed to update company admin" });
  }
}

export async function deleteCompanyMember(req: Request, res: Response): Promise<void> {
  const memberId = parseIdParam(req.params.id);
  if (isNaN(memberId)) {
    res.status(400).json({ success: false, message: "Invalid member ID" });
    return;
  }

  try {
    const [deletedMember] = await db
      .delete(companyMembers)
      .where(eq(companyMembers.id, memberId))
      .returning();

    if (!deletedMember) {
      res.status(404).json({ success: false, message: "Company member not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: deletedMember,
      message: "Company member removed successfully",
    });
  } catch (error: any) {
    console.error(`[COMPANY_CONTROLLER] Error deleting company member ${memberId}:`, error);
    res.status(500).json({ success: false, message: "Failed to delete company member" });
  }
}

import { pgEnum, pgTable, serial, text, timestamp, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin", "superadmin"]);
export const projectMemberRoleEnum = pgEnum("project_member_role", ["owner", "editor", "viewer"]);
export const documentStatusEnum = pgEnum("document_status", ["active", "superseded", "deleted"]);
export const logTypeEnum = pgEnum("log_type", ["SUCCESS", "WARNING", "ERROR"]);

// ─── TABLES ──────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(),
  refreshToken: text("refresh_token"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  projectCode: varchar("project_code", { length: 100 }).notNull().unique(),
  productName: text("product_name").notNull(),
  dosageForm: text("dosage_form"),
  productType: text("product_type"),
  manufacturer: text("manufacturer"),
  mahHolder: text("mah_holder"),
  responsibleUser: text("responsible_user"),
  tariff: text("tariff"),
  additionalFeature: text("additional_feature"),
  status: text("status").default("Active").notNull(),
  isProjectSaved: boolean("is_project_saved").default(false).notNull(),
  version: integer("version").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dossierConfig = pgTable("dossier_config", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  submissionCountry: text("submission_country"),
  role: text("role"),
  procedureType: text("procedure_type"),
  typeOfProcedure: text("type_of_procedure"),
  applicationNumber: text("application_number"),
  dossierSequence: text("dossier_sequence").default("Sequence 0000").notNull(),
  isDossierSaved: boolean("is_dossier_saved").default(false).notNull(),
});

export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: projectMemberRoleEnum("role").default("editor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectDocuments = pgTable("project_documents", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  originalName: text("original_name").notNull(),
  imageKitUrl: text("image_kit_url"),
  imageKitFileId: text("image_kit_file_id"),
  fileSize: integer("file_size").default(0).notNull(),
  sequence: text("sequence").default("0000").notNull(),
  md5Checksum: text("md5_checksum"),
  status: documentStatusEnum("status").default("active").notNull(),
  operation: text("operation").default("new").notNull(),
  issueDate: timestamp("issue_date"),
  expirationDate: timestamp("expiration_date"),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  logType: logTypeEnum("log_type").notNull(),
  message: text("message").notNull(),
  userCredentials: text("user_credentials"),
  formationDate: timestamp("formation_date").defaultNow().notNull(),
});

export const packageArchives = pgTable("package_archives", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  fullName: text("full_name").notNull(),
  size: integer("size").notNull(),
  xmlChecksum: text("xml_checksum").notNull(),
  zipChecksum: text("zip_checksum").notNull(),
  downloadUrl: text("download_url").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// ─── RELATIONS ───────────────────────────────────────────────────────────────
export const projectsRelations = relations(projects, ({ one, many }) => ({
  dossierConfig: one(dossierConfig, {
    fields: [projects.id],
    references: [dossierConfig.projectId],
  }),
  members: many(projectMembers),
  documents: many(projectDocuments),
  auditLogs: many(auditLogs),
  packageArchives: many(packageArchives),
}));

export const dossierConfigRelations = relations(dossierConfig, ({ one }) => ({
  project: one(projects, {
    fields: [dossierConfig.projectId],
    references: [projects.id],
  }),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const projectDocumentsRelations = relations(projectDocuments, ({ one }) => ({
  project: one(projects, {
    fields: [projectDocuments.projectId],
    references: [projects.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  project: one(projects, {
    fields: [auditLogs.projectId],
    references: [projects.id],
  }),
}));

export const packageArchivesRelations = relations(packageArchives, ({ one }) => ({
  project: one(projects, {
    fields: [packageArchives.projectId],
    references: [projects.id],
  }),
}));

// ─── TYPES ───────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type DossierConfig = typeof dossierConfig.$inferSelect;
export type NewDossierConfig = typeof dossierConfig.$inferInsert;

export type ProjectMember = typeof projectMembers.$inferSelect;
export type NewProjectMember = typeof projectMembers.$inferInsert;

export type ProjectDocument = typeof projectDocuments.$inferSelect;
export type NewProjectDocument = typeof projectDocuments.$inferInsert;

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export type PackageArchive = typeof packageArchives.$inferSelect;
export type NewPackageArchive = typeof packageArchives.$inferInsert;

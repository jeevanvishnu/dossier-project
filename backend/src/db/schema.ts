import { pgEnum, pgTable, uuid, text, timestamp, varchar, integer, boolean, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin", "superadmin"]);
export const projectMemberRoleEnum = pgEnum("project_member_role", ["owner", "editor", "viewer"]);
export const documentStatusEnum = pgEnum("document_status", ["active", "superseded", "deleted"]);
export const logTypeEnum = pgEnum("log_type", ["SUCCESS", "WARNING", "ERROR"]);

// ─── TABLES ──────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("user").notNull(),
  imageUrl: text("image_url"),
  imageKitFileId: text("imagekit_file_id"),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_reset_password_token").on(table.resetPasswordToken),
]);

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 50 }),
  address: text("address"),
  imageUrl: text("image_url"),
  subscriptionStartDate: timestamp("subscription_start_date").defaultNow().notNull(),
  subscriptionEndDate: timestamp("subscription_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_companies_email").on(table.email),
  index("idx_companies_subscription_end_date").on(table.subscriptionEndDate),
]);

export const companyMembers = pgTable("company_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .references(() => companies.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role").default("admin").notNull(), // or enum
  maxUsers: integer("max_users").default(10).notNull(),
  storageGb: integer("storage_gb").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_company_members_company_id").on(table.companyId),
  index("idx_company_members_user_id").on(table.userId),
  index("idx_company_members_company_id_role").on(table.companyId, table.role),
]);

export const refreshSessions = pgTable("refresh_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  familyId: varchar("family_id", { length: 36 }).notNull(),
  familyCreatedAt: timestamp("family_created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_refresh_sessions_user_id").on(table.userId),
  index("idx_refresh_sessions_token_hash").on(table.tokenHash),
  index("idx_refresh_sessions_family_id").on(table.familyId),
  index("idx_refresh_sessions_expires_at").on(table.expiresAt),
  index("idx_refresh_sessions_user_id_revoked_at").on(table.userId, table.revokedAt),
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
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
}, (table) => [
  index("idx_projects_company_id").on(table.companyId),
  index("idx_projects_company_id_created_at").on(table.companyId, table.createdAt),
]);

export const dossierConfig = pgTable("dossier_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  submissionCountry: text("submission_country"),
  role: text("role"),
  procedureType: text("procedure_type"),
  typeOfProcedure: text("type_of_procedure"),
  applicationNumber: text("application_number"),
  dossierSequence: text("dossier_sequence").default("Sequence 0000").notNull(),
  isDossierSaved: boolean("is_dossier_saved").default(false).notNull(),
  dossierDetails: jsonb("dossier_details"),
}, (table) => [
  index("idx_dossier_config_project_id").on(table.projectId),
]);

export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: projectMemberRoleEnum("role").default("editor").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_project_members_project_id").on(table.projectId),
  index("idx_project_members_user_id").on(table.userId),
  uniqueIndex("uniq_project_members_project_user").on(table.projectId, table.userId),
]);

export const projectDocuments = pgTable("project_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  // Links document to the specific dossier sequence it was uploaded under.
  // Nullable for backwards-compatibility with documents created before this column was added.
  dossierConfigId: uuid("dossier_config_id")
    .references(() => dossierConfig.id, { onDelete: "set null" }),
  nodeId: varchar("node_id", { length: 100 }).notNull(),
  docCode: varchar("doc_code", { length: 5 }),
  docType: varchar("doc_type", { length: 100 }),
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
}, (table) => [
  index("idx_project_documents_project_id").on(table.projectId),
  index("idx_project_documents_node_id").on(table.nodeId),
  index("idx_project_documents_project_id_node_id_status").on(table.projectId, table.nodeId, table.status),
  index("idx_project_documents_project_id_status").on(table.projectId, table.status),
  index("idx_project_documents_dossier_config_id").on(table.dossierConfigId),
]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  logType: logTypeEnum("log_type").notNull(),
  message: text("message").notNull(),
  userCredentials: text("user_credentials"),
  formationDate: timestamp("formation_date").defaultNow().notNull(),
}, (table) => [
  index("idx_audit_logs_project_id").on(table.projectId),
  index("idx_audit_logs_project_id_formation_date").on(table.projectId, table.formationDate),
]);

export const packageArchives = pgTable("package_archives", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  fullName: text("full_name").notNull(),
  size: integer("size").notNull(),
  xmlChecksum: text("xml_checksum").notNull(),
  zipChecksum: text("zip_checksum").notNull(),
  downloadUrl: text("download_url").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_package_archives_project_id").on(table.projectId),
]);

// ─── RELATIONS ───────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  refreshSessions: many(refreshSessions),
  projectMembers: many(projectMembers),
  companyMembers: many(companyMembers),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  members: many(companyMembers),
  projects: many(projects),
}));

export const companyMembersRelations = relations(companyMembers, ({ one }) => ({
  company: one(companies, {
    fields: [companyMembers.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [companyMembers.userId],
    references: [users.id],
  }),
}));

export const refreshSessionsRelations = relations(refreshSessions, ({ one }) => ({
  user: one(users, {
    fields: [refreshSessions.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  company: one(companies, {
    fields: [projects.companyId],
    references: [companies.id],
  }),
  dossierConfig: one(dossierConfig, {
    fields: [projects.id],
    references: [dossierConfig.projectId],
  }),
  dossierConfigs: many(dossierConfig),
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

export type RefreshSession = typeof refreshSessions.$inferSelect;
export type NewRefreshSession = typeof refreshSessions.$inferInsert;

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

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

export type CompanyMember = typeof companyMembers.$inferSelect;
export type NewCompanyMember = typeof companyMembers.$inferInsert;


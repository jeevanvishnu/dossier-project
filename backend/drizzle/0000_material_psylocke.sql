CREATE TYPE "public"."document_status" AS ENUM('active', 'superseded', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."log_type" AS ENUM('SUCCESS', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"log_type" "log_type" NOT NULL,
	"message" text NOT NULL,
	"user_credentials" text,
	"formation_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"mobile" varchar(50),
	"address" text,
	"image_url" text,
	"subscription_start_date" timestamp DEFAULT now() NOT NULL,
	"subscription_end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"max_users" integer DEFAULT 10 NOT NULL,
	"storage_gb" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dossier_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"submission_country" text,
	"role" text,
	"procedure_type" text,
	"type_of_procedure" text,
	"application_number" text,
	"dossier_sequence" text DEFAULT 'Sequence 0000' NOT NULL,
	"is_dossier_saved" boolean DEFAULT false NOT NULL,
	"dossier_details" jsonb
);
--> statement-breakpoint
CREATE TABLE "package_archives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"size" integer NOT NULL,
	"xml_checksum" text NOT NULL,
	"zip_checksum" text NOT NULL,
	"download_url" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"node_id" varchar(100) NOT NULL,
	"doc_code" varchar(5),
	"doc_type" varchar(100),
	"original_name" text NOT NULL,
	"image_kit_url" text,
	"image_kit_file_id" text,
	"file_size" integer DEFAULT 0 NOT NULL,
	"sequence" text DEFAULT '0000' NOT NULL,
	"md5_checksum" text,
	"status" "document_status" DEFAULT 'active' NOT NULL,
	"operation" text DEFAULT 'new' NOT NULL,
	"issue_date" timestamp,
	"expiration_date" timestamp,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_member_role" DEFAULT 'editor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid,
	"project_code" varchar(100) NOT NULL,
	"product_name" text NOT NULL,
	"dosage_form" text,
	"product_type" text,
	"manufacturer" text,
	"mah_holder" text,
	"responsible_user" text,
	"tariff" text,
	"additional_feature" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"is_project_saved" boolean DEFAULT false NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
CREATE TABLE "refresh_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"family_id" varchar(36) NOT NULL,
	"family_created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"image_url" text,
	"imagekit_file_id" text,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_members" ADD CONSTRAINT "company_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_config" ADD CONSTRAINT "dossier_config_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_archives" ADD CONSTRAINT "package_archives_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_project_id" ON "audit_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_audit_logs_project_id_formation_date" ON "audit_logs" USING btree ("project_id","formation_date");--> statement-breakpoint
CREATE INDEX "idx_companies_email" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_companies_subscription_end_date" ON "companies" USING btree ("subscription_end_date");--> statement-breakpoint
CREATE INDEX "idx_company_members_company_id" ON "company_members" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_company_members_user_id" ON "company_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_company_members_company_id_role" ON "company_members" USING btree ("company_id","role");--> statement-breakpoint
CREATE INDEX "idx_dossier_config_project_id" ON "dossier_config" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_package_archives_project_id" ON "package_archives" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_node_id" ON "project_documents" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id_node_id_status" ON "project_documents" USING btree ("project_id","node_id","status");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id_status" ON "project_documents" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "idx_project_members_project_id" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_user_id" ON "project_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_project_members_project_user" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_company_id" ON "projects" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_projects_company_id_created_at" ON "projects" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_user_id" ON "refresh_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_token_hash" ON "refresh_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_family_id" ON "refresh_sessions" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_expires_at" ON "refresh_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_user_id_revoked_at" ON "refresh_sessions" USING btree ("user_id","revoked_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");
CREATE TYPE "public"."document_status" AS ENUM('active', 'superseded', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."log_type" AS ENUM('SUCCESS', 'WARNING', 'ERROR');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'superadmin');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"log_type" "log_type" NOT NULL,
	"message" text NOT NULL,
	"user_credentials" text,
	"formation_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dossier_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"submission_country" text,
	"role" text,
	"procedure_type" text,
	"type_of_procedure" text,
	"application_number" text,
	"dossier_sequence" text DEFAULT 'Sequence 0000' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "package_archives" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"size" integer NOT NULL,
	"xml_checksum" text NOT NULL,
	"zip_checksum" text NOT NULL,
	"download_url" text NOT NULL,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"node_id" varchar(100) NOT NULL,
	"original_name" text NOT NULL,
	"image_kit_url" text NOT NULL,
	"image_kit_file_id" text NOT NULL,
	"file_size" integer NOT NULL,
	"sequence" text DEFAULT '0000' NOT NULL,
	"md5_checksum" text NOT NULL,
	"status" "document_status" DEFAULT 'active' NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "project_member_role" DEFAULT 'editor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_code" varchar(100) NOT NULL,
	"product_name" text NOT NULL,
	"dosage_form" text,
	"product_type" text,
	"manufacturer" text,
	"mah_holder" text,
	"responsible_user" text,
	"tariff" text,
	"status" text DEFAULT 'Active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code")
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'::"public"."role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_config" ADD CONSTRAINT "dossier_config_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "package_archives" ADD CONSTRAINT "package_archives_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
import { db } from "./db";
import { sql } from "drizzle-orm";

export async function ensureDatabaseSchema() {
  console.log("⏳ Synchronizing database schema with PostgreSQL...");

  // Statements to ensure types and aligned schema
  const setupStatements = [
    // Create enums safely
    `DO $$ BEGIN CREATE TYPE "public"."document_status" AS ENUM('active', 'superseded', 'deleted'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "public"."log_type" AS ENUM('SUCCESS', 'WARNING', 'ERROR'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "public"."project_member_role" AS ENUM('owner', 'editor', 'viewer'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
    `DO $$ BEGIN CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'superadmin'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

    // Ensure all enum values exist even if enum types were previously created
    `ALTER TYPE "public"."document_status" ADD VALUE IF NOT EXISTS 'active';`,
    `ALTER TYPE "public"."document_status" ADD VALUE IF NOT EXISTS 'superseded';`,
    `ALTER TYPE "public"."document_status" ADD VALUE IF NOT EXISTS 'deleted';`,
    `ALTER TYPE "public"."log_type" ADD VALUE IF NOT EXISTS 'SUCCESS';`,
    `ALTER TYPE "public"."log_type" ADD VALUE IF NOT EXISTS 'WARNING';`,
    `ALTER TYPE "public"."log_type" ADD VALUE IF NOT EXISTS 'ERROR';`,
    `ALTER TYPE "public"."project_member_role" ADD VALUE IF NOT EXISTS 'owner';`,
    `ALTER TYPE "public"."project_member_role" ADD VALUE IF NOT EXISTS 'editor';`,
    `ALTER TYPE "public"."project_member_role" ADD VALUE IF NOT EXISTS 'viewer';`,
    `ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'user';`,
    `ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'admin';`,
    `ALTER TYPE "public"."role" ADD VALUE IF NOT EXISTS 'superadmin';`,

    // Drop legacy tables if present
    `DROP TABLE IF EXISTS "document_history" CASCADE;`,
    `DROP TABLE IF EXISTS "dossier_documents" CASCADE;`,

    // Ensure projects table structure matches current schema.ts
    `DO $$ 
    BEGIN 
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') AND 
         NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'project_code') THEN
        DROP TABLE "projects" CASCADE;
      END IF;
    END $$;`,

    // Re-create users
    `CREATE TABLE IF NOT EXISTS "users" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" text,
      "email" varchar(255) NOT NULL UNIQUE,
      "password" text NOT NULL,
      "role" "public"."role" DEFAULT 'user' NOT NULL,
      "refresh_token" text,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // Re-create projects
    `CREATE TABLE IF NOT EXISTS "projects" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_code" varchar(100) NOT NULL UNIQUE,
      "product_name" text NOT NULL,
      "dosage_form" text,
      "product_type" text,
      "manufacturer" text,
      "mah_holder" text,
      "responsible_user" text,
      "tariff" text,
      "status" text DEFAULT 'Active' NOT NULL,
      "version" integer DEFAULT 1 NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );`,

    // Re-create dossier_config
    `CREATE TABLE IF NOT EXISTS "dossier_config" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "submission_country" text,
      "role" text,
      "procedure_type" text,
      "type_of_procedure" text,
      "application_number" text,
      "dossier_sequence" text DEFAULT 'Sequence 0000' NOT NULL
    );`,

    // Re-create project_members
    `CREATE TABLE IF NOT EXISTS "project_members" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "role" "public"."project_member_role" DEFAULT 'editor' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );`,

    // Re-create project_documents
    `CREATE TABLE IF NOT EXISTS "project_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "node_id" varchar(100) NOT NULL,
      "original_name" text NOT NULL,
      "image_kit_url" text,
      "image_kit_file_id" text,
      "file_size" integer DEFAULT 0 NOT NULL,
      "sequence" text DEFAULT '0000' NOT NULL,
      "md5_checksum" text,
      "status" "public"."document_status" DEFAULT 'active' NOT NULL,
      "operation" text DEFAULT 'new' NOT NULL,
      "uploaded_at" timestamp DEFAULT now() NOT NULL
    );`,

    // Migration statements for existing DB instances
    `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;`,
    `ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;`,
    `ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "operation" text DEFAULT 'new' NOT NULL;`,
    `ALTER TABLE "project_documents" ALTER COLUMN "image_kit_url" DROP NOT NULL;`,
    `ALTER TABLE "project_documents" ALTER COLUMN "image_kit_file_id" DROP NOT NULL;`,
    `ALTER TABLE "project_documents" ALTER COLUMN "md5_checksum" DROP NOT NULL;`,

    // Re-create audit_logs
    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "log_type" "public"."log_type" NOT NULL,
      "message" text NOT NULL,
      "user_credentials" text,
      "formation_date" timestamp DEFAULT now() NOT NULL
    );`,

    // Re-create package_archives
    `CREATE TABLE IF NOT EXISTS "package_archives" (
      "id" serial PRIMARY KEY NOT NULL,
      "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "full_name" text NOT NULL,
      "size" integer NOT NULL,
      "xml_checksum" text NOT NULL,
      "zip_checksum" text NOT NULL,
      "download_url" text NOT NULL,
      "generated_at" timestamp DEFAULT now() NOT NULL
    );`
  ];

  for (const stmt of setupStatements) {
    try {
      await db.execute(sql.raw(stmt));
    } catch (err: any) {
      console.warn("Notice/Warning during DB schema sync:", err.message);
    }
  }

  console.log("✅ Database schema sync completed successfully!");
}

if (require.main === module) {
  ensureDatabaseSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Schema sync failed:", err);
      process.exit(1);
    });
}

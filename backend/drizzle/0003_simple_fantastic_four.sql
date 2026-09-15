CREATE TABLE IF NOT EXISTS "refresh_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"family_id" varchar(36) NOT NULL,
	"family_created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"revoked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_documents" ALTER COLUMN "image_kit_url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_documents" ALTER COLUMN "image_kit_file_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project_documents" ALTER COLUMN "file_size" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "project_documents" ALTER COLUMN "md5_checksum" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dossier_config" ADD COLUMN IF NOT EXISTS "is_dossier_saved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "operation" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "issue_date" timestamp;--> statement-breakpoint
ALTER TABLE "project_documents" ADD COLUMN IF NOT EXISTS "expiration_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "additional_feature" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "is_project_saved" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "refresh_sessions" ADD CONSTRAINT "refresh_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_sessions_user_id" ON "refresh_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_sessions_token_hash" ON "refresh_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_sessions_family_id" ON "refresh_sessions" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_refresh_sessions_expires_at" ON "refresh_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN IF EXISTS "refresh_token";
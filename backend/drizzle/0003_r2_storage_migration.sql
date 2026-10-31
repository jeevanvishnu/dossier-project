ALTER TABLE "project_documents" RENAME COLUMN "image_kit_url" TO "storage_url";--> statement-breakpoint
ALTER TABLE "project_documents" RENAME COLUMN "image_kit_file_id" TO "storage_key";--> statement-breakpoint
ALTER TABLE "project_documents" ALTER COLUMN "file_size" TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "imagekit_file_id" TO "storage_key";--> statement-breakpoint
ALTER TABLE "package_archives" ALTER COLUMN "size" TYPE bigint;--> statement-breakpoint
ALTER TABLE "package_archives" ADD COLUMN IF NOT EXISTS "storage_key" text;


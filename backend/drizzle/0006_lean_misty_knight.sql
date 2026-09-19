ALTER TABLE "users" ADD COLUMN "is_blocked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_project_id" ON "audit_logs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_dossier_config_project_id" ON "dossier_config" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_package_archives_project_id" ON "package_archives" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_documents_node_id" ON "project_documents" USING btree ("node_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_project_id" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_project_members_user_id" ON "project_members" USING btree ("user_id");
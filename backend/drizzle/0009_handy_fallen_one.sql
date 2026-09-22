ALTER TABLE "companies" ADD COLUMN "subscription_start_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "subscription_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "company_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_logs_project_id_formation_date" ON "audit_logs" USING btree ("project_id","formation_date");--> statement-breakpoint
CREATE INDEX "idx_companies_email" ON "companies" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_companies_subscription_end_date" ON "companies" USING btree ("subscription_end_date");--> statement-breakpoint
CREATE INDEX "idx_company_members_company_id_role" ON "company_members" USING btree ("company_id","role");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id_node_id_status" ON "project_documents" USING btree ("project_id","node_id","status");--> statement-breakpoint
CREATE INDEX "idx_project_documents_project_id_status" ON "project_documents" USING btree ("project_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_project_members_project_user" ON "project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_company_id" ON "projects" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_projects_company_id_created_at" ON "projects" USING btree ("company_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_refresh_sessions_user_id_revoked_at" ON "refresh_sessions" USING btree ("user_id","revoked_at");
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_start_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_end_date" timestamp;

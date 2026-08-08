ALTER TABLE "cars" ADD COLUMN "checked_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_no" UNIQUE("no");
ALTER TABLE "cars" ADD COLUMN "plate" text;--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_plate_length" CHECK (char_length("cars"."plate") between 1 and 16);
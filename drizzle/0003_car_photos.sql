CREATE TABLE "car_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"car_id" text NOT NULL,
	"position" integer NOT NULL,
	"image" "bytea" NOT NULL,
	"image_type" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_photos_car_position" UNIQUE("car_id","position"),
	CONSTRAINT "car_photos_position_range" CHECK ("car_photos"."position" between 0 and 5),
	CONSTRAINT "car_photos_image_size" CHECK (octet_length("car_photos"."image") between 1 and 1000000),
	CONSTRAINT "car_photos_image_type" CHECK ("car_photos"."image_type" = 'image/jpeg')
);
--> statement-breakpoint
ALTER TABLE "car_photos" ADD CONSTRAINT "car_photos_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "car_photos_car_idx" ON "car_photos" USING btree ("car_id");
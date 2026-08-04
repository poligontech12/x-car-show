CREATE TABLE "user_avatars" (
	"user_id" text PRIMARY KEY NOT NULL,
	"image" "bytea" NOT NULL,
	"image_type" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_avatars_image_size" CHECK (octet_length("user_avatars"."image") between 1 and 400000),
	CONSTRAINT "user_avatars_image_type" CHECK ("user_avatars"."image_type" = 'image/jpeg')
);
--> statement-breakpoint
ALTER TABLE "user_avatars" ADD CONSTRAINT "user_avatars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
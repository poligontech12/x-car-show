CREATE TABLE "spotted_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"image" bytea NOT NULL,
	"image_type" text NOT NULL,
	"location" text,
	"caption" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spotted_posts_image_size" CHECK (octet_length("spotted_posts"."image") between 1 and 1000000),
	CONSTRAINT "spotted_posts_image_type" CHECK ("spotted_posts"."image_type" = 'image/jpeg')
);
--> statement-breakpoint
CREATE TABLE "spotted_usage" (
	"scope" text PRIMARY KEY NOT NULL,
	"post_count" integer DEFAULT 0 NOT NULL,
	"total_bytes" bigint DEFAULT 0 NOT NULL,
	"attempt_window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"decode_attempts" integer DEFAULT 0 NOT NULL,
	"post_window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"post_window_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spotted_usage_post_count" CHECK ("spotted_usage"."post_count" >= 0),
	CONSTRAINT "spotted_usage_total_bytes" CHECK ("spotted_usage"."total_bytes" >= 0),
	CONSTRAINT "spotted_usage_decode_attempts" CHECK ("spotted_usage"."decode_attempts" >= 0),
	CONSTRAINT "spotted_usage_post_window_count" CHECK ("spotted_usage"."post_window_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "spotted_posts" ADD CONSTRAINT "spotted_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "spotted_posts_created_idx" ON "spotted_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "spotted_posts_author_created_idx" ON "spotted_posts" USING btree ("author_id","created_at");
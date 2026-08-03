-- One vote each becomes three.
--
-- The old primary key was the voter alone, which is exactly what capped
-- people at a single ballot. It is replaced by (voter, car) so a repeated
-- vote for the same car is still the same row — a ballot queued on a bad
-- signal stays safe to replay — and the cap moves to a numbered slot:
-- unique per voter, checked to be 1, 2 or 3. Three rows per person then
-- falls out of the constraints rather than relying on the app to count.
--
-- drizzle-kit cannot read the old key's name, so the drop is written out.

ALTER TABLE "votes" DROP CONSTRAINT "votes_pkey";--> statement-breakpoint

-- Any ballot already cast becomes slot 1. The default is dropped straight
-- after, so every later vote has to say which slot it occupies.
ALTER TABLE "votes" ADD COLUMN "slot" integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE "votes" ALTER COLUMN "slot" DROP DEFAULT;--> statement-breakpoint

ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_id_car_id_pk" PRIMARY KEY("voter_id","car_id");--> statement-breakpoint
CREATE INDEX "votes_car_idx" ON "votes" USING btree ("car_id");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_voter_slot" UNIQUE("voter_id","slot");--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_slot_range" CHECK ("votes"."slot" between 1 and 3);

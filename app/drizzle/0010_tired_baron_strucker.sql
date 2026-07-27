CREATE TABLE "rank_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"keyword_id" uuid NOT NULL,
	"snapshot_date" date NOT NULL,
	"rank" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rank_snapshots" ADD CONSTRAINT "rank_snapshots_keyword_id_rank_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."rank_keywords"("id") ON DELETE cascade ON UPDATE no action;
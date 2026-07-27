ALTER TABLE "products" ADD COLUMN "tier" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badge_initial" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "badge_color" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_sale" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_recommended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rank_up_user_rate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rank_before" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "rank_after" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "order_cutoff_time" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "same_day_start" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "min_run_days" integer;
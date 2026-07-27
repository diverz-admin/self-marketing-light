ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."product_category";--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('reward_place', 'reward_shopping', 'reward_coupang', 'place_blog_distribute', 'place_receipt', 'shopping_product_provided', 'shopping_product_not_provided');--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "category" SET DATA TYPE "public"."product_category" USING "category"::"public"."product_category";--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ALTER COLUMN "platform" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ALTER COLUMN "platform" SET DEFAULT 'place'::text;--> statement-breakpoint
ALTER TABLE "rank_keywords" ALTER COLUMN "platform" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "rank_keywords" ALTER COLUMN "platform" SET DEFAULT 'place'::text;--> statement-breakpoint
DROP TYPE "public"."rank_platform";--> statement-breakpoint
CREATE TYPE "public"."rank_platform" AS ENUM('place', 'shopping', 'coupang');--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ALTER COLUMN "platform" SET DEFAULT 'place'::"public"."rank_platform";--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ALTER COLUMN "platform" SET DATA TYPE "public"."rank_platform" USING "platform"::"public"."rank_platform";--> statement-breakpoint
ALTER TABLE "rank_keywords" ALTER COLUMN "platform" SET DEFAULT 'place'::"public"."rank_platform";--> statement-breakpoint
ALTER TABLE "rank_keywords" ALTER COLUMN "platform" SET DATA TYPE "public"."rank_platform" USING "platform"::"public"."rank_platform";
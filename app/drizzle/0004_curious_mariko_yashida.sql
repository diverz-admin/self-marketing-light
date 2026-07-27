CREATE TYPE "public"."board_channel" AS ENUM('shopping', 'place', 'coupang');--> statement-breakpoint
ALTER TABLE "board_posts" ADD COLUMN "channel" "board_channel";
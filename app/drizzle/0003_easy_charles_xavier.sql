ALTER TABLE "board_posts" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "notices" ADD COLUMN "attachments" jsonb DEFAULT '[]'::jsonb NOT NULL;
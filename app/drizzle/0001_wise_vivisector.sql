CREATE TYPE "public"."board_type" AS ENUM('free', 'review', 'commerce', 'qna', 'tip');--> statement-breakpoint
CREATE TYPE "public"."coupon_discount_type" AS ENUM('amount', 'percent');--> statement-breakpoint
CREATE TYPE "public"."extension_status" AS ENUM('requested', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."extension_target" AS ENUM('campaign', 'guaranteed', 'review');--> statement-breakpoint
CREATE TYPE "public"."guaranteed_status" AS ENUM('requested', 'reviewing', 'setting', 'running', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."point_charge_status" AS ENUM('requested', 'approved', 'rejected', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."rank_platform" AS ENUM('place', 'shopping', 'coupang', 'google');--> statement-breakpoint
CREATE TYPE "public"."review_campaign_status" AS ENUM('requested', 'paid', 'setting', 'recruiting', 'running', 'completed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."review_platform" AS ENUM('place', 'naver_shopping', 'coupang');--> statement-breakpoint
CREATE TYPE "public"."review_task_status" AS ENUM('waiting', 'assigned', 'writing', 'submitted', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."review_type" AS ENUM('blog_distribute', 'receipt', 'visitor', 'reservation', 'blog_experience', 'blog_reporter', 'product_provided', 'product_not_provided');--> statement-breakpoint
CREATE TYPE "public"."service_request_status" AS ENUM('requested', 'reviewing', 'quoted', 'in_progress', 'completed', 'canceled');--> statement-breakpoint
CREATE TABLE "board_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_type" "board_type" DEFAULT 'free' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid,
	"author_name" text,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_blinded" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_extensions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "extension_target" NOT NULL,
	"target_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"add_days" integer DEFAULT 0 NOT NULL,
	"add_qty" integer DEFAULT 0 NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "extension_status" DEFAULT 'requested' NOT NULL,
	"memo" text,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupon_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid,
	"discount_amount" numeric(12, 2) NOT NULL,
	"used_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"discount_type" "coupon_discount_type" DEFAULT 'amount' NOT NULL,
	"discount_value" numeric(12, 2) NOT NULL,
	"min_order_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"max_discount_amount" numeric(12, 2),
	"total_quota" integer,
	"issued_count" integer DEFAULT 0 NOT NULL,
	"used_count" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "guaranteed_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_id" uuid,
	"platform" "rank_platform" DEFAULT 'place' NOT NULL,
	"keyword" text NOT NULL,
	"target_name" text,
	"target_url" text,
	"target_rank" integer DEFAULT 1 NOT NULL,
	"guaranteed_days" integer DEFAULT 30 NOT NULL,
	"achieved_days" integer DEFAULT 0 NOT NULL,
	"current_rank" integer,
	"start_date" date,
	"end_date" date,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "guaranteed_status" DEFAULT 'requested' NOT NULL,
	"setting" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"category" text DEFAULT 'service' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"author_id" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "point_charges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"bonus_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"method" text DEFAULT 'bank_transfer' NOT NULL,
	"depositor_name" text,
	"receipt_type" text,
	"status" "point_charge_status" DEFAULT 'requested' NOT NULL,
	"memo" text,
	"processed_by" uuid,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"unit_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"unit" text DEFAULT '건' NOT NULL,
	"options" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rank_keywords" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "rank_platform" DEFAULT 'place' NOT NULL,
	"keyword" text NOT NULL,
	"target_name" text,
	"target_url" text,
	"is_paid" boolean DEFAULT false NOT NULL,
	"monthly_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"current_rank" integer,
	"previous_rank" integer,
	"last_checked_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"platform" "review_platform" NOT NULL,
	"review_type" "review_type" NOT NULL,
	"store_name" text NOT NULL,
	"target_url" text,
	"keyword" text,
	"total_qty" integer DEFAULT 0 NOT NULL,
	"completed_qty" integer DEFAULT 0 NOT NULL,
	"unit_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"start_date" date,
	"end_date" date,
	"status" "review_campaign_status" DEFAULT 'requested' NOT NULL,
	"setting" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"request_note" text,
	"admin_memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_campaign_id" uuid NOT NULL,
	"reviewer_name" text,
	"reviewer_contact" text,
	"status" "review_task_status" DEFAULT 'waiting' NOT NULL,
	"post_url" text,
	"receipt_url" text,
	"scheduled_date" date,
	"completed_at" timestamp with time zone,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" text NOT NULL,
	"service_key" text NOT NULL,
	"service_name" text NOT NULL,
	"inputs" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"quoted_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "service_request_status" DEFAULT 'requested' NOT NULL,
	"contact" text,
	"admin_memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "form_schema" SET DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "channel" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "efficiency" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "avg_rank_up_rate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subscription_info" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role" "user_role" DEFAULT 'advertiser' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "credit_balance" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "board_posts" ADD CONSTRAINT "board_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_extensions" ADD CONSTRAINT "campaign_extensions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD CONSTRAINT "guaranteed_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD CONSTRAINT "guaranteed_campaigns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_charges" ADD CONSTRAINT "point_charges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "point_charges" ADD CONSTRAINT "point_charges_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rank_keywords" ADD CONSTRAINT "rank_keywords_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD CONSTRAINT "review_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_tasks" ADD CONSTRAINT "review_tasks_review_campaign_id_review_campaigns_id_fk" FOREIGN KEY ("review_campaign_id") REFERENCES "public"."review_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
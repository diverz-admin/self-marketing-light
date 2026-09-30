-- 운영정책 rev.11 (2026-09-02) — 구조 변경
--
-- 멱등하게 작성되어 있다. 최근 작업(admin_cart_items · purchase_orders ·
-- rank_memberships · products.cost_price)이 db:push 로만 반영되어 마이그레이션
-- 기록에 없는 탓에, 생성된 diff 에 이미 존재하는 객체가 섞여 나온다.
-- IF NOT EXISTS / 예외 처리로 감싸 두면 기존 DB와 새 DB 양쪽에서 통과한다.

DO $$ BEGIN
	CREATE TYPE "public"."admin_cart_item_status" AS ENUM('pending', 'ordered', 'canceled');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."coupon_issue_status" AS ENUM('active', 'used', 'expired', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."credit_kind" AS ENUM('paid', 'free');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."fault_party" AS ENUM('customer', 'company');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."invoice_status" AS ENUM('not_required', 'pending', 'issued', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."membership_status" AS ENUM('active', 'expired', 'canceled');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."point_refund_status" AS ENUM('requested', 'approved', 'paid', 'canceled', 'rejected');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'ordered', 'running', 'done', 'canceled');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."purchase_settle_status" AS ENUM('unpaid', 'scheduled', 'paid');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."purchase_source_type" AS ENUM('reward_place', 'reward_shopping', 'reward_coupang', 'guaranteed', 'review_place', 'review_shopping', 'etc');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."sales_incentive_status" AS ENUM('accrued', 'paid', 'revoked');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	CREATE TYPE "public"."user_status" AS ENUM('active', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'sales';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'super_admin';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_cart_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"product_key" text NOT NULL,
	"title" text NOT NULL,
	"target" text,
	"note" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" "admin_cart_item_status" DEFAULT 'pending' NOT NULL,
	"created_by_admin_id" uuid,
	"order_id" uuid,
	"ordered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_name" text,
	"actor_role" text,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"target_label" text,
	"reason" text,
	"before" jsonb,
	"after" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coupon_issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "coupon_issue_status" DEFAULT 'active' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"issue_reason" text,
	"issued_by_admin_id" uuid,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "holidays" (
	"date" date PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"year" integer NOT NULL,
	"source" text DEFAULT 'api' NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "point_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "point_refund_status" DEFAULT 'requested' NOT NULL,
	"requested_amount" numeric(12, 2) NOT NULL,
	"balance_at_request" numeric(12, 2),
	"free_balance_at_request" numeric(12, 2),
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"bank_name" text,
	"account_number" text,
	"account_holder" text,
	"depositor_name" text,
	"holder_verified" boolean DEFAULT false NOT NULL,
	"balance_at_transfer" numeric(12, 2),
	"recalculated_amount" numeric(12, 2),
	"transfer_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(12, 2),
	"paid_at" timestamp with time zone,
	"invoice_status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"invoice_number" text,
	"reason" text,
	"cancel_reason" text,
	"admin_memo" text,
	"processed_by_admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_type" "purchase_source_type" DEFAULT 'etc' NOT NULL,
	"source_id" uuid,
	"order_id" uuid,
	"vendor_name" text NOT NULL,
	"vendor_contact" text,
	"title" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"purchase_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "purchase_order_status" DEFAULT 'draft' NOT NULL,
	"settle_status" "purchase_settle_status" DEFAULT 'unpaid' NOT NULL,
	"ordered_at" date,
	"settled_at" date,
	"memo" text,
	"created_by_admin_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rank_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "membership_status" DEFAULT 'active' NOT NULL,
	"paid_at" date,
	"start_date" date NOT NULL,
	"end_date" date,
	"monthly_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"memo" text,
	"granted_by_admin_id" uuid,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_incentives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sales_rep_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"source_type" "purchase_source_type" DEFAULT 'etc' NOT NULL,
	"source_id" uuid,
	"base_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"rate" numeric(5, 4) DEFAULT '0' NOT NULL,
	"amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"status" "sales_incentive_status" DEFAULT 'accrued' NOT NULL,
	"accrued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoke_reason" text,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_reps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"code" text NOT NULL,
	"display_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_reps_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "sales_reps_code_unique" UNIQUE("code")
);--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "refunded_amount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "performed_days" integer;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "stopped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "fault_party" "fault_party";--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "stop_reason" text;--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "stopped_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "coupon_redemptions" ADD COLUMN IF NOT EXISTS "issue_id" uuid;--> statement-breakpoint
ALTER TABLE "credits" ADD COLUMN IF NOT EXISTS "kind" "credit_kind" DEFAULT 'paid' NOT NULL;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD COLUMN IF NOT EXISTS "refunded_amount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD COLUMN IF NOT EXISTS "stopped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD COLUMN IF NOT EXISTS "fault_party" "fault_party";--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD COLUMN IF NOT EXISTS "stop_reason" text;--> statement-breakpoint
ALTER TABLE "guaranteed_campaigns" ADD COLUMN IF NOT EXISTS "stopped_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN IF NOT EXISTS "tax_email" text;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN IF NOT EXISTS "consign_agreed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN IF NOT EXISTS "sales_rep_id" uuid;--> statement-breakpoint
ALTER TABLE "member_profiles" ADD COLUMN IF NOT EXISTS "referred_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "point_charges" ADD COLUMN IF NOT EXISTS "invoice_status" "invoice_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "point_charges" ADD COLUMN IF NOT EXISTS "invoice_issued_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "point_charges" ADD COLUMN IF NOT EXISTS "invoice_number" text;--> statement-breakpoint
ALTER TABLE "point_charges" ADD COLUMN IF NOT EXISTS "deposit_amount" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "point_charges" ADD COLUMN IF NOT EXISTS "bonus_reason" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "cost_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor_name" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor_contact" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor_memo" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "vendor_form_key" text;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "refunded_amount" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "stopped_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "fault_party" "fault_party";--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "stop_reason" text;--> statement-breakpoint
ALTER TABLE "review_campaigns" ADD COLUMN IF NOT EXISTS "stopped_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "free_balance" numeric(12, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_transaction_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspend_reason" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspended_by_admin_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sessions_valid_from" timestamp with time zone;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "admin_cart_items" ADD CONSTRAINT "admin_cart_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "admin_cart_items" ADD CONSTRAINT "admin_cart_items_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "admin_cart_items" ADD CONSTRAINT "admin_cart_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coupon_issues" ADD CONSTRAINT "coupon_issues_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coupon_issues" ADD CONSTRAINT "coupon_issues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coupon_issues" ADD CONSTRAINT "coupon_issues_issued_by_admin_id_users_id_fk" FOREIGN KEY ("issued_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "point_refunds" ADD CONSTRAINT "point_refunds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "point_refunds" ADD CONSTRAINT "point_refunds_processed_by_admin_id_users_id_fk" FOREIGN KEY ("processed_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_admin_id_users_id_fk" FOREIGN KEY ("created_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "rank_memberships" ADD CONSTRAINT "rank_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "rank_memberships" ADD CONSTRAINT "rank_memberships_granted_by_admin_id_users_id_fk" FOREIGN KEY ("granted_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sales_incentives" ADD CONSTRAINT "sales_incentives_sales_rep_id_sales_reps_id_fk" FOREIGN KEY ("sales_rep_id") REFERENCES "public"."sales_reps"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sales_incentives" ADD CONSTRAINT "sales_incentives_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "sales_reps" ADD CONSTRAINT "sales_reps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_stopped_by_admin_id_users_id_fk" FOREIGN KEY ("stopped_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "coupon_redemptions" ADD CONSTRAINT "coupon_redemptions_issue_id_coupon_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."coupon_issues"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "guaranteed_campaigns" ADD CONSTRAINT "guaranteed_campaigns_stopped_by_admin_id_users_id_fk" FOREIGN KEY ("stopped_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_sales_rep_id_sales_reps_id_fk" FOREIGN KEY ("sales_rep_id") REFERENCES "public"."sales_reps"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
DO $$ BEGIN
	ALTER TABLE "review_campaigns" ADD CONSTRAINT "review_campaigns_stopped_by_admin_id_users_id_fk" FOREIGN KEY ("stopped_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null; END $$;
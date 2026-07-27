CREATE TABLE "member_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"username" text,
	"phone" text,
	"org_name" text,
	"org_type" text,
	"biz_number" text,
	"biz_condition" text,
	"biz_category" text,
	"biz_file_path" text,
	"biz_file_name" text,
	"biz_file_size" integer,
	"biz_file_uploaded_at" timestamp with time zone,
	"agreed_at" timestamp with time zone,
	"admin_memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
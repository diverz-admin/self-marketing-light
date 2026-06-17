import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  date,
  jsonb,
} from "drizzle-orm/pg-core";

// 1. 사용자 테이블
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// 2. 셀프 마케팅 프로필 테이블
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title"),             // 한줄 소개/타이틀 (예: "성장을 갈망하는 풀스택 개발자")
  bio: text("bio"),                 // 자기소개 상세
  contactEmail: text("contact_email"),
  blogUrl: text("blog_url"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

// 3. 포트폴리오 프로젝트 테이블
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),         // 상세 내용 (마크다운 등)
  projectUrl: text("project_url"),  // 라이브 서비스 링크
  githubUrl: text("github_url"),    // 소스 코드 링크
  imageUrl: text("image_url"),      // 프로젝트 대표 이미지 링크
  tags: text("tags").array().default([]), // 기술 스택 태그 배열
  isFeatured: boolean("is_featured").default(false), // 대표 프로젝트 여부
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

// 4. 셀프 브랜딩 포스팅 테이블 (블로그 기능 등)
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  status: text("status").notNull().default("draft"), // draft | published
  tags: text("tags").array().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

// ============================================================
// PART 2: B2B 셀프 마케팅 SaaS
// ============================================================

// --- Enums ---

export const userRoleEnum = pgEnum("user_role", ["advertiser", "supplier", "admin"]);

export const businessTypeEnum = pgEnum("business_type", ["place", "store"]);

export const productTypeEnum = pgEnum("product_type", [
  "place_traffic",
  "store_traffic",
  "store_action",
  "blog_review",
  "visit_review",
  "community_viral",
  "pr_media",
  "influencer",
  "rank_tracking",
]);

export const productUnitEnum = pgEnum("product_unit", [
  "per_visit_day",
  "per_item",
  "subscription",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "submitted",
  "reviewing",
  "scheduled",
  "running",
  "paused",
  "completed",
  "canceled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "refunded",
  "partial_refund",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "assigned",
  "in_progress",
  "submitted",
  "approved",
  "rejected",
]);

export const settlementStatusEnum = pgEnum("settlement_status", [
  "pending",
  "processing",
  "completed",
]);

// --- Tables ---

// 사업자 정보 (한 유저가 여러 매장/상품 보유 가능)
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: businessTypeEnum("type").notNull(),
  name: text("name").notNull(),
  externalUrl: text("external_url"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Business = typeof businesses.$inferSelect;
export type NewBusiness = typeof businesses.$inferInsert;

// 판매 가능한 마케팅 상품 카탈로그
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  productType: productTypeEnum("product_type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  unit: productUnitEnum("unit").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  minQty: integer("min_qty").notNull().default(1),
  maxQty: integer("max_qty"),
  estDurationDays: integer("est_duration_days"),
  formSchema: jsonb("form_schema").notNull(), // 캠페인 빌더 동적 폼 정의
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// 캠페인 (광고주가 주문한 마케팅 실행 단위)
export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  status: campaignStatusEnum("status").notNull().default("draft"),
  inputs: jsonb("inputs").notNull().default({}), // 폼 입력값 (키워드, 지역, 미션 등)
  dailyQty: integer("daily_qty"),
  totalQty: integer("total_qty").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  quotedAmount: numeric("quoted_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

// 캠페인 일별 실행/유입 기록
export const campaignEvents = pgTable("campaign_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  eventDate: date("event_date").notNull(),
  deliveredQty: integer("delivered_qty").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CampaignEvent = typeof campaignEvents.$inferSelect;
export type NewCampaignEvent = typeof campaignEvents.$inferInsert;

// 주문/결제
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method"),      // card | bank_transfer | virtual_account | credit
  pgTxId: text("pg_tx_id"),   // PG사 거래 ID
  status: paymentStatusEnum("status").notNull().default("paid"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

// 크레딧 원장 (충전/차감 이벤트 로그)
export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  delta: numeric("delta", { precision: 12, scale: 2 }).notNull(), // +충전 / -차감
  reason: text("reason"),
  refId: uuid("ref_id"),      // 관련 order_id 또는 campaign_id
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Credit = typeof credits.$inferSelect;
export type NewCredit = typeof credits.$inferInsert;

// 공급자 (매체 / 체험단 / 크리에이터)
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channelType: text("channel_type"),    // naver_blog | instagram | youtube | cafe | ...
  capacity: integer("capacity"),         // 동시 처리 가능 캠페인 수
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;

// 캠페인 ↔ 공급자 배정
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  assignedQty: integer("assigned_qty").notNull(),
  status: assignmentStatusEnum("status").notNull().default("assigned"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Assignment = typeof assignments.$inferSelect;
export type NewAssignment = typeof assignments.$inferInsert;

// 공급자 정산 (2차)
export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").notNull().references(() => suppliers.id),
  period: text("period").notNull(), // ex: "2026-06"
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: settlementStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settlement = typeof settlements.$inferSelect;
export type NewSettlement = typeof settlements.$inferInsert;

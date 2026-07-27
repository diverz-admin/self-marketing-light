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

// 사용자 역할 enum (users 테이블에서 참조하므로 상단에 선언)
export const userRoleEnum = pgEnum("user_role", ["advertiser", "supplier", "admin"]);

// 1. 사용자 테이블
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("advertiser"),
  creditBalance: numeric("credit_balance", { precision: 12, scale: 2 }).notNull().default("0"),
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
// (userRoleEnum은 파일 상단 users 테이블 위에 선언됨)

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

// 상품등록 카테고리 — 어드민에서 상품을 묶는 단위
export const productCategoryEnum = pgEnum("product_category", [
  "reward_place",                   // 리워드마케팅 · 네이버 플레이스
  "reward_shopping",                // 리워드마케팅 · 네이버 쇼핑
  "reward_coupang",                 // 리워드마케팅 · 쿠팡
  "place_blog_distribute",          // 네이버 플레이스 · 블로그배포
  "place_receipt",                  // 네이버 플레이스 · 영수증리뷰
  "shopping_product_provided",      // 네이버 쇼핑 · 제품제공
  "shopping_product_not_provided",  // 네이버 쇼핑 · 제품미제공
]);

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
  formSchema: jsonb("form_schema").notNull().default({}), // 캠페인 빌더 동적 폼 정의
  category: productCategoryEnum("category"),                   // 상품등록 카테고리 (null = 미분류)
  // 기획서: 리워드마케팅 상품등록 항목 (효율 / 평균 상승률 / 구독 정보)
  channel: text("channel"),                                    // place | shopping | coupang
  efficiency: numeric("efficiency", { precision: 5, scale: 2 }),        // 효율 (%)
  avgRankUpRate: numeric("avg_rank_up_rate", { precision: 5, scale: 2 }), // 평균 올라가는 (%)
  subscriptionInfo: text("subscription_info"),                 // 구독 정보

  // ── 사용자 상품 선택 화면(리워드 캠페인 신청)에 그대로 노출되는 값들 ──
  tier: text("tier"),                          // 카드 묶음: 공통 | 맞집 | 일반
  subtitle: text("subtitle"),                  // 카드 부제 ("+150여 채널")
  thumbnailUrl: text("thumbnail_url"),         // 상품 썸네일 (공개 URL)
  thumbnailPath: text("thumbnail_path"),       // 스토리지 객체 경로 (교체·삭제용)
  // 썸네일이 없을 때만 쓰는 대체 표시 (구 아이콘 방식)
  badgeInitial: text("badge_initial"),
  badgeColor: text("badge_color"),
  isSale: boolean("is_sale").notNull().default(false),          // SALE 리본
  isRecommended: boolean("is_recommended").notNull().default(false), // 👍 추천
  rankUpUserRate: numeric("rank_up_user_rate", { precision: 5, scale: 2 }), // 순위 상승 경험 고객 비율 (73%)
  rankBefore: integer("rank_before"),          // 순위 상승 추이 시작 (18위)
  rankAfter: integer("rank_after"),            // 순위 상승 추이 도달 (3위)
  orderCutoffTime: text("order_cutoff_time"),  // 당일 접수 마감 ("13:30")
  sameDayStart: boolean("same_day_start").notNull().default(false), // 당일 구동 가능
  minRunDays: integer("min_run_days"),         // 최소 구동 기간 (일)

  // ── 리뷰/체험단 상품 전용 (건당 원고 단위 판매 — 리워드 상품은 사용하지 않는다) ──
  reviewType: text("review_type"),             // blog_distribute | receipt | visitor | reservation | blog_experience | blog_reporter | product_provided | product_not_provided
  reviewChars: integer("review_chars"),        // 원고 글자수 (700자)
  reviewImages: integer("review_images"),      // 원고 이미지 수 (7장)
  blogGrade: text("blog_grade"),               // 블로그 등급 ("준최2~5")
  deliveryTiming: text("delivery_timing"),     // same_day | next_day
  originalPrice: numeric("original_price", { precision: 12, scale: 2 }), // 할인 전 정가
  saleTag: text("sale_tag"),                   // 할인 문구 ("오픈 기념 할인")

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
  // 셋팅·구동을 맡은 관리자 (어드민 캠페인 관리 화면의 담당자)
  assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),
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

// ============================================================
// PART 3: 어드민 콘솔 (기획서 기반)
// ============================================================

// ── 기본 > 포인트충전 ──
export const pointChargeStatusEnum = pgEnum("point_charge_status", [
  "requested",
  "approved",
  "rejected",
  "canceled",
]);

export const pointCharges = pgTable("point_charges", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  bonusAmount: numeric("bonus_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  method: text("method").notNull().default("bank_transfer"), // bank_transfer | card | virtual_account
  depositorName: text("depositor_name"),                     // 입금자명
  receiptType: text("receipt_type"),                         // tax_invoice | cash_receipt | none
  status: pointChargeStatusEnum("status").notNull().default("requested"),
  memo: text("memo"),
  processedBy: uuid("processed_by").references(() => users.id, { onDelete: "set null" }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PointCharge = typeof pointCharges.$inferSelect;
export type NewPointCharge = typeof pointCharges.$inferInsert;

// ── 기본 > 쿠폰 ──
export const couponDiscountTypeEnum = pgEnum("coupon_discount_type", ["amount", "percent"]);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: couponDiscountTypeEnum("discount_type").notNull().default("amount"),
  discountValue: numeric("discount_value", { precision: 12, scale: 2 }).notNull(), // 쿠폰 금액 정의
  minOrderAmount: numeric("min_order_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  maxDiscountAmount: numeric("max_discount_amount", { precision: 12, scale: 2 }),
  totalQuota: integer("total_quota"),                             // null = 무제한
  issuedCount: integer("issued_count").notNull().default(0),
  usedCount: integer("used_count").notNull().default(0),          // 사용 카운팅
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

// 쿠폰 사용 이력 (사용 카운팅 근거)
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type NewCouponRedemption = typeof couponRedemptions.$inferInsert;

// ── 기본 > 공지사항 ──
export const notices = pgTable("notices", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("service"), // service | update | event | maintenance
  isPinned: boolean("is_pinned").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  viewCount: integer("view_count").notNull().default(0),
  // 본문에 붙는 이미지/영상 첨부. [{ kind, url, path, name, size, mime, thumb }]
  attachments: jsonb("attachments").notNull().default([]),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Notice = typeof notices.$inferSelect;
export type NewNotice = typeof notices.$inferInsert;

// ── 기본 > 게시판 ──
export const boardTypeEnum = pgEnum("board_type", ["free", "review", "commerce", "qna", "tip"]);

// 사용자 화면 게시판 탭 = 채널. null이면 채널 구분 없는 글(모든 탭에 노출)
export const boardChannelEnum = pgEnum("board_channel", ["shopping", "place", "coupang"]);

export const boardPosts = pgTable("board_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardType: boardTypeEnum("board_type").notNull().default("free"),
  channel: boardChannelEnum("channel"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
  authorName: text("author_name"),
  isPinned: boolean("is_pinned").notNull().default(false),
  isPublished: boolean("is_published").notNull().default(true),
  isBlinded: boolean("is_blinded").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  // 본문에 붙는 이미지/영상 첨부. [{ kind, url, path, name, size, mime, thumb }]
  attachments: jsonb("attachments").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BoardPost = typeof boardPosts.$inferSelect;
export type NewBoardPost = typeof boardPosts.$inferInsert;

// ── 통합순위관리 ──
export const rankPlatformEnum = pgEnum("rank_platform", ["place", "shopping", "coupang"]);

export const rankKeywords = pgTable("rank_keywords", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: rankPlatformEnum("platform").notNull().default("place"),
  keyword: text("keyword").notNull(),
  targetName: text("target_name"),   // 업체명/상품명
  targetUrl: text("target_url"),
  isPaid: boolean("is_paid").notNull().default(false),  // 키워드 1개 무료 / 2개 이상 유료
  monthlyFee: numeric("monthly_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  currentRank: integer("current_rank"),
  previousRank: integer("previous_rank"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RankKeyword = typeof rankKeywords.$inferSelect;
export type NewRankKeyword = typeof rankKeywords.$inferInsert;

// 키워드별 일자 순위 이력 — 캠페인 관리 화면의 순위 추이 차트가 이 값을 그린다
export const rankSnapshots = pgTable("rank_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  keywordId: uuid("keyword_id").notNull().references(() => rankKeywords.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date").notNull(),
  rank: integer("rank"),                       // 순위권 밖이면 null
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RankSnapshot = typeof rankSnapshots.$inferSelect;
export type NewRankSnapshot = typeof rankSnapshots.$inferInsert;

// ── 금액 설정 통합 (기획서 내 "금액 설정 필요" 항목) ──
// category 예: rank | reward | guaranteed | place_review | shopping_review | performance | viral | content
export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  key: text("key").notNull(),        // extra_keyword | blog_distribute | receipt | product_provided ...
  label: text("label").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  unit: text("unit").notNull().default("건"),  // 건 | 월 | 일
  options: jsonb("options").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PricingRule = typeof pricingRules.$inferSelect;
export type NewPricingRule = typeof pricingRules.$inferInsert;

// ── 리워드마케팅 > 보장형 캠페인 ──
export const guaranteedStatusEnum = pgEnum("guaranteed_status", [
  "requested",   // 신청
  "reviewing",   // 검토중
  "setting",     // 셋팅중
  "running",     // 진행중
  "completed",   // 완료
  "canceled",    // 취소
]);

export const guaranteedCampaigns = pgTable("guaranteed_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "set null" }),
  platform: rankPlatformEnum("platform").notNull().default("place"),
  keyword: text("keyword").notNull(),
  targetName: text("target_name"),
  targetUrl: text("target_url"),
  targetRank: integer("target_rank").notNull().default(1),   // 보장 순위
  guaranteedDays: integer("guaranteed_days").notNull().default(30),
  achievedDays: integer("achieved_days").notNull().default(0),
  currentRank: integer("current_rank"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: guaranteedStatusEnum("status").notNull().default("requested"),
  setting: jsonb("setting").notNull().default({}),   // 캠페인 셋팅 값
  memo: text("memo"),
  // 셋팅·구동을 맡은 관리자 (어드민 보장형 캠페인 관리의 담당자)
  assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GuaranteedCampaign = typeof guaranteedCampaigns.$inferSelect;
export type NewGuaranteedCampaign = typeof guaranteedCampaigns.$inferInsert;

// ── 연장 신청 (리워드 / 보장형 / 리뷰 공통) ──
export const extensionTargetEnum = pgEnum("extension_target", ["campaign", "guaranteed", "review"]);
export const extensionStatusEnum = pgEnum("extension_status", ["requested", "approved", "rejected"]);

export const campaignExtensions = pgTable("campaign_extensions", {
  id: uuid("id").primaryKey().defaultRandom(),
  targetType: extensionTargetEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  addDays: integer("add_days").notNull().default(0),
  addQty: integer("add_qty").notNull().default(0),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: extensionStatusEnum("status").notNull().default("requested"),
  memo: text("memo"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CampaignExtension = typeof campaignExtensions.$inferSelect;
export type NewCampaignExtension = typeof campaignExtensions.$inferInsert;

// ── 리뷰/체험단 캠페인 ──
export const reviewPlatformEnum = pgEnum("review_platform", ["place", "naver_shopping", "coupang"]);

export const reviewTypeEnum = pgEnum("review_type", [
  "blog_distribute",      // 블로그 배포
  "receipt",              // 영수증 리뷰
  "visitor",              // 방문자 리뷰
  "reservation",          // 예약자 리뷰
  "blog_experience",      // 블로그 체험단
  "blog_reporter",        // 블로그 기자단
  "product_provided",     // 제품 제공
  "product_not_provided", // 제품 미제공
]);

export const reviewCampaignStatusEnum = pgEnum("review_campaign_status", [
  "requested",   // 신청
  "paid",        // 결제완료
  "setting",     // 셋팅중
  "recruiting",  // 모집중
  "running",     // 진행중
  "completed",   // 완료
  "canceled",    // 취소
]);

export const reviewCampaigns = pgTable("review_campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  platform: reviewPlatformEnum("platform").notNull(),
  reviewType: reviewTypeEnum("review_type").notNull(),
  storeName: text("store_name").notNull(),
  targetUrl: text("target_url"),
  keyword: text("keyword"),
  totalQty: integer("total_qty").notNull().default(0),
  completedQty: integer("completed_qty").notNull().default(0),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: reviewCampaignStatusEnum("status").notNull().default("requested"),
  setting: jsonb("setting").notNull().default({}),   // 셋팅 값 (가이드/미션/제공내역 등)
  requestNote: text("request_note"),                 // 고객 요청사항 / 수정사항
  adminMemo: text("admin_memo"),
  // 셋팅·진행을 맡은 관리자 (어드민 리뷰 관리의 담당자)
  assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewCampaign = typeof reviewCampaigns.$inferSelect;
export type NewReviewCampaign = typeof reviewCampaigns.$inferInsert;

// 리뷰 진행현황 개별 건 (블로그 작성 / 영수증 진행현황 셋팅)
export const reviewTaskStatusEnum = pgEnum("review_task_status", [
  "waiting",    // 대기
  "assigned",   // 배정
  "writing",    // 작성중
  "submitted",  // 제출
  "approved",   // 승인
  "rejected",   // 반려
]);

export const reviewTasks = pgTable("review_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewCampaignId: uuid("review_campaign_id").notNull().references(() => reviewCampaigns.id, { onDelete: "cascade" }),
  reviewerName: text("reviewer_name"),
  reviewerContact: text("reviewer_contact"),
  status: reviewTaskStatusEnum("status").notNull().default("waiting"),
  postUrl: text("post_url"),         // 블로그 작성 URL
  receiptUrl: text("receipt_url"),   // 영수증 이미지 URL
  scheduledDate: date("scheduled_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewTask = typeof reviewTasks.$inferSelect;
export type NewReviewTask = typeof reviewTasks.$inferInsert;

// ── 퍼포먼스 마케팅 / 바이럴 커뮤니티 / 콘텐츠 : 전 페이지 신청 확인 ──
export const serviceRequestStatusEnum = pgEnum("service_request_status", [
  "requested",   // 신청
  "reviewing",   // 상담중
  "quoted",      // 견적발송
  "in_progress", // 진행중
  "completed",   // 완료
  "canceled",    // 취소
]);

export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  category: text("category").notNull(),      // performance | viral | content
  serviceKey: text("service_key").notNull(), // meta_ads | naver_cpc | cafe | board | video | image | detail ...
  serviceName: text("service_name").notNull(),
  inputs: jsonb("inputs").notNull().default({}),
  quotedAmount: numeric("quoted_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: serviceRequestStatusEnum("status").notNull().default("requested"),
  // 상담·진행을 맡은 관리자 (어드민 서비스 신청내역의 담당자)
  assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),
  contact: text("contact"),
  adminMemo: text("admin_memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ServiceRequest = typeof serviceRequests.$inferSelect;
export type NewServiceRequest = typeof serviceRequests.$inferInsert;

// ── 회원 가입 정보 (가입 폼에서 받는 조직/사업자 정보) ──
// 가입 폼은 이 값들을 받는데 저장되지 않고 있었다. 어드민 회원 상세에서 열람한다.
export const memberProfiles = pgTable("member_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  username: text("username"),          // 로그인 아이디
  phone: text("phone"),
  orgName: text("org_name"),           // 조직명(회사명)
  orgType: text("org_type"),           // 대행사 / 광고주 등
  bizNumber: text("biz_number"),       // 사업자등록번호
  bizCondition: text("biz_condition"), // 업태
  bizCategory: text("biz_category"),   // 업종(종목)
  // 사업자등록증 — 비공개 버킷의 객체 경로. 열람 시 서명 URL을 발급한다.
  bizFilePath: text("biz_file_path"),
  bizFileName: text("biz_file_name"),
  bizFileSize: integer("biz_file_size"),
  bizFileUploadedAt: timestamp("biz_file_uploaded_at", { withTimezone: true }),
  agreedAt: timestamp("agreed_at", { withTimezone: true }), // 약관 동의 시각
  adminMemo: text("admin_memo"),       // 관리자 비고사항
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type NewMemberProfile = typeof memberProfiles.$inferInsert;

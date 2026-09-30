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
//
// CK-02 어드민 권한 단계 — 슈퍼 / 관리자 / 영업자 3단계.
// AU-03 어드민 권한 부여는 super_admin 만 할 수 있다.
// RF-00 추천인 코드는 sales(내부 영업자) 전용이다.
export const userRoleEnum = pgEnum("user_role", [
  "advertiser",
  "supplier",
  "admin",
  "sales",
  "super_admin",
]);

/** AB-01 계정 상태 — 정지되면 로그인이 차단된다 */
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);

// 1. 사용자 테이블
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull().default("advertiser"),
  // 총 포인트 잔액. 불변식: creditBalance = 유상 + 무상, 유상 = creditBalance − freeBalance.
  // 기존 화면이 모두 이 값을 총액으로 읽으므로 의미를 바꾸지 않는다.
  creditBalance: numeric("credit_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  // PT-01 무상(보너스·쿠폰) 포인트 잔액 — 환불 대상에서 제외한다.
  // PT-02 차감 시 이 잔액을 먼저 소진한다.
  freeBalance: numeric("free_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  // PT-08 최종 거래일 — 마지막 충전 또는 마지막 사용 시점. 5년 소멸 판정의 기준.
  lastTransactionAt: timestamp("last_transaction_at", { withTimezone: true }),
  // AB-01 계정 상태
  status: userStatusEnum("status").notNull().default("active"),
  suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  // AB-03a 정지 사유 — AU-04에 따라 정지 처리 시 필수 입력이다
  suspendReason: text("suspend_reason"),
  // 자기 참조라 .references() 를 걸지 않는다 — 처리자 계정이 지워져도 정지 기록은 남아야 한다
  suspendedByAdminId: uuid("suspended_by_admin_id"),
  // SS-03 이 시각 이전에 발급된 세션은 무효. 계정 정지·비밀번호 변경 시 현재 시각으로 올린다.
  sessionsValidFrom: timestamp("sessions_valid_from", { withTimezone: true }),
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

/**
 * M-01 중도 해지 귀책 구분.
 * customer — 고객 사유. 수행분을 공제하고 남은 금액만 환불한다.
 * company  — 회사 사유. 전액 환불한다.
 *
 * 자유 문자열 사유(stopReason)와 분리해 둔다. 환불액 계산이 이 값에 달려 있어
 * 문장에서 읽어낼 수 없어야 하기 때문이다.
 */
export const faultPartyEnum = pgEnum("fault_party", ["customer", "company"]);

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
  // 매입 원가 — 마진 확인용이라 관리자만 본다 (고객 화면에는 노출하지 않는다)
  costPrice: numeric("cost_price", { precision: 12, scale: 2 }),
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

  // ── CK-08 매체사(공급처) 기본 정보 — 발주할 때 필요한 값들 ──
  // 상품마다 실제로 돌리는 업체가 다르고, 업체마다 발주 양식이 달라(CK-10)
  // 어느 업체에 어떤 양식으로 넣을지를 상품에 붙여 둔다.
  vendorName: text("vendor_name"),             // 매체사(공급처) 업체명
  vendorContact: text("vendor_contact"),        // 담당자 · 연락처
  vendorMemo: text("vendor_memo"),              // 발주 시 유의사항
  // CK-10 발주 엑셀 양식 키 — 매체사마다 요구 양식이 달라 상품별로 매핑한다
  vendorFormKey: text("vendor_form_key"),

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
  // M-01 환불 누계. 정산 공식은 "환불액 = 결제액 − round(결제액 × 수행일수 ÷ 총일수)"이고,
  // 재정산 시에는 이 누계와의 차액만 이동시킨다.
  refundedAmount: numeric("refunded_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  // M-05 관리자가 확인한 부분 수행일 (정수 일수)
  performedDays: integer("performed_days"),
  // M-01 중단 처리 — 귀책 구분과 사유를 분리해 기록한다
  stoppedAt: timestamp("stopped_at", { withTimezone: true }),
  faultParty: faultPartyEnum("fault_party"),
  stopReason: text("stop_reason"),
  stoppedByAdminId: uuid("stopped_by_admin_id").references(() => users.id, { onDelete: "set null" }),
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

/**
 * PT-01 포인트 원장의 유상/무상 구분.
 * paid — 고객이 돈을 낸 포인트. 환불 대상이다.
 * free — 보너스·쿠폰 등 무상 지급분. 환불 대상이 아니다.
 */
export const creditKindEnum = pgEnum("credit_kind", ["paid", "free"]);

// 크레딧 원장 (충전/차감 이벤트 로그)
//
// PT-01 유상/무상을 원장에서 분리 관리한다. 충전 승인처럼 한 번에 유상+보너스가
// 지급되는 경우에도 kind 가 다르므로 줄을 나눠 적는다.
// PT-02 차감은 무상(free)을 먼저 소진하고 모자란 만큼만 유상(paid)에서 뺀다.
export const credits = pgTable("credits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  kind: creditKindEnum("kind").notNull().default("paid"),
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

/**
 * CK-03 세금계산서 발행 상태.
 * 승인은 되었으나 계산서가 아직 나가지 않은 건을 구분할 수 있어야 한다.
 * (P-00 / CG-04 — 입금 확인 후 충전 건별로 개별 발행)
 */
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "not_required", // 계산서 대상이 아님 (현금영수증 등)
  "pending",      // 발행 대기
  "issued",       // 발행 완료
  "failed",       // 발행 실패
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
  // CK-03 계산서 발행 추적 — 승인 상태와 별개로 움직인다
  invoiceStatus: invoiceStatusEnum("invoice_status").notNull().default("pending"),
  invoiceIssuedAt: timestamp("invoice_issued_at", { withTimezone: true }),
  invoiceNumber: text("invoice_number"),
  // P-00 실입금액 = 요청 포인트 × 1.1. 계산서 기준액과 맞추기 위해 받은 금액을 그대로 남긴다.
  depositAmount: numeric("deposit_amount", { precision: 12, scale: 2 }),
  // CG-02 과입금·미달입금 협의 결과 — AU-04에 따라 불일치 건은 메모가 필수다
  memo: text("memo"),
  processedBy: uuid("processed_by").references(() => users.id, { onDelete: "set null" }),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  // CG-05a 보너스 지급 사유 — 재량 항목이므로 사유 기록이 필수다 (AU-04)
  bonusReason: text("bonus_reason"),
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

/**
 * CP-02 쿠폰 발급 인스턴스의 상태.
 * 유효기간은 쿠폰 정의(coupons.startsAt/endsAt)가 아니라 발급 건마다 따로 흐른다.
 */
export const couponIssueStatusEnum = pgEnum("coupon_issue_status", [
  "active",   // 사용 가능
  "used",     // 사용 완료
  "expired",  // 기간 만료
  "revoked",  // 관리자 회수
]);

/**
 * CP-02 쿠폰 발급 인스턴스 — "누구에게 언제 발급했고 언제까지 쓸 수 있는가".
 *
 * 지금까지는 쿠폰 정의(coupons)와 사용 이력(coupon_redemptions)만 있어서
 * 발급 시점을 알 수 없었고, 따라서 "발급일로부터 30일" 을 판정할 수가 없었다.
 * 유효기간 판정은 coupons.endsAt(정의 기간)이 아니라 이 테이블의 expiresAt 을 본다.
 */
export const couponIssues = pgTable("coupon_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: couponIssueStatusEnum("status").notNull().default("active"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
  // CP-02 발급일 + POLICY.coupon.validDays
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  // CP-01 관리자 개별 발급은 재량이되 사유 기록이 필수다 (AU-04)
  issueReason: text("issue_reason"),
  issuedByAdminId: uuid("issued_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokeReason: text("revoke_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CouponIssue = typeof couponIssues.$inferSelect;
export type NewCouponIssue = typeof couponIssues.$inferInsert;

// 쿠폰 사용 이력 (사용 카운팅 근거)
export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  // CP-02 어느 발급 건을 썼는지. 유효기간 판정이 발급 인스턴스 기준이므로 연결해 둔다.
  issueId: uuid("issue_id").references(() => couponIssues.id, { onDelete: "set null" }),
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

// 지식공유 댓글 — 한 단계 답글까지 (parentId = 원댓글)
export const boardComments = pgTable("board_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => boardPosts.id, { onDelete: "cascade" }),
  // 답글이면 원댓글 id. 원댓글이 지워져도 답글이 남도록 삭제는 소프트 삭제(isDeleted)로 한다
  parentId: uuid("parent_id"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  // 쓸 때의 이름 — 회원명이 바뀌어도 댓글에는 그때 이름이 남는다
  authorName: text("author_name").notNull(),
  // 운영자(관리자) 댓글 — 화면에서 "운영자" 배지로 구분한다
  isAdmin: boolean("is_admin").notNull().default(false),
  content: text("content").notNull(),
  // 답글이 달린 댓글을 지우면 "삭제된 댓글입니다."로 자리만 남긴다
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type BoardComment = typeof boardComments.$inferSelect;
export type NewBoardComment = typeof boardComments.$inferInsert;

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
  // M-01 중단 처리 — 귀책 구분과 사유를 분리해 기록한다
  refundedAmount: numeric("refunded_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  stoppedAt: timestamp("stopped_at", { withTimezone: true }),
  faultParty: faultPartyEnum("fault_party"),
  stopReason: text("stop_reason"),
  stoppedByAdminId: uuid("stopped_by_admin_id").references(() => users.id, { onDelete: "set null" }),
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
  // RV-02b 완료로 판정된 시점. 이후 리뷰 URL이 지워져 completedQty 가 줄어도
  // 이 값이 차 있으면 진행중으로 되돌리지 않는다.
  completedAt: timestamp("completed_at", { withTimezone: true }),
  // M-01 중단 처리 — 귀책 구분과 사유를 분리해 기록한다
  refundedAmount: numeric("refunded_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  stoppedAt: timestamp("stopped_at", { withTimezone: true }),
  faultParty: faultPartyEnum("fault_party"),
  stopReason: text("stop_reason"),
  stoppedByAdminId: uuid("stopped_by_admin_id").references(() => users.id, { onDelete: "set null" }),
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
  // TX-04 세금계산서 발행용 이메일 — 담당자 이메일(users.email)과 별개로 받는다
  taxEmail: text("tax_email"),
  agreedAt: timestamp("agreed_at", { withTimezone: true }), // 약관 동의 시각
  // PV-01 개인정보 처리 위탁 동의 — 가입 시 별도로 받는다
  consignAgreedAt: timestamp("consign_agreed_at", { withTimezone: true }),
  // RF-01 영업자-업체 연결 — 어느 영업자 코드로 가입한 업체인지.
  // 이 값이 없으면 인센티브 산정 대상을 특정할 수 없다.
  salesRepId: uuid("sales_rep_id").references(() => salesReps.id, { onDelete: "set null" }),
  referredAt: timestamp("referred_at", { withTimezone: true }),
  adminMemo: text("admin_memo"),       // 관리자 비고사항
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type NewMemberProfile = typeof memberProfiles.$inferInsert;

// ── 관리자가 담아주는 장바구니 ──
//
// 보장형·콘텐츠처럼 "문의하기"로 들어오는 상품은 고객이 신청 화면에서 직접 담을 수 없다.
// 상담 후 관리자가 회원의 장바구니에 바로 넣어 주고, 고객은 장바구니에서 결제만 한다.
// (고객이 신청 화면에서 담는 리워드 장바구니는 브라우저에만 남는다 — 이건 서버에 남긴다)
export const adminCartItemStatusEnum = pgEnum("admin_cart_item_status", [
  "pending",   // 담아둠 (고객 장바구니에 보임)
  "ordered",   // 고객이 결제함
  "canceled",  // 관리자가 회수
]);

export const adminCartItems = pgTable("admin_cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // 고정 카탈로그 키 (네이버 플레이스 보장형 · 고퀄리티 이미지 제작 등)
  productKey: text("product_key").notNull(),
  // 담을 때의 상품명 — 카탈로그가 바뀌어도 고객이 본 이름은 그대로 남는다
  title: text("title").notNull(),
  target: text("target"),              // 대상 (플레이스명 / 사이트 주소 등)
  note: text("note"),                  // 고객에게 보이는 안내 메모
  quantity: integer("quantity").notNull().default(1),
  // 문의 기반 견적이라 단가표가 없다 — 담을 때 관리자가 정한 금액을 그대로 쓴다
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: adminCartItemStatusEnum("status").notNull().default("pending"),
  createdByAdminId: uuid("created_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  // 담아준 항목이 어느 결제로 넘어갔는지. 이 연결이 없어서 "ordered" 로 전이시키는
  // 코드가 존재하지 않았다 — 결제 시 이 값을 채우면서 상태를 옮긴다.
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  orderedAt: timestamp("ordered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminCartItem = typeof adminCartItems.$inferSelect;
export type NewAdminCartItem = typeof adminCartItems.$inferInsert;

// ── 정산 관리 > 매입(발주) ──
//
// 주문(orders)은 우리가 받은 매출이고, 그 건을 실제로 돌리는 업체에 발주를 준다.
// 주문 한 건에 발주가 여러 개 붙을 수 있어(매체를 나눠 돌리는 경우) 별도 테이블로 둔다.
// 매출-매입 차이가 곧 마진이라, 두 금액을 같은 줄에서 보게 하는 것이 이 화면의 목적이다.
export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",     // 발주 전 (매입처 미정)
  "ordered",   // 발주 완료
  "running",   // 업체 작업중
  "done",      // 작업 완료
  "canceled",  // 취소
]);

/** 업체에 실제로 돈을 보냈는지 */
export const purchaseSettleStatusEnum = pgEnum("purchase_settle_status", [
  "unpaid",    // 미지급
  "scheduled", // 지급 예정
  "paid",      // 지급 완료
]);

/**
 * 발주 대상 — 고객이 신청한 상품 종류.
 * 신청 화면이 여러 개라 테이블도 나뉘어 있어, 종류 + id 로 어느 건인지 가리킨다.
 */
export const purchaseSourceTypeEnum = pgEnum("purchase_source_type", [
  "reward_place",     // 플레이스 상위노출
  "reward_shopping",  // 쇼핑 상위노출
  "reward_coupang",   // 쿠팡 상위노출
  "guaranteed",       // 보장형
  "review_place",     // 플레이스 리뷰
  "review_shopping",  // 쇼핑 리뷰
  "etc",              // 상담 등 신청 화면을 거치지 않은 건
]);

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 어느 신청 건에 대한 발주인지 — 테이블이 나뉘어 있어 FK 대신 종류 + id 로 가리킨다
  sourceType: purchaseSourceTypeEnum("source_type").notNull().default("etc"),
  sourceId: uuid("source_id"),
  // 결제 기록과도 연결해 둔다 (주문이 지워져도 발주 기록은 남는다)
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  vendorName: text("vendor_name").notNull(),          // 발주처 업체명
  vendorContact: text("vendor_contact"),              // 담당자 · 연락처
  title: text("title").notNull(),                     // 발주 내용 (상품·캠페인명)
  quantity: integer("quantity").notNull().default(1),
  // 매입가 — 업체에 지급할 금액. 매출은 orders.amount 를 그대로 본다.
  purchaseAmount: numeric("purchase_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: purchaseOrderStatusEnum("status").notNull().default("draft"),
  settleStatus: purchaseSettleStatusEnum("settle_status").notNull().default("unpaid"),
  orderedAt: date("ordered_at"),                      // 발주일
  settledAt: date("settled_at"),                      // 지급일
  memo: text("memo"),
  createdByAdminId: uuid("created_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;

// ── 통합순위관리 멤버십 ──
//
// 회원가입만 하면 키워드 1개는 무료로 추적된다.
// 2개째부터는 멤버십이 있어야 등록할 수 있고, 멤버십이 살아 있는 동안은 개수 제한이 없다.
// 만료되면 무료 한도(1개)로 돌아가므로 초과분은 추적이 멈춘다.
export const membershipStatusEnum = pgEnum("membership_status", [
  "active",    // 이용중
  "expired",   // 기간 만료
  "canceled",  // 관리자 해지
]);

export const rankMemberships = pgTable("rank_memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: membershipStatusEnum("status").notNull().default("active"),
  // 사용자가 직접 결제한 날 — 이용 기간의 기준이 된다
  paidAt: date("paid_at"),
  startDate: date("start_date").notNull(),
  // 만료일이 지나면 무료 한도로 돌아간다 (null = 무기한)
  endDate: date("end_date"),
  monthlyFee: numeric("monthly_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  memo: text("memo"),
  // 부여·해지를 처리한 관리자
  grantedByAdminId: uuid("granted_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  canceledAt: timestamp("canceled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type RankMembership = typeof rankMemberships.$inferSelect;
export type NewRankMembership = typeof rankMemberships.$inferInsert;

// ============================================================
// PART 4: 운영정책 rev.11 (2026-09-02) 반영 — 신규 테이블
//
// 근거 문서: BLUEEGG_운영정책_rev11_20260902.pdf "Part 5. 개발 반영 항목"
// 조항 번호(PT-09, AU-01 …)는 문서와 1:1로 맞춘다.
// ============================================================

// ── AU-01 감사 로그 ──
//
// 관리자의 모든 "변경" 행위를 남긴다. AU-01b 조회(읽기)는 기록하지 않는다.
// AU-02 보관 기간은 5년으로, 포인트 소멸시효(PT-08)와 같다.
//
// AU-04 재량 항목(보너스 지급·쿠폰 발급·이용 정지·담아주기 금액·기간 변경·환불 금액)은
// 사유가 비어 있으면 저장 자체가 되지 않아야 하므로, reason 이 채워진 채로 들어온다.
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 처리자. 계정이 지워져도 로그는 남아야 하므로 이름을 함께 박아 둔다.
  actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
  actorName: text("actor_name"),
  actorRole: text("actor_role"),
  // 무엇을 했는지 — "point_charge.approve", "user.suspend" 같은 점 표기
  action: text("action").notNull(),
  // 무엇에 대해 했는지
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id"),
  targetLabel: text("target_label"),   // 화면에 보여 줄 대상 이름 (회원명·캠페인명)
  // AU-04 재량 항목의 사유. 해당 action 이면 비어 있을 수 없다.
  reason: text("reason"),
  // 바뀐 값 — 되돌릴 때와 분쟁 시 근거로 쓴다
  before: jsonb("before"),
  after: jsonb("after"),
  ip: text("ip"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

// ── PT-09 / PT-11 포인트 환불 처리 ──
//
// 환불 신청은 카카오톡 상담으로만 접수하고(PT-09) 어드민에서 수기로 처리한다.
// 이 테이블은 그 수기 처리의 기록이자 체크리스트다.
//
// PT-11 이 규정이 이 테이블의 모양을 정한다 — 접수 후 입금 전까지 잔액을 잠그지
// 않으므로, 고객이 그 사이에 포인트를 쓰면 실제 보낼 금액이 달라진다. 그래서
// "접수 시점 잔액"과 "송금 직전 잔액"을 둘 다 남기고, 최종 송금액은 후자에서
// 재산정한다. 재산정 결과가 최소 환불 금액(PT-07) 미만이면 환불을 취소한다.
export const pointRefundStatusEnum = pgEnum("point_refund_status", [
  "requested",  // 접수 (카카오톡 상담)
  "approved",   // 검토 완료, 송금 대기
  "paid",       // 입금 완료
  "canceled",   // PT-11 재산정 결과 하한 미달 등으로 취소
  "rejected",   // 반려
]);

export const pointRefunds = pgTable("point_refunds", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: pointRefundStatusEnum("status").notNull().default("requested"),

  // ── 접수 시점 ──
  requestedAmount: numeric("requested_amount", { precision: 12, scale: 2 }).notNull(),
  // PT-01 무상 포인트는 환불 대상이 아니므로, 접수 시점의 유상/무상을 남겨 둔다
  balanceAtRequest: numeric("balance_at_request", { precision: 12, scale: 2 }),
  freeBalanceAtRequest: numeric("free_balance_at_request", { precision: 12, scale: 2 }),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),

  // ── PT-05 환불 계좌는 입금자명과 동일한 계좌만 허용한다 ──
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountHolder: text("account_holder"),   // 예금주
  depositorName: text("depositor_name"),   // 원 충전 건의 입금자명 — 예금주와 일치해야 한다
  holderVerified: boolean("holder_verified").notNull().default(false),

  // ── PT-11 송금 직전 재산정 ──
  balanceAtTransfer: numeric("balance_at_transfer", { precision: 12, scale: 2 }),
  recalculatedAmount: numeric("recalculated_amount", { precision: 12, scale: 2 }),
  // PT-06 이체 수수료는 고객 부담이라 환불액에서 뺀다.
  // 단 세금계산서 기준액은 수수료를 빼기 전 금액(recalculatedAmount)이다.
  transferFee: numeric("transfer_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  // 실제로 보낸 금액 = recalculatedAmount − transferFee
  paidAmount: numeric("paid_amount", { precision: 12, scale: 2 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),

  // ── PT-04 환불 시 세금계산서 처리 (방식은 회의 미확정 — 상태만 추적한다) ──
  invoiceStatus: invoiceStatusEnum("invoice_status").notNull().default("pending"),
  invoiceNumber: text("invoice_number"),

  // AU-04 재량 항목이므로 사유가 필수다
  reason: text("reason"),
  cancelReason: text("cancel_reason"),
  adminMemo: text("admin_memo"),
  processedByAdminId: uuid("processed_by_admin_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PointRefund = typeof pointRefunds.$inferSelect;
export type NewPointRefund = typeof pointRefunds.$inferInsert;

// ── RF-00 내부 영업자 ──
//
// rev.11에서 추천인 제도가 뒤집혔다. 이전 초안은 전 회원에게 추천 코드를 발급하고
// 대행사도 보상 대상이었으나, 지금은 코드가 내부 영업자 전용이다.
// 일반 회원·대행사에게는 코드를 발급하지 않는다(RF-00).
// 대행사의 수익은 대행사가(할인 단가)이며 인센티브 대상이 아니다(RF-05 / AG-07).
export const salesReps = pgTable("sales_reps", {
  id: uuid("id").primaryKey().defaultRandom(),
  // 영업자 본인의 로그인 계정 (users.role = 'sales')
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  // 업체 가입 시 입력받는 추천인 코드
  code: text("code").notNull().unique(),
  displayName: text("display_name"),
  isActive: boolean("is_active").notNull().default(true),
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SalesRep = typeof salesReps.$inferSelect;
export type NewSalesRep = typeof salesReps.$inferInsert;

// ── RF-01 영업자 인센티브 ──
//
// 적립 시점은 "완료"가 아니라 "종료"다. 기준 금액은 실제 수행분의 실결제액
// (쿠폰 할인 후)이며, 환불을 먼저 반영한 뒤 남은 금액에 요율을 적용한다.
//
// 미확정(Part 2) — RF-01a 요율, RF-01b 지급 형태·정산 주기·원천징수, RF-03 회수 기준.
// 요율은 확정 전이라 건별로 적용값을 박아 둔다(나중에 요율이 바뀌어도 과거 건이 흔들리지 않는다).
// RF-02 내부 영업자에 대한 지급이므로 회원 포인트 적립 체계와 분리한다 — 여기 쌓인 값은
// credits 원장을 건드리지 않는다.
export const salesIncentiveStatusEnum = pgEnum("sales_incentive_status", [
  "accrued",  // 적립됨 (지급 전)
  "paid",     // 지급 완료
  "revoked",  // 회수
]);

export const salesIncentives = pgTable("sales_incentives", {
  id: uuid("id").primaryKey().defaultRandom(),
  salesRepId: uuid("sales_rep_id").notNull().references(() => salesReps.id, { onDelete: "cascade" }),
  // 사용 금액이 발생한 업체
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // 어느 건에서 나왔는지 — 신청 화면이 여러 개라 종류 + id 로 가리킨다 (purchase_orders 와 같은 방식)
  sourceType: purchaseSourceTypeEnum("source_type").notNull().default("etc"),
  sourceId: uuid("source_id"),
  // 실결제액(쿠폰 할인 후)에서 환불을 먼저 뺀 금액
  baseAmount: numeric("base_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  // 적용 요율 — RF-01a 미확정이라 확정 전에는 0으로 쌓인다
  rate: numeric("rate", { precision: 5, scale: 4 }).notNull().default("0"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  status: salesIncentiveStatusEnum("status").notNull().default("accrued"),
  // 적립 시점은 캠페인 "종료" 시점이다
  accruedAt: timestamp("accrued_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  // RF-03 회수 — 사유 기록 필수 (AU-04)
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokeReason: text("revoke_reason"),
  memo: text("memo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SalesIncentive = typeof salesIncentives.$inferSelect;
export type NewSalesIncentive = typeof salesIncentives.$inferInsert;

// ── CS-03 법정공휴일 ──
//
// 공공데이터 API에서 연 단위로 받아 캐시한다. 조회에 실패하면 캐시 값을 쓴다.
// PT-10(환불 영업일 7일) · HD-01(담당자 배정 영업일 1일) · PU-02(예상 집행일)의
// 영업일 계산이 전부 여기에 의존한다. 지금은 policy.ts 에 연도별로 손으로 적어 둔
// 배열이 있는데, 매년 갱신해야 하므로 이 테이블로 옮긴다.
export const holidays = pgTable("holidays", {
  // YYYY-MM-DD. 하루에 하나라 날짜 자체를 키로 쓴다.
  date: date("date").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  // api = 공공데이터포털에서 받아옴 / manual = 관리자가 직접 넣음(임시공휴일 등)
  source: text("source").notNull().default("api"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Holiday = typeof holidays.$inferSelect;
export type NewHoliday = typeof holidays.$inferInsert;

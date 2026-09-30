// 어드민 공통 포맷터 & 상태 라벨/색상 매핑

export type BadgeTone = "gray" | "blue" | "green" | "amber" | "red" | "purple";

export const toneClass: Record<BadgeTone, string> = {
  gray: "bg-[#EEF1F5] text-[#5B6472]",
  blue: "bg-[#E4EFFF] text-[#2452EB]",
  green: "bg-[#DFF5E6] text-[#1E7E43]",
  amber: "bg-[#FCEFD9] text-[#B5751B]",
  red: "bg-[#FFE3E8] text-[#C4363B]",
  purple: "bg-[#EBE6FB] text-[#5B3FB0]",
};

/**
 * 금액 표기 — "1,234,567원".
 *
 * 원화 기호 U+20A9(₩)를 앞에 붙이지 않는다. 이 글자는 잉크 폭이 advance 폭보다
 * 넓어 가로 획 두 개가 바로 뒤 숫자에 닿는다. 굵고 큰 글씨(대시보드 KPI 등)에서는
 * 금액에 취소선이 그어진 것처럼 읽혀 "매출이 취소됐나?"로 오해할 소지가 있다.
 * tracking 을 정상으로 되돌려도 글리프 자체의 문제라 그대로다.
 *
 * 접미 "원"은 그 충돌이 없고, 고객 화면(장바구니 등)이 이미 쓰는 표기이며
 * 보이지 않는 문자를 섞지 않아 복사·붙여넣기도 깨끗하다.
 */
export function formatKRW(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(n)) return "0원";
  return Math.round(n).toLocaleString("ko-KR") + "원";
}

export function formatNumber(value: string | number | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value ?? 0;
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("ko-KR");
}

/**
 * 날짜 포맷은 서버와 브라우저에서 **같은 문자열**이 나와야 한다.
 * `toLocaleString("ko-KR")`은 Node와 브라우저의 로케일 데이터가 달라
 * "PM 12:15" / "오후 12:15"처럼 갈리고, 그대로 하이드레이션 실패로 이어진다.
 * 그래서 숫자 부품만 en-CA(고정 포맷)로 뽑고 한국어 표기는 직접 조립한다.
 * 기준 시간대는 서비스 기준인 KST로 고정한다.
 */
const KST_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function kstParts(d: Date) {
  const out: Record<string, string> = {};
  for (const p of KST_PARTS.formatToParts(d)) {
    if (p.type !== "literal") out[p.type] = p.value;
  }
  return out;
}

function toDate(d: Date | string | null | undefined): Date | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(d: Date | string | null | undefined): string {
  const date = toDate(d);
  if (!date) return "-";
  const p = kstParts(date);
  return `${p.year}. ${p.month}. ${p.day}.`;
}

export function formatDateTime(d: Date | string | null | undefined): string {
  const date = toDate(d);
  if (!date) return "-";
  const p = kstParts(date);
  const h24 = Number(p.hour);           // hour12:false 는 자정을 "24"로 줄 수 있다
  const hour = h24 % 24;
  const meridiem = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${p.year}. ${p.month}. ${p.day}. ${meridiem} ${h12}:${p.minute}`;
}

// ── 상태 라벨/톤 매핑 ──

type LabelTone = { label: string; tone: BadgeTone };

export const roleMeta: Record<string, LabelTone> = {
  advertiser: { label: "광고주", tone: "blue" },
  supplier: { label: "공급자", tone: "purple" },
  admin: { label: "관리자", tone: "red" },
};

// 캠페인 진행 프로세스: 신청접수 → 셋팅완료 → 구동중 → 완료
export const campaignStatusMeta: Record<string, LabelTone> = {
  draft: { label: "임시저장", tone: "gray" },
  submitted: { label: "신청접수", tone: "amber" },
  reviewing: { label: "신청접수", tone: "amber" }, // 사용하지 않는 단계 — 과거 데이터만 이 값을 가진다
  scheduled: { label: "셋팅완료", tone: "purple" },
  running: { label: "구동중", tone: "green" },
  paused: { label: "구동중", tone: "green" }, // 사용하지 않는 단계 — 과거 데이터만 이 값을 가진다
  completed: { label: "완료", tone: "gray" },
  canceled: { label: "취소", tone: "red" },
  refunded: { label: "환불", tone: "red" },
};

/** 프로세스 단계 — 화면에 그대로 노출되는 순서 */
export const CAMPAIGN_STAGES = [
  { key: "submitted", label: "신청접수", tone: "amber" as BadgeTone },
  { key: "setting_done", label: "셋팅완료", tone: "purple" as BadgeTone },
  { key: "running", label: "구동중", tone: "green" as BadgeTone },
  { key: "completed", label: "완료", tone: "gray" as BadgeTone },
];

/** 서비스 기준 시간대(KST)의 오늘 날짜 — "YYYY-MM-DD" */
export function todayKST(): string {
  const p = kstParts(new Date());
  return `${p.year}-${p.month}-${p.day}`;
}

/**
 * 캠페인의 현재 단계.
 *   신청접수 → (관리자가 셋팅 완료) → 셋팅완료 → 시작일이 되면 구동중 → 종료일이 지나면 완료
 * 셋팅 완료 이후의 전환은 관리자가 누르지 않아도 기간에 맞춰 자동으로 넘어간다.
 * reviewing(확인중)·paused(일시중지)는 프로세스에서 내려간 값이라 각각 신청접수·구동중으로 묶는다.
 */
export function campaignStage(
  status: string,
  opts: { startDate: string | null; endDate: string | null; today: string },
) {
  if (status === "completed") return "completed";
  // 셋팅이 끝난 캠페인(scheduled)과 이미 구동에 들어간 캠페인은 기간으로 단계를 가른다
  if (status === "scheduled" || status === "running" || status === "paused") {
    // 기간이 비어 있으면 아직 셋팅되지 않은 것이다 → 신청접수로 되돌려 셋팅을 받는다
    if (!opts.startDate || !opts.endDate) return "submitted";
    if (opts.endDate < opts.today) return "completed";
    if (opts.startDate > opts.today) return "setting_done";
    return "running";
  }
  if (status === "submitted" || status === "reviewing" || status === "draft") return "submitted";
  return status;
}

export const campaignStageMeta: Record<string, LabelTone> = Object.fromEntries(
  CAMPAIGN_STAGES.map((s) => [s.key, { label: s.label, tone: s.tone }]),
);

/** 보장형도 같은 프로세스를 쓴다 — 마지막 단계 이름만 "보장완료" */
export const GUARANTEED_STAGES = [
  { key: "submitted", label: "신청접수", tone: "amber" as BadgeTone },
  { key: "setting_done", label: "셋팅완료", tone: "purple" as BadgeTone },
  { key: "running", label: "구동중", tone: "green" as BadgeTone },
  { key: "completed", label: "보장완료", tone: "blue" as BadgeTone },
];

export const guaranteedStageMeta: Record<string, LabelTone> = Object.fromEntries(
  GUARANTEED_STAGES.map((s) => [s.key, { label: s.label, tone: s.tone }]),
);

/**
 * 보장형 캠페인의 현재 단계.
 * 상태값만 다를 뿐 판정 규칙은 상위노출과 같다 — 셋팅(기간)이 있어야 구동으로 넘어간다.
 */
export function guaranteedStage(
  status: string,
  opts: { startDate: string | null; endDate: string | null; today: string },
) {
  if (status === "completed") return "completed";
  if (status === "canceled") return "canceled";
  if (status === "setting" || status === "running") {
    if (!opts.startDate || !opts.endDate) return "submitted";
    if (opts.endDate < opts.today) return "completed";
    if (opts.startDate > opts.today) return "setting_done";
    return "running";
  }
  // requested · reviewing
  return "submitted";
}

export const paymentStatusMeta: Record<string, LabelTone> = {
  paid: { label: "결제완료", tone: "green" },
  refunded: { label: "환불", tone: "red" },
  partial_refund: { label: "부분환불", tone: "amber" },
};

export const assignmentStatusMeta: Record<string, LabelTone> = {
  assigned: { label: "배정", tone: "gray" },
  in_progress: { label: "진행중", tone: "blue" },
  submitted: { label: "제출", tone: "purple" },
  approved: { label: "승인", tone: "green" },
  rejected: { label: "반려", tone: "red" },
};

export const settlementStatusMeta: Record<string, LabelTone> = {
  pending: { label: "정산대기", tone: "amber" },
  processing: { label: "처리중", tone: "blue" },
  completed: { label: "정산완료", tone: "green" },
};

export const productTypeLabel: Record<string, string> = {
  place_traffic: "플레이스 트래픽",
  store_traffic: "쇼핑 트래픽",
  store_action: "쇼핑 액션",
  blog_review: "블로그 리뷰",
  visit_review: "방문 리뷰",
  community_viral: "커뮤니티 바이럴",
  pr_media: "PR/언론",
  influencer: "인플루언서",
  rank_tracking: "순위 추적",
};

export const productUnitLabel: Record<string, string> = {
  per_visit_day: "일 방문당",
  per_item: "건당",
  subscription: "구독",
};

// ── 기획서 기반 신규 상태 매핑 ──

export const pointChargeStatusMeta: Record<string, LabelTone> = {
  requested: { label: "입금대기", tone: "amber" },
  approved: { label: "충전완료", tone: "green" },
  rejected: { label: "반려", tone: "red" },
  canceled: { label: "취소", tone: "gray" },
};

export const chargeMethodLabel: Record<string, string> = {
  bank_transfer: "무통장입금",
  card: "카드결제",
  virtual_account: "가상계좌",
};

export const receiptTypeLabel: Record<string, string> = {
  tax_invoice: "세금계산서",
  cash_receipt: "현금영수증",
  none: "미발행",
};

export const couponDiscountTypeLabel: Record<string, string> = {
  amount: "정액 할인",
  percent: "정률 할인",
};

export const noticeCategoryMeta: Record<string, LabelTone> = {
  service: { label: "서비스", tone: "blue" },
  update: { label: "업데이트", tone: "purple" },
  event: { label: "이벤트", tone: "green" },
  maintenance: { label: "점검", tone: "amber" },
};

export const boardTypeMeta: Record<string, LabelTone> = {
  free: { label: "자유게시판", tone: "gray" },
  review: { label: "이용후기", tone: "green" },
  commerce: { label: "커머스", tone: "blue" },
  qna: { label: "질문답변", tone: "amber" },
  tip: { label: "노하우", tone: "purple" },
};

export const rankPlatformMeta: Record<string, LabelTone> = {
  place: { label: "네이버 플레이스", tone: "green" },
  shopping: { label: "네이버 쇼핑", tone: "blue" },
  coupang: { label: "쿠팡", tone: "red" },
};

export const guaranteedStatusMeta: Record<string, LabelTone> = {
  requested: { label: "신청접수", tone: "amber" },
  reviewing: { label: "검토중", tone: "blue" },
  setting: { label: "셋팅중", tone: "purple" },
  running: { label: "진행중", tone: "green" },
  completed: { label: "완료", tone: "gray" },
  canceled: { label: "취소", tone: "red" },
};

/**
 * 관리 화면 정렬 기준 — 손이 필요한 단계가 위로 온다.
 * 신청접수(셋팅 대기) → 셋팅완료(구동 대기) → 구동중 → 완료 → 취소
 */
const STAGE_ORDER: Record<string, number> = {
  submitted: 0,
  setting_done: 1,
  running: 2,
  completed: 3,
  canceled: 4,
};

/** 단계 우선순위로 정렬하고, 같은 단계 안에서는 최근 신청이 위로 */
export function byStagePriority<T extends { stage: string; createdAt: string }>(a: T, b: T) {
  const diff = (STAGE_ORDER[a.stage] ?? 9) - (STAGE_ORDER[b.stage] ?? 9);
  return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
}

/** 리뷰 캠페인도 같은 프로세스 — 마지막 단계 이름만 "리뷰완료" */
export const REVIEW_STAGES = [
  { key: "submitted", label: "신청접수", tone: "amber" as BadgeTone },
  { key: "setting_done", label: "셋팅완료", tone: "purple" as BadgeTone },
  { key: "running", label: "진행중", tone: "green" as BadgeTone },
  { key: "completed", label: "리뷰완료", tone: "blue" as BadgeTone },
];

export const reviewStageMeta: Record<string, LabelTone> = Object.fromEntries(
  REVIEW_STAGES.map((s) => [s.key, { label: s.label, tone: s.tone }]),
);

/**
 * 리뷰 캠페인의 현재 단계.
 * 상위노출·보장형과 같은 규칙 — 셋팅(기간)이 있어야 진행중으로 넘어간다.
 */
export function reviewStage(
  status: string,
  opts: { startDate: string | null; endDate: string | null; today: string },
) {
  if (status === "completed") return "completed";
  if (status === "canceled") return "canceled";
  if (status === "setting" || status === "recruiting" || status === "running") {
    if (!opts.startDate || !opts.endDate) return "submitted";
    if (opts.endDate < opts.today) return "completed";
    if (opts.startDate > opts.today) return "setting_done";
    return "running";
  }
  // requested · paid
  return "submitted";
}

export const extensionStatusMeta: Record<string, LabelTone> = {
  requested: { label: "연장대기", tone: "amber" },
  approved: { label: "승인", tone: "green" },
  rejected: { label: "반려", tone: "red" },
};

export const extensionTargetLabel: Record<string, string> = {
  campaign: "리워드 캠페인",
  guaranteed: "보장형 캠페인",
  review: "리뷰 캠페인",
};

export const reviewPlatformMeta: Record<string, LabelTone> = {
  place: { label: "네이버 플레이스", tone: "green" },
  naver_shopping: { label: "네이버 쇼핑", tone: "blue" },
  coupang: { label: "쿠팡", tone: "red" },
};

export const reviewTypeLabel: Record<string, string> = {
  blog_distribute: "블로그 배포",
  receipt: "영수증 리뷰",
  visitor: "방문자 리뷰",
  reservation: "예약자 리뷰",
  blog_experience: "블로그 체험단",
  blog_reporter: "블로그 기자단",
  product_provided: "제품 제공",
  product_not_provided: "제품 미제공",
};

// 플랫폼별로 선택 가능한 리뷰 유형 (기획서 구분)
export const REVIEW_TYPES_BY_PLATFORM: Record<string, string[]> = {
  place: ["blog_distribute", "receipt", "visitor", "reservation", "blog_experience", "blog_reporter"],
  naver_shopping: ["product_provided", "product_not_provided", "blog_experience", "blog_reporter"],
  coupang: ["product_provided", "product_not_provided"],
};

export const reviewCampaignStatusMeta: Record<string, LabelTone> = {
  requested: { label: "신청접수", tone: "amber" },
  paid: { label: "결제완료", tone: "blue" },
  setting: { label: "셋팅중", tone: "purple" },
  recruiting: { label: "모집중", tone: "blue" },
  running: { label: "진행중", tone: "green" },
  completed: { label: "완료", tone: "gray" },
  canceled: { label: "취소", tone: "red" },
};

export const reviewTaskStatusMeta: Record<string, LabelTone> = {
  waiting: { label: "대기", tone: "gray" },
  assigned: { label: "배정", tone: "blue" },
  writing: { label: "작성중", tone: "amber" },
  submitted: { label: "제출", tone: "purple" },
  approved: { label: "승인", tone: "green" },
  rejected: { label: "반려", tone: "red" },
};

export const serviceRequestStatusMeta: Record<string, LabelTone> = {
  requested: { label: "신청접수", tone: "amber" },
  reviewing: { label: "상담중", tone: "blue" },
  quoted: { label: "견적발송", tone: "purple" },
  in_progress: { label: "진행중", tone: "green" },
  completed: { label: "완료", tone: "gray" },
  canceled: { label: "취소", tone: "red" },
};

export const serviceCategoryMeta: Record<string, LabelTone> = {
  performance: { label: "퍼포먼스 마케팅", tone: "blue" },
  viral: { label: "바이럴 커뮤니티", tone: "green" },
  content: { label: "콘텐츠", tone: "purple" },
};

// 카테고리별 세부 서비스 (플랫폼 페이지와 1:1 대응)
export const SERVICE_KEYS: Record<string, { key: string; name: string }[]> = {
  performance: [
    { key: "meta_ads", name: "메타 광고" },
    { key: "naver_cpc", name: "네이버 CPC" },
    { key: "naver_cpc_refund", name: "네이버 CPC 환급형" },
  ],
  viral: [
    { key: "cafe", name: "카페 바이럴" },
    { key: "board", name: "커뮤니티 게시판" },
  ],
  content: [
    { key: "video", name: "영상 제작" },
    { key: "image", name: "이미지 제작" },
    { key: "detail", name: "상세페이지" },
    { key: "homepage", name: "홈페이지" },
    { key: "branding", name: "브랜딩" },
  ],
};

// 금액 설정(pricing_rules) 카테고리 라벨
export const pricingCategoryLabel: Record<string, string> = {
  rank: "통합순위관리",
  reward: "리워드마케팅",
  guaranteed: "보장형 캠페인",
  place_review: "플레이스 리뷰",
  shopping_review: "쇼핑 리뷰",
  performance: "퍼포먼스 마케팅",
  viral: "바이럴 커뮤니티",
  content: "콘텐츠",
};

/** 순위 변동 표시용 (이전 순위 대비 상승/하락) */
export function rankDelta(current: number | null, previous: number | null) {
  if (current == null || previous == null) return null;
  const diff = previous - current; // 순위는 낮을수록 좋음
  if (diff === 0) return { label: "-", tone: "gray" as BadgeTone };
  return diff > 0
    ? { label: `▲ ${diff}`, tone: "green" as BadgeTone }
    : { label: `▼ ${Math.abs(diff)}`, tone: "red" as BadgeTone };
}

/** 게시판 채널 (사용자 화면 탭과 1:1) */
export const boardChannelLabel: Record<string, string> = {
  shopping: "네이버 쇼핑",
  place: "네이버 플레이스",
  coupang: "쿠팡",
};

// ── 상품등록 카테고리 ──
// 대분류(리워드마케팅 / 리뷰·체험단) 아래에 6개 카테고리를 둔다.
export type ProductCategory =
  | "reward_place"
  | "reward_shopping"
  | "reward_coupang"
  | "place_blog_distribute"
  | "place_receipt"
  | "shopping_product_provided"
  | "shopping_product_not_provided";

export const PRODUCT_CATEGORIES: {
  key: ProductCategory;
  group: "리워드마케팅" | "리뷰/체험단";
  label: string;      // 탭에 쓰는 짧은 이름
  fullLabel: string;  // 폼·배지에 쓰는 전체 이름
  tone: BadgeTone;
  productType: string; // 카테고리 선택 시 자동으로 채워지는 상품 유형
  channel: string;     // 카테고리 선택 시 자동으로 채워지는 채널
}[] = [
  { key: "reward_place", group: "리워드마케팅", label: "네이버 플레이스", fullLabel: "리워드마케팅 · 네이버 플레이스", tone: "green", productType: "place_traffic", channel: "place" },
  { key: "reward_shopping", group: "리워드마케팅", label: "네이버 쇼핑", fullLabel: "리워드마케팅 · 네이버 쇼핑", tone: "blue", productType: "store_traffic", channel: "shopping" },
  { key: "reward_coupang", group: "리워드마케팅", label: "쿠팡", fullLabel: "리워드마케팅 · 쿠팡", tone: "red", productType: "store_traffic", channel: "coupang" },
  { key: "place_blog_distribute", group: "리뷰/체험단", label: "플레이스 블로그배포", fullLabel: "네이버 플레이스 · 블로그배포", tone: "purple", productType: "blog_review", channel: "place" },
  { key: "place_receipt", group: "리뷰/체험단", label: "플레이스 영수증리뷰", fullLabel: "네이버 플레이스 · 영수증리뷰", tone: "amber", productType: "visit_review", channel: "place" },
  { key: "shopping_product_provided", group: "리뷰/체험단", label: "쇼핑 제품제공", fullLabel: "네이버 쇼핑 · 제품제공", tone: "blue", productType: "blog_review", channel: "shopping" },
  { key: "shopping_product_not_provided", group: "리뷰/체험단", label: "쇼핑 제품미제공", fullLabel: "네이버 쇼핑 · 제품미제공", tone: "red", productType: "blog_review", channel: "shopping" },
];

export const productCategoryMeta: Record<
  string,
  { label: string; fullLabel: string; group: string; tone: BadgeTone; productType: string; channel: string }
> = Object.fromEntries(PRODUCT_CATEGORIES.map((c) => [c.key, c]));

/** 카테고리에 대응하는 상품 유형·채널 기본값 (미분류/알 수 없는 키는 null) */
export function productCategoryDefaults(category: string | null | undefined) {
  if (!category) return null;
  const meta = productCategoryMeta[category];
  return meta ? { productType: meta.productType, channel: meta.channel } : null;
}

/**
 * 상품등록은 대분류별로 신청 방식이 달라 어드민 화면이 나뉘어 있다.
 * (리워드 = 일 방문당 트래픽 / 리뷰·체험단 = 건당 원고)
 */
export const REWARD_CATEGORY_KEYS = PRODUCT_CATEGORIES.filter((c) => c.group === "리워드마케팅").map((c) => c.key);
export const REVIEW_CATEGORY_KEYS = PRODUCT_CATEGORIES.filter((c) => c.group === "리뷰/체험단").map((c) => c.key);

// ── 리뷰/체험단 상품 (건당 원고 단위로 판매) ──

/** 리뷰 상품이 붙는 플랫폼 — products.channel 값과 동일하게 쓴다 */
export const REVIEW_PRODUCT_CHANNELS: { key: string; label: string }[] = [
  { key: "place", label: "네이버 플레이스" },
  { key: "shopping", label: "네이버 쇼핑" },
  { key: "coupang", label: "쿠팡" },
];

/**
 * 플랫폼별 선택 가능한 리뷰 유형 — 고객 신청 화면에 실제로 열려 있는 조합만 담는다.
 *  · 네이버 플레이스 리뷰: 블로그배포 / 영수증리뷰
 *  · 쇼핑 리뷰: 네이버 쇼핑·쿠팡 각각 제품제공 / 제품미제공
 * (visitor·reservation·blog_experience·blog_reporter 는 신청 화면에서 내려간 유형이라 제외)
 */
export const REVIEW_TYPES_BY_CHANNEL: Record<string, string[]> = {
  place: ["blog_distribute", "receipt"],
  shopping: ["product_provided", "product_not_provided"],
  coupang: ["product_provided", "product_not_provided"],
};

/** 원고를 쓰는 유형은 blog_review, 방문/영수증 인증 유형은 visit_review */
const REVIEW_TYPE_PRODUCT_TYPE: Record<string, string> = {
  blog_distribute: "blog_review",
  product_provided: "blog_review",
  product_not_provided: "blog_review",
  receipt: "visit_review",
};

/**
 * 채널 + 리뷰 유형 → 상품등록 카테고리.
 * 쿠팡 리뷰는 대응하는 카테고리 값이 없어 미분류로 남는다 (목록은 채널·유형으로 묶으므로 문제 없음).
 */
const REVIEW_CATEGORY_MAP: Record<string, ProductCategory> = {
  "place:blog_distribute": "place_blog_distribute",
  "place:receipt": "place_receipt",
  "shopping:product_provided": "shopping_product_provided",
  "shopping:product_not_provided": "shopping_product_not_provided",
};

/** 리뷰 상품의 채널·유형이 정해지면 카테고리와 상품 유형은 따라온다 */
export function reviewProductDefaults(channel: string, reviewType: string) {
  return {
    category: REVIEW_CATEGORY_MAP[`${channel}:${reviewType}`] ?? "",
    productType: REVIEW_TYPE_PRODUCT_TYPE[reviewType] ?? "blog_review",
  };
}

/**
 * 리뷰 상품등록 화면의 고정 줄 — 채널 × 리뷰 유형 조합이 곧 상품이다.
 * 리뷰는 유형이 원고 조건을 이미 정하므로 관리자가 정할 값은 건별 가격뿐이다.
 */
export const REVIEW_PRICE_ROWS: { channel: string; reviewType: string }[] =
  REVIEW_PRODUCT_CHANNELS.flatMap((c) =>
    (REVIEW_TYPES_BY_CHANNEL[c.key] ?? []).map((reviewType) => ({ channel: c.key, reviewType })),
  );

/** 가격 줄의 기본 상품명 ("네이버 플레이스 블로그 배포") */
export function reviewPriceRowLabel(channel: string, reviewType: string) {
  const channelLabel = REVIEW_PRODUCT_CHANNELS.find((c) => c.key === channel)?.label ?? channel;
  return `${channelLabel} ${reviewTypeLabel[reviewType] ?? reviewType}`;
}

// ── 리워드 상품 카드 (사용자 상품 선택 화면) ──

/** 카드 묶음 — 사용자 화면에서 이 순서대로 섹션이 나뉜다 (플레이스·쇼핑 기본값) */
export const PRODUCT_TIERS = ["공통", "맞집", "일반"] as const;
export type ProductTier = (typeof PRODUCT_TIERS)[number];

/**
 * 묶음 이름은 채널마다 다르다 — 쿠팡 신청 화면은 "쿠팡 전용 / 로켓배송"으로 섹션을 나눈다.
 * `products.tier` 는 자유 문자열이라, 여기 목록이 어드민 선택지와 고객 화면 섹션을 함께 결정한다.
 */
const TIERS_BY_CATEGORY: Record<string, readonly string[]> = {
  reward_coupang: ["공통", "쿠팡 전용", "로켓배송"],
};

/** 카테고리에 맞는 카드 묶음 목록 (모르는 카테고리는 기본값) */
export function tiersFor(category: string | null | undefined): readonly string[] {
  return (category && TIERS_BY_CATEGORY[category]) || PRODUCT_TIERS;
}

/** 묶음 머리말 색 — 고객 신청 화면 섹션 헤더에 쓰인다 */
export const TIER_COLOR: Record<string, string> = {
  공통: "#2452EB",
  맞집: "#F97316",
  일반: "#8B5CF6",
  "쿠팡 전용": "#AE0000",
  로켓배송: "#AE0000",
};

/** 효율(%) → 등급 라벨. 사용자 화면 막대 옆 문구와 동일 기준. */
export function efficiencyGrade(efficiency: number | null): { label: string; tone: BadgeTone } {
  if (efficiency == null) return { label: "-", tone: "gray" };
  if (efficiency >= 78) return { label: "높음", tone: "green" };
  if (efficiency >= 50) return { label: "보통", tone: "blue" };
  return { label: "낮음", tone: "amber" };
}

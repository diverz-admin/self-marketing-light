/**
 * 발주 대상 상품 구분 — 클라이언트에서도 쓰므로 DB 는 건드리지 않는다.
 * (로더는 lib/purchase-targets.ts 에 있고 서버에서만 불린다)
 *
 * 고객이 /marketing 에서 신청하면 상품 종류별로 다른 테이블에 쌓인다.
 *   · 상위노출(플레이스/쇼핑/쿠팡) → campaigns
 *   · 보장형                      → guaranteed_campaigns
 *   · 리뷰(플레이스/쇼핑)          → review_campaigns
 */
/**
 * 발주 화면의 탭.
 *
 * 리뷰는 한 테이블(review_campaigns)에 담기지만 유형마다 발주에 넘길 항목이 달라
 * 탭에서는 유형까지 갈라 본다. 발주 기록(purchase_orders.source_type)은 그대로
 * review_place / review_shopping 로 남으므로 DB 는 건드리지 않는다.
 */
export const PURCHASE_SOURCES = [
  { key: "reward_place", label: "플레이스 상위노출", sourceType: "reward_place" },
  { key: "guaranteed", label: "플레이스 보장 상위노출", sourceType: "guaranteed" },
  { key: "reward_shopping", label: "네이버 쇼핑 상위노출", sourceType: "reward_shopping" },
  { key: "reward_coupang", label: "쿠팡 상위노출", sourceType: "reward_coupang" },
  { key: "review_place_blog", label: "플레이스 리뷰 · 블로그배포", sourceType: "review_place", reviewType: "blog_distribute" },
  { key: "review_place_receipt", label: "플레이스 리뷰 · 영수증", sourceType: "review_place", reviewType: "receipt" },
  { key: "review_shopping", label: "네이버 쇼핑 리뷰", sourceType: "review_shopping", platform: "naver_shopping" },
  { key: "review_coupang", label: "쿠팡 리뷰", sourceType: "review_shopping", platform: "coupang" },
] as const;

/** 전체 탭의 "구분" 배지 — 발주 기록에 남는 source_type 기준 */
export const purchaseSourceLabel: Record<string, string> = {
  reward_place: "플레이스 상위노출",
  guaranteed: "플레이스 보장 상위노출",
  reward_shopping: "네이버 쇼핑 상위노출",
  reward_coupang: "쿠팡 상위노출",
  review_place: "네이버 플레이스 리뷰",
  review_shopping: "네이버 쇼핑 리뷰",
  etc: "기타",
};

/** 그 건이 이 탭에 속하는지 */
export function matchesTab(
  tab: (typeof PURCHASE_SOURCES)[number],
  line: { sourceType: string; reviewType: string | null; platform: string },
) {
  if (line.sourceType !== tab.sourceType) return false;
  const wantedType = "reviewType" in tab ? tab.reviewType : null;
  if (wantedType && line.reviewType !== wantedType) return false;
  // 쇼핑 리뷰는 네이버·쿠팡이 한 테이블에 섞여 있어 플랫폼까지 본다
  const wantedPlatform = "platform" in tab ? tab.platform : null;
  return wantedPlatform ? line.platform === wantedPlatform : true;
}

/** 전체 탭의 "구분" 배지 — 쇼핑 리뷰는 플랫폼까지 갈라 보여준다 */
export function sourceBadgeLabel(line: { sourceType: string; platform: string }) {
  if (line.sourceType === "review_shopping" && line.platform === "coupang") return "쿠팡 리뷰";
  return purchaseSourceLabel[line.sourceType] ?? line.sourceType;
}

/** 발주 화면이 한 줄로 다루는 신청 건 */
export type PurchaseTarget = {
  sourceType: string;
  sourceId: string;
  /** 회사명 → 가입자명 순 */
  advertiser: string;
  /** 상품명 (버즈빌 · 블로그 배포 등) */
  productName: string;
  /** 대상 (플레이스명 · 상품명) */
  targetName: string;
  targetUrl: string | null;
  keyword: string;
  quantity: number;
  /** 일 작업량 — 신청 화면마다 이름이 달라 로더에서 맞춰 담는다 */
  dailyQty: number | null;
  /** 고객이 낸 금액 (매출) */
  saleAmount: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
  /** 리뷰 유형 (blog_distribute · receipt · product_provided …) — 리뷰 건에만 있다 */
  reviewType: string | null;
  /** 신청이 붙은 플랫폼 (place · naver_shopping · coupang) */
  platform: string;
  /** 신청 폼이 저장한 원본 — 상품마다 엑셀에 넣을 항목이 달라 그대로 들고 다닌다 */
  setting: Record<string, unknown>;
  /** 폼의 자유 입력 (쇼핑 리뷰의 작성 가이드 등) */
  requestNote: string | null;
};

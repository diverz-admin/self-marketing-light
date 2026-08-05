/**
 * 관리자가 장바구니에 담아줄 수 있는 상품.
 *
 * 보장형·콘텐츠 제작처럼 "문의하기"로 들어오는 건들이라 고객이 신청 화면에서
 * 직접 담을 수 없다. 단가표도 없어 상담 결과에 따라 금액이 매번 달라지므로,
 * 목록만 고정해 두고 금액은 담을 때 관리자가 정한다.
 */
export type AdminCartProduct = {
  key: string;
  label: string;
  /** 어떤 상품인지 한 줄 설명 — 어드민 선택 화면과 고객 장바구니에 함께 쓴다 */
  desc: string;
  group: "리워드" | "콘텐츠";
  /** 등급이 나뉘는 상품 (신청 페이지의 Standard·Deluxe·Premium과 같은 구분) */
  tiered?: boolean;
};

/**
 * 콘텐츠 상품 등급 — 이미지 제작을 뺀 콘텐츠 전 상품이 이 세 등급으로 나뉜다.
 * (신청 페이지의 Standard · Deluxe · Premium)
 */
export const ADMIN_CART_TIERS = ["스탠다드", "디럭스", "프리미엄"] as const;

export type AdminCartTier = (typeof ADMIN_CART_TIERS)[number];

export const ADMIN_CART_PRODUCTS: AdminCartProduct[] = [
  {
    key: "place_guaranteed",
    label: "네이버 플레이스 보장형",
    desc: "보장 순위 유지 기간만큼 과금하는 플레이스 상위노출",
    group: "리워드",
  },
  {
    key: "image_hq",
    label: "고퀄리티 이미지 제작",
    desc: "상품·매장 촬영 및 편집 이미지 제작",
    group: "콘텐츠",
  },
  {
    key: "total_branding",
    label: "Total 브랜딩",
    desc: "브랜드 아이덴티티 전반 (로고 · 컬러 · 가이드)",
    group: "콘텐츠",
    tiered: true,
  },
  {
    key: "homepage",
    label: "홈페이지",
    desc: "기업·브랜드 홈페이지 기획 및 제작",
    group: "콘텐츠",
    tiered: true,
  },
  {
    key: "detail_page",
    label: "상세페이지",
    desc: "쇼핑몰 상품 상세페이지 기획 및 디자인",
    group: "콘텐츠",
    tiered: true,
  },
  {
    key: "video",
    label: "영상 제작",
    desc: "홍보 영상 · 숏폼 콘텐츠 제작",
    group: "콘텐츠",
    tiered: true,
  },
];

export const adminCartProductLabel: Record<string, string> = Object.fromEntries(
  ADMIN_CART_PRODUCTS.map((p) => [p.key, p.label]),
);

export function adminCartProduct(key: string) {
  return ADMIN_CART_PRODUCTS.find((p) => p.key === key) ?? null;
}

export const ADMIN_CART_STATUS_META: Record<string, { label: string; tone: "amber" | "green" | "gray" }> = {
  pending: { label: "담아둠", tone: "amber" },
  ordered: { label: "결제완료", tone: "green" },
  canceled: { label: "회수", tone: "gray" },
};

import { db } from "@/db";
import { campaigns, products, users } from "@/db/schema";
import { desc, eq, ne } from "drizzle-orm";

/** 대시보드 "실시간 주문 현황" 한 줄 */
export type RecentOrder = {
  id: string;
  /** 개인정보라 가운데를 가린 이름 — 테스트광고주 → 테****주 */
  maskedName: string;
  /** 서비스 이름 (예: 네이버 플레이스 리워드) */
  service: string;
  /** 아바타 타일에 쓸 한 글자 */
  tile: string;
  /** N건 결제 */
  qty: number;
  /** 1일 전 / 3시간 전 */
  ago: string;
};

/** 상품 유형 → 화면에 보여줄 서비스 이름. 목업 문구를 그대로 쓴다. */
const SERVICE_LABEL: Record<string, string> = {
  place_traffic: "네이버 플레이스 리워드",
  store_traffic: "네이버 쇼핑 리워드",
  store_action: "네이버 쇼핑 리워드",
  blog_review: "블로그 리뷰",
  visit_review: "플레이스 리뷰",
  community_viral: "네이버 카페 침투",
  pr_media: "언론 홍보",
  influencer: "인플루언서",
  rank_tracking: "통합순위관리",
};

/** 첫 글자와 마지막 글자만 남긴다. 두 글자 이하면 뒤만 가린다. */
function mask(name: string): string {
  const n = name.trim();
  if (n.length <= 1) return n;
  if (n.length === 2) return `${n[0]}*`;
  return `${n[0]}****${n[n.length - 1]}`;
}

function timeAgo(at: Date): string {
  const m = Math.floor((Date.now() - at.getTime()) / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

/**
 * 최근 접수된 캠페인을 주문 피드로 보여준다.
 *
 * 목업의 "실시간 주문 현황"과 같은 블록이다. 주문 원장(orders)이 아니라 campaigns 를 보는
 * 이유는, 이 피드가 보여주는 것이 "누가 무슨 서비스를 몇 건 신청했는가"이기 때문이다
 * (금액이 아니라 건수를 쓴다). 초안(draft)은 아직 접수가 아니므로 제외한다.
 *
 * ⚠️ 다른 회원의 활동이 섞이는 화면이라 이름은 반드시 가려서 내보낸다.
 */
export async function loadRecentOrders(limit = 5): Promise<RecentOrder[]> {
  const rows = await db
    .select({
      id: campaigns.id,
      name: users.name,
      productType: products.productType,
      title: products.title,
      qty: campaigns.totalQty,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .innerJoin(users, eq(campaigns.userId, users.id))
    .innerJoin(products, eq(campaigns.productId, products.id))
    .where(ne(campaigns.status, "draft"))
    .orderBy(desc(campaigns.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    maskedName: mask(r.name),
    service: SERVICE_LABEL[r.productType] ?? r.title,
    tile: r.name.trim().charAt(0) || "?",
    qty: r.qty,
    ago: timeAgo(r.createdAt),
  }));
}

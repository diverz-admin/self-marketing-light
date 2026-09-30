import { db } from "@/db";
import { campaigns, products } from "@/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { campaignStage, todayKST } from "@/lib/admin-format";

/** 대시보드 "현재 운영중인 캠페인" 한 줄 */
export type DashboardCampaign = {
  id: string;
  /** 신청 대상 — 플레이스명 / 상품명 */
  targetName: string;
  /** 어드민에 등록된 상품명 (무엇을 샀는가) */
  productTitle: string;
  /** 신청 키워드 */
  keyword: string;
  /** 채널 — 네이버 플레이스 / 네이버 쇼핑 / 쿠팡 … */
  channel: string;
  /** 진행중 / 완료 / 대기 */
  statusLabel: string;
  statusKind: "running" | "done" | "pending";
  startDate: string;
  endDate: string;
  qty: number;
};

/**
 * 채널 이름. 카테고리가 있으면 그것으로, 없는 레거시 상품은 상품 유형으로 가른다.
 * (`my-reward-campaigns.ts` 의 SCOPE 와 같은 판단 기준을 이름 붙이는 쪽으로 뒤집은 것)
 */
function channelOf(category: string | null, productType: string): string {
  const byCategory: Record<string, string> = {
    reward_place: "네이버 플레이스",
    reward_shopping: "네이버 쇼핑",
    reward_coupang: "쿠팡",
    place_blog_distribute: "네이버 플레이스",
    place_receipt: "네이버 플레이스",
    shopping_product_provided: "네이버 쇼핑",
    shopping_product_not_provided: "네이버 쇼핑",
  };
  if (category && byCategory[category]) return byCategory[category];

  const byType: Record<string, string> = {
    place_traffic: "네이버 플레이스",
    store_traffic: "네이버 쇼핑",
    store_action: "네이버 쇼핑",
    blog_review: "블로그",
    visit_review: "네이버 플레이스",
    community_viral: "네이버 카페",
    pr_media: "언론",
    influencer: "인플루언서",
    rank_tracking: "통합순위관리",
  };
  return byType[productType] ?? "기타";
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

/** KPI 칸이 쓰는 집계 — 목록은 3건만 보여주지만 개수는 전체를 세야 한다 */
export type CampaignCounts = { running: number; done: number; total: number };

/**
 * KPI 카드의 추세선이 쓰는 최근 14일 계열.
 * 값 하나만 있는 카드는 "이게 많은 건지 적은 건지"를 알 수 없다 — 같은 지표의
 * 지난 2주를 옆에 두면 숫자가 맥락을 갖는다.
 */
export type CampaignTrend = { running: number[]; done: number[]; total: number[] };

/** 최근 n일의 KST 날짜 키 (YYYY-MM-DD, 과거 → 오늘 순) */
function recentDays(n = 14): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" });
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(fmt.format(d));
  }
  return out;
}

/**
 * 로그인한 회원 본인의 캠페인. 초안(draft)은 아직 신청이 아니므로 뺀다.
 *
 * 목록(`items`)은 **진행중만** 담는다 — 카드 제목이 "진행 중인 캠페인 현황"이라
 * 완료 건이 섞이면 안 된다. 개수(`counts`)는 KPI 가 쓰므로 전체를 센다.
 */
export async function loadDashboardCampaigns(
  userId: string,
  limit = 3,
): Promise<{ items: DashboardCampaign[]; counts: CampaignCounts; trend: CampaignTrend }> {
  const rows = await db
    .select({
      id: campaigns.id,
      status: campaigns.status,
      inputs: campaigns.inputs,
      totalQty: campaigns.totalQty,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
      productTitle: products.title,
      productType: products.productType,
      category: products.category,
    })
    .from(campaigns)
    .innerJoin(products, eq(campaigns.productId, products.id))
    .where(and(eq(campaigns.userId, userId), ne(campaigns.status, "draft")))
    .orderBy(desc(campaigns.createdAt));

  const today = todayKST();

  const all: DashboardCampaign[] = rows.map((c) => {
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    // 어드민 4단계 → 화면 3단계. 캠페인 관리 화면과 같은 함수를 써서 표기를 맞춘다.
    const stage = campaignStage(c.status, { startDate: c.startDate, endDate: c.endDate, today });
    const statusKind: DashboardCampaign["statusKind"] =
      stage === "completed" ? "done" : stage === "running" ? "running" : "pending";

    return {
      id: c.id,
      targetName: str(inputs.storeName) || str(inputs.productName) || c.productTitle,
      productTitle: c.productTitle,
      keyword: str(inputs.keyword) || "-",
      channel: channelOf(c.category, c.productType),
      statusLabel: statusKind === "done" ? "완료" : statusKind === "running" ? "진행중" : "대기",
      statusKind,
      startDate: c.startDate ?? "",
      endDate: c.endDate ?? "",
      qty: c.totalQty,
    };
  });

  /*
   * 추세 — 날짜별로 그날의 상태를 다시 센다.
   *   running  그날 기준 기간 안에 들어 있던 건
   *   done     그날까지 종료된 건 (누계)
   *   total    그날까지 접수된 건 (누계)
   * 이미 읽어 온 rows 로 계산하므로 추가 쿼리가 없다.
   */
  const days = recentDays();
  const createdKeys = rows.map((c) => c.createdAt.toISOString().slice(0, 10));
  const trend: CampaignTrend = {
    running: days.map(
      (d) => rows.filter((c) => c.startDate && c.endDate && c.startDate <= d && d <= c.endDate).length,
    ),
    done: days.map((d) => rows.filter((c) => c.endDate && c.endDate < d).length),
    total: days.map((d, i) => createdKeys.filter((k) => k <= d).length || (i === days.length - 1 ? all.length : 0)),
  };

  return {
    items: all.filter((c) => c.statusKind === "running").slice(0, limit),
    counts: {
      running: all.filter((c) => c.statusKind === "running").length,
      done: all.filter((c) => c.statusKind === "done").length,
      total: all.length,
    },
    trend,
  };
}

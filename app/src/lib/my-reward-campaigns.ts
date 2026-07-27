import { db } from "@/db";
import { campaigns, products, rankKeywords, rankSnapshots } from "@/db/schema";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { campaignStage, todayKST } from "@/lib/admin-format";

/** 고객 캠페인 관리 화면 한 행 — 플레이스·쇼핑이 같은 모양을 쓴다 */
export type MyRewardCampaign = {
  id: string;
  targetName: string;   // 플레이스명 / 상품명
  targetUrl: string;    // 플레이스 링크 / 상품 링크
  keyword: string;
  productTitle: string; // 어드민에 등록된 상품명
  unitPrice: number;
  dailyQty: number;
  durationDays: number;
  status: "running" | "pending" | "done";
  startDate: string;
  endDate: string;
  orderAmount: number;
  rank: number | null;
  rankDiff: number;
};

export type RankPoint = { date: string; rank: number };

/**
 * 이 화면이 다루는 범위 — 어드민 `loadCampaignData` 의 IN_SCOPE 와 같은 기준.
 * 한쪽만 바뀌면 고객 화면과 어드민 목록이 어긋난다.
 */
const SCOPE = {
  place: and(
    isNull(products.reviewType),
    or(
      eq(products.category, "reward_place"),
      // 카테고리 없이 등록된 레거시 상품은 상품 유형으로 가른다
      and(isNull(products.category), eq(products.productType, "place_traffic")),
    ),
  ),
  shopping: and(
    isNull(products.reviewType),
    or(
      eq(products.category, "reward_shopping"),
      and(isNull(products.category), inArray(products.productType, ["store_traffic", "store_action"])),
    ),
  ),
  // 쿠팡은 레거시 미분류 상품을 끌어오지 않는다 (쇼핑과 상품 유형이 같아 구분이 안 된다)
  coupang: and(isNull(products.reviewType), eq(products.category, "reward_coupang")),
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 셋팅 전이라 기간이 비어 있으면 신청일·수량으로 임시 기간을 만들어 보여준다.
 * (어드민과 같은 방식이라 두 화면의 기간 표기가 일치한다)
 */
function period(startDate: string | null, endDate: string | null, createdAt: Date, dailyQty: number | null, totalQty: number) {
  if (startDate && endDate) return { startDate, endDate };
  const start = startDate ?? toYMD(createdAt);
  const days = dailyQty && dailyQty > 0 ? Math.max(1, Math.ceil(totalQty / dailyQty)) : 7;
  return { startDate: start, endDate: endDate ?? toYMD(new Date(new Date(start).getTime() + (days - 1) * DAY_MS)) };
}

/** 시작일~종료일 일수 (양끝 포함) */
function daysBetween(start: string, end: string) {
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / DAY_MS;
  return Math.max(1, Math.round(diff) + 1);
}

/** 어드민 4단계(신청접수·셋팅완료·구동중·완료) → 고객 화면 3단계 */
function customerStatus(stage: string): MyRewardCampaign["status"] {
  if (stage === "completed") return "done";
  if (stage === "running") return "running";
  return "pending";
}

/** 로그인한 회원 본인의 리워드 캠페인 + 키워드 순위 이력 */
export async function loadMyRewardCampaigns(userId: string, platform: "place" | "shopping" | "coupang") {
  const rows = await db
    .select({
      id: campaigns.id,
      status: campaigns.status,
      inputs: campaigns.inputs,
      dailyQty: campaigns.dailyQty,
      totalQty: campaigns.totalQty,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      quotedAmount: campaigns.quotedAmount,
      createdAt: campaigns.createdAt,
      productTitle: products.title,
      productUnitPrice: products.unitPrice,
    })
    .from(campaigns)
    .innerJoin(products, eq(campaigns.productId, products.id))
    .where(and(eq(campaigns.userId, userId), SCOPE[platform]))
    .orderBy(desc(campaigns.createdAt));

  // 현재 순위·추이는 순위추적(rank_keywords)에서 회원+플랫폼+키워드로 맞춘다 — 어드민과 동일한 매칭 키
  const keywordRows = await db
    .select({
      id: rankKeywords.id,
      keyword: rankKeywords.keyword,
      currentRank: rankKeywords.currentRank,
      previousRank: rankKeywords.previousRank,
    })
    .from(rankKeywords)
    .where(and(eq(rankKeywords.userId, userId), eq(rankKeywords.platform, platform)));

  const keywordMap = new Map(keywordRows.map((k) => [k.keyword, k]));

  const snapshotRows = keywordRows.length
    ? await db
        .select({
          keywordId: rankSnapshots.keywordId,
          snapshotDate: rankSnapshots.snapshotDate,
          rank: rankSnapshots.rank,
        })
        .from(rankSnapshots)
        .where(inArray(rankSnapshots.keywordId, keywordRows.map((k) => k.id)))
        .orderBy(rankSnapshots.snapshotDate)
    : [];

  const historyMap = new Map<string, RankPoint[]>();
  for (const s of snapshotRows) {
    if (s.rank == null) continue;
    const list = historyMap.get(s.keywordId) ?? [];
    // 차트 라벨은 MM/DD — 서버·클라이언트가 같은 문자열을 쓰도록 날짜 문자열을 그대로 자른다
    list.push({ date: s.snapshotDate.slice(5).replace("-", "/"), rank: s.rank });
    historyMap.set(s.keywordId, list);
  }

  const today = todayKST();
  const rankHistory: Record<string, RankPoint[]> = {};
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

  const items: MyRewardCampaign[] = rows.map((c) => {
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    const keyword = str(inputs.keyword);
    const kw = keyword ? keywordMap.get(keyword) : undefined;
    const { startDate, endDate } = period(c.startDate, c.endDate, c.createdAt, c.dailyQty, c.totalQty);

    const history = kw ? historyMap.get(kw.id) : undefined;
    if (history && history.length > 1) rankHistory[c.id] = history;

    return {
      id: c.id,
      // 플레이스는 storeName/placeUrl, 쇼핑은 productName/productUrl 로 신청된다
      targetName: str(inputs.storeName) || str(inputs.productName) || "-",
      targetUrl: str(inputs.placeUrl) || str(inputs.productUrl),
      keyword,
      productTitle: c.productTitle,
      unitPrice: Number(c.productUnitPrice),
      dailyQty: c.dailyQty ?? c.totalQty,
      durationDays: daysBetween(startDate, endDate),
      status: customerStatus(campaignStage(c.status, { startDate: c.startDate, endDate: c.endDate, today })),
      startDate,
      endDate,
      orderAmount: Number(c.quotedAmount),
      rank: kw?.currentRank ?? null,
      // 음수 = 순위 상승 (숫자가 작아짐) — 화면의 화살표 방향이 이 부호를 따른다
      rankDiff: kw?.currentRank != null && kw.previousRank != null ? kw.currentRank - kw.previousRank : 0,
    };
  });

  return { items, rankHistory };
}

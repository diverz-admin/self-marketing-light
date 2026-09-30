import { db } from "@/db";
import {
  campaigns,
  guaranteedCampaigns,
  products,
  rankKeywords,
  rankSnapshots,
  reviewCampaigns,
  reviewTasks,
} from "@/db/schema";
import { and, asc, desc, eq, inArray, isNotNull, isNull, ne } from "drizzle-orm";
import { campaignStage, reviewTypeLabel, todayKST } from "@/lib/admin-format";

/**
 * 마이 캠페인 현황 — 리워드·보장형·리뷰 세 표를 한 목록으로 합친다.
 * (blueeggbiz.com /platform/campaigns 와 같은 범위·상태 구분)
 */

export type MyCampaignPlatform = "place" | "shopping" | "coupang";
export type MyCampaignKind = "리워드" | "보장형" | "리뷰";
/** 접수대기 · 진행중 · 완료 · 중단 */
export type MyCampaignStatus = "wait" | "live" | "done" | "stop";

/**
 * 하루치 순위. visit/blog 는 네이버 플레이스의 방문자·블로그 리뷰 수로, 플레이스에만 있다.
 * 순위 스냅샷에 아직 리뷰 수 칸이 없어 지금은 비어 있다(화면은 "—"로 표시).
 */
export type RankPoint = { date: string; rank: number; visit?: number | null; blog?: number | null };

type RewardDetail = {
  kind: "리워드";
  dailyQty: number | null;
  totalQty: number;
  initialRank: number | null;
  history: RankPoint[];
};
type GuaranteedDetail = {
  kind: "보장형";
  targetRank: number;
  guaranteedDays: number;
  achievedDays: number;
  missedDays: number;
  countStartDate: string | null;
  initialRank: number | null;
  history: RankPoint[];
};
type ReviewDetail = {
  kind: "리뷰";
  totalQty: number;
  completedQty: number;
  posts: { url: string; date: string }[];
};

export type MyCampaignRow = {
  id: string;
  kind: MyCampaignKind;
  /** 유형 칸 표기 — 리뷰는 세부 유형(블로그 배포 등)을 쓴다 */
  typeLabel: string;
  platform: MyCampaignPlatform;
  name: string;
  keyword: string;
  rank: number | null;
  /** 직전 측정 대비 상승 폭 (0 = 변화 없음·하락) */
  rankUp: number;
  startDate: string;
  endDate: string;
  /** 신청일 — 기간 필터의 기준 */
  requestDate: string;
  status: MyCampaignStatus;
  manageHref: string;
  /** 상세를 열 수 없을 때 안내 문구 (null = 열 수 있음) */
  lockedReason: string | null;
  detail: RewardDetail | GuaranteedDetail | ReviewDetail;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const YMD = (d: Date) => d.toISOString().slice(0, 10);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");

const NO_TRACKING = "현재 해당 캠페인은 순위 추적을 제공하지 않고 있습니다.";
const NOT_LINKED = "이 캠페인은 순위 추적에 연결되지 않았습니다. 담당자가 연결하면 그날부터 순위가 기록됩니다.";
const NOT_MEASURED = "아직 순위가 측정되지 않았습니다. 캠페인이 시작되면 매일 순위가 자동 기록됩니다.";
const OUT_OF_RANK = "가장 최근 측정에서 순위권 밖이었습니다. 측정은 매일 정상적으로 이뤄지고 있습니다.";

/** 리워드 상품의 채널 — `my-reward-campaigns.ts` 의 SCOPE 와 같은 판단 기준 */
function rewardPlatform(category: string | null, productType: string): MyCampaignPlatform | null {
  if (category === "reward_place") return "place";
  if (category === "reward_shopping") return "shopping";
  if (category === "reward_coupang") return "coupang";
  if (category) return null;
  if (productType === "place_traffic") return "place";
  if (productType === "store_traffic" || productType === "store_action") return "shopping";
  return null;
}

const REWARD_MANAGE: Record<MyCampaignPlatform, string> = {
  place: "/marketing/reward/place/manage",
  shopping: "/marketing/reward/shopping/manage",
  coupang: "/marketing/reward/coupang/manage",
};

const REVIEW_PLATFORM: Record<string, MyCampaignPlatform> = {
  place: "place",
  naver_shopping: "shopping",
  coupang: "coupang",
};

const REVIEW_MANAGE: Record<MyCampaignPlatform, string> = {
  place: "/marketing/review/place/manage",
  // 쇼핑·쿠팡 리뷰는 개발본에 관리 화면이 없다 — 상담 안내 화면으로 보낸다
  shopping: "/marketing/review/shopping",
  coupang: "/marketing/review/shopping",
};

/** 셋팅 전이라 기간이 비어 있으면 신청일·수량으로 임시 기간을 만든다 (캠페인 관리 화면과 같은 방식) */
function rewardPeriod(startDate: string | null, endDate: string | null, createdAt: Date, dailyQty: number | null, totalQty: number) {
  if (startDate && endDate) return { startDate, endDate };
  const start = startDate ?? YMD(createdAt);
  const days = dailyQty && dailyQty > 0 ? Math.max(1, Math.ceil(totalQty / dailyQty)) : 7;
  return { startDate: start, endDate: endDate ?? YMD(new Date(new Date(start).getTime() + (days - 1) * DAY_MS)) };
}

/** 순위 칸·상세 공통 — 추적 연결 여부에 따라 현재 순위와 안내 문구를 정한다 */
function rankInfo(
  kw: { currentRank: number | null; previousRank: number | null; lastCheckedAt: Date | null } | undefined,
  history: RankPoint[] | undefined,
) {
  const rank = kw?.currentRank ?? null;
  const prev = kw?.previousRank ?? null;
  return {
    rank,
    rankUp: rank != null && prev != null && prev > rank ? prev - rank : 0,
    initialRank: history?.[0]?.rank ?? null,
    lockedReason: rank != null ? null : !kw ? NOT_LINKED : kw.lastCheckedAt ? OUT_OF_RANK : NOT_MEASURED,
  };
}

export async function loadMyCampaigns(userId: string): Promise<MyCampaignRow[]> {
  const today = todayKST();

  const [rewardRows, guarRows, reviewRows, keywordRows] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        status: campaigns.status,
        inputs: campaigns.inputs,
        dailyQty: campaigns.dailyQty,
        totalQty: campaigns.totalQty,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        stoppedAt: campaigns.stoppedAt,
        createdAt: campaigns.createdAt,
        productTitle: products.title,
        productType: products.productType,
        category: products.category,
      })
      .from(campaigns)
      .innerJoin(products, eq(campaigns.productId, products.id))
      .where(and(eq(campaigns.userId, userId), ne(campaigns.status, "draft"), isNull(products.reviewType)))
      .orderBy(desc(campaigns.createdAt)),
    db.select().from(guaranteedCampaigns).where(eq(guaranteedCampaigns.userId, userId)).orderBy(desc(guaranteedCampaigns.createdAt)),
    db.select().from(reviewCampaigns).where(eq(reviewCampaigns.userId, userId)).orderBy(desc(reviewCampaigns.createdAt)),
    db
      .select({
        id: rankKeywords.id,
        platform: rankKeywords.platform,
        keyword: rankKeywords.keyword,
        currentRank: rankKeywords.currentRank,
        previousRank: rankKeywords.previousRank,
        lastCheckedAt: rankKeywords.lastCheckedAt,
      })
      .from(rankKeywords)
      .where(eq(rankKeywords.userId, userId)),
  ]);

  // 순위는 순위추적(rank_keywords)에서 회원+플랫폼+키워드로 맞춘다 — 캠페인 관리 화면과 같은 매칭 키
  const keywordMap = new Map(keywordRows.map((k) => [`${k.platform}|${k.keyword}`, k]));
  const snapshotRows = keywordRows.length
    ? await db
        .select({ keywordId: rankSnapshots.keywordId, snapshotDate: rankSnapshots.snapshotDate, rank: rankSnapshots.rank })
        .from(rankSnapshots)
        .where(inArray(rankSnapshots.keywordId, keywordRows.map((k) => k.id)))
        .orderBy(asc(rankSnapshots.snapshotDate))
    : [];
  const historyMap = new Map<string, RankPoint[]>();
  for (const s of snapshotRows) {
    if (s.rank == null) continue;
    const list = historyMap.get(s.keywordId) ?? [];
    list.push({ date: s.snapshotDate.slice(5).replace("-", "/"), rank: s.rank });
    historyMap.set(s.keywordId, list);
  }

  const out: MyCampaignRow[] = [];

  /* ── 리워드 ── */
  for (const c of rewardRows) {
    const platform = rewardPlatform(c.category, c.productType);
    if (!platform) continue;
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    const keyword = str(inputs.keyword);
    const kw = keyword ? keywordMap.get(`${platform}|${keyword}`) : undefined;
    const history = kw ? historyMap.get(kw.id) ?? [] : [];
    const { startDate, endDate } = rewardPeriod(c.startDate, c.endDate, c.createdAt, c.dailyQty, c.totalQty);
    const stage = campaignStage(c.status, { startDate: c.startDate, endDate: c.endDate, today });
    const stopped = !!c.stoppedAt || c.status === "canceled" || c.status === "refunded";
    const info = rankInfo(kw, history);

    out.push({
      id: c.id,
      kind: "리워드",
      typeLabel: "리워드",
      platform,
      name: str(inputs.storeName) || str(inputs.productName) || c.productTitle,
      keyword: keyword || "-",
      rank: platform === "coupang" ? null : info.rank,
      rankUp: platform === "coupang" ? 0 : info.rankUp,
      startDate,
      endDate,
      requestDate: YMD(c.createdAt),
      status: stopped ? "stop" : stage === "completed" ? "done" : stage === "running" ? "live" : "wait",
      manageHref: REWARD_MANAGE[platform],
      lockedReason: platform === "coupang" ? NO_TRACKING : info.lockedReason,
      detail: { kind: "리워드", dailyQty: c.dailyQty, totalQty: c.totalQty, initialRank: info.initialRank, history },
    });
  }

  /* ── 보장형 ── */
  for (const g of guarRows) {
    const platform = g.platform as MyCampaignPlatform;
    const kw = keywordMap.get(`${platform}|${g.keyword}`);
    const history = kw ? historyMap.get(kw.id) ?? [] : [];
    const info = rankInfo(kw, history);
    const rank = g.currentRank ?? info.rank;
    // 시작일부터 오늘까지 지난 날 중 보장 순위 밖이던 날 = 정지 일수
    const elapsed = g.startDate && g.startDate <= today
      ? Math.round((new Date(today).getTime() - new Date(g.startDate).getTime()) / DAY_MS) + 1
      : 0;
    const status: MyCampaignStatus =
      g.stoppedAt || g.status === "canceled" ? "stop"
      : g.status === "completed" ? "done"
      : g.status === "running" ? "live"
      : "wait";

    out.push({
      id: g.id,
      kind: "보장형",
      typeLabel: "보장형",
      platform,
      name: g.targetName || g.keyword,
      keyword: g.keyword,
      rank,
      rankUp: info.rankUp,
      startDate: g.startDate ?? YMD(g.createdAt),
      endDate: g.endDate ?? "",
      requestDate: YMD(g.createdAt),
      status,
      manageHref: "/marketing/reward/place/guaranteed/manage",
      lockedReason: null, // 보장 카운트는 순위 추적과 무관하게 늘 볼 수 있다
      detail: {
        kind: "보장형",
        targetRank: g.targetRank,
        guaranteedDays: g.guaranteedDays,
        achievedDays: g.achievedDays,
        missedDays: Math.max(0, Math.min(elapsed - g.achievedDays, g.guaranteedDays - g.achievedDays)),
        countStartDate: g.startDate,
        initialRank: info.initialRank,
        history,
      },
    });
  }

  /* ── 리뷰 ── */
  const postRows = reviewRows.length
    ? await db
        .select({
          reviewCampaignId: reviewTasks.reviewCampaignId,
          postUrl: reviewTasks.postUrl,
          completedAt: reviewTasks.completedAt,
          scheduledDate: reviewTasks.scheduledDate,
        })
        .from(reviewTasks)
        .where(and(inArray(reviewTasks.reviewCampaignId, reviewRows.map((r) => r.id)), isNotNull(reviewTasks.postUrl)))
        .orderBy(asc(reviewTasks.createdAt))
    : [];
  const postsByCampaign = new Map<string, { url: string; date: string }[]>();
  for (const p of postRows) {
    const list = postsByCampaign.get(p.reviewCampaignId) ?? [];
    list.push({ url: p.postUrl as string, date: p.completedAt ? YMD(p.completedAt) : p.scheduledDate ?? "" });
    postsByCampaign.set(p.reviewCampaignId, list);
  }

  for (const r of reviewRows) {
    const platform = REVIEW_PLATFORM[r.platform] ?? "place";
    const status: MyCampaignStatus =
      r.stoppedAt || r.status === "canceled" ? "stop"
      : r.status === "completed" ? "done"
      : r.status === "running" || r.status === "recruiting" ? "live"
      : "wait";

    out.push({
      id: r.id,
      kind: "리뷰",
      typeLabel: reviewTypeLabel[r.reviewType] ?? "리뷰",
      platform,
      name: r.storeName,
      keyword: r.keyword || "-",
      rank: null,
      rankUp: 0,
      startDate: r.startDate ?? YMD(r.createdAt),
      endDate: r.endDate ?? "",
      requestDate: YMD(r.createdAt),
      status,
      manageHref: REVIEW_MANAGE[platform],
      lockedReason: null,
      detail: {
        kind: "리뷰",
        totalQty: r.totalQty,
        completedQty: r.completedQty,
        posts: postsByCampaign.get(r.id) ?? [],
      },
    });
  }

  // 신청일 최신순
  return out.sort((a, b) => b.requestDate.localeCompare(a.requestDate));
}

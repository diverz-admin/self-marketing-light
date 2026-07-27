import { db } from "@/db";
import {
  campaigns, users, products, businesses, campaignEvents, campaignExtensions,
  rankKeywords, rankSnapshots, memberProfiles,
} from "@/db/schema";
import { eq, desc, sql, and, or, inArray, isNull, isNotNull, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { campaignStage, todayKST } from "@/lib/admin-format";
import { periodRange, type PeriodParams } from "@/lib/period-filter";
import type { ExtensionRow } from "@/components/admin/ExtensionsPanel";
import type { AdminCampaignRow } from "./CampaignsClient";

// 상위노출로 취급하는 상품 유형 (순위추적·바이럴 등은 이 화면 대상이 아니다)
const PLACE_TYPES = ["place_traffic"] as const;
const SHOPPING_TYPES = ["store_traffic", "store_action"] as const;
const SCOPE_TYPES = [...PLACE_TYPES, ...SHOPPING_TYPES];

/**
 * 이 화면이 다루는 범위 — 네이버 플레이스 / 네이버 쇼핑 / 쿠팡 상위노출 캠페인.
 * 리뷰/체험단 캠페인은 각자의 화면에서 관리한다.
 */
const IN_SCOPE = and(
  isNull(products.reviewType),
  or(
    inArray(products.category, ["reward_place", "reward_shopping", "reward_coupang"]),
    // 고객 신청 화면은 카테고리·채널이 없는 고정 상품에 캠페인을 붙인다 → 상품 유형으로 가른다
    and(
      isNull(products.category),
      or(isNull(products.channel), inArray(products.channel, ["place", "shopping"])),
      inArray(products.productType, SCOPE_TYPES),
    ),
  ),
);

/**
 * 상품의 카테고리 → 채널 → 상품 유형 순으로 플랫폼을 판별한다.
 * IN_SCOPE 를 통과한 캠페인은 반드시 플레이스/쇼핑/쿠팡 중 하나로 떨어진다.
 */
function platformOf(category: string | null, channel: string | null, productType: string | null) {
  if (category === "reward_coupang" || channel === "coupang") return "coupang";
  if (category === "reward_place" || channel === "place") return "place";
  return productType && (PLACE_TYPES as readonly string[]).includes(productType) ? "place" : "shopping";
}

/** 캠페인 신청 입력값 — 플레이스는 storeName/placeUrl, 쇼핑은 productName/productUrl 로 들어온다 */
function targetOf(inputs: Record<string, unknown>) {
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
  return {
    name: str(inputs.storeName) ?? str(inputs.productName),
    url: str(inputs.placeUrl) ?? str(inputs.productUrl),
    keyword: str(inputs.keyword) ?? "",
    region: str(inputs.region) ?? "",
  };
}

/**
 * 플레이스/쇼핑 상위노출 관리 두 화면이 같은 데이터를 쓰되 플랫폼만 다르다.
 * 화면별 페이지에서 이 로더를 호출한다.
 */
// 광고주(users)와 담당 관리자(users)를 같은 쿼리에서 조인하려면 별칭이 필요하다
const assignedAdmin = alias(users, "assigned_admin");

const DAY_MS = 24 * 60 * 60 * 1000;
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 기간은 화면에 "미정"으로 남기지 않는다.
 * 셋팅 전이면 신청일과 수량으로 임시 기간을 만들어 보여주고, 임시라는 표시를 함께 넘긴다.
 * (셋팅 모달도 이 값을 기본값으로 열어 그대로 저장할 수 있다)
 */
function period(
  startDate: string | null,
  endDate: string | null,
  createdAt: Date,
  dailyQty: number | null,
  totalQty: number,
) {
  if (startDate && endDate) return { startDate, endDate, periodProvisional: false };

  const start = startDate ?? toYMD(createdAt);
  const days = dailyQty && dailyQty > 0 ? Math.max(1, Math.ceil(totalQty / dailyQty)) : 7;
  const end = endDate ?? toYMD(new Date(new Date(start).getTime() + (days - 1) * DAY_MS));
  return { startDate: start, endDate: end, periodProvisional: true };
}

export async function loadCampaignData(
  platform: "place" | "shopping" | "coupang",
  periodParams: PeriodParams = {},
) {
  const range = periodRange(periodParams);
  /**
   * 완료 캠페인은 계속 쌓이므로, 기간을 고르면 SQL 에서 종료일로 걸러 온다.
   * (클라이언트에서 거르면 전량을 내려받아야 해 데이터가 늘수록 감당이 안 된다)
   */
  const periodFilter = range
    ? and(isNotNull(campaigns.endDate), gte(campaigns.endDate, range.start), lte(campaigns.endDate, range.end))
    : undefined;

  const [rows, deliveredRows, rankRows, snapshotRows, extensionRows] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        userId: campaigns.userId,
        status: campaigns.status,
        inputs: campaigns.inputs,
        totalQty: campaigns.totalQty,
        dailyQty: campaigns.dailyQty,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        quotedAmount: campaigns.quotedAmount,
        paidAmount: campaigns.paidAmount,
        createdAt: campaigns.createdAt,
        userName: users.name,
        userEmail: users.email,
        // 광고주 표기는 가입 시 등록한 회사명을 우선한다
        orgName: memberProfiles.orgName,
        // 담당자 = 셋팅·구동을 맡은 관리자
        assignedAdminId: campaigns.assignedAdminId,
        assignedAdminName: assignedAdmin.name,
        productTitle: products.title,
        productType: products.productType,
        productCategory: products.category,
        productChannel: products.channel,
        businessName: businesses.name,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.userId, users.id))
      .leftJoin(assignedAdmin, eq(campaigns.assignedAdminId, assignedAdmin.id))
      .leftJoin(memberProfiles, eq(campaigns.userId, memberProfiles.userId))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .leftJoin(businesses, eq(campaigns.businessId, businesses.id))
      .where(periodFilter ? and(IN_SCOPE, periodFilter) : IN_SCOPE)
      .orderBy(desc(campaigns.createdAt))
      .limit(500),
    db
      .select({
        campaignId: campaignEvents.campaignId,
        delivered: sql<number>`sum(${campaignEvents.deliveredQty})::int`,
      })
      .from(campaignEvents)
      .groupBy(campaignEvents.campaignId),
    // 현재 순위는 순위추적(rank_keywords)에서 가져온다 — 회원 + 플랫폼 + 키워드로 맞춘다
    db
      .select({
        id: rankKeywords.id,
        userId: rankKeywords.userId,
        platform: rankKeywords.platform,
        keyword: rankKeywords.keyword,
        currentRank: rankKeywords.currentRank,
        previousRank: rankKeywords.previousRank,
      })
      .from(rankKeywords)
      .where(inArray(rankKeywords.platform, ["place", "shopping", "coupang"])),
    // 순위 추이 차트용 일자별 이력
    db
      .select({
        keywordId: rankSnapshots.keywordId,
        snapshotDate: rankSnapshots.snapshotDate,
        rank: rankSnapshots.rank,
      })
      .from(rankSnapshots)
      .orderBy(rankSnapshots.snapshotDate),
    db
      .select({
        id: campaignExtensions.id,
        targetType: campaignExtensions.targetType,
        targetId: campaignExtensions.targetId,
        userName: users.name,
        userEmail: users.email,
        addDays: campaignExtensions.addDays,
        addQty: campaignExtensions.addQty,
        amount: campaignExtensions.amount,
        status: campaignExtensions.status,
        memo: campaignExtensions.memo,
        createdAt: campaignExtensions.createdAt,
        // 고객 "연장 안내" 화면과 같은 정보를 보여주기 위한 대상 캠페인 값들
        productTitle: products.title,
        unitPrice: products.unitPrice,
        campaignEndDate: campaigns.endDate,
        campaignStartDate: campaigns.startDate,
        campaignCreatedAt: campaigns.createdAt,
        campaignDailyQty: campaigns.dailyQty,
        campaignTotalQty: campaigns.totalQty,
        campaignInputs: campaigns.inputs,
        // 광고주명·현재 순위를 위한 값들 (가입 시 등록한 회사명 우선)
        campaignUserId: campaigns.userId,
        orgName: memberProfiles.orgName,
        businessName: businesses.name,
        productCategory: products.category,
        productChannel: products.channel,
        productType: products.productType,
      })
      .from(campaignExtensions)
      .leftJoin(users, eq(campaignExtensions.userId, users.id))
      .leftJoin(campaigns, eq(campaignExtensions.targetId, campaigns.id))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .leftJoin(memberProfiles, eq(campaignExtensions.userId, memberProfiles.userId))
      .leftJoin(businesses, eq(campaigns.businessId, businesses.id))
      // 연장 신청도 같은 범위만 — 캠페인이 삭제된 건은 남겨 처리할 수 있게 한다
      .where(and(eq(campaignExtensions.targetType, "campaign"), or(IN_SCOPE, isNull(products.id))))
      .orderBy(desc(campaignExtensions.createdAt))
      .limit(200),
  ]);

  // 단계는 "오늘" 기준으로 갈리므로 서버에서 계산해 넘긴다 (클라이언트에서 계산하면 하이드레이션이 어긋난다)
  const today = todayKST();
  // 기간 선택지는 화면에 로드된 행이 아니라 전체 데이터에서 뽑는다
  const yearRows = await db
    .selectDistinct({ year: sql<number>`extract(year from ${campaigns.endDate})::int` })
    .from(campaigns)
    .leftJoin(products, eq(campaigns.productId, products.id))
    .where(and(IN_SCOPE, isNotNull(campaigns.endDate)));
  const years = yearRows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);

  const delMap = new Map(deliveredRows.map((r) => [r.campaignId, r.delivered]));
  const rankMap = new Map(rankRows.map((r) => [`${r.userId}:${r.platform}:${r.keyword}`, r]));

  const historyMap = new Map<string, { date: string; rank: number }[]>();
  for (const s of snapshotRows) {
    if (s.rank == null) continue;
    const list = historyMap.get(s.keywordId) ?? [];
    list.push({ date: s.snapshotDate, rank: s.rank });
    historyMap.set(s.keywordId, list);
  }

  const all: AdminCampaignRow[] = rows.map((c) => {
    const target = targetOf((c.inputs ?? {}) as Record<string, unknown>);
    const platform = platformOf(c.productCategory, c.productChannel, c.productType);
    const rank = rankMap.get(`${c.userId}:${platform}:${target.keyword}`);
    return {
      id: c.id,
      status: c.status,
      stage: campaignStage(c.status, { startDate: c.startDate, endDate: c.endDate, today }),
      platform,
      targetName: target.name ?? c.businessName ?? "-",
      targetUrl: target.url,
      keyword: target.keyword,
      region: target.region,
      totalQty: c.totalQty,
      dailyQty: c.dailyQty,
      delivered: delMap.get(c.id) ?? 0,
      currentRank: rank?.currentRank ?? null,
      previousRank: rank?.previousRank ?? null,
      ...period(c.startDate, c.endDate, c.createdAt, c.dailyQty, c.totalQty),
      quotedAmount: Number(c.quotedAmount),
      paidAmount: Number(c.paidAmount ?? 0),
      createdAt: c.createdAt.toISOString(),
      // 회사명 → (없으면) 사업장명 → 가입자명 순으로 대체
      advertiser: c.orgName ?? c.businessName ?? c.userName ?? "-",
      userName: c.userName ?? "-",
      userEmail: c.userEmail ?? "",
      assignedAdminId: c.assignedAdminId,
      assignedAdminName: c.assignedAdminName ?? "",
      rankHistory: (rank && historyMap.get(rank.id)) || [],
      // 상품 = 고객이 신청 화면에서 고른 상품(버즈빌·프리마 등) 그 자체
      productTitle: c.productTitle ?? "-",
    };
  });

  const data = all.filter((r) => r.platform === platform);
  const campaignIds = new Set(data.map((r) => r.id));

  const extensions: ExtensionRow[] = extensionRows
    // 연장 신청도 화면의 플랫폼에 속한 캠페인 건만 (캠페인이 지워진 건은 처리할 수 있게 남긴다)
    .filter((e) => campaignIds.has(e.targetId) || !e.productTitle)
    .map((e) => {
      const t = targetOf((e.campaignInputs ?? {}) as Record<string, unknown>);
      // 현재 순위는 캠페인 목록과 같은 키(회원 + 플랫폼 + 키워드)로 맞춘다
      const extPlatform = platformOf(e.productCategory, e.productChannel, e.productType);
      const extRank = e.campaignUserId
        ? rankMap.get(`${e.campaignUserId}:${extPlatform}:${t.keyword}`)
        : undefined;
      // 셋팅 전이라 기간이 비어 있으면 캠페인 목록과 같은 방식으로 임시 시작일을 만든다
      const extPeriod = e.campaignCreatedAt
        ? period(e.campaignStartDate, e.campaignEndDate, e.campaignCreatedAt, e.campaignDailyQty, e.campaignTotalQty ?? 0)
        : null;
      return {
        id: e.id,
        targetType: e.targetType,
        // 신청 입력값 → 사업장명 순으로 대체 (상품명은 플레이스명이 아니다)
        targetLabel: t.name ?? e.businessName ?? e.productTitle ?? "(삭제된 캠페인)",
        targetUrl: t.url,
        keyword: t.keyword,
        productTitle: e.productTitle ?? "-",
        unitPrice: e.unitPrice != null ? Number(e.unitPrice) : null,
        currentEndDate: e.campaignEndDate,
        currentStartDate: extPeriod?.startDate ?? null,
        currentRank: extRank?.currentRank ?? null,
        // 회사명 → 사업장명 → 가입자명 순으로 대체 (캠페인 목록의 광고주 표기와 동일)
        advertiser: e.orgName ?? e.businessName ?? e.userName ?? "-",
        userName: e.userName ?? "(탈퇴 회원)",
        userEmail: e.userEmail ?? "-",
        addDays: e.addDays,
        addQty: e.addQty,
        amount: Number(e.amount),
        status: e.status,
        memo: e.memo,
        createdAt: e.createdAt.toISOString(),
      };
    });

  return { data, extensions, years };
}

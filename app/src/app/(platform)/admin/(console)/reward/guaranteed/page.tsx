import { db } from "@/db";
import {
  guaranteedCampaigns, users, memberProfiles, campaignExtensions, pricingRules,
  rankKeywords, rankSnapshots,
} from "@/db/schema";
import { and, asc, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PageTitle } from "@/components/admin/ui";
import { guaranteedStage, todayKST } from "@/lib/admin-format";
import { parsePeriod, periodRange } from "@/lib/period-filter";
import type { ExtensionRow } from "@/components/admin/ExtensionsPanel";
import type { PricingRuleRow } from "@/components/admin/PricingPanel";
import { GuaranteedClient, type GuaranteedRow } from "./GuaranteedClient";

export const dynamic = "force-dynamic";

const GUARANTEED_PRICING_PRESETS = [
  { key: "place_top1", label: "플레이스 1위 보장", unit: "일" },
  { key: "place_top3", label: "플레이스 3위 보장", unit: "일" },
  { key: "shopping_top1", label: "쇼핑 1위 보장", unit: "일" },
  { key: "extension_daily", label: "연장 단가", unit: "일" },
];

// 광고주(users)와 담당 관리자(users)를 같은 쿼리에서 조인하려면 별칭이 필요하다
const assignedAdmin = alias(users, "assigned_admin");

const DAY_MS = 24 * 60 * 60 * 1000;
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 기간은 화면에 "미정"으로 남기지 않는다.
 * 셋팅 전이면 신청일과 보장 일수로 임시 기간을 만들어 보여준다.
 */
function period(startDate: string | null, endDate: string | null, createdAt: Date, guaranteedDays: number) {
  if (startDate && endDate) return { startDate, endDate, periodProvisional: false };
  const start = startDate ?? toYMD(createdAt);
  const days = Math.max(1, guaranteedDays);
  const end = endDate ?? toYMD(new Date(new Date(start).getTime() + (days - 1) * DAY_MS));
  return { startDate: start, endDate: end, periodProvisional: true };
}

export default async function AdminGuaranteedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const periodParams = parsePeriod(await searchParams);
  const range = periodRange(periodParams);
  // 완료 데이터는 계속 쌓이므로 기간을 고르면 SQL 에서 종료일로 걸러 온다
  const periodFilter = range
    ? and(
        isNotNull(guaranteedCampaigns.endDate),
        gte(guaranteedCampaigns.endDate, range.start),
        lte(guaranteedCampaigns.endDate, range.end),
      )
    : undefined;

  const [rows, extensionRows, ruleRows, rankRows, snapshotRows] = await Promise.all([
    db
      .select({
        id: guaranteedCampaigns.id,
        userId: guaranteedCampaigns.userId,
        userName: users.name,
        userEmail: users.email,
        orgName: memberProfiles.orgName,
        assignedAdminName: assignedAdmin.name,
        platform: guaranteedCampaigns.platform,
        keyword: guaranteedCampaigns.keyword,
        targetName: guaranteedCampaigns.targetName,
        targetUrl: guaranteedCampaigns.targetUrl,
        targetRank: guaranteedCampaigns.targetRank,
        guaranteedDays: guaranteedCampaigns.guaranteedDays,
        achievedDays: guaranteedCampaigns.achievedDays,
        currentRank: guaranteedCampaigns.currentRank,
        startDate: guaranteedCampaigns.startDate,
        endDate: guaranteedCampaigns.endDate,
        amount: guaranteedCampaigns.amount,
        status: guaranteedCampaigns.status,
        memo: guaranteedCampaigns.memo,
        createdAt: guaranteedCampaigns.createdAt,
      })
      .from(guaranteedCampaigns)
      .leftJoin(users, eq(guaranteedCampaigns.userId, users.id))
      .leftJoin(memberProfiles, eq(guaranteedCampaigns.userId, memberProfiles.userId))
      .leftJoin(assignedAdmin, eq(guaranteedCampaigns.assignedAdminId, assignedAdmin.id))
      .where(periodFilter)
      .orderBy(desc(guaranteedCampaigns.createdAt))
      .limit(500),
    db
      .select({
        id: campaignExtensions.id,
        targetType: campaignExtensions.targetType,
        userName: users.name,
        userEmail: users.email,
        addDays: campaignExtensions.addDays,
        addQty: campaignExtensions.addQty,
        amount: campaignExtensions.amount,
        status: campaignExtensions.status,
        memo: campaignExtensions.memo,
        createdAt: campaignExtensions.createdAt,
        keyword: guaranteedCampaigns.keyword,
        targetName: guaranteedCampaigns.targetName,
        currentEndDate: guaranteedCampaigns.endDate,
      })
      .from(campaignExtensions)
      .leftJoin(users, eq(campaignExtensions.userId, users.id))
      .leftJoin(guaranteedCampaigns, eq(campaignExtensions.targetId, guaranteedCampaigns.id))
      .where(eq(campaignExtensions.targetType, "guaranteed"))
      .orderBy(desc(campaignExtensions.createdAt))
      .limit(200),
    db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.category, "guaranteed"))
      .orderBy(asc(pricingRules.sortOrder), asc(pricingRules.label)),
    // 현재 순위·추이는 순위추적(rank_keywords)에서 회원 + 플랫폼 + 키워드로 맞춘다
    db
      .select({
        id: rankKeywords.id,
        userId: rankKeywords.userId,
        platform: rankKeywords.platform,
        keyword: rankKeywords.keyword,
        currentRank: rankKeywords.currentRank,
      })
      .from(rankKeywords),
    db
      .select({
        keywordId: rankSnapshots.keywordId,
        snapshotDate: rankSnapshots.snapshotDate,
        rank: rankSnapshots.rank,
      })
      .from(rankSnapshots)
      .orderBy(rankSnapshots.snapshotDate),
  ]);

  // 기간 선택지는 화면에 로드된 행이 아니라 전체 데이터에서 뽑는다
  const yearRows = await db
    .selectDistinct({ year: sql<number>`extract(year from ${guaranteedCampaigns.endDate})::int` })
    .from(guaranteedCampaigns)
    .where(isNotNull(guaranteedCampaigns.endDate));
  const years = yearRows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);

  const today = todayKST();
  const rankMap = new Map(rankRows.map((r) => [`${r.userId}:${r.platform}:${r.keyword}`, r]));

  const historyMap = new Map<string, { date: string; rank: number }[]>();
  for (const s of snapshotRows) {
    if (s.rank == null) continue;
    const list = historyMap.get(s.keywordId) ?? [];
    list.push({ date: s.snapshotDate, rank: s.rank });
    historyMap.set(s.keywordId, list);
  }

  const data: GuaranteedRow[] = rows.map((g) => {
    const rank = rankMap.get(`${g.userId}:${g.platform}:${g.keyword}`);
    const history = (rank && historyMap.get(rank.id)) || [];
    // 보장 카운트 = 보장 순위 안에 머문 일수 (이력이 있으면 이력 기준, 없으면 저장값)
    const countedDays = history.length ? history.filter((h) => h.rank <= g.targetRank).length : g.achievedDays;
    const countStart = history.find((h) => h.rank <= g.targetRank)?.date ?? null;

    return {
      id: g.id,
      advertiser: g.orgName ?? g.userName ?? "-",
      userName: g.userName ?? "(탈퇴 회원)",
      userEmail: g.userEmail ?? "-",
      assignedAdminName: g.assignedAdminName ?? "",
      platform: g.platform,
      keyword: g.keyword,
      targetName: g.targetName ?? "-",
      targetUrl: g.targetUrl,
      targetRank: g.targetRank,
      guaranteedDays: g.guaranteedDays,
      achievedDays: countedDays,
      countStartDate: countStart,
      currentRank: rank?.currentRank ?? g.currentRank,
      rankHistory: history,
      ...period(g.startDate, g.endDate, g.createdAt, g.guaranteedDays),
      stage: guaranteedStage(g.status, { startDate: g.startDate, endDate: g.endDate, today }),
      amount: Number(g.amount),
      status: g.status,
      memo: g.memo,
      createdAt: g.createdAt.toISOString(),
    };
  });

  const extensions: ExtensionRow[] = extensionRows.map((e) => ({
    id: e.id,
    targetType: e.targetType,
    targetLabel: e.targetName ?? e.keyword ?? "(삭제된 캠페인)",
    keyword: e.keyword ?? "",
    currentEndDate: e.currentEndDate,
    userName: e.userName ?? "(탈퇴 회원)",
    userEmail: e.userEmail ?? "-",
    addDays: e.addDays,
    addQty: e.addQty,
    amount: Number(e.amount),
    status: e.status,
    memo: e.memo,
    createdAt: e.createdAt.toISOString(),
  }));

  const rules: PricingRuleRow[] = ruleRows.map((r) => ({
    id: r.id,
    category: r.category,
    key: r.key,
    label: r.label,
    unitPrice: Number(r.unitPrice),
    unit: r.unit,
    isActive: r.isActive,
    sortOrder: r.sortOrder,
  }));

  return (
    <div>
      <PageTitle
        title="보장형 캠페인 관리"
        description="보장 순위 유지 현황을 확인하고 셋팅합니다. 연장 신청도 여기서 처리합니다."
      />
      <GuaranteedClient
        rows={data}
        extensions={extensions}
        rules={rules}
        presets={GUARANTEED_PRICING_PRESETS}
        years={years}
        period={periodParams}
      />
    </div>
  );
}

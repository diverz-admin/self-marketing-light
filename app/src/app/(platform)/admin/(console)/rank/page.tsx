import { db } from "@/db";
import { rankKeywords, pricingRules, users } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import type { PricingRuleRow } from "@/components/admin/PricingPanel";
import { RankClient, type RankKeywordRow, type UserOption } from "./RankClient";

export const dynamic = "force-dynamic";

// 기획서: 키워드 1개 무료 / 2개 이상 유료 → 금액 설정
const RANK_PRICING_PRESETS = [
  { key: "extra_keyword", label: "추가 키워드 (2개째부터)", unit: "월" },
  { key: "place_keyword", label: "플레이스 키워드", unit: "월" },
  { key: "shopping_keyword", label: "쇼핑 키워드", unit: "월" },
  { key: "coupang_keyword", label: "쿠팡 키워드", unit: "월" },
];

export default async function AdminRankPage() {
  const [rows, ruleRows, userRows, summaryRow] = await Promise.all([
    db
      .select({
        id: rankKeywords.id,
        userId: rankKeywords.userId,
        userName: users.name,
        userEmail: users.email,
        platform: rankKeywords.platform,
        keyword: rankKeywords.keyword,
        targetName: rankKeywords.targetName,
        targetUrl: rankKeywords.targetUrl,
        isPaid: rankKeywords.isPaid,
        monthlyFee: rankKeywords.monthlyFee,
        currentRank: rankKeywords.currentRank,
        previousRank: rankKeywords.previousRank,
        lastCheckedAt: rankKeywords.lastCheckedAt,
        isActive: rankKeywords.isActive,
      })
      .from(rankKeywords)
      .leftJoin(users, eq(rankKeywords.userId, users.id))
      // 같은 배치로 등록되면 createdAt이 동일해 순서가 흔들린다 → id로 고정
      .orderBy(desc(rankKeywords.createdAt), desc(rankKeywords.id))
      .limit(500),
    db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.category, "rank"))
      .orderBy(asc(pricingRules.sortOrder), asc(pricingRules.label)),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(users.name).limit(500),
    db
      .select({
        total: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where ${rankKeywords.isPaid})::int`,
        mrr: sql<number>`coalesce(sum(${rankKeywords.monthlyFee}) filter (where ${rankKeywords.isPaid} and ${rankKeywords.isActive}), 0)::float`,
        tracked: sql<number>`count(*) filter (where ${rankKeywords.isActive})::int`,
      })
      .from(rankKeywords),
  ]);

  const summary = summaryRow[0];

  const data: RankKeywordRow[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName ?? "(탈퇴 회원)",
    userEmail: r.userEmail ?? "-",
    platform: r.platform,
    keyword: r.keyword,
    targetName: r.targetName,
    targetUrl: r.targetUrl,
    isPaid: r.isPaid,
    monthlyFee: Number(r.monthlyFee),
    currentRank: r.currentRank,
    previousRank: r.previousRank,
    lastCheckedAt: r.lastCheckedAt?.toISOString() ?? null,
    isActive: r.isActive,
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

  const userOptions: UserOption[] = userRows.map((u) => ({ id: u.id, name: u.name, email: u.email }));

  return (
    <div>
      <PageTitle
        title="통합순위관리"
        description="회원별 추적 키워드와 과금 상태를 관리합니다. 키워드 1개는 무료, 2개째부터 유료입니다."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="전체 키워드" value={`${summary?.total ?? 0}개`} tone="blue" />
        <StatCard label="추적중" value={`${summary?.tracked ?? 0}개`} tone="green" />
        <StatCard label="유료 키워드" value={`${summary?.paid ?? 0}개`} tone="purple" />
        <StatCard label="월 예상 매출" value={formatKRW(summary?.mrr)} tone="amber" />
      </div>

      <RankClient rows={data} users={userOptions} rules={rules} presets={RANK_PRICING_PRESETS} />
    </div>
  );
}

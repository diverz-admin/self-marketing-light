import { db } from "@/db";
import { rankKeywords, pricingRules, users, rankMemberships, memberProfiles } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW, todayKST } from "@/lib/admin-format";
import {
  isMembershipLive, overLimitCount, isRenewalDue, daysUntilExpiry, lockedKeywordIds,
} from "@/lib/rank-membership";
import type { PricingRuleRow } from "@/components/admin/PricingPanel";
import { RankClient, type RankKeywordRow, type UserOption, type MemberRow } from "./RankClient";

export const dynamic = "force-dynamic";

// 기획서: 키워드 1개 무료 / 2개 이상 유료 → 금액 설정
const RANK_PRICING_PRESETS = [
  { key: "extra_keyword", label: "추가 키워드 (2개째부터)", unit: "월" },
  { key: "place_keyword", label: "플레이스 키워드", unit: "월" },
  { key: "shopping_keyword", label: "쇼핑 키워드", unit: "월" },
  { key: "coupang_keyword", label: "쿠팡 키워드", unit: "월" },
];

export default async function AdminRankPage() {
  const [rows, ruleRows, userRows, summaryRow, membershipRows] = await Promise.all([
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
        createdAt: rankKeywords.createdAt,
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
    // 회원별 멤버십 — 최근 건이 앞에 오게 해 이용중 건을 먼저 잡는다
    db
      .select({
        id: rankMemberships.id,
        userId: rankMemberships.userId,
        status: rankMemberships.status,
        paidAt: rankMemberships.paidAt,
        startDate: rankMemberships.startDate,
        endDate: rankMemberships.endDate,
        monthlyFee: rankMemberships.monthlyFee,
        memo: rankMemberships.memo,
      })
      .from(rankMemberships)
      .orderBy(desc(rankMemberships.createdAt))
      .limit(1000),
  ]);

  // 회원 목록은 회사명까지 붙여 보여준다
  const profileRows = await db
    .select({ userId: memberProfiles.userId, orgName: memberProfiles.orgName, phone: memberProfiles.phone })
    .from(memberProfiles);

  const summary = summaryRow[0];

  // 멤버십이 없는 회원은 처음 등록한 1개만 남고 나머지가 잠긴다
  const today = todayKST();
  const membershipRowsByUser = new Map<string, (typeof membershipRows)[number]>();
  for (const m of membershipRows) {
    const prev = membershipRowsByUser.get(m.userId);
    if (!prev || (prev.status !== "active" && m.status === "active")) membershipRowsByUser.set(m.userId, m);
  }
  const keywordsByUser = new Map<string, { id: string; createdAt: string }[]>();
  for (const k of rows) {
    const list = keywordsByUser.get(k.userId) ?? [];
    list.push({ id: k.id, createdAt: k.createdAt.toISOString() });
    keywordsByUser.set(k.userId, list);
  }
  const lockedIds = new Set<string>();
  for (const [userId, list] of keywordsByUser) {
    const live = isMembershipLive(membershipRowsByUser.get(userId) ?? null, today);
    for (const id of lockedKeywordIds(list, live)) lockedIds.add(id);
  }

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
    locked: lockedIds.has(r.id),
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

  // 회원 = 멤버십 + 키워드 사용량을 한 줄로 묶어 본다
  const profileMap = new Map(profileRows.map((p) => [p.userId, p]));
  const keywordCount = new Map<string, number>();
  for (const k of rows) keywordCount.set(k.userId, (keywordCount.get(k.userId) ?? 0) + 1);

  const members: MemberRow[] = userRows.map((u) => {
    // 이용중 건이 있으면 그것을, 없으면 가장 최근 건을 대표로 둔다
    const m = membershipRowsByUser.get(u.id) ?? null;
    const live = isMembershipLive(m, today);
    const count = keywordCount.get(u.id) ?? 0;
    const profile = profileMap.get(u.id);
    return {
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      orgName: profile?.orgName ?? null,
      phone: profile?.phone ?? null,
      keywordCount: count,
      live,
      overLimit: overLimitCount(count, live),
      // 만료 3일 전부터 연장 안내 대상
      renewalDue: isRenewalDue(m, today),
      daysLeft: live ? daysUntilExpiry(m?.endDate ?? null, today) : null,
      membership: m
        ? {
            id: m.id,
            status: m.status,
            paidAt: m.paidAt,
            startDate: m.startDate,
            endDate: m.endDate,
            monthlyFee: Number(m.monthlyFee),
            memo: m.memo,
          }
        : null,
    };
  });

  return (
    <div>
      <PageTitle
        title="통합순위관리"
        description="회원별 추적 키워드와 멤버십을 관리합니다. 키워드 1개는 무료, 2개째부터는 멤버십이 있어야 등록됩니다."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="전체 키워드" value={`${summary?.total ?? 0}개`} tone="blue" />
        {/* 잠긴 키워드는 추적이 멈추므로 추적중에서 뺀다 */}
        <StatCard
          label="추적중"
          value={`${data.filter((r) => r.isActive && !r.locked).length}개`}
          sub={lockedIds.size ? `${lockedIds.size}개 잠김` : undefined}
          tone="green"
        />
        <StatCard
          label="멤버십 회원"
          value={`${members.filter((m) => m.live).length}명`}
          sub={
            members.filter((m) => m.renewalDue).length
              ? `연장 안내 ${members.filter((m) => m.renewalDue).length}명`
              : "키워드 무제한"
          }
          tone="purple"
        />
        <StatCard
          label="멤버십 월 매출"
          value={formatKRW(members.filter((m) => m.live).reduce((s, m) => s + (m.membership?.monthlyFee ?? 0), 0))}
          tone="amber"
        />
      </div>

      <RankClient
        rows={data}
        members={members}
        users={userOptions}
        rules={rules}
        presets={RANK_PRICING_PRESETS}
      />
    </div>
  );
}

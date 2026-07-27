import Link from "next/link";
import { db } from "@/db";
import {
  users, campaigns, orders, products,
  pointCharges, reviewCampaigns, guaranteedCampaigns, serviceRequests, campaignExtensions,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { StatCard, Card, SectionHeader, PageTitle, Badge, TableShell, Th, Td, EmptyState } from "@/components/admin/ui";
import { RevenuePanel } from "@/components/admin/RevenuePanel";
import { SignupPanel } from "@/components/admin/SignupPanel";
import {
  formatKRW,
  formatNumber,
  formatDate,
  campaignStatusMeta,
  roleMeta,
  toneClass,
  type BadgeTone,
} from "@/lib/admin-format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    roleRows,
    campStatusRows,
    revenueRow,
    pendingRow,
    runningRow,
    dailyRevenueRows,
    monthlyRevenueRows,
    recentCampaigns,
    todoRow,
    signupRow,
  ] = await Promise.all([
    db.select({ role: users.role, count: sql<number>`count(*)::int` }).from(users).groupBy(users.role),
    db.select({ status: campaigns.status, count: sql<number>`count(*)::int` }).from(campaigns).groupBy(campaigns.status),
    // 오늘 / 어제 매출 (KST 기준, 결제완료 주문)
    db.execute<{ today: number; yesterday: number }>(sql`
      select
        coalesce(sum(${orders.amount}) filter (
          where (${orders.createdAt} at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date
        ), 0)::float as today,
        coalesce(sum(${orders.amount}) filter (
          where (${orders.createdAt} at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date - 1
        ), 0)::float as yesterday
      from ${orders}
      where ${orders.status} = 'paid'
    `),
    db.select({ count: sql<number>`count(*)::int` }).from(campaigns).where(sql`${campaigns.status} in ('submitted','reviewing')`),
    db.select({ count: sql<number>`count(*)::int` }).from(campaigns).where(eq(campaigns.status, "running")),
    db
      .select({
        date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: sql<number>`sum(${orders.amount})::float`,
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid' and ${orders.createdAt} >= now() - interval '14 days'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`),
    // 월별 매출 (최근 12개월)
    db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
        amount: sql<number>`sum(${orders.amount})::float`,
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid' and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`),
    db
      .select({
        id: campaigns.id,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        quotedAmount: campaigns.quotedAmount,
        totalQty: campaigns.totalQty,
        userName: users.name,
        productTitle: products.title,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.userId, users.id))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .orderBy(desc(campaigns.createdAt))
      .limit(7),
    // 기획서 각 영역의 "처리 대기" 건수 — 단일 쿼리로 집계
    // (pgBouncer 경유 시 동시 쿼리를 늘리면 커넥션이 물릴 수 있어 하나로 합침)
    db.execute<{
      point_charge: number; review: number; guaranteed: number; service: number; extension: number;
    }>(sql`
      select
        (select count(*) from ${pointCharges} where status = 'requested')::int as point_charge,
        (select count(*) from ${reviewCampaigns} where status in ('requested','paid'))::int as review,
        (select count(*) from ${guaranteedCampaigns} where status in ('requested','reviewing'))::int as guaranteed,
        (select count(*) from ${serviceRequests} where status = 'requested')::int as service,
        (select count(*) from ${campaignExtensions} where status = 'requested')::int as extension
    `),
    // 신규 가입 — 요약(오늘/어제/이번 달/지난 달/전체) + 일별·월별 시계열을 KST 기준으로 한 번에.
    // (처리 대기 집계와 같은 이유로, 동시 커넥션을 늘리지 않도록 단일 쿼리로 합침)
    db.execute<{
      today: number; yesterday: number; this_month: number; last_month: number; total: number;
      daily: { date: string; count: number }[];
      monthly: { month: string; count: number }[];
    }>(sql`
      with s as (select (${users.createdAt} at time zone 'Asia/Seoul') as ts from ${users}),
           n as (select (now() at time zone 'Asia/Seoul') as now_kst)
      select
        count(*) filter (where ts::date = (select now_kst from n)::date)::int as today,
        count(*) filter (where ts::date = (select now_kst from n)::date - 1)::int as yesterday,
        count(*) filter (where date_trunc('month', ts) = date_trunc('month', (select now_kst from n)))::int as this_month,
        count(*) filter (where date_trunc('month', ts) = date_trunc('month', (select now_kst from n)) - interval '1 month')::int as last_month,
        count(*)::int as total,
        coalesce((
          select json_agg(d) from (
            select to_char(ts, 'YYYY-MM-DD') as date, count(*)::int as count
            from s where ts >= (select now_kst from n)::date - interval '13 days'
            group by 1
          ) d
        ), '[]'::json) as daily,
        coalesce((
          select json_agg(m) from (
            select to_char(ts, 'YYYY-MM') as month, count(*)::int as count
            from s where ts >= date_trunc('month', (select now_kst from n)) - interval '11 months'
            group by 1
          ) m
        ), '[]'::json) as monthly
      from s
    `),
  ]);

  const totalUsers = roleRows.reduce((s, r) => s + r.count, 0);
  const totalCampaigns = campStatusRows.reduce((s, r) => s + r.count, 0);
  const todayRevenue = revenueRow[0]?.today ?? 0;
  const yesterdayRevenue = revenueRow[0]?.yesterday ?? 0;
  const revenueDelta =
    yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : null;
  const pending = pendingRow[0]?.count ?? 0;
  const running = runningRow[0]?.count ?? 0;

  const todo = todoRow[0];
  const TODO_ITEMS = [
    { label: "포인트 충전 승인", count: todo?.point_charge ?? 0, href: "/admin/points", hint: "입금 확인 후 지급" },
    { label: "캠페인 승인 대기", count: pending, href: "/admin/reward/campaigns", hint: "검수 후 승인" },
    { label: "보장형 신청", count: todo?.guaranteed ?? 0, href: "/admin/reward/guaranteed", hint: "순위·기간 셋팅" },
    { label: "리뷰 캠페인 셋팅", count: todo?.review ?? 0, href: "/admin/review/place", hint: "결제 후 진행 셋팅" },
    { label: "서비스 신청 상담", count: todo?.service ?? 0, href: "/admin/requests", hint: "견적 발송" },
    { label: "연장 신청 처리", count: todo?.extension ?? 0, href: "/admin/reward/campaigns", hint: "기간·수량 연장" },
  ];
  const todoTotal = TODO_ITEMS.reduce((s, i) => s + i.count, 0);

  // 최근 14일 매출 스캐폴드 (빈 날짜 0 채움)
  const revMap = new Map(dailyRevenueRows.map((r) => [r.date, r.amount]));
  const revenueSeries: { date: string; amount: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    revenueSeries.push({ date: key, amount: revMap.get(key) ?? 0 });
  }

  // 최근 12개월 스캐폴드 (매출 없는 달도 0으로 채워 축이 끊기지 않게)
  const monthMap = new Map(monthlyRevenueRows.map((r) => [r.month, r.amount]));
  const monthlySeries: { label: string; amount: number }[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  cursor.setMonth(cursor.getMonth() - 11);
  for (let i = 0; i < 12; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    monthlySeries.push({ label: key, amount: monthMap.get(key) ?? 0 });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // 신규 가입 — KST 기준 날짜 키로 스캐폴드
  const kstKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d); // YYYY-MM-DD
  const signup = signupRow[0];
  const signupSummary = {
    today: signup?.today ?? 0,
    yesterday: signup?.yesterday ?? 0,
    thisMonth: signup?.this_month ?? 0,
    lastMonth: signup?.last_month ?? 0,
    total: totalUsers,
  };

  const signupDayMap = new Map((signup?.daily ?? []).map((r) => [r.date, r.count]));
  const signupDailySeries: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = kstKey(d);
    signupDailySeries.push({ date: key, count: signupDayMap.get(key) ?? 0 });
  }

  const signupMonthMap = new Map((signup?.monthly ?? []).map((r) => [r.month, r.count]));
  const signupMonthlySeries: { label: string; count: number }[] = [];
  const [kstYear, kstMonth] = kstKey(new Date()).split("-").map(Number);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(kstYear, kstMonth - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    signupMonthlySeries.push({ label: key, count: signupMonthMap.get(key) ?? 0 });
  }

  return (
    <div>
      <PageTitle title="대시보드" description="플랫폼 핵심 지표 현황" />

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <StatCard
          label="오늘 매출"
          value={formatKRW(todayRevenue)}
          sub={
            <>
              어제 {formatKRW(yesterdayRevenue)}
              {revenueDelta !== null && (
                <span
                  className={`ml-1.5 font-semibold ${
                    revenueDelta > 0
                      ? "text-brand-success"
                      : revenueDelta < 0
                        ? "text-brand-error"
                        : "text-brand-muted"
                  }`}
                >
                  {revenueDelta > 0 ? "▲" : revenueDelta < 0 ? "▼" : "-"} {Math.abs(revenueDelta)}%
                </span>
              )}
            </>
          }
          tone="blue"
          icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />}
        />
        <StatCard
          label="전체 회원"
          value={formatNumber(totalUsers)}
          sub={`오늘 +${formatNumber(signupSummary.today)} · 이번 달 +${formatNumber(signupSummary.thisMonth)}`}
          tone="purple"
          icon={<Icon path="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-6 4 4 0 004 6z" />}
        />
        <StatCard
          label="진행중 캠페인"
          value={formatNumber(running)}
          sub={`전체 ${totalCampaigns}건`}
          tone="green"
          icon={<Icon path="M13 10V3L4 14h7v7l9-11h-7z" />}
        />
        <StatCard
          label="승인 대기"
          value={formatNumber(pending)}
          sub="검토가 필요한 캠페인"
          tone="amber"
          icon={<Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
      </div>

      {/* 처리 대기 — 대시보드 최상단 강조 영역 */}
      <section className="rounded-2xl border-2 border-brand-primary/15 bg-white overflow-hidden mb-4 md:mb-6">
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 text-white"
          style={{ background: "linear-gradient(135deg,#0D3473,#111D37)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
              <Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-extrabold">처리 대기</p>
              <p className="text-[12px] text-white/60">관리자 조치가 필요한 건</p>
            </div>
          </div>
          <div className="text-right leading-none">
            <span className="text-[30px] font-extrabold">{formatNumber(todoTotal)}</span>
            <span className="text-[13px] text-white/70 ml-1">건</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-brand-border">
          {TODO_ITEMS.map((item) => {
            const urgent = item.count > 0;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group p-4 transition-colors ${urgent ? "hover:bg-brand-warning-bg/50" : "hover:bg-brand-light"}`}
              >
                <p className="text-[12.5px] font-semibold text-brand-sub leading-snug">{item.label}</p>
                <p
                  className={`text-[28px] font-extrabold mt-1.5 leading-none ${
                    urgent ? "text-brand-warning" : "text-brand-muted"
                  }`}
                >
                  {formatNumber(item.count)}
                </p>
                <p className="text-[11.5px] text-brand-muted mt-1.5 group-hover:text-brand-primary transition-colors">
                  {urgent ? `${item.hint} →` : "대기 없음"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 신규 회원 가입 — 오늘 / 이번 달 / 전체 + 추이 */}
      <div className="mb-4 md:mb-6">
        <SignupPanel summary={signupSummary} daily={signupDailySeries} monthly={signupMonthlySeries} />
      </div>

      {/* 매출 추이 — 일별 / 월별 전환 */}
      <div className="mb-4 md:mb-6">
        <RevenuePanel daily={revenueSeries} monthly={monthlySeries} />
      </div>

      {/* 최근 캠페인 + 회원 구성 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <Card>
            <SectionHeader title="최근 캠페인" right={<Link href="/admin/reward/campaigns" className="text-[13px] font-semibold text-brand-primary hover:underline">전체 보기</Link>} />
            {recentCampaigns.length ? (
              <TableShell
                head={
                  <>
                    <Th>광고주</Th>
                    <Th>상품</Th>
                    <Th className="text-right">금액</Th>
                    <Th>상태</Th>
                    <Th>신청일</Th>
                  </>
                }
              >
                {recentCampaigns.map((c) => {
                  const meta = campaignStatusMeta[c.status] ?? { label: c.status, tone: "gray" as BadgeTone };
                  return (
                    <tr key={c.id} className="hover:bg-brand-light/50 transition-colors">
                      <Td className="font-semibold text-brand-dark">{c.userName ?? "-"}</Td>
                      <Td>{c.productTitle ?? "-"}</Td>
                      <Td className="text-right tabular-nums">{formatKRW(c.quotedAmount)}</Td>
                      <Td><Badge tone={meta.tone}>{meta.label}</Badge></Td>
                      <Td className="text-brand-sub">{formatDate(c.createdAt)}</Td>
                    </tr>
                  );
                })}
              </TableShell>
            ) : (
              <EmptyState message="캠페인이 없습니다." />
            )}
          </Card>
        </div>

        <div className="space-y-4 md:space-y-6">
          <Card className="p-5">
            <p className="text-[13px] font-bold text-brand-dark mb-3">회원 구성</p>
            <div className="space-y-2.5">
              {(["advertiser", "supplier", "admin"] as const).map((role) => {
                const count = roleRows.find((r) => r.role === role)?.count ?? 0;
                const meta = roleMeta[role];
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold ${toneClass[meta.tone]}`}>{meta.label}</span>
                    <span className="text-[15px] font-bold text-brand-dark tabular-nums">{formatNumber(count)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

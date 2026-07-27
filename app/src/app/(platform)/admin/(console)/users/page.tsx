import { db } from "@/db";
import { users, campaigns, orders, pointCharges } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { MemberTrendPanel } from "@/components/admin/MemberTrendPanel";
import { RevenuePanel } from "@/components/admin/RevenuePanel";
import { UsersClient, type AdminUserRow } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [userRows, campCountRows, paymentRows, chargeRows, signupTrendRow, paymentTrendRow] =
    await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        creditBalance: users.creditBalance,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select({ userId: campaigns.userId, count: sql<number>`count(*)::int` })
      .from(campaigns)
      .groupBy(campaigns.userId),
    // 기획서: 회원목록 + 결제현황
    db
      .select({
        userId: orders.userId,
        paidAmount: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} = 'paid'), 0)::float`,
        refundedAmount: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} <> 'paid'), 0)::float`,
        orderCount: sql<number>`count(*)::int`,
        lastPaidAt: sql<string | null>`max(${orders.createdAt})`,
      })
      .from(orders)
      .groupBy(orders.userId),
    db
      .select({
        userId: pointCharges.userId,
        chargedAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved'), 0)::float`,
      })
      .from(pointCharges)
      .groupBy(pointCharges.userId),
    // 가입 추이 — 창 이전 누적(baseline) + 일별/월별 신규수를 한 쿼리로 (KST)
    db.execute<{
      before_daily: number;
      before_monthly: number;
      daily: { date: string; count: number }[] | null;
      monthly: { month: string; count: number }[] | null;
    }>(sql`
      with s as (select (${users.createdAt} at time zone 'Asia/Seoul') as ts from ${users}),
           n as (select (now() at time zone 'Asia/Seoul') as now_kst)
      select
        (select count(*) from s where ts < (select now_kst from n)::date - interval '13 days')::int as before_daily,
        (select count(*) from s where ts < date_trunc('month', (select now_kst from n)) - interval '11 months')::int as before_monthly,
        (select json_agg(d) from (
          select to_char(ts, 'YYYY-MM-DD') as date, count(*)::int as count
          from s where ts >= (select now_kst from n)::date - interval '13 days' group by 1
        ) d) as daily,
        (select json_agg(m) from (
          select to_char(ts, 'YYYY-MM') as month, count(*)::int as count
          from s where ts >= date_trunc('month', (select now_kst from n)) - interval '11 months' group by 1
        ) m) as monthly
    `),
    // 결제액 추이 — 일별/월별을 한 쿼리로 (KST, 결제완료 기준)
    db.execute<{
      daily: { date: string; amount: number }[] | null;
      monthly: { month: string; amount: number }[] | null;
    }>(sql`
      with o as (
        select (${orders.createdAt} at time zone 'Asia/Seoul') as ts, ${orders.amount} as amount
        from ${orders} where ${orders.status} = 'paid'
      ), n as (select (now() at time zone 'Asia/Seoul') as now_kst)
      select
        (select json_agg(d) from (
          select to_char(ts, 'YYYY-MM-DD') as date, sum(amount)::float as amount
          from o where ts >= (select now_kst from n)::date - interval '13 days' group by 1
        ) d) as daily,
        (select json_agg(m) from (
          select to_char(ts, 'YYYY-MM') as month, sum(amount)::float as amount
          from o where ts >= date_trunc('month', (select now_kst from n)) - interval '11 months' group by 1
        ) m) as monthly
    `),
  ]);

  const campMap = new Map(campCountRows.map((r) => [r.userId, r.count]));
  const payMap = new Map(paymentRows.map((r) => [r.userId, r]));
  const chargeMap = new Map(chargeRows.map((r) => [r.userId, Number(r.chargedAmount)]));

  const rows: AdminUserRow[] = userRows.map((u) => {
    const pay = payMap.get(u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      creditBalance: Number(u.creditBalance),
      createdAt: u.createdAt.toISOString(),
      campaignCount: campMap.get(u.id) ?? 0,
      paidAmount: Number(pay?.paidAmount ?? 0),
      refundedAmount: Number(pay?.refundedAmount ?? 0),
      orderCount: pay?.orderCount ?? 0,
      lastPaidAt: pay?.lastPaidAt ? new Date(pay.lastPaidAt).toISOString() : null,
      chargedAmount: chargeMap.get(u.id) ?? 0,
    };
  });

  // ── 추이 시리즈 스캐폴드 (KST 기준 키) ──
  const kstKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
  const dayKeys: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dayKeys.push(kstKey(d));
  }
  const [kstYear, kstMonth] = kstKey(new Date()).split("-").map(Number);
  const monthKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(kstYear, kstMonth - 1 - i, 1));
    monthKeys.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  // 누적 회원가입수 = 창 이전 누적 + 구간 신규수 누적합
  const signupTrend = signupTrendRow[0];
  const signupDayMap = new Map((signupTrend?.daily ?? []).map((r) => [r.date, r.count]));
  let running = signupTrend?.before_daily ?? 0;
  const memberDaily = dayKeys.map((key) => {
    const added = signupDayMap.get(key) ?? 0;
    running += added;
    return { label: key, count: running, added };
  });

  const signupMonthMap = new Map((signupTrend?.monthly ?? []).map((r) => [r.month, r.count]));
  running = signupTrend?.before_monthly ?? 0;
  const memberMonthly = monthKeys.map((key) => {
    const added = signupMonthMap.get(key) ?? 0;
    running += added;
    return { label: key, count: running, added };
  });

  // 결제액 추이
  const paymentTrend = paymentTrendRow[0];
  const payDayMap = new Map((paymentTrend?.daily ?? []).map((r) => [r.date, Number(r.amount)]));
  const paymentDaily = dayKeys.map((key) => ({ date: key, amount: payDayMap.get(key) ?? 0 }));
  const payMonthMap = new Map((paymentTrend?.monthly ?? []).map((r) => [r.month, Number(r.amount)]));
  const paymentMonthly = monthKeys.map((key) => ({ label: key, amount: payMonthMap.get(key) ?? 0 }));

  return (
    <div>
      <PageTitle title="회원관리" description="회원 목록과 결제현황을 함께 확인하고 역할·포인트를 조정합니다." />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-6">
        <MemberTrendPanel daily={memberDaily} monthly={memberMonthly} />
        <RevenuePanel daily={paymentDaily} monthly={paymentMonthly} title="결제액 추이" />
      </div>

      <UsersClient rows={rows} />
    </div>
  );
}

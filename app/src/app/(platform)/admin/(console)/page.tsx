import Link from "next/link";
import { db } from "@/db";
import {
  users, campaigns, orders, products,
  pointCharges, reviewCampaigns, guaranteedCampaigns, serviceRequests, campaignExtensions,
} from "@/db/schema";
import { sql, desc, eq } from "drizzle-orm";
import { Card, SectionHeader, PageTitle, EmptyState } from "@/components/admin/ui";
import { MetricCard, Num, LastUpdated, cumulative } from "@/components/admin/console-ui";
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

/**
 * 쿼리를 하나씩 차례로 실행한다 (Promise.all 대신).
 * 운영(Vercel)은 Supabase 트랜잭션 풀러를 거치는데, 한 요청에서 쿼리를 10개씩 동시에
 * 띄우면 커넥션이 물려 응답이 오지 않고 300초 제한에 걸렸다. 순서대로 돌리면 몇 초 안에 끝난다.
 */
async function inSeries<const T extends readonly (() => PromiseLike<unknown>)[]>(
  tasks: T,
): Promise<{ -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const out: unknown[] = [];
  for (const task of tasks) out.push(await task());
  return out as { -readonly [K in keyof T]: Awaited<ReturnType<T[K]>> };
}

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
  ] = await inSeries([
    () => db.select({ role: users.role, count: sql<number>`count(*)::int` }).from(users).groupBy(users.role),
    () => db.select({ status: campaigns.status, count: sql<number>`count(*)::int` }).from(campaigns).groupBy(campaigns.status),
    // 오늘 / 어제 매출 (KST 기준, 결제완료 주문)
    () => db.execute<{ today: number; yesterday: number }>(sql`
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
    () => db.select({ count: sql<number>`count(*)::int` }).from(campaigns).where(sql`${campaigns.status} in ('submitted','reviewing')`),
    () => db.select({ count: sql<number>`count(*)::int` }).from(campaigns).where(eq(campaigns.status, "running")),
    () => db
      .select({
        date: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
        amount: sql<number>`sum(${orders.amount})::float`,
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid' and ${orders.createdAt} >= now() - interval '14 days'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`),
    // 월별 매출 (최근 12개월)
    () => db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
        amount: sql<number>`sum(${orders.amount})::float`,
      })
      .from(orders)
      .where(sql`${orders.status} = 'paid' and ${orders.createdAt} >= date_trunc('month', now()) - interval '11 months'`)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`),
    () => db
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
    () => db.execute<{
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
    () => db.execute<{
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

  /**
   * 처리 대기 — 급한 순으로 왼쪽부터 놓는다.
   *
   * 긴급도의 기준은 "고객 돈이 얼마나 묶여 있는가"다.
   *   high   고객이 이미 돈을 냈는데 받을 것을 못 받은 상태. 하루만 늦어도 문의가 온다.
   *   normal 결제는 끝났고 진행이 밀리는 건. 기한은 있으나 오늘 안이면 된다.
   *   low    아직 돈이 오가지 않은 상담 건.
   *
   * 순서를 런타임에 정렬하지 않는 이유는 매일 보는 화면이기 때문이다. 건수에 따라
   * 칸이 자리를 바꾸면 위치를 기억할 수 없어 오히려 훑기 어려워진다.
   */
  const TODO_ITEMS = [
    // 입금은 됐는데 포인트가 안 나간 상태 (CG-01)
    { label: "포인트 충전 승인", count: todo?.point_charge ?? 0, href: "/admin/points", hint: "입금 확인 후 지급", level: "high" as const },
    // 결제는 됐는데 집행이 시작되지 않은 상태. 마감시각을 넘기면 집행일이 하루 밀린다 (PU-02)
    { label: "캠페인 승인 대기", count: pending, href: "/admin/reward/campaigns", hint: "검수 후 승인", level: "high" as const },
    // 처리가 늦으면 진행 중 캠페인이 끊긴다
    { label: "연장 신청 처리", count: todo?.extension ?? 0, href: "/admin/reward/campaigns", hint: "기간·수량 연장", level: "normal" as const },
    { label: "보장형 신청", count: todo?.guaranteed ?? 0, href: "/admin/reward/guaranteed", hint: "순위·기간 셋팅", level: "normal" as const },
    { label: "리뷰 캠페인 셋팅", count: todo?.review ?? 0, href: "/admin/review/place", hint: "결제 후 진행 셋팅", level: "normal" as const },
    // 견적 전이라 아직 돈이 묶여 있지 않다
    { label: "서비스 신청 상담", count: todo?.service ?? 0, href: "/admin/requests", hint: "견적 발송", level: "low" as const },
  ];
  const todoTotal = TODO_ITEMS.reduce((s, i) => s + i.count, 0);
  /** 헤더에 따로 뽑아 주는 "먼저 볼 것" 건수 */
  const todoUrgent = TODO_ITEMS.filter((i) => i.level === "high").reduce((s, i) => s + i.count, 0);

  /** 로그 줄의 상태 점 — Badge 의 알약 대신 쓴다 */
  const statusDot: Record<BadgeTone, string> = {
    gray: "bg-brand-muted",
    blue: "bg-brand-primary",
    green: "bg-brand-success",
    amber: "bg-brand-warning",
    red: "bg-brand-error",
    purple: "bg-[#B9A8FF]",
  };

  const TODO_LEVEL: Record<"high" | "normal" | "low", { count: string; rail: string; tag?: string }> = {
    high: { count: "text-brand-error", rail: "bg-brand-error", tag: "먼저" },
    normal: { count: "text-brand-warning", rail: "bg-brand-warning" },
    // 진한 남색(brand-dark)은 대비가 세서 주황보다 오히려 눈에 먼저 든다.
    // 가장 덜 급한 칸이므로 한 단계 물러난 text-sub 를 쓴다.
    low: { count: "text-brand-sub", rail: "bg-brand-border" },
  };

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

  // 이번 달 / 지난달 매출 — monthlySeries 는 12개월 스캐폴드라 끝 두 칸이 이번 달·지난달이다
  const thisMonthRevenue = monthlySeries[monthlySeries.length - 1]?.amount ?? 0;
  const lastMonthRevenue = monthlySeries[monthlySeries.length - 2]?.amount ?? 0;
  const monthDelta =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null;

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
    /*
     * 콘솔 다크 테마 — globals.css 의 `.console` 블록이 색을 덮는다.
     * 바닥은 `.console::before` 가 뷰포트에 고정해 깐다.
     * 되돌리려면 이 래퍼의 클래스만 떼면 된다.
     */
    <div className="console min-h-screen">
      <div className="flex items-end justify-between gap-4 mb-4 md:mb-5">
        <PageTitle title="대시보드" description="플랫폼 핵심 지표 현황" />
        {/* 운영 콘솔이면 "지금 보는 값이 언제 것인지"가 항상 보여야 한다 */}
        <div className="pb-1 shrink-0">
          <LastUpdated />
        </div>
      </div>

      {/* 지표 — 값 + 최근 14일 추세 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 md:mb-5">
        <MetricCard
          label="오늘 매출"
          metricKey="REV/D"
          value={formatNumber(todayRevenue)}
          unit="원"
          delta={revenueDelta}
          sub={`어제 ${formatKRW(yesterdayRevenue)}`}
          series={revenueSeries.map((r) => r.amount)}
          tone="text-brand-primary"
        />
        <MetricCard
          label="전체 회원"
          metricKey="USERS"
          value={formatNumber(totalUsers)}
          unit="명"
          sub={`오늘 +${formatNumber(signupSummary.today)} · 이번 달 +${formatNumber(signupSummary.thisMonth)}`}
          series={cumulative(signupDailySeries.map((r) => r.count), totalUsers)}
          tone="text-[#7C5CE0]"
        />
        <MetricCard
          label="진행중 캠페인"
          metricKey="CAMP/ACTIVE"
          value={formatNumber(running)}
          unit="건"
          sub={`전체 ${formatNumber(totalCampaigns)}건`}
          tone="text-brand-success"
        />
        {/*
          이 자리에는 "승인 대기" 건수가 있었는데, 바로 아래 처리 대기의
          "캠페인 승인 대기"와 같은 숫자였다. 지표 행과 할 일 영역이 섞여
          같은 값을 두 번 보여주던 것이라, 지표 행은 지표만 갖게 한다.
          승인 대기는 아래에서 빨강 + "먼저" 표시로 더 강하게 드러난다.
        */}
        <MetricCard
          label="이번 달 매출"
          metricKey="REV/M"
          value={formatNumber(thisMonthRevenue)}
          unit="원"
          delta={monthDelta}
          sub={`지난달 ${formatKRW(lastMonthRevenue)}`}
          series={monthlySeries.map((m) => m.amount)}
          tone="text-brand-warning"
        />
      </div>

      {/* 처리 대기 — 대시보드 최상단 강조 영역 */}
      <section className="rounded-xl border border-brand-border bg-white overflow-hidden mb-4 md:mb-5">
        <div
          className="flex items-center justify-between gap-4 px-5 py-4 text-white"
          style={{ background: "var(--gradient-point-wide)" }}
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
          <div className="flex items-baseline gap-3 leading-none">
            {todoUrgent > 0 && (
              <span className="flex items-baseline gap-1 rounded-lg bg-white/15 px-2.5 py-1.5">
                <span className="text-[12px] text-white/70">먼저</span>
                <span className="text-[15px] font-extrabold"><Num>{formatNumber(todoUrgent)}</Num></span>
                <span className="text-[11px] text-white/70">건</span>
              </span>
            )}
            <span className="whitespace-nowrap">
              <span className="text-[30px] font-extrabold"><Num>{formatNumber(todoTotal)}</Num></span>
              <span className="text-[13px] text-white/70 ml-1">건</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-brand-border">
          {TODO_ITEMS.map((item) => {
            const waiting = item.count > 0;
            const level = TODO_LEVEL[item.level];
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`group relative p-4 pt-[18px] transition-colors ${
                  waiting ? "hover:bg-brand-light" : "hover:bg-brand-light/60"
                }`}
              >
                {/* 대기 중인 칸만 위쪽에 색 띠를 둬 훑을 때 급한 열이 먼저 잡히게 한다 */}
                {waiting && (
                  <span className={`absolute inset-x-0 top-0 h-[3px] ${level.rail}`} aria-hidden />
                )}

                <div className="flex items-start justify-between gap-1.5">
                  <p
                    className={`text-[12.5px] font-semibold leading-snug ${
                      waiting ? "text-brand-dark" : "text-brand-muted"
                    }`}
                  >
                    {item.label}
                  </p>
                  {/* 색만으로 구분하지 않는다 — 급한 칸에는 글자로도 표시한다 */}
                  {waiting && level.tag && (
                    <span className="shrink-0 rounded-md bg-brand-error-bg px-1.5 py-0.5 text-[10.5px] font-bold text-brand-error leading-none">
                      {level.tag}
                    </span>
                  )}
                </div>

                <p
                  className={`text-[28px] font-extrabold mt-1.5 leading-none ${
                    waiting ? level.count : "text-brand-border"
                  }`}
                >
                  <Num>{formatNumber(item.count)}</Num>
                </p>
                <p
                  className={`text-[11.5px] mt-1.5 transition-colors ${
                    waiting
                      ? "text-brand-sub group-hover:text-brand-primary"
                      : "text-brand-muted/70"
                  }`}
                >
                  {waiting ? `${item.hint} →` : "대기 없음"}
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
              /*
               * 로그 스타일 — 표 대신 한 줄에 시각·주체·대상·금액·상태를 흘린다.
               * 운영자가 위에서 아래로 훑으며 "언제 무슨 일이 있었나"를 읽는 자리라
               * 표의 격자보다 로그의 줄이 맞는다. 시각·금액은 모노라 자릿수가 맞고,
               * 상태는 알약 배지 대신 점으로 줄여 줄의 무게를 글자 쪽에 남긴다.
               */
              <div className="px-2 pb-2">
                <div className="flex items-center gap-3 px-3 py-2 text-[10.5px] font-semibold text-brand-muted border-b border-brand-border">
                  <span className="w-[74px] shrink-0"><Num className="tracking-[0.08em]">DATE</Num></span>
                  <span className="w-[88px] shrink-0"><Num className="tracking-[0.08em]">USER</Num></span>
                  <span className="flex-1 min-w-0"><Num className="tracking-[0.08em]">PRODUCT</Num></span>
                  <span className="w-[104px] shrink-0 text-right"><Num className="tracking-[0.08em]">AMOUNT</Num></span>
                  <span className="w-[88px] shrink-0"><Num className="tracking-[0.08em]">STATUS</Num></span>
                </div>

                {recentCampaigns.map((c) => {
                  const meta = campaignStatusMeta[c.status] ?? { label: c.status, tone: "gray" as BadgeTone };
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2.5 text-[13px] border-b border-brand-border/60 last:border-0 hover:bg-brand-light transition-colors"
                    >
                      <span className="w-[74px] shrink-0 text-brand-muted">
                        <Num>{formatDate(c.createdAt).replace(/^\d{4}\.\s*/, "").replace(/\.$/, "")}</Num>
                      </span>
                      <span className="w-[88px] shrink-0 font-semibold text-brand-dark truncate">{c.userName ?? "-"}</span>
                      <span className="flex-1 min-w-0 text-brand-text truncate">{c.productTitle ?? "-"}</span>
                      <span className="w-[104px] shrink-0 text-right font-semibold text-brand-dark">
                        <Num>{formatNumber(c.quotedAmount)}</Num>
                        <span className="text-brand-muted ml-0.5">원</span>
                      </span>
                      <span className="w-[88px] shrink-0 flex items-center gap-1.5 text-[12px] text-brand-sub">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[meta.tone]}`} />
                        <span className="truncate">{meta.label}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
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

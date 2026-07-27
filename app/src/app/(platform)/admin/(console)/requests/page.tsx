import { db } from "@/db";
import { serviceRequests, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { parsePeriod, periodRange, periodLabel } from "@/lib/period-filter";
import { RequestsClient, type ServiceRequestRow } from "./RequestsClient";

export const dynamic = "force-dynamic";

// 신청 회원(users)과 담당 관리자(users)를 같은 쿼리에서 조인하려면 별칭이 필요하다
const assignedAdmin = alias(users, "assigned_admin");

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const range = periodRange(period);
  /**
   * 신청 건은 계속 쌓이므로 연/월/일을 고르면 SQL 에서 신청일(KST) 기준으로 걸러 온다.
   * (요약 카드도 같은 조건을 쓴다 — 목록과 숫자가 어긋나면 읽을 수 없다)
   */
  const requestedDate = sql`(${serviceRequests.createdAt} at time zone 'Asia/Seoul')::date`;
  const periodFilter = range
    ? sql`${requestedDate} between ${range.start}::date and ${range.end}::date`
    : undefined;

  const [rows, summaryRow, yearRows] = await Promise.all([
    db
      .select({
        id: serviceRequests.id,
        userName: users.name,
        userEmail: users.email,
        category: serviceRequests.category,
        serviceKey: serviceRequests.serviceKey,
        serviceName: serviceRequests.serviceName,
        inputs: serviceRequests.inputs,
        quotedAmount: serviceRequests.quotedAmount,
        status: serviceRequests.status,
        contact: serviceRequests.contact,
        adminMemo: serviceRequests.adminMemo,
        createdAt: serviceRequests.createdAt,
        // 담당자 = 상담·처리를 맡은 관리자
        assignedAdminName: assignedAdmin.name,
      })
      .from(serviceRequests)
      .leftJoin(users, eq(serviceRequests.userId, users.id))
      .leftJoin(assignedAdmin, eq(serviceRequests.assignedAdminId, assignedAdmin.id))
      .where(periodFilter)
      .orderBy(desc(serviceRequests.createdAt))
      .limit(300),
    db
      .select({
        total: sql<number>`count(*)::int`,
        requested: sql<number>`count(*) filter (where ${serviceRequests.status} = 'requested')::int`,
        inProgress: sql<number>`count(*) filter (where ${serviceRequests.status} in ('reviewing','quoted','in_progress'))::int`,
        quoted: sql<number>`coalesce(sum(${serviceRequests.quotedAmount}) filter (where ${serviceRequests.status} <> 'canceled'), 0)::float`,
      })
      .from(serviceRequests)
      .where(periodFilter),
    // 기간 선택지는 화면에 로드된 행이 아니라 전체 데이터에서 뽑는다
    db
      .selectDistinct({
        year: sql<number>`extract(year from (${serviceRequests.createdAt} at time zone 'Asia/Seoul'))::int`,
      })
      .from(serviceRequests),
  ]);

  const summary = summaryRow[0];
  const years = yearRows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);

  const data: ServiceRequestRow[] = rows.map((r) => ({
    id: r.id,
    userName: r.userName ?? "(탈퇴 회원)",
    userEmail: r.userEmail ?? "-",
    category: r.category,
    serviceKey: r.serviceKey,
    serviceName: r.serviceName,
    inputs: (r.inputs ?? {}) as Record<string, unknown>,
    quotedAmount: Number(r.quotedAmount),
    status: r.status,
    assignedAdminName: r.assignedAdminName ?? "",
    contact: r.contact,
    adminMemo: r.adminMemo,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle
        title="서비스 신청내역"
        description="퍼포먼스 마케팅 · 바이럴 커뮤니티 · 콘텐츠 전 페이지의 신청 건을 한 곳에서 확인합니다."
      />

      {/* 요약 카드도 아래 기간 필터를 따라간다 — 어떤 기간의 숫자인지 함께 적는다 */}
      <p className="text-[13px] font-semibold text-brand-sub mb-2">{periodLabel(period)} 기준</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="전체 신청" value={`${summary?.total ?? 0}건`} tone="blue" />
        <StatCard label="신규 접수" value={`${summary?.requested ?? 0}건`} tone="amber" />
        <StatCard label="진행중" value={`${summary?.inProgress ?? 0}건`} tone="green" />
        <StatCard label="견적 합계" value={formatKRW(summary?.quoted)} tone="purple" />
      </div>

      <RequestsClient rows={data} years={years} period={period} />
    </div>
  );
}

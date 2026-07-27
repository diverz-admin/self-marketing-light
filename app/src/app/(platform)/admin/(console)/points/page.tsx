import { db } from "@/db";
import { pointCharges, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { PointsClient, type PointChargeRow, type UserOption } from "./PointsClient";

export const dynamic = "force-dynamic";

export default async function AdminPointsPage() {
  const [rows, summaryRow, userRows] = await Promise.all([
    db
      .select({
        id: pointCharges.id,
        userId: pointCharges.userId,
        userName: users.name,
        userEmail: users.email,
        amount: pointCharges.amount,
        bonusAmount: pointCharges.bonusAmount,
        method: pointCharges.method,
        depositorName: pointCharges.depositorName,
        receiptType: pointCharges.receiptType,
        status: pointCharges.status,
        memo: pointCharges.memo,
        createdAt: pointCharges.createdAt,
        processedAt: pointCharges.processedAt,
      })
      .from(pointCharges)
      .leftJoin(users, eq(pointCharges.userId, users.id))
      // 처리해야 할 입금대기를 항상 맨 앞으로, 그 다음 최신순
      .orderBy(sql`case when ${pointCharges.status} = 'requested' then 0 else 1 end`, desc(pointCharges.createdAt))
      .limit(500),
    db
      .select({
        waiting: sql<number>`count(*) filter (where ${pointCharges.status} = 'requested')::int`,
        waitingAmount: sql<number>`coalesce(sum(${pointCharges.amount}) filter (where ${pointCharges.status} = 'requested'), 0)::float`,
        approvedAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved'), 0)::float`,
        monthAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved' and ${pointCharges.createdAt} >= date_trunc('month', now())), 0)::float`,
      })
      .from(pointCharges),
    db
      .select({ id: users.id, name: users.name, email: users.email, creditBalance: users.creditBalance })
      .from(users)
      .orderBy(users.name)
      .limit(500),
  ]);

  const summary = summaryRow[0];

  const data: PointChargeRow[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName ?? "(탈퇴 회원)",
    userEmail: r.userEmail ?? "-",
    amount: Number(r.amount),
    bonusAmount: Number(r.bonusAmount),
    method: r.method,
    depositorName: r.depositorName,
    receiptType: r.receiptType,
    status: r.status,
    memo: r.memo,
    createdAt: r.createdAt.toISOString(),
    processedAt: r.processedAt?.toISOString() ?? null,
  }));

  const userOptions: UserOption[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    creditBalance: Number(u.creditBalance),
  }));

  return (
    <div>
      <PageTitle
        title="포인트충전"
        description="입금 확인 후 승인하면 회원 포인트가 즉시 지급됩니다."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="입금대기" value={`${summary?.waiting ?? 0}건`} sub={formatKRW(summary?.waitingAmount)} tone="amber" />
        <StatCard label="이번 달 충전액" value={formatKRW(summary?.monthAmount)} tone="blue" />
        <StatCard label="누적 충전액" value={formatKRW(summary?.approvedAmount)} tone="green" />
        <StatCard label="충전 신청 건수" value={`${data.length}건`} tone="gray" />
      </div>

      <PointsClient rows={data} users={userOptions} />
    </div>
  );
}

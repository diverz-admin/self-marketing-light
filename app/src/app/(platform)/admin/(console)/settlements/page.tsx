import { db } from "@/db";
import { settlements, suppliers, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { SettlementsClient, type AdminSettlementRow } from "./SettlementsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettlementsPage() {
  const [rows, sums] = await Promise.all([
    db
      .select({
        id: settlements.id,
        period: settlements.period,
        amount: settlements.amount,
        status: settlements.status,
        createdAt: settlements.createdAt,
        supplierName: users.name,
        channelType: suppliers.channelType,
      })
      .from(settlements)
      .leftJoin(suppliers, eq(settlements.supplierId, suppliers.id))
      .leftJoin(users, eq(suppliers.userId, users.id))
      .orderBy(desc(settlements.period), desc(settlements.createdAt)),
    db
      .select({
        pending: sql<number>`coalesce(sum(${settlements.amount}) filter (where ${settlements.status} <> 'completed'),0)::float`,
        completed: sql<number>`coalesce(sum(${settlements.amount}) filter (where ${settlements.status} = 'completed'),0)::float`,
      })
      .from(settlements),
  ]);

  const data: AdminSettlementRow[] = rows.map((r) => ({
    id: r.id,
    period: r.period,
    amount: Number(r.amount),
    status: r.status,
    supplierName: r.supplierName ?? "-",
    channelType: r.channelType ?? "",
  }));

  const s = sums[0] ?? { pending: 0, completed: 0 };

  return (
    <div>
      <PageTitle title="정산 관리" description={`공급자 정산 ${data.length}건`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
        <StatCard label="미정산 잔액" value={formatKRW(s.pending)} tone="amber" />
        <StatCard label="정산 완료" value={formatKRW(s.completed)} tone="green" />
        <StatCard label="총 정산 규모" value={formatKRW(s.pending + s.completed)} tone="blue" />
      </div>
      <SettlementsClient rows={data} />
    </div>
  );
}

import { db } from "@/db";
import { orders, users, campaigns, products } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { OrdersClient, type AdminOrderRow } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const [rows, sums] = await Promise.all([
    db
      .select({
        id: orders.id,
        amount: orders.amount,
        method: orders.method,
        pgTxId: orders.pgTxId,
        status: orders.status,
        createdAt: orders.createdAt,
        userName: users.name,
        userEmail: users.email,
        productTitle: products.title,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(campaigns, eq(orders.campaignId, campaigns.id))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .orderBy(desc(orders.createdAt)),
    db
      .select({
        paid: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} = 'paid'),0)::float`,
        refunded: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} in ('refunded','partial_refund')),0)::float`,
        count: sql<number>`count(*)::int`,
      })
      .from(orders),
  ]);

  const data: AdminOrderRow[] = rows.map((o) => ({
    id: o.id,
    amount: Number(o.amount),
    method: o.method ?? "",
    pgTxId: o.pgTxId ?? "",
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    userName: o.userName ?? "-",
    userEmail: o.userEmail ?? "",
    productTitle: o.productTitle ?? "-",
  }));

  const s = sums[0] ?? { paid: 0, refunded: 0, count: 0 };

  return (
    <div>
      <PageTitle title="주문 / 결제" description={`전체 ${data.length}건`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-5">
        <StatCard label="총 결제액" value={formatKRW(s.paid)} tone="green" />
        <StatCard label="환불액" value={formatKRW(s.refunded)} tone="red" />
        <StatCard label="순매출" value={formatKRW(s.paid - s.refunded)} tone="blue" />
      </div>
      <OrdersClient rows={data} />
    </div>
  );
}

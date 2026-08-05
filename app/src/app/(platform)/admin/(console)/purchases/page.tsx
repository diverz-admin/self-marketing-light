import { db } from "@/db";
import { purchaseOrders, users, couponRedemptions, pointCharges } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { loadPurchaseTargets } from "@/lib/purchase-targets";
import { PurchasesClient, type PurchaseLine } from "./PurchasesClient";

export const dynamic = "force-dynamic";

/**
 * 발주 관리.
 *
 * 고객이 /marketing 에서 신청하면 상품 종류별 테이블에 쌓인다.
 * 이 화면은 그 신청 건을 한 줄씩 모아 놓고, 각 건을 어느 업체에 얼마로 발주했는지 붙인다.
 * 신청(매출) 옆에 발주(매입)가 붙어야 마진이 보인다.
 */
export default async function AdminPurchasesPage() {
  const [targets, purchaseRows, couponSum, pointSum] = await Promise.all([
    loadPurchaseTargets(),
    db
      .select({
        id: purchaseOrders.id,
        sourceType: purchaseOrders.sourceType,
        sourceId: purchaseOrders.sourceId,
        vendorName: purchaseOrders.vendorName,
        vendorContact: purchaseOrders.vendorContact,
        title: purchaseOrders.title,
        quantity: purchaseOrders.quantity,
        purchaseAmount: purchaseOrders.purchaseAmount,
        status: purchaseOrders.status,
        settleStatus: purchaseOrders.settleStatus,
        orderedAt: purchaseOrders.orderedAt,
        settledAt: purchaseOrders.settledAt,
        memo: purchaseOrders.memo,
        adminName: users.name,
        createdAt: purchaseOrders.createdAt,
      })
      .from(purchaseOrders)
      .leftJoin(users, eq(purchaseOrders.createdByAdminId, users.id))
      .orderBy(desc(purchaseOrders.createdAt))
      .limit(1000),
    db
      .select({ total: sql<number>`coalesce(sum(${couponRedemptions.discountAmount}), 0)::float` })
      .from(couponRedemptions),
    db
      .select({ total: sql<number>`coalesce(sum(${pointCharges.bonusAmount}), 0)::float` })
      .from(pointCharges)
      .where(eq(pointCharges.status, "approved")),
  ]);

  // 신청 건에 발주를 붙인다 (한 건을 여러 업체에 나눠 발주할 수 있어 배열로 담는다)
  const bySource = new Map<string, typeof purchaseRows>();
  for (const p of purchaseRows) {
    if (!p.sourceId) continue;
    const list = bySource.get(p.sourceId) ?? [];
    list.push(p);
    bySource.set(p.sourceId, list);
  }

  const lines: PurchaseLine[] = targets.map((t) => {
    const purchases = (bySource.get(t.sourceId) ?? []).map((p) => ({
      id: p.id,
      vendorName: p.vendorName,
      vendorContact: p.vendorContact,
      title: p.title,
      quantity: p.quantity,
      purchaseAmount: Number(p.purchaseAmount),
      status: p.status,
      settleStatus: p.settleStatus,
      orderedAt: p.orderedAt,
      settledAt: p.settledAt,
      memo: p.memo,
      adminName: p.adminName ?? "",
    }));
    return { ...t, purchases };
  });

  return (
    <div>
      <PageTitle
        title="발주 관리"
        description="고객이 신청한 건을 확인하고 업체에 발주합니다. 신청(매출)과 발주(매입)를 한 줄에서 봅니다."
      />
      <PurchasesClient
        lines={lines}
        couponUsed={couponSum[0]?.total ?? 0}
        pointGranted={pointSum[0]?.total ?? 0}
      />
    </div>
  );
}

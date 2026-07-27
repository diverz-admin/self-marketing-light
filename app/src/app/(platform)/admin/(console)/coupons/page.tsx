import { db } from "@/db";
import { coupons, couponRedemptions, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { PageTitle, StatCard } from "@/components/admin/ui";
import { formatKRW } from "@/lib/admin-format";
import { CouponsClient, type CouponRow, type RedemptionRow } from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const [rows, redemptionRows, summaryRow] = await Promise.all([
    db.select().from(coupons).orderBy(desc(coupons.createdAt)).limit(300),
    db
      .select({
        id: couponRedemptions.id,
        couponId: couponRedemptions.couponId,
        couponName: coupons.name,
        couponCode: coupons.code,
        userName: users.name,
        userEmail: users.email,
        discountAmount: couponRedemptions.discountAmount,
        usedAt: couponRedemptions.usedAt,
      })
      .from(couponRedemptions)
      .leftJoin(coupons, eq(couponRedemptions.couponId, coupons.id))
      .leftJoin(users, eq(couponRedemptions.userId, users.id))
      .orderBy(desc(couponRedemptions.usedAt))
      .limit(300),
    db
      .select({
        active: sql<number>`count(*) filter (where ${coupons.isActive})::int`,
        totalIssued: sql<number>`coalesce(sum(${coupons.issuedCount}), 0)::int`,
        totalUsed: sql<number>`coalesce(sum(${coupons.usedCount}), 0)::int`,
      })
      .from(coupons),
  ]);

  const discountSum = redemptionRows.reduce((acc, r) => acc + Number(r.discountAmount), 0);
  const summary = summaryRow[0];

  const data: CouponRow[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    description: c.description,
    discountType: c.discountType,
    discountValue: Number(c.discountValue),
    minOrderAmount: Number(c.minOrderAmount),
    maxDiscountAmount: c.maxDiscountAmount != null ? Number(c.maxDiscountAmount) : null,
    totalQuota: c.totalQuota,
    issuedCount: c.issuedCount,
    usedCount: c.usedCount,
    startsAt: c.startsAt?.toISOString() ?? null,
    endsAt: c.endsAt?.toISOString() ?? null,
    isActive: c.isActive,
  }));

  const redemptions: RedemptionRow[] = redemptionRows.map((r) => ({
    id: r.id,
    couponName: r.couponName ?? "(삭제된 쿠폰)",
    couponCode: r.couponCode ?? "-",
    userName: r.userName ?? "(탈퇴 회원)",
    userEmail: r.userEmail ?? "-",
    discountAmount: Number(r.discountAmount),
    usedAt: r.usedAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle title="쿠폰" description="쿠폰 금액을 정의하고 발급·사용 현황을 확인합니다." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="활성 쿠폰" value={`${summary?.active ?? 0}개`} tone="green" />
        <StatCard label="총 발급" value={`${summary?.totalIssued ?? 0}건`} tone="blue" />
        <StatCard label="총 사용" value={`${summary?.totalUsed ?? 0}건`} tone="purple" />
        <StatCard label="누적 할인액" value={formatKRW(discountSum)} tone="amber" />
      </div>

      <CouponsClient rows={data} redemptions={redemptions} />
    </div>
  );
}

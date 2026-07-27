import { db } from "@/db";
import { credits, pointCharges } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";

/**
 * 보유 포인트 = 크레딧 원장(credits) 합계.
 * 관리자가 충전 신청을 승인하면 credits 에 +행이 쌓이므로, 이 합계가 곧 화면 잔액이다.
 */
export async function loadPointBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
    .from(credits)
    .where(eq(credits.userId, userId));

  return row?.balance ?? 0;
}

export type PointChargeRow = {
  id: string;
  date: string;
  amount: number;
  bonusAmount: number;
  method: string;
  depositorName: string | null;
  receiptType: string | null;
  status: string;
};

/** 본인 충전 신청 내역 — 어드민 "포인트충전" 화면과 같은 행을 본다 */
export async function loadMyPointCharges(userId: string): Promise<PointChargeRow[]> {
  const rows = await db
    .select()
    .from(pointCharges)
    .where(eq(pointCharges.userId, userId))
    .orderBy(desc(pointCharges.createdAt))
    .limit(100);

  return rows.map((c) => ({
    id: c.id,
    date: c.createdAt.toISOString().slice(0, 10),
    amount: Number(c.amount),
    bonusAmount: Number(c.bonusAmount),
    method: c.method,
    depositorName: c.depositorName,
    receiptType: c.receiptType,
    status: c.status,
  }));
}

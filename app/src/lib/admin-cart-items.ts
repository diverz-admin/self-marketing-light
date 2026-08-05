import { db } from "@/db";
import { adminCartItems } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { adminCartProduct } from "@/lib/admin-cart";

/** 고객 장바구니에 보이는 "관리자가 담아준 상품" 한 줄 */
export type AdminCartLineItem = {
  id: string;
  title: string;
  group: string;
  target: string | null;
  note: string | null;
  quantity: number;
  amount: number;
};

/** 아직 결제하지 않은 건만 장바구니에 보인다 */
export async function loadAdminCartItems(userId: string): Promise<AdminCartLineItem[]> {
  const rows = await db
    .select()
    .from(adminCartItems)
    .where(and(eq(adminCartItems.userId, userId), eq(adminCartItems.status, "pending")))
    .orderBy(asc(adminCartItems.createdAt));

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    group: adminCartProduct(r.productKey)?.group ?? "상담",
    target: r.target,
    note: r.note,
    quantity: r.quantity,
    amount: Number(r.amount),
  }));
}

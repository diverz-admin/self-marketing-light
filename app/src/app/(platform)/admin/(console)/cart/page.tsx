import { db } from "@/db";
import { adminCartItems, users, memberProfiles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PageTitle } from "@/components/admin/ui";
import { AdminCartClient, type AdminCartRow, type UserOption } from "./AdminCartClient";

export const dynamic = "force-dynamic";

// 담아준 회원과 담아준 관리자를 같은 쿼리에서 조인하려면 별칭이 필요하다
const createdByAdmin = alias(users, "created_by_admin");

export default async function AdminCartPage() {
  const [rows, userRows] = await Promise.all([
    db
      .select({
        id: adminCartItems.id,
        userId: adminCartItems.userId,
        userName: users.name,
        userEmail: users.email,
        orgName: memberProfiles.orgName,
        phone: memberProfiles.phone,
        adminName: createdByAdmin.name,
        productKey: adminCartItems.productKey,
        title: adminCartItems.title,
        target: adminCartItems.target,
        note: adminCartItems.note,
        quantity: adminCartItems.quantity,
        amount: adminCartItems.amount,
        status: adminCartItems.status,
        orderedAt: adminCartItems.orderedAt,
        createdAt: adminCartItems.createdAt,
      })
      .from(adminCartItems)
      .leftJoin(users, eq(adminCartItems.userId, users.id))
      .leftJoin(memberProfiles, eq(adminCartItems.userId, memberProfiles.userId))
      .leftJoin(createdByAdmin, eq(adminCartItems.createdByAdminId, createdByAdmin.id))
      .orderBy(desc(adminCartItems.createdAt))
      .limit(300),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(users.name).limit(500),
  ]);

  const data: AdminCartRow[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    advertiser: r.orgName ?? r.userName ?? "-",
    userName: r.userName ?? "(탈퇴 회원)",
    userPhone: r.phone ?? "",
    adminName: r.adminName ?? "",
    productKey: r.productKey,
    title: r.title,
    target: r.target,
    note: r.note,
    quantity: r.quantity,
    amount: Number(r.amount),
    status: r.status,
    orderedAt: r.orderedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  const userOptions: UserOption[] = userRows.map((u) => ({ id: u.id, name: u.name, email: u.email }));

  return (
    <div>
      <PageTitle
        title="장바구니 담아주기"
        description="문의로 들어온 보장형·콘텐츠 상품을 회원 장바구니에 바로 넣어 줍니다. 회원은 장바구니에서 결제만 하면 됩니다."
      />
      <AdminCartClient rows={data} users={userOptions} />
    </div>
  );
}

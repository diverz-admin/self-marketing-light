import { db } from "@/db";
import { adminCartItems, users, memberProfiles } from "@/db/schema";
import { desc, eq, isNotNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { PageTitle } from "@/components/admin/ui";
import { parsePeriod, periodRange } from "@/lib/period-filter";
import { AdminCartClient, type AdminCartRow, type UserOption } from "./AdminCartClient";

export const dynamic = "force-dynamic";

// 담아준 회원과 담아준 관리자를 같은 쿼리에서 조인하려면 별칭이 필요하다
const createdByAdmin = alias(users, "created_by_admin");

export default async function AdminCartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const range = periodRange(period);
  /**
   * 결제완료 건은 계속 쌓이므로 연/월/일을 고르면 결제일(KST) 기준으로 걸러 온다.
   * 아직 담아둔 건은 결제일이 없으니 기간과 무관하게 그대로 둔다 — 담아둔 목록은 늘 전부 보여야 한다.
   */
  const orderedDate = sql`(${adminCartItems.orderedAt} at time zone 'Asia/Seoul')::date`;
  const periodFilter = range
    ? sql`${adminCartItems.status} <> 'ordered' or ${orderedDate} between ${range.start}::date and ${range.end}::date`
    : undefined;

  const [rows, userRows, yearRows] = await Promise.all([
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
      .where(periodFilter)
      .orderBy(desc(adminCartItems.createdAt))
      .limit(300),
    // 담을 회원은 업체명으로 찾는다 — 가입 정보(업체명·연락처)를 함께 가져온다
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        orgName: memberProfiles.orgName,
        phone: memberProfiles.phone,
      })
      .from(users)
      .leftJoin(memberProfiles, eq(memberProfiles.userId, users.id))
      .orderBy(users.name)
      .limit(500),
    // 기간 선택지는 화면에 로드된 행이 아니라 결제된 전체 건에서 뽑는다
    db
      .selectDistinct({
        year: sql<number>`extract(year from (${adminCartItems.orderedAt} at time zone 'Asia/Seoul'))::int`,
      })
      .from(adminCartItems)
      .where(isNotNull(adminCartItems.orderedAt)),
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

  const years = yearRows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);

  const userOptions: UserOption[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    orgName: u.orgName ?? "",
    phone: u.phone ?? "",
  }));

  return (
    <div>
      <PageTitle
        title="장바구니 담아주기"
        description="문의로 들어온 보장형·콘텐츠 상품을 회원 장바구니에 바로 넣어 줍니다. 회원은 장바구니에서 결제만 하면 됩니다."
      />
      <AdminCartClient rows={data} users={userOptions} years={years} period={period} />
    </div>
  );
}

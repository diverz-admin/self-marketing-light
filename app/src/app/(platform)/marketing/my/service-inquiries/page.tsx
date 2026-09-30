import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { serviceRequests } from "@/db/schema";
import { viewerId } from "@/lib/viewer";
import ServiceInquiriesView, { type ServiceInquiry } from "./ServiceInquiriesView";

export const dynamic = "force-dynamic";

/** 신청일은 KST 날짜로 보여준다 — 자정 무렵 신청이 전날로 찍히지 않게 */
const kstDate = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);

export default async function ServiceInquiriesPage() {
  const userId = await viewerId();

  // 상담으로 접수한 추가 서비스 — 어드민 "서비스 신청내역"과 같은 행을 본인 것만 본다
  const rows = await db
    .select({
      id: serviceRequests.id,
      serviceName: serviceRequests.serviceName,
      status: serviceRequests.status,
      quotedAmount: serviceRequests.quotedAmount,
      createdAt: serviceRequests.createdAt,
    })
    .from(serviceRequests)
    .where(eq(serviceRequests.userId, userId))
    .orderBy(desc(serviceRequests.createdAt));

  const items: ServiceInquiry[] = rows.map((r) => ({
    id: r.id,
    serviceName: r.serviceName,
    status: r.status,
    quotedAmount: Number(r.quotedAmount),
    requestedAt: kstDate(r.createdAt),
  }));

  return <ServiceInquiriesView items={items} />;
}

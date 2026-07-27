import { db } from "@/db";
import { campaigns, users, products, businesses, campaignEvents } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { CampaignsClient, type AdminCampaignRow } from "./CampaignsClient";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const [rows, deliveredRows] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        status: campaigns.status,
        inputs: campaigns.inputs,
        totalQty: campaigns.totalQty,
        dailyQty: campaigns.dailyQty,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        quotedAmount: campaigns.quotedAmount,
        paidAmount: campaigns.paidAmount,
        createdAt: campaigns.createdAt,
        userName: users.name,
        userEmail: users.email,
        productTitle: products.title,
        businessName: businesses.name,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.userId, users.id))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .leftJoin(businesses, eq(campaigns.businessId, businesses.id))
      .orderBy(desc(campaigns.createdAt)),
    db
      .select({ campaignId: campaignEvents.campaignId, delivered: sql<number>`sum(${campaignEvents.deliveredQty})::int` })
      .from(campaignEvents)
      .groupBy(campaignEvents.campaignId),
  ]);

  const delMap = new Map(deliveredRows.map((r) => [r.campaignId, r.delivered]));

  const data: AdminCampaignRow[] = rows.map((c) => {
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      status: c.status,
      keyword: typeof inputs.keyword === "string" ? inputs.keyword : "",
      region: typeof inputs.region === "string" ? inputs.region : "",
      totalQty: c.totalQty,
      dailyQty: c.dailyQty,
      delivered: delMap.get(c.id) ?? 0,
      startDate: c.startDate,
      endDate: c.endDate,
      quotedAmount: Number(c.quotedAmount),
      paidAmount: Number(c.paidAmount ?? 0),
      createdAt: c.createdAt.toISOString(),
      userName: c.userName ?? "-",
      userEmail: c.userEmail ?? "",
      productTitle: c.productTitle ?? "-",
      businessName: c.businessName ?? "-",
    };
  });

  return (
    <div>
      <PageTitle title="캠페인 관리" description={`전체 ${data.length}건 · 승인/검수 및 상태 관리`} />
      <CampaignsClient rows={data} />
    </div>
  );
}

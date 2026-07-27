import { db } from "@/db";
import { products, campaigns } from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { ProductsClient, type AdminProductRow } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [rows, campCountRows] = await Promise.all([
    db
      .select({
        id: products.id,
        productType: products.productType,
        title: products.title,
        description: products.description,
        unit: products.unit,
        unitPrice: products.unitPrice,
        minQty: products.minQty,
        maxQty: products.maxQty,
        estDurationDays: products.estDurationDays,
        isActive: products.isActive,
      })
      .from(products)
      .orderBy(desc(products.isActive), desc(products.createdAt)),
    db.select({ productId: campaigns.productId, count: sql<number>`count(*)::int` }).from(campaigns).groupBy(campaigns.productId),
  ]);

  const campMap = new Map(campCountRows.map((r) => [r.productId, r.count]));
  const data: AdminProductRow[] = rows.map((p) => ({
    id: p.id,
    productType: p.productType,
    title: p.title,
    description: p.description ?? "",
    unit: p.unit,
    unitPrice: Number(p.unitPrice),
    minQty: p.minQty,
    maxQty: p.maxQty,
    estDurationDays: p.estDurationDays,
    isActive: p.isActive,
    campaignCount: campMap.get(p.id) ?? 0,
  }));

  return (
    <div>
      <PageTitle title="상품 관리" description={`전체 ${data.length}개 · 카탈로그 및 판매 상태`} />
      <ProductsClient rows={data} />
    </div>
  );
}

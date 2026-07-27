import { db } from "@/db";
import { products, campaigns } from "@/db/schema";
import { sql, desc, and, or, inArray, isNull } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { REWARD_CATEGORY_KEYS } from "@/lib/admin-format";
import { ProductsClient, type AdminProductRow } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [rows, campCountRows] = await Promise.all([
    db
      .select({
        id: products.id,
        productType: products.productType,
        category: products.category,
        title: products.title,
        description: products.description,
        unit: products.unit,
        unitPrice: products.unitPrice,
        minQty: products.minQty,
        maxQty: products.maxQty,
        estDurationDays: products.estDurationDays,
        channel: products.channel,
        efficiency: products.efficiency,
        avgRankUpRate: products.avgRankUpRate,
        subscriptionInfo: products.subscriptionInfo,
        tier: products.tier,
        subtitle: products.subtitle,
        thumbnailUrl: products.thumbnailUrl,
        thumbnailPath: products.thumbnailPath,
        badgeInitial: products.badgeInitial,
        badgeColor: products.badgeColor,
        isSale: products.isSale,
        isRecommended: products.isRecommended,
        rankUpUserRate: products.rankUpUserRate,
        rankBefore: products.rankBefore,
        rankAfter: products.rankAfter,
        orderCutoffTime: products.orderCutoffTime,
        sameDayStart: products.sameDayStart,
        minRunDays: products.minRunDays,
        isActive: products.isActive,
      })
      .from(products)
      // 리워드 카테고리 + 미분류(레거시)만 — 리뷰/체험단 상품은 /admin/review/products 에서 관리한다.
      // 쿠팡 리뷰처럼 카테고리가 비는 리뷰 상품이 섞이지 않도록 reviewType 이 있는 건 제외한다.
      .where(
        or(
          inArray(products.category, REWARD_CATEGORY_KEYS),
          and(isNull(products.category), isNull(products.reviewType)),
        ),
      )
      .orderBy(desc(products.isActive), desc(products.createdAt)),
    db
      .select({ productId: campaigns.productId, count: sql<number>`count(*)::int` })
      .from(campaigns)
      .groupBy(campaigns.productId),
  ]);

  const campMap = new Map(campCountRows.map((r) => [r.productId, r.count]));

  const data: AdminProductRow[] = rows.map((p) => ({
    id: p.id,
    productType: p.productType,
    category: p.category,
    title: p.title,
    description: p.description ?? "",
    unit: p.unit,
    unitPrice: Number(p.unitPrice),
    minQty: p.minQty,
    maxQty: p.maxQty,
    estDurationDays: p.estDurationDays,
    channel: p.channel,
    efficiency: p.efficiency != null ? Number(p.efficiency) : null,
    avgRankUpRate: p.avgRankUpRate != null ? Number(p.avgRankUpRate) : null,
    subscriptionInfo: p.subscriptionInfo,
    tier: p.tier,
    subtitle: p.subtitle,
    thumbnailUrl: p.thumbnailUrl,
    thumbnailPath: p.thumbnailPath,
    badgeInitial: p.badgeInitial,
    badgeColor: p.badgeColor,
    isSale: p.isSale,
    isRecommended: p.isRecommended,
    rankUpUserRate: p.rankUpUserRate != null ? Number(p.rankUpUserRate) : null,
    rankBefore: p.rankBefore,
    rankAfter: p.rankAfter,
    orderCutoffTime: p.orderCutoffTime,
    sameDayStart: p.sameDayStart,
    minRunDays: p.minRunDays,
    isActive: p.isActive,
    campaignCount: campMap.get(p.id) ?? 0,
  }));

  return (
    <div>
      <PageTitle
        title="리워드 상품등록"
        description="플레이스·쇼핑·쿠팡 리워드 상품의 금액·효율·순위 상승 지표를 관리합니다. 리뷰/체험단 상품은 리뷰 상품등록에서 관리합니다."
      />
      <ProductsClient rows={data} />
    </div>
  );
}

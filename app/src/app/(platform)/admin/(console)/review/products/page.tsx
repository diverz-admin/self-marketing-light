import { db } from "@/db";
import { products, reviewCampaigns } from "@/db/schema";
import { sql, desc, inArray, or, isNotNull } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { REVIEW_CATEGORY_KEYS } from "@/lib/admin-format";
import { ReviewProductsClient, type AdminReviewProductRow } from "./ReviewProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewProductsPage() {
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
        minRunDays: products.minRunDays,
        estDurationDays: products.estDurationDays,
        channel: products.channel,
        subtitle: products.subtitle,
        tier: products.tier,
        thumbnailUrl: products.thumbnailUrl,
        thumbnailPath: products.thumbnailPath,
        isSale: products.isSale,
        isRecommended: products.isRecommended,
        reviewType: products.reviewType,
        reviewChars: products.reviewChars,
        reviewImages: products.reviewImages,
        blogGrade: products.blogGrade,
        deliveryTiming: products.deliveryTiming,
        originalPrice: products.originalPrice,
        saleTag: products.saleTag,
        isActive: products.isActive,
      })
      .from(products)
      // 리뷰 유형이 지정된 상품 + 리뷰 카테고리로 등록된 레거시 상품
      // (쿠팡 리뷰는 대응 카테고리가 없어 reviewType 으로만 잡힌다)
      .where(or(isNotNull(products.reviewType), inArray(products.category, REVIEW_CATEGORY_KEYS)))
      .orderBy(desc(products.isActive), desc(products.createdAt)),
    // 리뷰 캠페인은 상품 ID가 아니라 플랫폼 + 리뷰 유형으로 신청된다 → 같은 조합끼리 집계한다
    db
      .select({
        platform: reviewCampaigns.platform,
        reviewType: reviewCampaigns.reviewType,
        count: sql<number>`count(*)::int`,
      })
      .from(reviewCampaigns)
      .groupBy(reviewCampaigns.platform, reviewCampaigns.reviewType),
  ]);

  // 리뷰 캠페인의 platform("naver_shopping")과 상품의 channel("shopping") 표기를 맞춘다
  const CHANNEL_TO_PLATFORM: Record<string, string> = { place: "place", shopping: "naver_shopping", coupang: "coupang" };
  const campMap = new Map(campCountRows.map((r) => [`${r.platform}:${r.reviewType}`, r.count]));
  const countFor = (channel: string | null, reviewType: string | null) =>
    channel && reviewType ? campMap.get(`${CHANNEL_TO_PLATFORM[channel] ?? channel}:${reviewType}`) ?? 0 : 0;

  const data: AdminReviewProductRow[] = rows.map((p) => ({
    id: p.id,
    productType: p.productType,
    category: p.category,
    title: p.title,
    description: p.description ?? "",
    unit: p.unit,
    unitPrice: Number(p.unitPrice),
    minQty: p.minQty,
    maxQty: p.maxQty,
    minRunDays: p.minRunDays,
    estDurationDays: p.estDurationDays,
    channel: p.channel,
    subtitle: p.subtitle,
    tier: p.tier,
    thumbnailUrl: p.thumbnailUrl,
    thumbnailPath: p.thumbnailPath,
    isSale: p.isSale,
    isRecommended: p.isRecommended,
    reviewType: p.reviewType,
    reviewChars: p.reviewChars,
    reviewImages: p.reviewImages,
    blogGrade: p.blogGrade,
    deliveryTiming: p.deliveryTiming,
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    saleTag: p.saleTag,
    isActive: p.isActive,
    campaignCount: countFor(p.channel, p.reviewType),
  }));

  return (
    <div>
      <PageTitle
        title="리뷰 상품등록"
        description="블로그배포·영수증리뷰·체험단 상품의 건당 금액과 원고 조건(글자수·이미지·블로그 등급·배포 시점)을 관리합니다."
      />
      <ReviewProductsClient rows={data} />
    </div>
  );
}

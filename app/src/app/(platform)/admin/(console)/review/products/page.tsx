import { db } from "@/db";
import { products } from "@/db/schema";
import { desc, isNotNull } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { REVIEW_PRICE_ROWS, reviewPriceRowLabel } from "@/lib/admin-format";
import { ReviewProductsClient, type ReviewPriceRow } from "./ReviewProductsClient";

export const dynamic = "force-dynamic";

export default async function AdminReviewProductsPage() {
  const rows = await db
    .select({
      id: products.id,
      channel: products.channel,
      reviewType: products.reviewType,
      unitPrice: products.unitPrice,
      costPrice: products.costPrice,
      isActive: products.isActive,
    })
    .from(products)
    .where(isNotNull(products.reviewType))
    // 같은 조합에 여러 건이면 판매중 → 최근 등록 순으로 앞의 것을 대표로 쓴다
    .orderBy(desc(products.isActive), desc(products.createdAt));

  const priceRows: ReviewPriceRow[] = REVIEW_PRICE_ROWS.map(({ channel, reviewType }) => {
    const found = rows.find((p) => p.channel === channel && p.reviewType === reviewType);
    return {
      channel,
      reviewType,
      productId: found?.id ?? null,
      title: reviewPriceRowLabel(channel, reviewType),
      unitPrice: found ? Number(found.unitPrice) : 0,
      costPrice: found?.costPrice != null ? Number(found.costPrice) : null,
      isActive: found?.isActive ?? false,
    };
  });

  return (
    <div>
      <PageTitle
        title="리뷰 상품등록"
        description="플랫폼별 리뷰 유형의 건별 가격을 등록합니다. 여기서 정한 금액이 고객 신청 화면에 그대로 노출됩니다."
      />
      <ReviewProductsClient rows={priceRows} />
    </div>
  );
}

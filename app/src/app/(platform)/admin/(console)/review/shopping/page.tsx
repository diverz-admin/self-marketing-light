import { PageTitle } from "@/components/admin/ui";
import { parsePeriod } from "@/lib/period-filter";
import { loadReviewAdminData } from "@/lib/admin-review-data";
import { ReviewRequestClient, type ReviewRequestConfig } from "@/components/admin/ReviewRequestClient";

export const dynamic = "force-dynamic";

/**
 * 고객 신청 화면(/marketing/review/shopping/product-experience)에 열려 있는 유형만 다룬다.
 * 그 화면 하나에서 네이버 쇼핑·쿠팡을 함께 고르므로 여기서도 두 채널을 같이 본다.
 */
const SHOPPING_CONFIG: ReviewRequestConfig = {
  label: "쇼핑 리뷰",
  fileName: "쇼핑리뷰_신청내역",
  types: [
    { key: "product_provided", label: "제품제공" },
    { key: "product_not_provided", label: "제품미제공" },
  ],
  linkLabel: "상품 링크",
  showChannel: true,
};

export default async function AdminShoppingReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const { rows, tasks, extensions, years } = await loadReviewAdminData(
    ["naver_shopping", "coupang"],
    "shopping_review",
    period,
  );

  return (
    <div>
      <PageTitle
        title="쇼핑 리뷰 관리"
        description="네이버 쇼핑·쿠팡의 제품제공·제품미제공 신청 내용을 확인하고 캠페인을 셋팅합니다. 건별 가격은 리뷰 상품등록에서 정합니다."
      />
      <ReviewRequestClient
        config={SHOPPING_CONFIG}
        rows={rows}
        tasks={tasks}
        extensions={extensions}
        years={years}
        period={period}
      />
    </div>
  );
}

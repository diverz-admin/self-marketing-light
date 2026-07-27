import { PageTitle } from "@/components/admin/ui";
import { parsePeriod } from "@/lib/period-filter";
import { loadReviewAdminData } from "@/lib/admin-review-data";
import { ReviewCampaignsClient } from "@/components/admin/ReviewCampaignsClient";

export const dynamic = "force-dynamic";

// 기획서: 네이버쇼핑 및 쿠팡 제품제공/미제공 금액 설정 필요
const SHOPPING_PRICING_PRESETS = [
  { key: "naver_product_provided", label: "네이버쇼핑 · 제품 제공", unit: "건" },
  { key: "naver_product_not_provided", label: "네이버쇼핑 · 제품 미제공", unit: "건" },
  { key: "coupang_product_provided", label: "쿠팡 · 제품 제공", unit: "건" },
  { key: "coupang_product_not_provided", label: "쿠팡 · 제품 미제공", unit: "건" },
  { key: "blog_experience", label: "블로그 체험단", unit: "건" },
  { key: "blog_reporter", label: "블로그 기자단", unit: "건" },
];

export default async function AdminShoppingReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const { rows, tasks, extensions, rules, users, years } = await loadReviewAdminData(
    ["naver_shopping", "coupang"],
    "shopping_review",

    period,
  );

  return (
    <div>
      <PageTitle
        title="쇼핑 리뷰 관리"
        description="네이버쇼핑 · 쿠팡 리뷰 캠페인의 신청 확인, 셋팅, 진행현황을 관리합니다."
      />


      <ReviewCampaignsClient
        platforms={["naver_shopping", "coupang"]}
        pricingCategory="shopping_review"
        pricingTitle="쇼핑 리뷰 금액 설정"
        pricingDescription="네이버쇼핑 · 쿠팡의 제품 제공 / 미제공별 단가를 정의합니다."
        pricingPresets={SHOPPING_PRICING_PRESETS}
        rows={rows}
        tasks={tasks}
        users={users}
        extensions={extensions}
        rules={rules}
        years={years}
        period={period}
      />
    </div>
  );
}

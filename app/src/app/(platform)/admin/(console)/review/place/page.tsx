import { PageTitle } from "@/components/admin/ui";
import { parsePeriod } from "@/lib/period-filter";
import { loadReviewAdminData } from "@/lib/admin-review-data";
import { ReviewCampaignsClient } from "@/components/admin/ReviewCampaignsClient";

export const dynamic = "force-dynamic";

// 기획서: 블로그배포 / 영수증리뷰 금액 설정 필요
const PLACE_PRICING_PRESETS = [
  { key: "blog_distribute", label: "블로그 배포", unit: "건" },
  { key: "receipt", label: "영수증 리뷰", unit: "건" },
  { key: "visitor", label: "방문자 리뷰", unit: "건" },
  { key: "reservation", label: "예약자 리뷰", unit: "건" },
  { key: "blog_experience", label: "블로그 체험단", unit: "건" },
  { key: "blog_reporter", label: "블로그 기자단", unit: "건" },
];

export default async function AdminPlaceReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const { rows, tasks, extensions, rules, users, years } = await loadReviewAdminData(
    ["place"],
    "place_review",

    period,
  );

  return (
    <div>
      <PageTitle
        title="플레이스 리뷰 관리"
        description="신청 내역을 확인하고 결제 후 캠페인을 셋팅합니다. 블로그 작성·영수증 진행현황도 관리합니다."
      />


      <ReviewCampaignsClient
        platforms={["place"]}
        pricingCategory="place_review"
        pricingTitle="플레이스 리뷰 금액 설정"
        pricingDescription="블로그 배포 · 영수증 리뷰 등 리뷰 유형별 단가를 정의합니다."
        pricingPresets={PLACE_PRICING_PRESETS}
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

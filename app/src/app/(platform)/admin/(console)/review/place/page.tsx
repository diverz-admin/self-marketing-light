import { PageTitle } from "@/components/admin/ui";
import { parsePeriod } from "@/lib/period-filter";
import { loadReviewAdminData } from "@/lib/admin-review-data";
import { ReviewRequestClient, type ReviewRequestConfig } from "@/components/admin/ReviewRequestClient";

export const dynamic = "force-dynamic";

/** 고객 신청 화면(/marketing/review/place/*)에 실제로 열려 있는 유형만 다룬다 */
const PLACE_CONFIG: ReviewRequestConfig = {
  label: "플레이스 리뷰",
  fileName: "플레이스리뷰_신청내역",
  types: [
    { key: "blog_distribute", label: "블로그배포" },
    { key: "receipt", label: "영수증리뷰" },
  ],
  linkLabel: "플레이스 링크",
};

export default async function AdminPlaceReviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const period = parsePeriod(await searchParams);
  const { rows, tasks, extensions, years } = await loadReviewAdminData(["place"], "place_review", period);

  return (
    <div>
      <PageTitle
        title="플레이스 리뷰 관리"
        description="블로그배포·영수증리뷰 신청 내용을 확인하고 캠페인을 셋팅합니다. 건별 가격은 리뷰 상품등록에서 정합니다."
      />
      <ReviewRequestClient
        config={PLACE_CONFIG}
        rows={rows}
        tasks={tasks}
        extensions={extensions}
        years={years}
        period={period}
      />
    </div>
  );
}

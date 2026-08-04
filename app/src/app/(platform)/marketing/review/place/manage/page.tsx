import { viewerId } from "@/lib/viewer";
import ReviewManageTable from "@/components/marketing/ReviewManageTable";
import PageHeader from "@/components/marketing/PageHeader";
import { loadMyReviewCampaigns } from "@/lib/my-review-campaigns";

export const dynamic = "force-dynamic";

export default async function PlaceReviewManagePage() {
  const userId = await viewerId();

  const campaigns = await loadMyReviewCampaigns(userId, ["place"]);

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 플레이스 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
      <ReviewManageTable
        campaigns={campaigns}
        breadcrumbLabel="블로그배포"
        createHref="/marketing/review/place/blog-reporter"
        showApplicants={false}
        showPostUrls={true}
      />
    </div>
  );
}

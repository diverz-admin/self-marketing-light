import { viewerId } from "@/lib/viewer";
import ReviewManageTable from "@/components/marketing/ReviewManageTable";
import PageHeader from "@/components/marketing/PageHeader";
import { loadMyReviewCampaigns } from "@/lib/my-review-campaigns";

export const dynamic = "force-dynamic";

const TABS = [
  { label: "상품 체험단", href: "/marketing/review/shopping/manage/product-experience" },
];

export default async function ShoppingReviewManagePage() {
  const userId = await viewerId();

  // 쇼핑 리뷰 관리 화면은 네이버 쇼핑·쿠팡 신청을 함께 보여준다 (신청 화면이 하나로 합쳐져 있다)
  const campaigns = await loadMyReviewCampaigns(userId, ["naver_shopping", "coupang"]);

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 쇼핑 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath={"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"}
      />
      <ReviewManageTable
        campaigns={campaigns}
        breadcrumbLabel="블로그리뷰(기자단)"
        breadcrumbPlatform="쇼핑 리뷰"
        createHref="/marketing/review/shopping/product-experience"
        tabs={TABS}
        showApplicants={false}
        showPostUrls={true}
        showChannel={true}
      />
    </div>
  );
}

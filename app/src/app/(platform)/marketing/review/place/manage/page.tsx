import { viewerId } from "@/lib/viewer";
import { todayKST } from "@/lib/admin-format";
import PageHeader from "@/components/marketing/PageHeader";
import { loadPlaceReviewManage } from "@/lib/place-review-manage";
import PlaceReviewManageView from "./PlaceReviewManageView";

export const dynamic = "force-dynamic";

export default async function PlaceReviewManagePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const [{ type }, userId] = await Promise.all([searchParams, viewerId()]);
  const rows = await loadPlaceReviewManage(userId);

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="네이버 플레이스 리뷰 관리"
        subtitle="신청한 리뷰 캠페인을 확인하고 관리하세요."
        iconPath="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
      <PlaceReviewManageView rows={rows} today={todayKST()} initialType={type === "receipt" ? "receipt" : "blog_distribute"} />
    </div>
  );
}

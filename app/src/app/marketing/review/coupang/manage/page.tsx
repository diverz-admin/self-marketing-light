import { redirect } from "next/navigation";

export default function CoupangReviewManageRedirect() {
  // 네이버/쿠팡 채널 통합 — 쇼핑 리뷰 캠페인 관리에서 채널별로 함께 관리합니다.
  redirect("/marketing/review/shopping/manage/product-experience");
}

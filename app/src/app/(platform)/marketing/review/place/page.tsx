import { redirect } from "next/navigation";

export default function PlaceReviewDashboard() {
  // 캠페인 신청 → 기본 유형(블로그배포) 폼으로 이동. 폼 상단에서 유형(블로그배포/영수증리뷰) 선택.
  redirect("/marketing/review/place/blog-reporter");
}

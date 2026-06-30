import { redirect } from "next/navigation";

export default function CoupangReviewRedirect() {
  // 네이버/쿠팡 채널 통합 — 캠페인 신청 페이지에서 채널을 선택합니다.
  redirect("/marketing/review/shopping/product-experience");
}

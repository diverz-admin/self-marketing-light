import { loadReviewProducts } from "@/lib/review-products";
import { todayKST } from "@/lib/admin-format";
import PlaceReviewApplyForm from "./PlaceReviewApplyForm";

export const dynamic = "force-dynamic";

/** 네이버 플레이스 리뷰 신청 — 블로그 배포(셀프) · 영수증 리뷰(상담)를 한 화면에서 고른다 */
export default async function PlaceReviewApplyPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  // 어드민 "리뷰 상품등록"의 플레이스 블로그배포 상품만 노출한다
  const products = await loadReviewProducts("place", "blog_distribute");
  return <PlaceReviewApplyForm products={products} initialType={type === "receipt" ? "receipt" : "blog"} today={todayKST()} />;
}

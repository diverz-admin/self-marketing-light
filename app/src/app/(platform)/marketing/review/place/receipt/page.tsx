import { loadReviewProducts } from "@/lib/review-products";
import ReceiptReviewForm from "./ReceiptReviewForm";

export const dynamic = "force-dynamic";

export default async function ReceiptReviewPage() {
  // 어드민 "리뷰 상품등록"의 플레이스 영수증리뷰 상품만 신청 화면에 노출한다
  const products = await loadReviewProducts("place", "receipt");

  return <ReceiptReviewForm products={products} />;
}

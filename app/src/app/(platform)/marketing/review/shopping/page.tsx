import type { Metadata } from "next";
import ShoppingReviewLanding from "./ShoppingReviewLanding";

export const metadata: Metadata = {
  title: "쇼핑 리뷰 | BLUE EGG",
  description: "네이버 쇼핑·쿠팡 실사용자 구매 리뷰 — 제품 제공형 / 실구매형, 상담 견적으로 진행합니다.",
};

export default function ShoppingReviewPage() {
  return <ShoppingReviewLanding />;
}

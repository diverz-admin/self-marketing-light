import { loadReviewProducts } from "@/lib/review-products";
import ProductExperienceForm, { type ReviewProductMap } from "./ProductExperienceForm";

export const dynamic = "force-dynamic";

// 이 화면 하나가 네이버 쇼핑·쿠팡 × 제품제공·제품미제공 네 조합을 모두 신청받는다
const COMBOS = [
  { channel: "shopping", reviewType: "product_provided" },
  { channel: "shopping", reviewType: "product_not_provided" },
  { channel: "coupang", reviewType: "product_provided" },
  { channel: "coupang", reviewType: "product_not_provided" },
];

export default async function ShoppingProductExperiencePage() {
  const lists = await Promise.all(COMBOS.map((c) => loadReviewProducts(c.channel, c.reviewType)));

  const productMap: ReviewProductMap = {};
  COMBOS.forEach((c, i) => {
    productMap[`${c.channel}:${c.reviewType}`] = lists[i];
  });

  return <ProductExperienceForm productMap={productMap} />;
}

import { loadReviewProducts } from "@/lib/review-products";
import BlogReporterForm from "./BlogReporterForm";

export const dynamic = "force-dynamic";

export default async function BlogReporterPage() {
  // 어드민 "리뷰 상품등록"의 플레이스 블로그배포 상품만 신청 화면에 노출한다
  const products = await loadReviewProducts("place", "blog_distribute");

  return <BlogReporterForm products={products} />;
}

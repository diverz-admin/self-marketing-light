import { db } from "@/db";
import { products } from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";

/** 고객 리뷰 신청 화면이 고르는 상품 — 어드민 "리뷰 상품등록"에서 내려온다 */
export type ReviewProductOption = {
  id: string;
  title: string;
  subtitle: string;
  unitPrice: number;
  originalPrice: number | null;
  saleTag: string | null;
  reviewChars: number | null;
  reviewImages: number | null;
  blogGrade: string | null;
  /** 일 발행량 상한 — 비어 있으면 화면 기본값(100) */
  maxQty: number | null;
};

/**
 * 채널 + 리뷰 유형에 해당하는 판매중 상품 목록 (싼 순).
 * 비어 있으면 어드민에 아직 상품이 등록되지 않은 것이라, 신청 화면은 신청을 막는다.
 */
export async function loadReviewProducts(channel: string, reviewType: string): Promise<ReviewProductOption[]> {
  const rows = await db
    .select({
      id: products.id,
      title: products.title,
      subtitle: products.subtitle,
      unitPrice: products.unitPrice,
      originalPrice: products.originalPrice,
      saleTag: products.saleTag,
      reviewChars: products.reviewChars,
      reviewImages: products.reviewImages,
      blogGrade: products.blogGrade,
      maxQty: products.maxQty,
    })
    .from(products)
    .where(
      and(
        eq(products.channel, channel),
        eq(products.reviewType, reviewType),
        eq(products.isActive, true),
      ),
    )
    .orderBy(asc(products.unitPrice));

  return rows.map((p) => ({
    id: p.id,
    title: p.title,
    subtitle: p.subtitle ?? "",
    unitPrice: Number(p.unitPrice),
    originalPrice: p.originalPrice != null ? Number(p.originalPrice) : null,
    saleTag: p.saleTag,
    reviewChars: p.reviewChars,
    reviewImages: p.reviewImages,
    blogGrade: p.blogGrade,
    maxQty: p.maxQty,
  }));
}

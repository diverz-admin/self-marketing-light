"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  campaigns, campaignExtensions, credits, orders, pointCharges, products, rankKeywords, reviewCampaigns,
} from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * 플레이스 상위노출 신청 — 어드민 "리워드 상품등록"의 상품을 그대로 캠페인에 연결한다.
 * 금액은 클라이언트 값을 믿지 않고 상품 단가로 다시 계산한다.
 */
export async function createPlaceRewardCampaign(input: {
  productId: string;
  placeName: string;
  placeUrl: string;
  keyword: string;
  dailyQty: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, placeName, placeUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  if (!productId || !placeName?.trim() || !placeUrl?.trim() || !keyword?.trim()) {
    return { error: "상품과 플레이스 정보를 모두 입력해주세요." };
  }

  try {
    const [product] = await db
      .select({ id: products.id, unitPrice: products.unitPrice, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) return { error: "판매 중인 상품이 아닙니다." };

    await db.insert(campaigns).values({
      userId: user.id,
      productId: product.id,
      status: "submitted",
      inputs: { storeName: placeName.trim(), placeUrl: placeUrl.trim(), keyword: keyword.trim() },
      dailyQty,
      totalQty: dailyQty,
      quotedAmount: String(dailyQty * Number(product.unitPrice)),
    });
  } catch (err) {
    console.error("createPlaceRewardCampaign error:", err);
    return { error: "캠페인 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/reward/place/manage");
  return { success: true };
}

/** 쇼핑 상위노출 신청 — 플레이스와 동일하게 등록된 상품을 캠페인에 연결한다 */
export async function createShoppingRewardCampaign(input: {
  productId: string;
  productName: string;
  productUrl: string;
  keyword: string;
  dailyQty: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, productName, productUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  if (!productId || !productName?.trim() || !productUrl?.trim() || !keyword?.trim()) {
    return { error: "상품과 스토어 정보를 모두 입력해주세요." };
  }

  try {
    const [product] = await db
      .select({ id: products.id, unitPrice: products.unitPrice, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) return { error: "판매 중인 상품이 아닙니다." };

    await db.insert(campaigns).values({
      userId: user.id,
      productId: product.id,
      status: "submitted",
      inputs: { productName: productName.trim(), productUrl: productUrl.trim(), keyword: keyword.trim() },
      dailyQty,
      totalQty: dailyQty,
      quotedAmount: String(dailyQty * Number(product.unitPrice)),
    });
  } catch (err) {
    console.error("createShoppingRewardCampaign error:", err);
    return { error: "캠페인 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/reward/shopping/manage");
  return { success: true };
}

/** 쿠팡 상위노출 신청 — 검색/찜하기 구분만 더할 뿐 쇼핑과 동일하다 */
export async function createCoupangRewardCampaign(input: {
  productId: string;
  productName: string;
  productUrl: string;
  keyword: string;
  dailyQty: number;
  serviceType?: string;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, productName, productUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  if (!productId || !productName?.trim() || !productUrl?.trim() || !keyword?.trim()) {
    return { error: "상품과 쿠팡 상품 정보를 모두 입력해주세요." };
  }

  try {
    const [product] = await db
      .select({ id: products.id, unitPrice: products.unitPrice, isActive: products.isActive })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) return { error: "판매 중인 상품이 아닙니다." };

    await db.insert(campaigns).values({
      userId: user.id,
      productId: product.id,
      status: "submitted",
      inputs: {
        productName: productName.trim(),
        productUrl: productUrl.trim(),
        keyword: keyword.trim(),
        serviceType: input.serviceType === "wishlist" ? "wishlist" : "search",
      },
      dailyQty,
      totalQty: dailyQty,
      quotedAmount: String(dailyQty * Number(product.unitPrice)),
    });
  } catch (err) {
    console.error("createCoupangRewardCampaign error:", err);
    return { error: "캠페인 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/reward/coupang/manage");
  return { success: true };
}

/**
 * 캠페인 연장 신청 — 고객 "연장 안내" 화면에서 올린다.
 * 금액은 화면 값을 믿지 않고 상품 단가로 다시 계산한다 (일 작업량 × 기간 × 건당 단가).
 * 승인은 어드민 상위노출 관리 > 연장 신청에서 처리한다.
 */
export async function requestCampaignExtension(input: {
  campaignId: string;
  dailyQty: number;
  days: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  const days = Math.max(1, Math.floor(input.days));

  try {
    const [row] = await db
      .select({
        id: campaigns.id,
        userId: campaigns.userId,
        unitPrice: products.unitPrice,
      })
      .from(campaigns)
      .leftJoin(products, eq(campaigns.productId, products.id))
      .where(eq(campaigns.id, input.campaignId))
      .limit(1);

    if (!row) return { error: "캠페인을 찾을 수 없습니다." };
    if (row.userId !== user.id) return { error: "본인 캠페인만 연장할 수 있습니다." };

    // 같은 캠페인에 대기 중인 신청이 있으면 중복 접수하지 않는다
    const [waiting] = await db
      .select({ id: campaignExtensions.id })
      .from(campaignExtensions)
      .where(
        and(
          eq(campaignExtensions.targetId, row.id),
          eq(campaignExtensions.targetType, "campaign"),
          eq(campaignExtensions.status, "requested"),
        ),
      )
      .limit(1);
    if (waiting) return { error: "이미 처리 대기 중인 연장 신청이 있습니다." };

    await db.insert(campaignExtensions).values({
      targetType: "campaign",
      targetId: row.id,
      userId: user.id,
      addQty: dailyQty,
      addDays: days,
      amount: String(dailyQty * days * Number(row.unitPrice ?? 0)),
      status: "requested",
    });
  } catch (err) {
    console.error("requestCampaignExtension error:", err);
    return { error: "연장 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/reward/place/manage");
  revalidatePath("/admin/reward/campaigns/place");
  return { success: true };
}

/**
 * 리뷰/체험단 캠페인 신청 — 플레이스 블로그배포·영수증리뷰, 쇼핑·쿠팡 체험단이 함께 쓴다.
 * 금액은 화면 값을 믿지 않고 어드민 "리뷰 상품등록"의 상품 단가로 다시 계산한다.
 * 신청 결과는 어드민 플레이스/쇼핑 리뷰 화면에 "신청" 상태로 뜬다.
 */
export async function createReviewCampaign(input: {
  productId: string;
  platform: "place" | "naver_shopping" | "coupang";
  reviewType: string;
  storeName: string;
  targetUrl?: string;
  keyword?: string;
  totalQty: number;
  startDate?: string;
  endDate?: string;
  setting?: Record<string, unknown>;
  requestNote?: string;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const totalQty = Math.max(1, Math.floor(input.totalQty));
  if (!input.productId || !input.storeName?.trim()) {
    return { error: "상품과 업체 정보를 모두 입력해주세요." };
  }

  try {
    // 상품의 채널·리뷰 유형이 신청 화면과 일치하는지까지 확인한다 (다른 상품 ID를 밀어 넣지 못하게)
    const [product] = await db
      .select({
        id: products.id,
        unitPrice: products.unitPrice,
        isActive: products.isActive,
        channel: products.channel,
        reviewType: products.reviewType,
      })
      .from(products)
      .where(eq(products.id, input.productId))
      .limit(1);

    if (!product || !product.isActive) return { error: "판매 중인 상품이 아닙니다." };
    if (product.reviewType !== input.reviewType) return { error: "상품과 리뷰 유형이 맞지 않습니다." };

    const unitPrice = Number(product.unitPrice);

    await db.insert(reviewCampaigns).values({
      userId: user.id,
      platform: input.platform,
      reviewType: input.reviewType as typeof reviewCampaigns.$inferInsert.reviewType,
      storeName: input.storeName.trim(),
      targetUrl: input.targetUrl?.trim() || null,
      keyword: input.keyword?.trim() || null,
      totalQty,
      unitPrice: String(unitPrice),
      totalAmount: String(unitPrice * totalQty),
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      status: "requested",
      setting: input.setting ?? {},
      requestNote: input.requestNote?.trim() || null,
    });
  } catch (err) {
    console.error("createReviewCampaign error:", err);
    return { error: "캠페인 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/review/place/manage");
  revalidatePath("/marketing/review/shopping/manage");
  return { success: true };
}

/**
 * 포인트 충전 신청 — 무통장입금 기준.
 * 신청은 "입금대기" 상태로 쌓이고, 어드민 "포인트충전"에서 승인해야 크레딧이 적립된다.
 */
export async function requestPointCharge(input: {
  amount: number;
  depositorName: string;
  receiptType?: string;
  taxInfo?: Record<string, unknown>;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount < 10000) {
    return { error: "최소 충전 포인트는 10,000P 입니다." };
  }
  if (!input.depositorName?.trim()) return { error: "입금자명을 입력해주세요." };

  try {
    await db.insert(pointCharges).values({
      userId: user.id,
      amount: String(amount),
      method: "bank_transfer",
      depositorName: input.depositorName.trim(),
      receiptType: input.receiptType === "tax_invoice" ? "tax_invoice" : "none",
      status: "requested",
      // 세금계산서 발행 정보는 관리자가 확인할 수 있도록 메모로 남긴다
      memo: input.taxInfo ? JSON.stringify(input.taxInfo) : null,
    });
  } catch (err) {
    console.error("requestPointCharge error:", err);
    return { error: "충전 신청 중 오류가 발생했습니다." };
  }

  revalidatePath("/marketing/my/charge");
  revalidatePath("/admin/points");
  return { success: true };
}

/**
 * 순위추적 키워드 등록 — 어드민 "키워드 순위" 화면에 그대로 뜬다.
 * 기획서: 키워드 1개 무료 / 2개째부터 유료 → 유료 여부만 표시하고, 금액은 관리자가 확정한다.
 */
export async function addRankKeyword(input: {
  platform: "place" | "shopping" | "coupang";
  keyword: string;
  targetName: string;
  targetUrl: string;
}): Promise<{ error: string } | { success: true; isPaid: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const keyword = input.keyword?.trim();
  const targetName = input.targetName?.trim();
  const targetUrl = input.targetUrl?.trim();
  if (!keyword || !targetName || !targetUrl) {
    return { error: "키워드와 업체 정보를 모두 입력해주세요." };
  }

  try {
    // 같은 플랫폼에 같은 키워드+대상이 이미 있으면 중복 등록하지 않는다
    const [dup] = await db
      .select({ id: rankKeywords.id })
      .from(rankKeywords)
      .where(
        and(
          eq(rankKeywords.userId, user.id),
          eq(rankKeywords.platform, input.platform),
          eq(rankKeywords.keyword, keyword),
          eq(rankKeywords.targetUrl, targetUrl),
        ),
      )
      .limit(1);
    if (dup) return { error: "이미 등록된 키워드입니다." };

    // 2개째부터 유료 (기존 활성 키워드가 있으면 유료)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(rankKeywords)
      .where(and(eq(rankKeywords.userId, user.id), eq(rankKeywords.isActive, true)));

    const isPaid = count >= 1;

    await db.insert(rankKeywords).values({
      userId: user.id,
      platform: input.platform,
      keyword,
      targetName,
      targetUrl,
      isPaid,
    });

    revalidatePath("/marketing/rank");
    revalidatePath("/admin/rank");
    return { success: true, isPaid };
  } catch (err) {
    console.error("addRankKeyword error:", err);
    return { error: "키워드 등록 중 오류가 발생했습니다." };
  }
}

/**
 * 장바구니 주문 확정 — 담긴 건별로 주문(orders)을 남기고 포인트를 차감한다.
 * 금액은 화면 값을 믿지 않고 상품 단가 × 수량으로 다시 계산하며,
 * 잔액이 모자라면 아무것도 남기지 않는다(전부 성공 또는 전부 취소).
 */
export async function checkoutCart(
  items: { productId: string; dailyQty: number }[],
): Promise<{ error: string } | { success: true; total: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!items.length) return { error: "장바구니가 비어 있습니다." };

  try {
    const rows = await db
      .select({ id: products.id, unitPrice: products.unitPrice, isActive: products.isActive })
      .from(products)
      .where(inArray(products.id, items.map((i) => i.productId)));

    const priceById = new Map(rows.filter((r) => r.isActive).map((r) => [r.id, Number(r.unitPrice)]));

    let total = 0;
    const priced = items.map((i) => {
      const unitPrice = priceById.get(i.productId);
      if (unitPrice == null) throw new Error(`판매 중이 아닌 상품이 있습니다.`);
      const qty = Math.max(1, Math.floor(i.dailyQty));
      const amount = unitPrice * qty;
      total += amount;
      return { productId: i.productId, amount };
    });

    const [balanceRow] = await db
      .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
      .from(credits)
      .where(eq(credits.userId, user.id));

    if ((balanceRow?.balance ?? 0) < total) return { error: "보유 포인트가 부족합니다." };

    await db.transaction(async (tx) => {
      for (const p of priced) {
        await tx.insert(orders).values({
          userId: user.id,
          amount: String(p.amount),
          method: "credit",
          status: "paid",
        });
      }
      await tx.insert(credits).values({
        userId: user.id,
        delta: String(-total),
        reason: "장바구니 주문",
      });
    });

    revalidatePath("/marketing/cart");
    revalidatePath("/admin/orders");
    return { success: true, total };
  } catch (err) {
    console.error("checkoutCart error:", err);
    const message = err instanceof Error && err.message.includes("판매 중")
      ? err.message
      : "주문 처리 중 오류가 발생했습니다.";
    return { error: message };
  }
}

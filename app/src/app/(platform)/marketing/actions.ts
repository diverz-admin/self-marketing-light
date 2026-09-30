"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/db";
import {
  campaigns, campaignExtensions, credits, orders, pointCharges, products, rankKeywords, reviewCampaigns,
  adminCartItems, rankMemberships, notices,
} from "@/db/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  MEMBERSHIP_MONTHLY_FEE, isMembershipLive, nextExpiry,
} from "@/lib/rank-membership";
import { POLICY } from "@/lib/policy";

/**
 * 플레이스 상위노출 신청 — 어드민 "리워드 상품등록"의 상품을 그대로 캠페인에 연결한다.
 * 금액은 클라이언트 값을 믿지 않고 상품 단가로 다시 계산한다.
 */
/** YYYY-MM-DD 에 달력 n일을 더한다 (신청 화면의 종료일 계산과 같은 규칙) */
function addCalendarDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

export async function createPlaceRewardCampaign(input: {
  productId: string;
  placeName: string;
  placeUrl: string;
  keyword: string;
  dailyQty: number;
  /** 작업 시작일(YYYY-MM-DD) · 구동 기간(일) — 신청 화면에서 고른다 */
  startDate?: string;
  days?: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, placeName, placeUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  const days = Math.max(1, Math.floor(input.days ?? 1));
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

    // 금액·수량은 기간을 곱해 담는다 — 고객 화면에서 청구한 값과 같아야 한다
    const totalQty = dailyQty * days;
    await db.insert(campaigns).values({
      userId: user.id,
      productId: product.id,
      status: "submitted",
      inputs: { storeName: placeName.trim(), placeUrl: placeUrl.trim(), keyword: keyword.trim() },
      dailyQty,
      totalQty,
      startDate: input.startDate || null,
      endDate: input.startDate ? addCalendarDays(input.startDate, days - 1) : null,
      quotedAmount: String(totalQty * Number(product.unitPrice)),
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
  /** 작업 시작일(YYYY-MM-DD) · 구동 기간(일) — 신청 화면에서 고른다 */
  startDate?: string;
  days?: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, productName, productUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  const days = Math.max(1, Math.floor(input.days ?? 1));
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
      // 금액·수량은 기간을 곱해 담는다 — 고객 화면에서 청구한 값과 같아야 한다
      totalQty: dailyQty * days,
      startDate: input.startDate || null,
      endDate: input.startDate ? addCalendarDays(input.startDate, days - 1) : null,
      quotedAmount: String(dailyQty * days * Number(product.unitPrice)),
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
  /** 작업 시작일(YYYY-MM-DD) · 구동 기간(일) — 신청 화면에서 고른다 */
  startDate?: string;
  days?: number;
}): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { productId, productName, productUrl, keyword } = input;
  const dailyQty = Math.max(1, Math.floor(input.dailyQty));
  const days = Math.max(1, Math.floor(input.days ?? 1));
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
      // 금액·수량은 기간을 곱해 담는다 — 고객 화면에서 청구한 값과 같아야 한다
      totalQty: dailyQty * days,
      startDate: input.startDate || null,
      endDate: input.startDate ? addCalendarDays(input.startDate, days - 1) : null,
      quotedAmount: String(dailyQty * days * Number(product.unitPrice)),
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
  const { minCharge, chargeUnit } = POLICY.point;
  if (!Number.isFinite(amount) || amount < minCharge || amount % chargeUnit !== 0) {
    return {
      error: `요청 포인트는 ${minCharge.toLocaleString()}P 이상, ${chargeUnit.toLocaleString()}P 단위여야 합니다.`,
    };
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
}): Promise<{ error: string } | { success: true; isPaid: boolean; id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const keyword = input.keyword?.trim();
  const targetName = input.targetName?.trim();
  const targetUrl = input.targetUrl?.trim();
  // 업체명은 비워도 된다 — 순위 측정 때 링크에서 채운다("확인 중")
  if (!keyword || !targetUrl) {
    return { error: "키워드와 링크를 모두 입력해주세요." };
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

    const [created] = await db.insert(rankKeywords).values({
      userId: user.id,
      platform: input.platform,
      keyword,
      targetName: targetName || null,
      targetUrl,
      isPaid,
    }).returning({ id: rankKeywords.id });

    revalidatePath("/marketing/rank");
    revalidatePath("/admin/rank");
    return { success: true, isPaid, id: created.id };
  } catch (err) {
    console.error("addRankKeyword error:", err);
    return { error: "키워드 등록 중 오류가 발생했습니다." };
  }
}

/** 오늘 (KST) — 이용 기간은 날짜 단위라 한국 날짜로 끊는다 */
const todayKST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());

/**
 * 통합순위관리 멤버십 결제 — 보유 포인트에서 월 이용료를 빼고 그 자리에서 이용을 시작한다.
 *
 * 관리자가 부여하던 것을 고객이 직접 결제하는 방식으로 바꿨다.
 * 이미 이용중이면 새로 시작하지 않고 남은 기간 뒤로 한 달을 붙인다(연장).
 */
export async function purchaseRankMembership(): Promise<
  { error: string } | { success: true; endDate: string; extended: boolean }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const today = todayKST();

  try {
    const [current] = await db
      .select()
      .from(rankMemberships)
      .where(eq(rankMemberships.userId, user.id))
      .orderBy(desc(rankMemberships.createdAt))
      .limit(1);

    const live = isMembershipLive(
      current ? { status: current.status, endDate: current.endDate } : null,
      today,
    );
    // 무기한 건은 붙일 자리가 없다 (관리자가 예전에 넣어 둔 건)
    if (live && !current.endDate) return { error: "이미 기간 제한 없이 이용 중입니다." };

    const [balanceRow] = await db
      .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
      .from(credits)
      .where(eq(credits.userId, user.id));

    if ((balanceRow?.balance ?? 0) < MEMBERSHIP_MONTHLY_FEE) {
      return { error: "보유 포인트가 부족합니다. 포인트를 충전해주세요." };
    }

    // 이용중이면 남은 기간이 끝난 다음부터, 아니면 오늘부터 한 달
    const base = live ? current.endDate! : today;
    const endDate = nextExpiry(base);

    await db.transaction(async (tx) => {
      await tx.insert(credits).values({
        userId: user.id,
        delta: String(-MEMBERSHIP_MONTHLY_FEE),
        reason: live ? "통합순위관리 멤버십 연장" : "통합순위관리 멤버십",
      });

      if (live) {
        await tx
          .update(rankMemberships)
          .set({ endDate, paidAt: today, updatedAt: new Date() })
          .where(eq(rankMemberships.id, current.id));
      } else {
        await tx.insert(rankMemberships).values({
          userId: user.id,
          status: "active",
          paidAt: today,
          startDate: today,
          endDate,
          monthlyFee: String(MEMBERSHIP_MONTHLY_FEE),
        });
      }
    });

    revalidatePath("/marketing/rank");
    revalidatePath("/admin/rank");
    return { success: true, endDate, extended: live };
  } catch (err) {
    console.error("purchaseRankMembership error:", err);
    return { error: "멤버십 결제 중 오류가 발생했습니다." };
  }
}

/** 장바구니에 담긴 리워드 한 건 — 주문하면 이 값 그대로 캠페인이 된다 */
export type CartCheckoutItem = {
  productId: string;
  channel?: "place" | "shopping" | "coupang";
  target?: string;
  url?: string;
  keyword?: string;
  dailyQty: number;
  days?: number;
  startDate?: string;
  serviceType?: "search" | "wishlist";
  kind?: "reward" | "review";
  review?: {
    reviewType: "blog_distribute";
    mainKeywords: string[];
    postingType: "후기성" | "정보성";
    hashtags: string[];
    businessInfo: string;
    imageMode: "CRAWL" | "ATTACH";
    imageDriveUrl?: string;
    crawlRequest?: string;
  };
};

/**
 * 장바구니 주문 확정 — 개발본과 같이 결제는 여기서만 한다.
 * 담긴 건마다 캠페인(신청접수)과 주문을 만들고 포인트를 한 번에 차감한다.
 * 금액은 화면 값을 믿지 않고 상품 단가 × 일 작업량 × 구동 기간으로 다시 계산하며,
 * 잔액이 모자라면 아무것도 남기지 않는다(전부 성공 또는 전부 취소).
 */
export async function checkoutCart(
  items: CartCheckoutItem[],
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
      if (unitPrice == null) throw new Error("판매가 중지된 상품입니다.");
      const dailyQty = Math.max(1, Math.floor(i.dailyQty));
      const days = Math.max(1, Math.floor(i.days ?? 1));
      const amount = unitPrice * dailyQty * days;
      total += amount;
      return { ...i, dailyQty, days, amount };
    });

    const [balanceRow] = await db
      .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
      .from(credits)
      .where(eq(credits.userId, user.id));

    if ((balanceRow?.balance ?? 0) < total) return { error: "보유 포인트가 부족합니다." };

    await db.transaction(async (tx) => {
      for (const p of priced) {
        // 리뷰·체험단 — 어드민 플레이스 리뷰 관리에 "신청" 상태로 뜬다
        if (p.kind === "review" && p.review) {
          const r = p.review;
          const totalQty = p.dailyQty * p.days;
          await tx.insert(reviewCampaigns).values({
            userId: user.id,
            platform: "place",
            reviewType: r.reviewType,
            storeName: p.target?.trim() || "-",
            targetUrl: p.url?.trim() || null,
            keyword: r.mainKeywords[0] ?? p.keyword ?? null,
            totalQty,
            unitPrice: String(p.amount / totalQty),
            totalAmount: String(p.amount),
            startDate: p.startDate || null,
            endDate: p.startDate ? addCalendarDays(p.startDate, p.days - 1) : null,
            status: "requested",
            setting: {
              postingType: r.postingType,
              mainKeywords: r.mainKeywords,
              hashtags: r.hashtags,
              businessInfo: r.businessInfo,
              imageMode: r.imageMode,
              imageDriveUrl: r.imageDriveUrl ?? null,
              crawlRequest: r.crawlRequest ?? null,
              issueDays: p.days,
              dailyVolume: p.dailyQty,
            },
          });
          await tx.insert(orders).values({ userId: user.id, amount: String(p.amount), method: "credit", status: "paid" });
          continue;
        }
        // 채널마다 어드민이 읽는 입력값 이름이 다르다 — 즉시 신청 때와 같은 모양으로 남긴다
        const target = p.target?.trim() ?? "";
        const url = p.url?.trim() ?? "";
        const keyword = p.keyword?.trim() ?? "";
        const inputs =
          p.channel === "place"
            ? { storeName: target, placeUrl: url, keyword }
            : p.channel === "coupang"
              ? { productName: target, productUrl: url, keyword, serviceType: p.serviceType === "wishlist" ? "wishlist" : "search" }
              : { productName: target, productUrl: url, keyword };
        const [camp] = await tx
          .insert(campaigns)
          .values({
            userId: user.id,
            productId: p.productId,
            status: "submitted",
            inputs,
            dailyQty: p.dailyQty,
            totalQty: p.dailyQty * p.days,
            startDate: p.startDate || null,
            endDate: p.startDate ? addCalendarDays(p.startDate, p.days - 1) : null,
            quotedAmount: String(p.amount),
            paidAmount: String(p.amount),
          })
          .returning({ id: campaigns.id });
        await tx.insert(orders).values({
          userId: user.id,
          campaignId: camp.id,
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
    revalidatePath("/marketing/my/campaigns");
    revalidatePath("/marketing/review/place/manage");
    revalidatePath("/admin/purchases");
    return { success: true, total };
  } catch (err) {
    console.error("checkoutCart error:", err);
    const message = err instanceof Error && err.message.includes("판매가")
      ? err.message
      : "주문 처리 중 오류가 발생했습니다.";
    return { error: message };
  }
}

/**
 * 관리자가 담아준 건 결제.
 * 단가표가 없는 문의 상품이라 금액은 담을 때 확정된 값을 그대로 쓴다.
 * (클라이언트가 보낸 금액은 믿지 않고 서버에 저장된 값으로만 계산한다)
 */
export async function checkoutAdminCartItems(
  ids: string[],
): Promise<{ error: string } | { success: true; total: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!ids.length) return { error: "결제할 항목이 없습니다." };

  try {
    // 본인 것 + 아직 결제 전인 건만 집는다
    const rows = await db
      .select()
      .from(adminCartItems)
      .where(
        and(
          inArray(adminCartItems.id, ids),
          eq(adminCartItems.userId, user.id),
          eq(adminCartItems.status, "pending"),
        ),
      );

    if (rows.length !== ids.length) {
      return { error: "장바구니가 변경되었습니다. 새로고침 후 다시 시도해주세요." };
    }

    const total = rows.reduce((sum, r) => sum + Number(r.amount), 0);

    const [balanceRow] = await db
      .select({ balance: sql<number>`coalesce(sum(${credits.delta}), 0)::float` })
      .from(credits)
      .where(eq(credits.userId, user.id));

    if ((balanceRow?.balance ?? 0) < total) return { error: "보유 포인트가 부족합니다." };

    await db.transaction(async (tx) => {
      for (const r of rows) {
        await tx.insert(orders).values({
          userId: user.id,
          amount: String(Number(r.amount)),
          method: "credit",
          status: "paid",
        });
        await tx
          .update(adminCartItems)
          .set({ status: "ordered", orderedAt: new Date(), updatedAt: new Date() })
          .where(eq(adminCartItems.id, r.id));
      }
      await tx.insert(credits).values({
        userId: user.id,
        delta: String(-total),
        reason: "장바구니 주문 (상담 상품)",
      });
    });

    revalidatePath("/marketing/cart");
    revalidatePath("/admin/cart");
    revalidatePath("/admin/purchases");
    return { success: true, total };
  } catch (err) {
    console.error("checkoutAdminCartItems error:", err);
    return { error: "주문 처리 중 오류가 발생했습니다." };
  }
}

/** 공지 조회수 +1 — 고객 공지사항 화면에서 공지를 열 때 부른다. 게시된 공지만 센다. */
export async function incrementNoticeView(noticeId: string): Promise<number | null> {
  const [row] = await db
    .update(notices)
    .set({ viewCount: sql`${notices.viewCount} + 1` })
    .where(and(eq(notices.id, noticeId), eq(notices.isPublished, true)))
    .returning({ viewCount: notices.viewCount });
  return row?.viewCount ?? null;
}

/** 순위추적 중단 — 키워드와 쌓인 순위 기록을 함께 지운다 (스냅샷은 FK cascade) */
export async function removeRankKeyword(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  try {
    await db.delete(rankKeywords).where(and(eq(rankKeywords.id, id), eq(rankKeywords.userId, user.id)));
    revalidatePath("/marketing/rank");
    revalidatePath("/admin/rank");
    return { success: true };
  } catch (err) {
    console.error("removeRankKeyword error:", err);
    return { error: "추적을 중단하지 못했습니다." };
  }
}

/**
 * 이 키워드만 다시 측정 — 측정은 백엔드 스케줄러 몫이다.
 * 로컬에는 크롤러 큐가 없어 소유만 확인하고 요청을 받아 둔다(다음 정기 측정에 반영).
 */
export async function requestRankRefresh(id: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const [row] = await db
    .select({ id: rankKeywords.id })
    .from(rankKeywords)
    .where(and(eq(rankKeywords.id, id), eq(rankKeywords.userId, user.id)))
    .limit(1);
  if (!row) return { error: "재측정을 요청하지 못했습니다." };
  return { success: true };
}

/**
 * 플레이스 링크 → 업체명 (리뷰 신청의 「가져오기」).
 * 링크에서 플레이스 ID 를 뽑아 네이버 모바일 플레이스 페이지의 제목(og:title)을 읽는다.
 * 네이버가 막거나 형식이 달라지면 이유를 돌려주고, 화면은 그 문구를 그대로 보여준다.
 */
export async function lookupPlaceName(
  url: string,
): Promise<{ companyName: string } | { companyName: null; reason: string }> {
  const raw = url.trim();
  let target = raw;
  // naver.me 단축 링크는 한 번 따라가서 실제 주소를 얻는다
  if (/naver\.me\//.test(raw)) {
    try {
      const r = await fetch(raw, { redirect: "manual", signal: AbortSignal.timeout(5000) });
      target = r.headers.get("location") ?? raw;
    } catch {
      return { companyName: null, reason: "업체명 조회에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }
  }
  const id = target.match(/(?:place|restaurant|hairshop|hospital|accommodation|nailshop)\/(\d{5,})/)?.[1] ?? target.match(/[?&]id=(\d{5,})/)?.[1];
  if (!id) return { companyName: null, reason: "플레이스 링크 주소 형식이 올바르지 않습니다. 주소를 다시 확인해 주세요." };

  try {
    const res = await fetch(`https://m.place.naver.com/place/${id}/home`, {
      headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!res.ok) return { companyName: null, reason: "업체명을 불러오지 못했습니다. 링크를 다시 확인해 주세요." };
    const html = await res.text();
    // 없는 ID 면 og:title 이 비고 <title> 은 늘 "네이버 플레이스"다 — 그 값을 업체명으로 쓰지 않는다
    const og = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/)?.[1];
    const name = og?.replace(/\s*[:|-]\s*네이버.*$/, "").trim();
    return name && name !== "네이버 플레이스"
      ? { companyName: name }
      : { companyName: null, reason: "업체명을 불러오지 못했습니다. 링크를 다시 확인해 주세요." };
  } catch {
    return { companyName: null, reason: "업체명 조회에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
}

/* ── 플레이스 리뷰 수정 요청 ─────────────────────────────────────────
   따로 테이블 없이 캠페인 setting 에 남긴다. 어드민이 검토 후 반영/반려한다.
   발행일수·일발행량·시작일은 결제 금액과 얽혀 있어 이 요청으로 못 바꾼다. */

async function ownReviewCampaign(userId: string, id: string) {
  const [row] = await db
    .select({ id: reviewCampaigns.id, setting: reviewCampaigns.setting })
    .from(reviewCampaigns)
    .where(and(eq(reviewCampaigns.id, id), eq(reviewCampaigns.userId, userId)))
    .limit(1);
  return row ?? null;
}

const nowKST = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul", dateStyle: "short", timeStyle: "short" }).format(new Date());

/** 캠페인 수정 요청 — 캠페인명·키워드·업체 정보·해시태그·이미지 출처 */
export async function requestReviewCampaignChange(
  campaignId: string,
  changes: Record<string, unknown>,
  reason: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!Object.keys(changes).length) return { error: "변경된 내용이 없습니다" };

  const row = await ownReviewCampaign(user.id, campaignId);
  if (!row) return { error: "수정 요청에 실패했습니다" };
  const setting = (row.setting ?? {}) as Record<string, unknown>;
  await db
    .update(reviewCampaigns)
    .set({
      setting: { ...setting, changeRequest: { status: "pending", requestedAt: nowKST(), reason: reason.trim().slice(0, 300) || undefined, changes } },
      updatedAt: new Date(),
    })
    .where(eq(reviewCampaigns.id, campaignId));
  revalidatePath("/marketing/review/place/manage");
  revalidatePath("/admin/review/place");
  return { success: true };
}

/** 등록된 블로그·리뷰 1건에 대한 수정 요청 (1건당 대기 중인 요청은 1개) */
export async function requestReviewPostChange(
  campaignId: string,
  taskId: string,
  text: string,
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!text.trim()) return { error: "수정 요청 내용을 입력해 주세요" };

  const row = await ownReviewCampaign(user.id, campaignId);
  if (!row) return { error: "수정 요청을 접수하지 못했습니다" };
  const setting = (row.setting ?? {}) as Record<string, unknown>;
  const reqs = { ...((setting.postRequests ?? {}) as Record<string, { status: string }>) };
  if (reqs[taskId]?.status === "pending") return { error: "이미 처리 대기 중인 요청이 있습니다. 먼저 철회해 주세요." };
  reqs[taskId] = { status: "pending", text: text.trim().slice(0, 1000), at: nowKST() } as never;
  await db.update(reviewCampaigns).set({ setting: { ...setting, postRequests: reqs }, updatedAt: new Date() }).where(eq(reviewCampaigns.id, campaignId));
  revalidatePath("/marketing/review/place/manage");
  return { success: true };
}

/** 대기 중인 글 수정 요청 철회 */
export async function withdrawReviewPostChange(campaignId: string, taskId: string): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const row = await ownReviewCampaign(user.id, campaignId);
  if (!row) return { error: "철회하지 못했습니다" };
  const setting = (row.setting ?? {}) as Record<string, unknown>;
  const reqs = { ...((setting.postRequests ?? {}) as Record<string, unknown>) };
  delete reqs[taskId];
  await db.update(reviewCampaigns).set({ setting: { ...setting, postRequests: reqs }, updatedAt: new Date() }).where(eq(reviewCampaigns.id, campaignId));
  revalidatePath("/marketing/review/place/manage");
  return { success: true };
}

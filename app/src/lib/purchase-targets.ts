import { db } from "@/db";
import {
  campaigns, products, businesses, guaranteedCampaigns, reviewCampaigns,
  users, memberProfiles,
} from "@/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { reviewTypeLabel } from "@/lib/admin-format";
import type { PurchaseTarget } from "@/lib/purchase-source";

/** 신청 건을 한 줄 형태로 모아 온다 — 서버에서만 호출한다 */

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** setting 에 담긴 숫자 — 신청 폼마다 키가 달라 후보를 순서대로 본다 */
function num(setting: Record<string, unknown>, ...keys: string[]) {
  for (const k of keys) {
    const v = setting[k];
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string" && v.trim() && Number(v) > 0) return Number(v);
  }
  return null;
}

/** 상품 카테고리·채널로 상위노출 플랫폼을 가른다 (loadCampaigns 와 같은 규칙) */
function rewardSource(category: string | null, channel: string | null) {
  if (category === "reward_coupang" || channel === "coupang") return "reward_coupang";
  if (category === "reward_place" || channel === "place") return "reward_place";
  return "reward_shopping";
}

export async function loadPurchaseTargets(): Promise<PurchaseTarget[]> {
  const [rewardRows, guaranteedRows, reviewRows] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        userId: campaigns.userId,
        inputs: campaigns.inputs,
        dailyQty: campaigns.dailyQty,
        totalQty: campaigns.totalQty,
        startDate: campaigns.startDate,
        endDate: campaigns.endDate,
        quotedAmount: campaigns.quotedAmount,
        status: campaigns.status,
        createdAt: campaigns.createdAt,
        productTitle: products.title,
        productCategory: products.category,
        productChannel: products.channel,
        businessName: businesses.name,
        userName: users.name,
        orgName: memberProfiles.orgName,
      })
      .from(campaigns)
      .leftJoin(products, eq(campaigns.productId, products.id))
      .leftJoin(businesses, eq(campaigns.businessId, businesses.id))
      .leftJoin(users, eq(campaigns.userId, users.id))
      .leftJoin(memberProfiles, eq(campaigns.userId, memberProfiles.userId))
      .orderBy(desc(campaigns.createdAt))
      .limit(500),
    db
      .select({
        id: guaranteedCampaigns.id,
        keyword: guaranteedCampaigns.keyword,
        targetName: guaranteedCampaigns.targetName,
        targetUrl: guaranteedCampaigns.targetUrl,
        guaranteedDays: guaranteedCampaigns.guaranteedDays,
        startDate: guaranteedCampaigns.startDate,
        endDate: guaranteedCampaigns.endDate,
        amount: guaranteedCampaigns.amount,
        setting: guaranteedCampaigns.setting,
        status: guaranteedCampaigns.status,
        createdAt: guaranteedCampaigns.createdAt,
        userName: users.name,
        orgName: memberProfiles.orgName,
      })
      .from(guaranteedCampaigns)
      .leftJoin(users, eq(guaranteedCampaigns.userId, users.id))
      .leftJoin(memberProfiles, eq(guaranteedCampaigns.userId, memberProfiles.userId))
      .orderBy(desc(guaranteedCampaigns.createdAt))
      .limit(500),
    db
      .select({
        id: reviewCampaigns.id,
        platform: reviewCampaigns.platform,
        reviewType: reviewCampaigns.reviewType,
        storeName: reviewCampaigns.storeName,
        targetUrl: reviewCampaigns.targetUrl,
        keyword: reviewCampaigns.keyword,
        totalQty: reviewCampaigns.totalQty,
        totalAmount: reviewCampaigns.totalAmount,
        setting: reviewCampaigns.setting,
        requestNote: reviewCampaigns.requestNote,
        startDate: reviewCampaigns.startDate,
        endDate: reviewCampaigns.endDate,
        status: reviewCampaigns.status,
        createdAt: reviewCampaigns.createdAt,
        userName: users.name,
        orgName: memberProfiles.orgName,
      })
      .from(reviewCampaigns)
      .leftJoin(users, eq(reviewCampaigns.userId, users.id))
      .leftJoin(memberProfiles, eq(reviewCampaigns.userId, memberProfiles.userId))
      .where(inArray(reviewCampaigns.platform, ["place", "naver_shopping", "coupang"]))
      .orderBy(desc(reviewCampaigns.createdAt))
      .limit(500),
  ]);

  const reward: PurchaseTarget[] = rewardRows.map((c) => {
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    return {
      sourceType: rewardSource(c.productCategory, c.productChannel),
      sourceId: c.id,
      advertiser: c.orgName ?? c.businessName ?? c.userName ?? "-",
      productName: c.productTitle ?? "-",
      targetName: str(inputs.storeName) ?? str(inputs.productName) ?? c.businessName ?? "-",
      targetUrl: str(inputs.placeUrl) ?? str(inputs.productUrl),
      keyword: str(inputs.keyword) ?? "",
      quantity: c.totalQty,
      dailyQty: c.dailyQty,
      saleAmount: Number(c.quotedAmount),
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      reviewType: null,
      platform: rewardSource(c.productCategory, c.productChannel).replace("reward_", ""),
      setting: inputs,
      requestNote: null,
    };
  });

  const guaranteed: PurchaseTarget[] = guaranteedRows.map((g) => {
    const setting = (g.setting ?? {}) as Record<string, unknown>;
    return {
      sourceType: "guaranteed",
      sourceId: g.id,
      advertiser: g.orgName ?? g.userName ?? "-",
      // 보장형 상품명은 셋팅에 담아 둔 값 (버즈빌 등)
      productName: str(setting.product) ?? "보장형",
      targetName: g.targetName ?? "-",
      targetUrl: g.targetUrl,
      keyword: g.keyword,
      quantity: g.guaranteedDays,
      dailyQty: num(setting, "dailyQty"),
      saleAmount: Number(g.amount),
      startDate: g.startDate,
      endDate: g.endDate,
      status: g.status,
      createdAt: g.createdAt.toISOString(),
      reviewType: null,
      platform: "place",
      setting,
      requestNote: null,
    };
  });

  const review: PurchaseTarget[] = reviewRows.map((r) => {
    const setting = (r.setting ?? {}) as Record<string, unknown>;
    return {
    sourceType: r.platform === "place" ? "review_place" : "review_shopping",
    sourceId: r.id,
    advertiser: r.orgName ?? r.userName ?? "-",
    productName: reviewTypeLabel[r.reviewType] ?? r.reviewType,
    targetName: r.storeName,
    targetUrl: r.targetUrl,
    keyword: r.keyword ?? "",
    quantity: r.totalQty,
    // 플레이스 리뷰는 dailyVolume, 쇼핑 리뷰는 dailyCount 로 들어온다
    dailyQty: num(setting, "dailyVolume", "dailyCount"),
    saleAmount: Number(r.totalAmount),
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reviewType: r.reviewType,
    platform: r.platform,
    setting,
    requestNote: r.requestNote,
    };
  });

  // 신청이 늦은 순 — 최근 들어온 건부터 발주한다
  return [...reward, ...guaranteed, ...review].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// 어드민 각 페이지가 실행하는 대표 쿼리를 실 DB에 직접 돌려 검증한다.
// (페이지는 인증 리다이렉트로 막혀 있어 HTTP 요청만으로는 쿼리가 실행되지 않음)
import { db } from "../src/db/index.js";
import {
  users, campaigns, orders, products, settlements, pointCharges, coupons,
  couponRedemptions, notices, boardPosts, rankKeywords, pricingRules,
  guaranteedCampaigns, campaignExtensions, reviewCampaigns, reviewTasks, serviceRequests,
} from "../src/db/schema.js";
import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { loadReviewAdminData } from "../src/lib/admin-review-data.js";

const checks: [string, () => Promise<unknown>][] = [
  ["대시보드 · 처리대기 집계", async () => {
    return Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(pointCharges).where(eq(pointCharges.status, "requested")),
      db.select({ c: sql<number>`count(*)::int` }).from(reviewCampaigns).where(sql`${reviewCampaigns.status} in ('requested','paid')`),
      db.select({ c: sql<number>`count(*)::int` }).from(guaranteedCampaigns).where(sql`${guaranteedCampaigns.status} in ('requested','reviewing')`),
      db.select({ c: sql<number>`count(*)::int` }).from(serviceRequests).where(eq(serviceRequests.status, "requested")),
      db.select({ c: sql<number>`count(*)::int` }).from(campaignExtensions).where(eq(campaignExtensions.status, "requested")),
    ]);
  }],

  ["회원관리 · 결제현황 집계", async () => {
    return Promise.all([
      db.select({
        userId: orders.userId,
        paidAmount: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} = 'paid'), 0)::float`,
        refundedAmount: sql<number>`coalesce(sum(${orders.amount}) filter (where ${orders.status} <> 'paid'), 0)::float`,
        orderCount: sql<number>`count(*)::int`,
        lastPaidAt: sql<string | null>`max(${orders.createdAt})`,
      }).from(orders).groupBy(orders.userId),
      db.select({
        userId: pointCharges.userId,
        chargedAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved'), 0)::float`,
      }).from(pointCharges).groupBy(pointCharges.userId),
    ]);
  }],

  ["포인트충전", async () => {
    return Promise.all([
      db.select({
        id: pointCharges.id, userName: users.name, amount: pointCharges.amount,
        status: pointCharges.status, createdAt: pointCharges.createdAt,
      }).from(pointCharges).leftJoin(users, eq(pointCharges.userId, users.id))
        .orderBy(desc(pointCharges.createdAt)).limit(300),
      db.select({
        waiting: sql<number>`count(*) filter (where ${pointCharges.status} = 'requested')::int`,
        waitingAmount: sql<number>`coalesce(sum(${pointCharges.amount}) filter (where ${pointCharges.status} = 'requested'), 0)::float`,
        approvedAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved'), 0)::float`,
        monthAmount: sql<number>`coalesce(sum(${pointCharges.amount} + ${pointCharges.bonusAmount}) filter (where ${pointCharges.status} = 'approved' and ${pointCharges.createdAt} >= date_trunc('month', now())), 0)::float`,
      }).from(pointCharges),
    ]);
  }],

  ["쿠폰 + 사용내역", async () => {
    return Promise.all([
      db.select().from(coupons).orderBy(desc(coupons.createdAt)).limit(300),
      db.select({
        id: couponRedemptions.id, couponName: coupons.name, userName: users.name,
        discountAmount: couponRedemptions.discountAmount, usedAt: couponRedemptions.usedAt,
      }).from(couponRedemptions)
        .leftJoin(coupons, eq(couponRedemptions.couponId, coupons.id))
        .leftJoin(users, eq(couponRedemptions.userId, users.id))
        .orderBy(desc(couponRedemptions.usedAt)).limit(300),
      db.select({
        active: sql<number>`count(*) filter (where ${coupons.isActive})::int`,
        totalIssued: sql<number>`coalesce(sum(${coupons.issuedCount}), 0)::int`,
        totalUsed: sql<number>`coalesce(sum(${coupons.usedCount}), 0)::int`,
      }).from(coupons),
    ]);
  }],

  ["공지사항", async () =>
    db.select({ id: notices.id, title: notices.title, authorName: users.name })
      .from(notices).leftJoin(users, eq(notices.authorId, users.id))
      .orderBy(desc(notices.isPinned), desc(notices.createdAt)).limit(300)],

  ["게시판", async () =>
    db.select().from(boardPosts)
      .orderBy(desc(boardPosts.isPinned), desc(boardPosts.createdAt)).limit(300)],

  ["통합순위관리", async () => {
    return Promise.all([
      db.select({
        id: rankKeywords.id, userName: users.name, platform: rankKeywords.platform,
        keyword: rankKeywords.keyword, monthlyFee: rankKeywords.monthlyFee,
      }).from(rankKeywords).leftJoin(users, eq(rankKeywords.userId, users.id))
        .orderBy(desc(rankKeywords.createdAt)).limit(500),
      db.select().from(pricingRules).where(eq(pricingRules.category, "rank"))
        .orderBy(asc(pricingRules.sortOrder), asc(pricingRules.label)),
      db.select({
        total: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where ${rankKeywords.isPaid})::int`,
        mrr: sql<number>`coalesce(sum(${rankKeywords.monthlyFee}) filter (where ${rankKeywords.isPaid} and ${rankKeywords.isActive}), 0)::float`,
        tracked: sql<number>`count(*) filter (where ${rankKeywords.isActive})::int`,
      }).from(rankKeywords),
    ]);
  }],

  ["상품등록 (신규 컬럼)", async () =>
    db.select({
      id: products.id, title: products.title, channel: products.channel,
      efficiency: products.efficiency, avgRankUpRate: products.avgRankUpRate,
      subscriptionInfo: products.subscriptionInfo,
    }).from(products).orderBy(desc(products.isActive), desc(products.createdAt))],

  ["리워드 캠페인 + 연장신청", async () =>
    db.select({
      id: campaignExtensions.id, userName: users.name, productTitle: products.title,
      addDays: campaignExtensions.addDays, status: campaignExtensions.status,
    }).from(campaignExtensions)
      .leftJoin(users, eq(campaignExtensions.userId, users.id))
      .leftJoin(campaigns, eq(campaignExtensions.targetId, campaigns.id))
      .leftJoin(products, eq(campaigns.productId, products.id))
      .where(eq(campaignExtensions.targetType, "campaign"))
      .orderBy(desc(campaignExtensions.createdAt)).limit(200)],

  ["보장형 캠페인", async () => {
    return Promise.all([
      db.select({
        id: guaranteedCampaigns.id, userName: users.name, keyword: guaranteedCampaigns.keyword,
        targetRank: guaranteedCampaigns.targetRank, status: guaranteedCampaigns.status,
      }).from(guaranteedCampaigns).leftJoin(users, eq(guaranteedCampaigns.userId, users.id))
        .orderBy(desc(guaranteedCampaigns.createdAt)).limit(300),
      db.select({
        total: sql<number>`count(*)::int`,
        requested: sql<number>`count(*) filter (where ${guaranteedCampaigns.status} = 'requested')::int`,
        running: sql<number>`count(*) filter (where ${guaranteedCampaigns.status} = 'running')::int`,
        revenue: sql<number>`coalesce(sum(${guaranteedCampaigns.amount}) filter (where ${guaranteedCampaigns.status} <> 'canceled'), 0)::float`,
      }).from(guaranteedCampaigns),
    ]);
  }],

  ["플레이스 리뷰 (공용 로더)", async () => loadReviewAdminData(["place"], "place_review")],
  ["쇼핑 리뷰 (공용 로더)", async () => loadReviewAdminData(["naver_shopping", "coupang"], "shopping_review")],

  ["리뷰 진행현황 inArray", async () => {
    const ids = (await db.select({ id: reviewCampaigns.id }).from(reviewCampaigns).limit(5)).map((r) => r.id);
    if (!ids.length) return "(리뷰 캠페인 없음 — inArray 스킵)";
    return db.select().from(reviewTasks).where(inArray(reviewTasks.reviewCampaignId, ids));
  }],

  ["서비스 신청내역", async () => {
    return Promise.all([
      db.select({
        id: serviceRequests.id, userName: users.name, serviceName: serviceRequests.serviceName,
        inputs: serviceRequests.inputs, status: serviceRequests.status,
      }).from(serviceRequests).leftJoin(users, eq(serviceRequests.userId, users.id))
        .orderBy(desc(serviceRequests.createdAt)).limit(300),
      db.select({
        total: sql<number>`count(*)::int`,
        requested: sql<number>`count(*) filter (where ${serviceRequests.status} = 'requested')::int`,
        inProgress: sql<number>`count(*) filter (where ${serviceRequests.status} in ('reviewing','quoted','in_progress'))::int`,
        quoted: sql<number>`coalesce(sum(${serviceRequests.quotedAmount}) filter (where ${serviceRequests.status} <> 'canceled'), 0)::float`,
      }).from(serviceRequests),
    ]);
  }],

  ["정산", async () => db.select().from(settlements).limit(50)],
];

let failed = 0;
for (const [name, fn] of checks) {
  try {
    const result = await fn();
    const count = Array.isArray(result)
      ? (Array.isArray(result[0]) ? result.map((r) => (Array.isArray(r) ? r.length : 1)).join("/") : result.length)
      : "obj";
    console.log(`  ok    ${name}  →  ${count}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}\n        ${e instanceof Error ? e.message : e}`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);

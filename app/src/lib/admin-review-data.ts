import { db } from "@/db";
import { reviewCampaigns, reviewTasks, users, memberProfiles, campaignExtensions, pricingRules } from "@/db/schema";
import { and, asc, desc, eq, gte, inArray, isNotNull, lte, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { reviewStage, todayKST } from "@/lib/admin-format";
import { periodRange, type PeriodParams } from "@/lib/period-filter";
import type { ExtensionRow } from "@/components/admin/ExtensionsPanel";
import type { PricingRuleRow } from "@/components/admin/PricingPanel";
import type {
  ReviewCampaignRow,
  ReviewTaskRow,
  UserOption,
} from "@/components/admin/ReviewCampaignsClient";

// 광고주(users)와 담당 관리자(users)를 같은 쿼리에서 조인하려면 별칭이 필요하다
const assignedAdmin = alias(users, "assigned_admin");

const DAY_MS = 24 * 60 * 60 * 1000;
const toYMD = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 기간은 화면에 "미정"으로 남기지 않는다.
 * 셋팅 전이면 신청일 기준 임시 기간(리뷰 건수만큼, 최소 7일)을 만들어 보여준다.
 */
function period(startDate: string | null, endDate: string | null, createdAt: Date, totalQty: number) {
  if (startDate && endDate) return { startDate, endDate, periodProvisional: false };
  const start = startDate ?? toYMD(createdAt);
  const days = Math.max(7, totalQty);
  const end = endDate ?? toYMD(new Date(new Date(start).getTime() + (days - 1) * DAY_MS));
  return { startDate: start, endDate: end, periodProvisional: true };
}

/** 플레이스/쇼핑 리뷰 어드민 페이지가 공유하는 데이터 로더 */
export async function loadReviewAdminData(
  platforms: string[],
  pricingCategory: string,
  periodParams: PeriodParams = {},
) {
  const platformFilter = inArray(
    reviewCampaigns.platform,
    platforms as ("place" | "naver_shopping" | "coupang")[],
  );

  const range = periodRange(periodParams);
  // 완료 데이터는 계속 쌓이므로 기간을 고르면 SQL 에서 종료일로 걸러 온다
  const rowFilter = range
    ? and(
        platformFilter,
        isNotNull(reviewCampaigns.endDate),
        gte(reviewCampaigns.endDate, range.start),
        lte(reviewCampaigns.endDate, range.end),
      )
    : platformFilter;

  const [campaignRows, ruleRows, userRows] = await Promise.all([
    db
      .select({
        id: reviewCampaigns.id,
        userId: reviewCampaigns.userId,
        userName: users.name,
        userEmail: users.email,
        orgName: memberProfiles.orgName,
        assignedAdminName: assignedAdmin.name,
        platform: reviewCampaigns.platform,
        reviewType: reviewCampaigns.reviewType,
        storeName: reviewCampaigns.storeName,
        targetUrl: reviewCampaigns.targetUrl,
        keyword: reviewCampaigns.keyword,
        totalQty: reviewCampaigns.totalQty,
        completedQty: reviewCampaigns.completedQty,
        unitPrice: reviewCampaigns.unitPrice,
        totalAmount: reviewCampaigns.totalAmount,
        startDate: reviewCampaigns.startDate,
        endDate: reviewCampaigns.endDate,
        status: reviewCampaigns.status,
        setting: reviewCampaigns.setting,
        requestNote: reviewCampaigns.requestNote,
        adminMemo: reviewCampaigns.adminMemo,
        createdAt: reviewCampaigns.createdAt,
      })
      .from(reviewCampaigns)
      .leftJoin(users, eq(reviewCampaigns.userId, users.id))
      .leftJoin(memberProfiles, eq(reviewCampaigns.userId, memberProfiles.userId))
      .leftJoin(assignedAdmin, eq(reviewCampaigns.assignedAdminId, assignedAdmin.id))
      .where(rowFilter)
      .orderBy(desc(reviewCampaigns.createdAt))
      .limit(500),
    db
      .select()
      .from(pricingRules)
      .where(eq(pricingRules.category, pricingCategory))
      .orderBy(asc(pricingRules.sortOrder), asc(pricingRules.label)),
    db.select({ id: users.id, name: users.name, email: users.email }).from(users).orderBy(users.name).limit(500),
  ]);

  const campaignIds = campaignRows.map((c) => c.id);

  const [taskRows, extensionRows] = await Promise.all([
    campaignIds.length
      ? db
          .select()
          .from(reviewTasks)
          .where(inArray(reviewTasks.reviewCampaignId, campaignIds))
          .orderBy(asc(reviewTasks.createdAt))
      : Promise.resolve([]),
    campaignIds.length
      ? db
          .select({
            id: campaignExtensions.id,
            targetType: campaignExtensions.targetType,
            userName: users.name,
            userEmail: users.email,
            addDays: campaignExtensions.addDays,
            addQty: campaignExtensions.addQty,
            amount: campaignExtensions.amount,
            status: campaignExtensions.status,
            memo: campaignExtensions.memo,
            createdAt: campaignExtensions.createdAt,
            storeName: reviewCampaigns.storeName,
          })
          .from(campaignExtensions)
          .leftJoin(users, eq(campaignExtensions.userId, users.id))
          .leftJoin(reviewCampaigns, eq(campaignExtensions.targetId, reviewCampaigns.id))
          .where(inArray(campaignExtensions.targetId, campaignIds))
          .orderBy(desc(campaignExtensions.createdAt))
          .limit(200)
      : Promise.resolve([]),
  ]);

  // 기간 선택지는 화면에 로드된 행이 아니라 전체 데이터에서 뽑는다
  const yearRows = await db
    .selectDistinct({ year: sql<number>`extract(year from ${reviewCampaigns.endDate})::int` })
    .from(reviewCampaigns)
    .where(and(platformFilter, isNotNull(reviewCampaigns.endDate)));
  const years = yearRows.map((r) => r.year).filter(Boolean).sort((a, b) => b - a);

  const today = todayKST();

  const rows: ReviewCampaignRow[] = campaignRows.map((c) => {
    const setting = (c.setting ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      userId: c.userId,
      advertiser: c.orgName ?? c.userName ?? "-",
      assignedAdminName: c.assignedAdminName ?? "",
      userName: c.userName ?? "(탈퇴 회원)",
      userEmail: c.userEmail ?? "-",
      platform: c.platform,
      reviewType: c.reviewType,
      storeName: c.storeName,
      targetUrl: c.targetUrl,
      keyword: c.keyword,
      totalQty: c.totalQty,
      completedQty: c.completedQty,
      unitPrice: Number(c.unitPrice),
      totalAmount: Number(c.totalAmount),
      ...period(c.startDate, c.endDate, c.createdAt, c.totalQty),
      stage: reviewStage(c.status, { startDate: c.startDate, endDate: c.endDate, today }),
      status: c.status,
      guide: typeof setting.guide === "string" ? setting.guide : "",
      mission: typeof setting.mission === "string" ? setting.mission : "",
      provideDetail: typeof setting.provideDetail === "string" ? setting.provideDetail : "",
      setting,
      requestNote: c.requestNote,
      adminMemo: c.adminMemo,
      createdAt: c.createdAt.toISOString(),
    };
  });

  const tasks: ReviewTaskRow[] = taskRows.map((t) => ({
    id: t.id,
    reviewCampaignId: t.reviewCampaignId,
    reviewerName: t.reviewerName,
    reviewerContact: t.reviewerContact,
    status: t.status,
    postUrl: t.postUrl,
    receiptUrl: t.receiptUrl,
    scheduledDate: t.scheduledDate,
    memo: t.memo,
  }));

  const extensions: ExtensionRow[] = extensionRows.map((e) => ({
    id: e.id,
    targetType: e.targetType,
    targetLabel: e.storeName ?? "(삭제된 캠페인)",
    userName: e.userName ?? "(탈퇴 회원)",
    userEmail: e.userEmail ?? "-",
    addDays: e.addDays,
    addQty: e.addQty,
    amount: Number(e.amount),
    status: e.status,
    memo: e.memo,
    createdAt: e.createdAt.toISOString(),
  }));

  const rules: PricingRuleRow[] = ruleRows.map((r) => ({
    id: r.id,
    category: r.category,
    key: r.key,
    label: r.label,
    unitPrice: Number(r.unitPrice),
    unit: r.unit,
    isActive: r.isActive,
    sortOrder: r.sortOrder,
  }));

  const userOptions: UserOption[] = userRows.map((u) => ({ id: u.id, name: u.name, email: u.email }));

  return { rows, tasks, extensions, rules, users: userOptions, years };
}

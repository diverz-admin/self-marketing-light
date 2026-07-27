import { db } from "@/db";
import { reviewCampaigns, reviewTasks } from "@/db/schema";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { reviewTypeLabel } from "@/lib/admin-format";
import type { Applicant, Campaign, PostUrl } from "@/components/marketing/ReviewManageTable";

/** DB 플랫폼 값 → 고객 화면 채널 라벨 */
const CHANNEL_LABEL: Record<string, string> = {
  place: "네이버 플레이스",
  naver_shopping: "네이버 쇼핑",
  coupang: "쿠팡",
};

/** 어드민 7단계 → 고객 화면 4단계 (진행중·대기중·일시정지·완료) */
function customerStatus(status: string): string {
  if (status === "completed") return "done";
  if (status === "running" || status === "recruiting") return "running";
  if (status === "canceled") return "paused";
  return "pending";
}

/** 리뷰어 제출 상태 → 고객 화면 표기 */
const TASK_REVIEW_STATUS: Record<string, Applicant["reviewStatus"]> = {
  waiting: "검토중",
  assigned: "검토중",
  writing: "검토중",
  submitted: "제출완료",
  approved: "승인",
  rejected: "반려",
};

const YMD = (d: Date) => d.toISOString().slice(0, 10);

/**
 * 로그인한 회원 본인의 리뷰 캠페인 — 어드민 "플레이스/쇼핑 리뷰"와 같은 행을 본다.
 * platforms 로 화면(플레이스 / 쇼핑·쿠팡)을 가른다.
 */
export async function loadMyReviewCampaigns(
  userId: string,
  platforms: ("place" | "naver_shopping" | "coupang")[],
): Promise<Campaign[]> {
  const rows = await db
    .select()
    .from(reviewCampaigns)
    .where(and(eq(reviewCampaigns.userId, userId), inArray(reviewCampaigns.platform, platforms)))
    .orderBy(desc(reviewCampaigns.createdAt))
    .limit(200);

  if (rows.length === 0) return [];

  const taskRows = await db
    .select()
    .from(reviewTasks)
    .where(inArray(reviewTasks.reviewCampaignId, rows.map((r) => r.id)))
    .orderBy(asc(reviewTasks.createdAt));

  const tasksByCampaign = new Map<string, typeof taskRows>();
  for (const t of taskRows) {
    const list = tasksByCampaign.get(t.reviewCampaignId) ?? [];
    list.push(t);
    tasksByCampaign.set(t.reviewCampaignId, list);
  }

  return rows.map((c) => {
    const setting = (c.setting ?? {}) as Record<string, unknown>;
    const tasks = tasksByCampaign.get(c.id) ?? [];

    const applicants: Applicant[] = tasks.map((t) => ({
      name: t.reviewerName ?? "-",
      blogUrl: t.postUrl ?? "",
      submittedAt: t.scheduledDate ?? "",
      reviewStatus: TASK_REVIEW_STATUS[t.status] ?? "검토중",
    }));

    // 작성 URL 이 실제로 올라온 건만 "발행된 원고"로 본다
    const postUrls: PostUrl[] = tasks
      .filter((t) => !!t.postUrl)
      .map((t) => ({
        name: t.reviewerName ?? "-",
        url: t.postUrl as string,
        writtenAt: t.completedAt ? YMD(t.completedAt) : t.scheduledDate ?? "",
      }));

    return {
      id: c.id,
      campaignName: c.storeName,
      keyword: c.keyword ?? "",
      totalCount: c.totalQty,
      doneCount: c.completedQty,
      status: customerStatus(c.status),
      startDate: c.startDate ?? YMD(c.createdAt),
      endDate: c.endDate ?? "",
      requestDate: YMD(c.createdAt),
      amount: Number(c.totalAmount),
      type: reviewTypeLabel[c.reviewType] ?? c.reviewType,
      channel: CHANNEL_LABEL[c.platform],
      productType:
        c.reviewType === "product_provided"
          ? "제품제공"
          : c.reviewType === "product_not_provided"
            ? "제품미제공"
            : undefined,
      postingUrl: c.targetUrl ?? "",
      hashtags: Array.isArray(setting.hashtags) ? (setting.hashtags as string[]) : [],
      applicants,
      postUrls,
    };
  });
}

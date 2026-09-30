import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { reviewCampaigns, reviewTasks } from "@/db/schema";
import type {
  PlaceReviewPost, PlaceReviewRow, ReviewChangeRequest, ReviewStatus,
} from "@/lib/place-review-types";

export type { PlaceReviewPost, PlaceReviewRow, ReviewChangeRequest, ReviewStatus } from "@/lib/place-review-types";

const YMD = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);

/** 어드민 7단계 → 고객 화면 4단계 (개발본: 대기중·진행중·완료·일시정지) */
function customerStatus(status: string): ReviewStatus {
  if (status === "completed") return "done";
  if (status === "running" || status === "recruiting") return "running";
  if (status === "canceled") return "paused";
  return "pending";
}

const arr = (v: unknown) => (Array.isArray(v) ? (v as unknown[]).map(String).filter(Boolean) : []);
const str = (v: unknown) => (typeof v === "string" ? v : "");

/**
 * 네이버 플레이스 리뷰 관리 — 회원 본인의 플레이스 리뷰 캠페인과 등록된 블로그·리뷰.
 * 수정 요청은 따로 테이블 없이 캠페인 setting 에 남긴다(어드민 리뷰 관리가 같은 값을 본다).
 */
export async function loadPlaceReviewManage(userId: string): Promise<PlaceReviewRow[]> {
  const rows = await db
    .select()
    .from(reviewCampaigns)
    .where(and(eq(reviewCampaigns.userId, userId), eq(reviewCampaigns.platform, "place")))
    .orderBy(desc(reviewCampaigns.createdAt))
    .limit(200);
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const tasks = await db.select().from(reviewTasks).where(inArray(reviewTasks.reviewCampaignId, ids)).orderBy(asc(reviewTasks.createdAt));
  const byCampaign = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const list = byCampaign.get(t.reviewCampaignId) ?? [];
    list.push(t);
    byCampaign.set(t.reviewCampaignId, list);
  }

  return rows
    .filter((c) => c.reviewType === "blog_distribute" || c.reviewType === "receipt")
    .map((c) => {
      const s = (c.setting ?? {}) as Record<string, unknown>;
      const postReq = (s.postRequests ?? {}) as Record<string, PlaceReviewPost["request"]>;
      const posts: PlaceReviewPost[] = (byCampaign.get(c.id) ?? [])
        .filter((t) => !!t.postUrl)
        .map((t) => ({
          id: t.id,
          date: t.completedAt ? YMD(t.completedAt) : t.scheduledDate ?? YMD(t.createdAt),
          url: t.postUrl as string,
          reviewer: t.reviewerName ?? "-",
          request: postReq[t.id] ?? null,
        }));
      const days = Number(s.issueDays) || (c.startDate && c.endDate ? Math.round((Date.parse(c.endDate) - Date.parse(c.startDate)) / 86_400_000) + 1 : 1);
      const daily = Number(s.dailyVolume) || Math.max(1, Math.round(c.totalQty / days));
      const mainKeywords = arr(s.mainKeywords);
      return {
        id: c.id,
        name: c.storeName,
        type: c.reviewType as "blog_distribute" | "receipt",
        url: c.targetUrl ?? "",
        mainKeywords: mainKeywords.length ? mainKeywords : c.keyword ? [c.keyword] : [],
        hashtags: arr(s.hashtags).map((h) => h.replace(/^#/, "")),
        bizInfo: str(s.businessInfo),
        postType: str(s.postingType) || "후기성",
        imageMode: s.imageMode === "ATTACH" ? "ATTACH" : "CRAWL",
        imageDriveUrl: str(s.imageDriveUrl),
        crawlRequest: str(s.crawlRequest),
        days,
        daily,
        total: c.totalQty,
        registered: posts.length,
        requestedAt: YMD(c.createdAt),
        status: customerStatus(c.status),
        posts,
        changeRequest: (s.changeRequest as ReviewChangeRequest | undefined) ?? null,
      };
    });
}

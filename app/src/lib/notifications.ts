import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { adminCartItems, campaigns, pointCharges, products, serviceRequests } from "@/db/schema";

/**
 * 고객 알림 — 따로 쌓는 알림 테이블 없이, 이미 있는 기록(충전·캠페인·서비스 신청·담아주기)에서
 * 최근 상태 변화를 알림 한 줄로 만든다. 읽음·삭제 여부는 브라우저에 남긴다(NotificationStore).
 *
 * 알림 id 는 "원본 id + 상태"라 같은 건의 상태가 바뀌면 새 알림으로 다시 뜬다.
 */
import type { AppNotification, NotificationTone } from "./notification-types";
export { CATEGORY_LABEL, type AppNotification, type NotificationCategory, type NotificationTone } from "./notification-types";

const won = (v: string | number) => `${Number(v).toLocaleString()}P`;

const CAMPAIGN_TEXT: Partial<Record<string, { tone: NotificationTone; title: string }>> = {
  submitted: { tone: "wait", title: "캠페인 접수 완료" },
  reviewing: { tone: "wait", title: "캠페인 검토 중" },
  scheduled: { tone: "info", title: "캠페인 셋팅 완료" },
  running: { tone: "ok", title: "캠페인 구동 시작" },
  paused: { tone: "info", title: "캠페인 일시정지" },
  completed: { tone: "ok", title: "캠페인 완료" },
  canceled: { tone: "fail", title: "캠페인 중단" },
  refunded: { tone: "info", title: "캠페인 환불 완료" },
};

const SERVICE_TEXT: Partial<Record<string, { tone: NotificationTone; title: string }>> = {
  requested: { tone: "wait", title: "서비스 신청 접수" },
  reviewing: { tone: "info", title: "상담이 시작되었습니다" },
  quoted: { tone: "info", title: "견적이 도착했습니다" },
  in_progress: { tone: "ok", title: "서비스 진행 시작" },
  completed: { tone: "ok", title: "서비스 완료" },
  canceled: { tone: "fail", title: "서비스 신청 취소" },
};

export async function loadNotifications(userId: string): Promise<AppNotification[]> {
  const since = new Date();
  since.setDate(since.getDate() - 60);

  const [charges, camps, services, pushes] = await Promise.all([
    db
      .select()
      .from(pointCharges)
      .where(and(eq(pointCharges.userId, userId), gte(pointCharges.createdAt, since)))
      .orderBy(desc(pointCharges.createdAt))
      .limit(30),
    db
      .select({ c: campaigns, productName: products.title, productType: products.productType, channel: products.channel })
      .from(campaigns)
      .leftJoin(products, eq(products.id, campaigns.productId))
      .where(and(eq(campaigns.userId, userId), gte(campaigns.updatedAt, since)))
      .orderBy(desc(campaigns.updatedAt))
      .limit(30),
    db
      .select()
      .from(serviceRequests)
      .where(and(eq(serviceRequests.userId, userId), gte(serviceRequests.updatedAt, since)))
      .orderBy(desc(serviceRequests.updatedAt))
      .limit(20),
    db
      .select()
      .from(adminCartItems)
      .where(and(eq(adminCartItems.userId, userId), eq(adminCartItems.status, "pending")))
      .orderBy(desc(adminCartItems.createdAt))
      .limit(10),
  ]);

  const out: AppNotification[] = [];

  for (const p of charges) {
    const at = (p.processedAt ?? p.createdAt).toISOString();
    const amount = won(Number(p.amount) + Number(p.bonusAmount));
    if (p.status === "approved") {
      out.push({ id: `charge:${p.id}:ok`, category: "charge", tone: "ok", title: "포인트 충전 완료", body: `${amount}가 충전되었습니다`, at, href: "/marketing/my/charge" });
    } else if (p.status === "requested") {
      out.push({ id: `charge:${p.id}:wait`, category: "charge", tone: "wait", title: "충전 요청 접수", body: `${won(p.amount)} · 입금 확인 후 충전됩니다`, at, href: "/marketing/my/charge" });
    } else {
      out.push({ id: `charge:${p.id}:fail`, category: "charge", tone: "fail", title: "충전 요청 취소", body: `${won(p.amount)} 충전 요청이 취소되었습니다`, at, href: "/marketing/my/charge" });
    }
  }

  for (const { c, productName, productType, channel } of camps) {
    const t = CAMPAIGN_TEXT[c.status];
    if (!t) continue;
    const inputs = (c.inputs ?? {}) as Record<string, unknown>;
    const target = String(inputs.placeName ?? inputs.productName ?? inputs.keyword ?? productName ?? "캠페인");
    const isReview = productType === "blog_review" || productType === "visit_review";
    const href = isReview
      ? "/marketing/review/place/manage"
      : channel === "shopping"
        ? "/marketing/reward/shopping/manage"
        : channel === "coupang"
          ? "/marketing/reward/coupang/manage"
          : "/marketing/reward/place/manage";
    out.push({
      id: `campaign:${c.id}:${c.status}`,
      category: isReview ? "review" : "reward",
      tone: t.tone,
      title: t.title,
      body: target,
      at: c.updatedAt.toISOString(),
      href,
    });
  }

  for (const s of services) {
    const t = SERVICE_TEXT[s.status];
    if (!t) continue;
    out.push({
      id: `service:${s.id}:${s.status}`,
      category: "etc",
      tone: t.tone,
      title: t.title,
      body: s.status === "quoted" && Number(s.quotedAmount) > 0 ? `${s.serviceName} · ${won(s.quotedAmount)}` : s.serviceName,
      at: s.updatedAt.toISOString(),
      href: "/marketing/my/service-inquiries",
    });
  }

  for (const a of pushes) {
    out.push({
      id: `cart:${a.id}`,
      category: "etc",
      tone: "info",
      title: "장바구니에 상품을 담아 드렸어요",
      body: `${a.title} · ${won(a.amount)}`,
      at: a.createdAt.toISOString(),
      href: "/marketing/cart",
    });
  }

  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 60);
}

/** 로그인 전 체험용 예시 알림 */
export function demoNotifications(): AppNotification[] {
  const ago = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
  return [
    { id: "demo:1", category: "reward", tone: "ok", title: "캠페인 구동 시작", body: "강남 한우담 본점", at: ago(12), href: "/marketing/reward/place/manage" },
    { id: "demo:2", category: "charge", tone: "ok", title: "포인트 충전 완료", body: "300,000P가 충전되었습니다", at: ago(95), href: "/marketing/my/charge" },
    { id: "demo:3", category: "review", tone: "wait", title: "캠페인 접수 완료", body: "연남 베이글하우스", at: ago(60 * 26), href: "/marketing/review/place/manage" },
  ];
}

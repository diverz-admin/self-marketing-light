/** 알림 타입 — 클라이언트도 읽으므로 DB 코드와 떼어 둔다 */
export type NotificationCategory = "reward" | "review" | "charge" | "referral" | "notice" | "etc";
export type NotificationTone = "ok" | "fail" | "wait" | "info";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  tone: NotificationTone;
  title: string;
  body: string;
  at: string; // ISO
  href: string;
};

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  reward: "리워드",
  review: "리뷰·체험단",
  charge: "충전",
  referral: "추천",
  notice: "공지",
  etc: "기타",
};


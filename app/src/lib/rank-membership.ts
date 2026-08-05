/**
 * 통합순위관리 멤버십 규칙 — 서버·클라이언트가 같은 기준을 쓰도록 한곳에 둔다.
 *
 * 회원가입만 하면 키워드 1개는 무료다.
 * 2개째부터는 멤버십이 있어야 등록할 수 있고, 이용중인 동안은 개수 제한이 없다.
 * 멤버십은 한 달 단위로 결제하며, 끝나기 3일 전에 연장 안내가 나간다.
 * 연장하지 않으면 처음 등록한 키워드 1개만 남고 나머지는 잠긴다(추적 중지).
 */
export const FREE_KEYWORD_LIMIT = 1;

/** 멤버십 기간 (개월) — 한 달 단위 결제 */
export const MEMBERSHIP_MONTHS = 1;

/** 만료 며칠 전부터 연장 안내를 보내는지 */
export const RENEWAL_NOTICE_DAYS = 3;

export const MEMBERSHIP_STATUS_META: Record<string, { label: string; tone: "green" | "gray" | "red" }> = {
  active: { label: "이용중", tone: "green" },
  expired: { label: "만료", tone: "gray" },
  canceled: { label: "해지", tone: "red" },
};

export type MembershipView = {
  id: string;
  status: string;
  /** 사용자가 결제한 날 */
  paidAt: string | null;
  startDate: string;
  endDate: string | null;
  monthlyFee: number;
  memo: string | null;
};

/**
 * 지금 이 멤버십이 살아 있는지.
 * status 는 관리자가 바꾸지만 만료일은 저절로 지나가므로 날짜도 함께 본다.
 */
export function isMembershipLive(m: { status: string; endDate: string | null } | null, today: string) {
  if (!m) return false;
  if (m.status !== "active") return false;
  return !m.endDate || m.endDate >= today;
}

/** 만료까지 남은 일수 (무기한·없음이면 null, 이미 지났으면 음수) */
export function daysUntilExpiry(endDate: string | null, today: string): number | null {
  if (!endDate) return null;
  const end = Date.parse(`${endDate}T00:00:00Z`);
  const now = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(end) || Number.isNaN(now)) return null;
  return Math.round((end - now) / 86_400_000);
}

/** 연장 안내를 보낼 시점인지 — 만료 3일 전부터 만료일까지 */
export function isRenewalDue(
  m: { status: string; endDate: string | null } | null,
  today: string,
): boolean {
  if (!isMembershipLive(m, today)) return false;
  const left = daysUntilExpiry(m?.endDate ?? null, today);
  return left != null && left >= 0 && left <= RENEWAL_NOTICE_DAYS;
}

/** 이 회원이 지금 등록할 수 있는 키워드 수 (null = 무제한) */
export function keywordLimitOf(live: boolean): number | null {
  return live ? null : FREE_KEYWORD_LIMIT;
}

/**
 * 잠기는 키워드 id — 멤버십이 없으면 처음 등록한 1개만 남기고 나머지를 잠근다.
 * 등록 순서는 오래된 것이 먼저다.
 */
export function lockedKeywordIds(
  keywords: { id: string; createdAt: string }[],
  live: boolean,
): Set<string> {
  if (live) return new Set();
  const ordered = [...keywords].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return new Set(ordered.slice(FREE_KEYWORD_LIMIT).map((k) => k.id));
}

/** 한도를 넘겨 잠긴 키워드 수 */
export function overLimitCount(keywordCount: number, live: boolean) {
  if (live) return 0;
  return Math.max(0, keywordCount - FREE_KEYWORD_LIMIT);
}

/** 결제일 + 1개월 — 이용 종료일 기본값 */
export function nextExpiry(paidAt: string): string {
  const [y, m, d] = paidAt.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + MEMBERSHIP_MONTHS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

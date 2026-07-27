import { db } from "@/db";
import { notices } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

/** 대시보드 공지 위젯 한 줄 */
export type DashboardNotice = { id: string; title: string; date: string; isNew: boolean };

/** 서버·클라이언트가 같은 문자열을 쓰도록 KST 기준으로 미리 포맷한다 */
const KST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * 대시보드 위젯용 최근 공지 — 어드민 "공지사항"에 발행된 글만,
 * 공지 목록 화면(/marketing/notices)과 같은 기준으로 가져온다.
 */
export async function loadDashboardNotices(limit = 5): Promise<DashboardNotice[]> {
  const rows = await db
    .select()
    .from(notices)
    .where(eq(notices.isPublished, true))
    .orderBy(desc(notices.isPinned), desc(notices.createdAt))
    .limit(limit);

  const now = Date.now();

  return rows.map((n) => {
    const at = n.publishedAt ?? n.createdAt;
    const [, m, d] = KST_DATE.format(at).split("-");
    return {
      id: n.id,
      title: n.title,
      date: `${m}.${d}`,
      // 최근 7일 이내 공지에 NEW 뱃지
      isNew: now - at.getTime() < NEW_WINDOW_MS,
    };
  });
}

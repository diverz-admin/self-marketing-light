import { db } from "@/db";
import { notices } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { parseAttachments } from "@/lib/attachments";
import { noticeCategoryMeta } from "@/lib/admin-format";
import { NoticesView, type NoticeItem } from "./NoticesView";

export const dynamic = "force-dynamic";

/** 서버·클라이언트가 같은 문자열을 쓰도록 KST 기준으로 미리 포맷한다 */
const KST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatKoreanDate(d: Date) {
  const [y, m, day] = KST_DATE.format(d).split("-");
  return `${y}년 ${m}월 ${day}일`;
}

export default async function NoticesPage() {
  const rows = await db
    .select()
    .from(notices)
    .where(eq(notices.isPublished, true))
    .orderBy(desc(notices.isPinned), desc(notices.createdAt))
    .limit(200);

  const items: NoticeItem[] = rows.map((n) => ({
    id: n.id,
    title: n.title,
    date: formatKoreanDate(n.publishedAt ?? n.createdAt),
    categoryLabel: noticeCategoryMeta[n.category]?.label ?? "공지",
    isPinned: n.isPinned,
    // 관리자가 입력한 본문을 문단 단위로 나눠 렌더한다
    paragraphs: n.content.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean),
    attachments: parseAttachments(n.attachments),
  }));

  return <NoticesView notices={items} />;
}

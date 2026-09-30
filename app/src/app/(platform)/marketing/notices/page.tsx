import { db } from "@/db";
import { notices } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { parseAttachments } from "@/lib/attachments";
import { NoticesView, type NoticeItem } from "./NoticesView";

export const dynamic = "force-dynamic";

/** 서버·클라이언트가 같은 문자열을 쓰도록 KST 기준으로 미리 포맷한다 */
const KST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [rows, sp] = await Promise.all([
    db
      .select()
      .from(notices)
      .where(eq(notices.isPublished, true))
      .orderBy(desc(notices.isPinned), desc(notices.createdAt))
      .limit(200),
    searchParams,
  ]);

  const items: NoticeItem[] = rows.map((n) => {
    const [y, m, d] = KST_DATE.format(n.publishedAt ?? n.createdAt).split("-");
    return {
      id: n.id,
      title: n.title,
      date: `${y}.${m}.${d}`,
      shortDate: `${y.slice(2)}.${m}.${d}`,
      category: n.category,
      isPinned: n.isPinned,
      viewCount: n.viewCount,
      // 관리자가 입력한 본문을 문단 단위로 나눠 렌더한다
      paragraphs: n.content.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean),
      attachments: parseAttachments(n.attachments),
    };
  });

  const cat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const post = Array.isArray(sp.post) ? sp.post[0] : sp.post;
  return <NoticesView notices={items} initialCategory={cat} initialPostId={post} />;
}

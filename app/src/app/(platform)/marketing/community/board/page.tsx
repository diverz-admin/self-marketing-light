import { db } from "@/db";
import { boardPosts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { parseAttachments } from "@/lib/attachments";
import { boardTypeMeta } from "@/lib/admin-format";
import { BoardView, type BoardItem } from "./BoardView";

export const dynamic = "force-dynamic";

/** DB 채널값 → 사용자 화면 탭 라벨 */
const CHANNEL_LABEL = {
  shopping: "네이버 쇼핑",
  place: "네이버 플레이스",
  coupang: "쿠팡",
} as const;

const KST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 서버·클라이언트가 같은 문자열을 쓰도록 미리 포맷 (2026.06.20) */
const formatDot = (d: Date) => KST_DATE.format(d).replace(/-/g, ".");

export default async function BoardPage() {
  const rows = await db
    .select()
    .from(boardPosts)
    .where(and(eq(boardPosts.isPublished, true), eq(boardPosts.isBlinded, false)))
    .orderBy(desc(boardPosts.isPinned), desc(boardPosts.createdAt))
    .limit(300);

  const posts: BoardItem[] = rows.map((p) => ({
    id: p.id,
    platform: p.channel ? CHANNEL_LABEL[p.channel] : null,
    category: boardTypeMeta[p.boardType]?.label ?? "자유",
    title: p.title,
    author: p.authorName ?? "관리자",
    date: formatDot(p.createdAt),
    views: p.viewCount,
    comments: p.commentCount,
    pinned: p.isPinned,
    paragraphs: p.content.split(/\n\s*\n|\n/).map((t) => t.trim()).filter(Boolean),
    attachments: parseAttachments(p.attachments),
  }));

  return <BoardView posts={posts} />;
}

import { db } from "@/db";
import { boardPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { parseAttachments } from "@/lib/attachments";
import { BoardClient, type BoardPostRow } from "./BoardClient";

export const dynamic = "force-dynamic";

export default async function AdminBoardPage() {
  const rows = await db
    .select()
    .from(boardPosts)
    .orderBy(desc(boardPosts.isPinned), desc(boardPosts.createdAt))
    .limit(300);

  const data: BoardPostRow[] = rows.map((p) => ({
    id: p.id,
    boardType: p.boardType,
    channel: p.channel,
    title: p.title,
    content: p.content,
    authorName: p.authorName ?? "관리자",
    isPinned: p.isPinned,
    isPublished: p.isPublished,
    isBlinded: p.isBlinded,
    viewCount: p.viewCount,
    commentCount: p.commentCount,
    attachments: parseAttachments(p.attachments),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle title="게시판" description="게시판별 글을 등록하고 노출·블라인드를 관리합니다." />
      <BoardClient rows={data} />
    </div>
  );
}

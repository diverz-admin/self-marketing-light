import { db } from "@/db";
import { notices, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { PageTitle } from "@/components/admin/ui";
import { parseAttachments } from "@/lib/attachments";
import { NoticesClient, type NoticeRow } from "./NoticesClient";

export const dynamic = "force-dynamic";

export default async function AdminNoticesPage() {
  const rows = await db
    .select({
      id: notices.id,
      title: notices.title,
      content: notices.content,
      category: notices.category,
      isPinned: notices.isPinned,
      isPublished: notices.isPublished,
      viewCount: notices.viewCount,
      attachments: notices.attachments,
      authorName: users.name,
      publishedAt: notices.publishedAt,
      createdAt: notices.createdAt,
    })
    .from(notices)
    .leftJoin(users, eq(notices.authorId, users.id))
    .orderBy(desc(notices.isPinned), desc(notices.createdAt))
    .limit(300);

  const data: NoticeRow[] = rows.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    category: n.category,
    isPinned: n.isPinned,
    isPublished: n.isPublished,
    viewCount: n.viewCount,
    attachments: parseAttachments(n.attachments),
    authorName: n.authorName ?? "관리자",
    publishedAt: n.publishedAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div>
      <PageTitle title="공지사항" description="서비스 공지를 등록하고 노출 여부를 관리합니다." />
      <NoticesClient rows={data} />
    </div>
  );
}

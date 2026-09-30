"use server";

import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { boardComments, boardPosts, users } from "@/db/schema";
import { createClient } from "@/utils/supabase/server";
import { LOGIN_DISABLED } from "@/lib/auth-mode";

export type BoardCommentItem = {
  id: string;
  parentId: string | null;
  authorName: string;
  isAdmin: boolean;
  isMine: boolean;
  isDeleted: boolean;
  content: string;
  /** 2026.09.28 14:05 (KST) */
  createdAt: string;
};

const MAX_LEN = 1000;

const KST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
function fmt(d: Date) {
  const parts = Object.fromEntries(KST.formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}.${parts.month}.${parts.day} ${parts.hour}:${parts.minute}`;
}

/**
 * 댓글을 쓰는 회원. 로그인한 회원이 우선이고, 로그인이 걷힌 상태(LOGIN_DISABLED)에서는
 * 다른 고객 화면과 같이 데모 회원(가장 먼저 만들어진 회원)으로 본다. 없으면 null = 댓글 불가.
 */
async function commenter() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const query = db.select({ id: users.id, name: users.name, role: users.role }).from(users);
  const [row] = user
    ? await query.where(eq(users.id, user.id)).limit(1)
    : LOGIN_DISABLED
      ? await query.orderBy(asc(users.createdAt)).limit(1)
      : [];
  return row ?? null;
}

/** 게시글의 댓글 수 = 지워지지 않은 댓글·답글 수 (목록의 (N) 표시가 이 값을 쓴다) */
async function syncCommentCount(postId: string) {
  await db
    .update(boardPosts)
    .set({
      commentCount: sql`(select count(*)::int from ${boardComments}
        where ${boardComments.postId} = ${postId} and ${boardComments.isDeleted} = false)`,
    })
    .where(eq(boardPosts.id, postId));
}

export async function listBoardComments(postId: string): Promise<{
  comments: BoardCommentItem[];
  canComment: boolean;
}> {
  const [me, rows] = await Promise.all([
    commenter(),
    db.select().from(boardComments).where(eq(boardComments.postId, postId)).orderBy(asc(boardComments.createdAt)),
  ]);
  return {
    canComment: !!me,
    comments: rows.map((c) => ({
      id: c.id,
      parentId: c.parentId,
      authorName: c.isDeleted ? "" : c.authorName,
      isAdmin: c.isAdmin,
      isMine: !!me && c.userId === me.id && !c.isDeleted,
      isDeleted: c.isDeleted,
      content: c.isDeleted ? "" : c.content,
      createdAt: fmt(c.createdAt),
    })),
  };
}

export async function addBoardComment(input: {
  postId: string;
  parentId?: string | null;
  content: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const content = input.content.trim();
  if (!content) return { ok: false, error: "내용을 입력해 주세요." };
  if (content.length > MAX_LEN) return { ok: false, error: `댓글은 ${MAX_LEN.toLocaleString()}자까지 쓸 수 있습니다.` };

  const me = await commenter();
  if (!me) return { ok: false, error: "로그인하면 댓글을 쓸 수 있습니다." };

  const [post] = await db
    .select({ id: boardPosts.id })
    .from(boardPosts)
    .where(and(eq(boardPosts.id, input.postId), eq(boardPosts.isPublished, true), eq(boardPosts.isBlinded, false)));
  if (!post) return { ok: false, error: "게시글을 찾을 수 없습니다." };

  // 답글은 한 단계까지 — 답글에 단 답글은 원댓글 아래로 붙인다
  let parentId: string | null = null;
  if (input.parentId) {
    const [parent] = await db
      .select({ id: boardComments.id, parentId: boardComments.parentId, isDeleted: boardComments.isDeleted })
      .from(boardComments)
      .where(and(eq(boardComments.id, input.parentId), eq(boardComments.postId, post.id)));
    if (!parent || parent.isDeleted) return { ok: false, error: "답글을 달 댓글을 찾을 수 없습니다." };
    parentId = parent.parentId ?? parent.id;
  }

  await db.insert(boardComments).values({
    postId: post.id,
    parentId,
    userId: me.id,
    authorName: me.name,
    isAdmin: me.role === "admin" || me.role === "super_admin",
    content,
  });
  await syncCommentCount(post.id);
  return { ok: true };
}

export async function deleteBoardComment(commentId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await commenter();
  if (!me) return { ok: false, error: "로그인이 필요합니다." };

  const [c] = await db.select().from(boardComments).where(eq(boardComments.id, commentId));
  if (!c || c.isDeleted) return { ok: false, error: "이미 삭제된 댓글입니다." };
  if (c.userId !== me.id) return { ok: false, error: "내가 쓴 댓글만 지울 수 있습니다." };

  const liveReplies = async (id: string) =>
    (
      await db
        .select({ n: sql<number>`count(*)::int` })
        .from(boardComments)
        .where(and(eq(boardComments.parentId, id), eq(boardComments.isDeleted, false)))
    )[0]?.n ?? 0;

  if (!c.parentId && (await liveReplies(c.id)) > 0) {
    // 답글이 달린 원댓글은 자리를 남긴다 — 답글이 맥락을 잃지 않게
    await db
      .update(boardComments)
      .set({ isDeleted: true, content: "", updatedAt: new Date() })
      .where(eq(boardComments.id, c.id));
  } else {
    await db.delete(boardComments).where(eq(boardComments.id, c.id));
    // 마지막 답글을 지워 빈 자리만 남은 원댓글도 함께 정리한다
    if (c.parentId && (await liveReplies(c.parentId)) === 0) {
      await db
        .delete(boardComments)
        .where(and(eq(boardComments.id, c.parentId), eq(boardComments.isDeleted, true)));
    }
  }
  await syncCommentCount(c.postId);
  return { ok: true };
}

/** 게시글 조회수 +1 — 글을 열 때 부른다. 게시·비블라인드 글만 센다. */
export async function incrementBoardView(postId: string): Promise<number | null> {
  const [row] = await db
    .update(boardPosts)
    .set({ viewCount: sql`${boardPosts.viewCount} + 1` })
    .where(and(eq(boardPosts.id, postId), eq(boardPosts.isPublished, true), eq(boardPosts.isBlinded, false)))
    .returning({ viewCount: boardPosts.viewCount });
  return row?.viewCount ?? null;
}

"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { addBoardComment, deleteBoardComment, listBoardComments, type BoardCommentItem } from "./actions";

const MAX_LEN = 1000;

/* ── 입력창 (댓글·답글 공용) ── */
function CommentForm({
  canComment,
  submitLabel,
  placeholder,
  autoFocus,
  onSubmit,
  onCancel,
}: {
  canComment: boolean;
  submitLabel: string;
  placeholder: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const left = MAX_LEN - text.length;

  const submit = () =>
    startTransition(async () => {
      if (await onSubmit(text)) setText("");
    });

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
        disabled={!canComment || pending}
        autoFocus={autoFocus}
        rows={3}
        placeholder={canComment ? placeholder : "로그인하면 댓글을 쓸 수 있습니다"}
        className="w-full resize-y rounded-xl border border-brand-border bg-white px-4 py-3 text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary disabled:bg-brand-lighter"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-[12.5px] tabular-nums ${left < 50 ? "text-red-500" : "text-brand-muted"}`}>
          {left.toLocaleString()}자 남음
        </span>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-3.5 py-2 rounded-xl text-[13px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">
              취소
            </button>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!canComment || pending || !text.trim()}
            className="px-4 py-2 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors disabled:opacity-40"
          >
            {pending ? "등록 중…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 댓글 한 줄 ── */
function CommentRow({
  c,
  isReply,
  onReply,
  onDelete,
  canReply,
}: {
  c: BoardCommentItem;
  isReply?: boolean;
  onReply?: () => void;
  onDelete: () => void;
  canReply: boolean;
}) {
  if (c.isDeleted) {
    return <p className="py-3 text-[14px] text-brand-muted">삭제된 댓글입니다.</p>;
  }
  // 운영자 댓글은 오른쪽 정렬 + 배지로 구분한다
  return (
    <div className={`flex ${c.isAdmin ? "justify-end" : ""}`}>
      <div className={`py-3 ${c.isAdmin ? "max-w-[85%] text-right" : "w-full"}`}>
        <div className={`flex items-center gap-2 ${c.isAdmin ? "justify-end" : ""}`}>
          {!c.isAdmin && (
            <span className="h-6 w-6 rounded-full bg-brand-lighter flex items-center justify-center text-[12px] font-bold text-brand-sub shrink-0">
              {c.authorName.charAt(0)}
            </span>
          )}
          <span className="text-[14px] font-bold text-brand-dark">{c.authorName}</span>
          {c.isAdmin && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-primary-50 text-brand-primary border border-brand-primary/20">운영자</span>
          )}
          <span className="text-[12px] text-brand-muted tabular-nums">{c.createdAt}</span>
        </div>
        <p className={`mt-1.5 whitespace-pre-wrap break-words text-[15px] leading-[1.65] text-brand-text ${
          c.isAdmin ? "inline-block rounded-xl bg-brand-primary-50 px-3.5 py-2.5 text-left" : isReply ? "" : "pl-8"
        }`}>
          {c.content}
        </p>
        <div className={`mt-1.5 flex items-center gap-3 text-[12.5px] font-bold ${c.isAdmin ? "justify-end" : isReply ? "" : "pl-8"}`}>
          {!isReply && canReply && onReply && (
            <button type="button" onClick={onReply} className="text-brand-sub hover:text-brand-primary transition-colors">답글</button>
          )}
          {c.isMine && (
            <button type="button" onClick={onDelete} className="text-brand-muted hover:text-red-500 transition-colors">삭제</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 댓글 영역 ── */
export function BoardComments({
  postId,
  onCountChange,
}: {
  postId: string;
  /** 댓글이 늘거나 줄면 목록의 (N) 표시를 맞춘다 */
  onCountChange: (postId: string, count: number) => void;
}) {
  const [data, setData] = useState<{ postId: string; comments: BoardCommentItem[]; canComment: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await listBoardComments(postId);
      setData({ postId, ...res });
      onCountChange(postId, res.comments.filter((c) => !c.isDeleted).length);
    } catch {
      setError("댓글을 불러오지 못했습니다.");
    }
  }, [postId, onCountChange]);

  useEffect(() => {
    let alive = true;
    listBoardComments(postId)
      .then((res) => {
        if (!alive) return;
        setData({ postId, ...res });
        onCountChange(postId, res.comments.filter((c) => !c.isDeleted).length);
      })
      .catch(() => { if (alive) setError("댓글을 불러오지 못했습니다."); });
    return () => { alive = false; };
  }, [postId, onCountChange]);

  // 다른 글로 넘어가면 이전 글의 댓글이 잠깐이라도 보이지 않게
  const current = data?.postId === postId ? data : null;

  const submit = async (text: string, parentId: string | null) => {
    const res = await addBoardComment({ postId, parentId, content: text });
    if (!res.ok) { setError(res.error); return false; }
    setError(null);
    setReplyTo(null);
    if (parentId) setExpanded((e) => ({ ...e, [parentId]: true }));
    await load();
    return true;
  };

  const remove = async (id: string) => {
    setConfirmId(null);
    const res = await deleteBoardComment(id);
    if (!res.ok) { setError(res.error); return; }
    setError(null);
    await load();
  };

  if (!current) {
    return <div className="py-8 text-center text-[14px] text-brand-muted">{error ?? "댓글을 불러오는 중…"}</div>;
  }

  const roots = current.comments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => current.comments.filter((c) => c.parentId === id);
  const count = current.comments.filter((c) => !c.isDeleted).length;

  return (
    <section>
      <p className="text-[16px] font-extrabold text-brand-dark">
        댓글 <span className="text-brand-primary">{count}</span>
      </p>

      <div className="mt-3 border-t border-brand-border divide-y divide-brand-border">
        {roots.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[15px] text-brand-muted">아직 댓글이 없습니다.</p>
            <p className="mt-1 text-[13px] text-brand-muted">궁금한 점이나 후기를 남겨 주세요.</p>
          </div>
        ) : (
          roots.map((c) => {
            const replies = repliesOf(c.id);
            const open = expanded[c.id];
            return (
              <div key={c.id}>
                <CommentRow
                  c={c}
                  canReply={current.canComment}
                  onReply={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  onDelete={() => setConfirmId(c.id)}
                />
                {replies.length > 0 && (
                  <div className="pl-8 pb-2">
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => ({ ...e, [c.id]: !open }))}
                      className="text-[12.5px] font-bold text-brand-primary hover:underline"
                    >
                      {open ? "▾ 답글 숨기기" : `▸ 답글 ${replies.length}개 보기`}
                    </button>
                    {open && (
                      <div className="mt-1 border-l-2 border-brand-border pl-4">
                        {replies.map((r) => (
                          <CommentRow key={r.id} c={r} isReply canReply={false} onDelete={() => setConfirmId(r.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {replyTo === c.id && (
                  <div className="pl-8 pb-4">
                    <CommentForm
                      canComment={current.canComment}
                      submitLabel="답글 등록"
                      placeholder={`${c.authorName}님에게 답글 남기기`}
                      autoFocus
                      onSubmit={(t) => submit(t, c.id)}
                      onCancel={() => setReplyTo(null)}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {error && <p className="mt-3 text-[13px] font-semibold text-red-500">{error}</p>}

      <div className="mt-4 pt-4 border-t border-brand-border">
        <CommentForm
          canComment={current.canComment}
          submitLabel="댓글 등록"
          placeholder="궁금한 점이나 후기를 남겨 주세요"
          onSubmit={(t) => submit(t, null)}
        />
      </div>

      {/* 삭제 확인 */}
      {confirmId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4" onClick={() => setConfirmId(null)}>
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-[17px] font-extrabold text-brand-dark">이 댓글을 지울까요?</p>
            <p className="mt-1.5 text-[14px] text-brand-sub">지운 댓글은 되돌릴 수 없습니다.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmId(null)}
                className="px-4 py-2 rounded-xl text-[14px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">
                취소
              </button>
              <button type="button" onClick={() => remove(confirmId)}
                className="px-4 py-2 rounded-xl text-[14px] font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

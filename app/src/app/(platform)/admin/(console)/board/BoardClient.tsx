"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { formatDate, formatNumber, boardTypeMeta, boardChannelLabel } from "@/lib/admin-format";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AttachmentBadge } from "@/components/admin/AttachmentBadge";
import type { Attachment } from "@/lib/attachments";
import { upsertBoardPost, toggleBoardBlinded, toggleBoardPinned, deleteBoardPost, type BoardPostInput } from "../actions";

export type BoardPostRow = {
  id: string;
  boardType: string;
  channel: string | null;
  title: string;
  content: string;
  authorName: string;
  isPinned: boolean;
  isPublished: boolean;
  isBlinded: boolean;
  viewCount: number;
  commentCount: number;
  attachments: Attachment[];
  createdAt: string;
};

const BOARD_TABS = [
  { key: "all", label: "전체" },
  { key: "free", label: "자유게시판" },
  { key: "review", label: "이용후기" },
  { key: "commerce", label: "커머스" },
  { key: "qna", label: "질문답변" },
  { key: "tip", label: "노하우" },
];

export function BoardClient({ rows }: { rows: BoardPostRow[] }) {
  const [boardType, setBoardType] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BoardPostRow | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.boardType] = (c[r.boardType] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (boardType !== "all" && r.boardType !== boardType) return false;
      return !q || r.title.toLowerCase().includes(q) || r.authorName.toLowerCase().includes(q);
    });
  }, [rows, boardType, query]);

  const act = (id: string, fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn();
      setMsg({ id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs tabs={BOARD_TABS.map((t) => ({ ...t, count: counts[t.key] ?? 0 }))} value={boardType} onChange={setBoardType} />
        <div className="md:ml-auto flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="제목 · 작성자 검색" className="md:w-64" />
          <Button onClick={() => setEditing("new")}>게시글 등록</Button>
        </div>
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>제목</Th>
                <Th>게시판</Th>
                <Th>작성자</Th>
                <Th className="text-center">조회 / 댓글</Th>
                <Th>등록일</Th>
                <Th>상태</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {filtered.map((p) => {
              const meta = boardTypeMeta[p.boardType] ?? { label: p.boardType, tone: "gray" as const };
              return (
                <tr key={p.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      {p.isPinned && <Badge tone="red">고정</Badge>}
                      <span className={`font-semibold ${p.isBlinded ? "text-brand-muted line-through" : "text-brand-dark"}`}>
                        {p.title}
                      </span>
                      {p.attachments.length > 0 && <AttachmentBadge items={p.attachments} />}
                    </div>
                    {msg?.id === p.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                  </Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                    {p.channel && (
                      <div className="text-[12px] text-brand-muted mt-1">{boardChannelLabel[p.channel]}</div>
                    )}
                  </Td>
                  <Td className="text-brand-sub">{p.authorName}</Td>
                  <Td className="text-center tabular-nums text-brand-sub">
                    {formatNumber(p.viewCount)} / {formatNumber(p.commentCount)}
                  </Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDate(p.createdAt)}</Td>
                  <Td>
                    {p.isBlinded ? (
                      <Badge tone="red">블라인드</Badge>
                    ) : (
                      <Badge tone={p.isPublished ? "green" : "gray"}>{p.isPublished ? "노출중" : "비노출"}</Badge>
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                        수정
                      </Button>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(p.id, () => toggleBoardPinned(p.id, !p.isPinned))}>
                        {p.isPinned ? "고정해제" : "고정"}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(p.id, () => toggleBoardBlinded(p.id, !p.isBlinded))}>
                        {p.isBlinded ? "복구" : "블라인드"}
                      </Button>
                      <Button size="sm" variant="danger" disabled={pending} onClick={() => act(p.id, () => deleteBoardPost(p.id))}>
                        삭제
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="등록된 게시글이 없습니다." />
        )}
      </Card>

      {editing && <BoardModal post={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function BoardModal({ post, onClose }: { post: BoardPostRow | null; onClose: () => void }) {
  const [form, setForm] = useState<BoardPostInput>({
    id: post?.id,
    boardType: post?.boardType ?? "free",
    channel: post?.channel ?? "",
    title: post?.title ?? "",
    content: post?.content ?? "",
    authorName: post?.authorName ?? "",
    isPinned: post?.isPinned ?? false,
    isPublished: post?.isPublished ?? true,
    attachments: post?.attachments ?? [],
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof BoardPostInput>(key: K, value: BoardPostInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertBoardPost(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={post ? "게시글 수정" : "게시글 등록"}
      onClose={onClose}
      width="max-w-[640px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="게시판">
          <Select value={form.boardType} onChange={(e) => set("boardType", e.target.value)}>
            <option value="free">자유게시판</option>
            <option value="review">이용후기</option>
            <option value="commerce">커머스</option>
            <option value="qna">질문답변</option>
            <option value="tip">노하우</option>
          </Select>
        </Field>
        <Field label="채널" hint="사용자 화면 게시판 탭">
          <Select value={form.channel ?? ""} onChange={(e) => set("channel", e.target.value)}>
            <option value="">채널 없음 (전 탭 노출)</option>
            <option value="shopping">네이버 쇼핑</option>
            <option value="place">네이버 플레이스</option>
            <option value="coupang">쿠팡</option>
          </Select>
        </Field>

        <Field label="작성자명" hint="비우면 관리자 이름으로 등록">
          <Input value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
        </Field>
      </div>

      <Field label="제목">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="게시글 제목" />
      </Field>

      <Field label="내용">
        <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} className="min-h-[200px]" />
      </Field>

      <Field label="이미지 · 영상" hint="본문 아래에 첨부 순서대로 노출됩니다">
        <MediaUploader
          value={form.attachments ?? []}
          onChange={(next) => set("attachments", next)}
          folder="board"
        />
      </Field>

      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
          <input type="checkbox" checked={form.isPinned} onChange={(e) => set("isPinned", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
          상단 고정
        </label>
        <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 accent-[#2452EB]" />
          즉시 노출
        </label>
      </div>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

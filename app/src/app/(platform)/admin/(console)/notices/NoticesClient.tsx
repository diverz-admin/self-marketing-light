"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Card, TableShell, Th, Td, EmptyState, Badge, Tabs, SearchInput,
  Button, Modal, ModalFooter, Field, Input, Select, Textarea, Notice,
} from "@/components/admin/ui";
import { formatDate, formatNumber, noticeCategoryMeta } from "@/lib/admin-format";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { AttachmentBadge } from "@/components/admin/AttachmentBadge";
import type { Attachment } from "@/lib/attachments";
import { upsertNotice, toggleNoticePublished, toggleNoticePinned, deleteNotice, type NoticeInput } from "../actions";

export type NoticeRow = {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  authorName: string;
  publishedAt: string | null;
  attachments: Attachment[];
  createdAt: string;
};

const CATEGORY_TABS = [
  { key: "all", label: "전체" },
  { key: "service", label: "서비스" },
  { key: "update", label: "업데이트" },
  { key: "event", label: "이벤트" },
  { key: "maintenance", label: "점검" },
];

export function NoticesClient({ rows }: { rows: NoticeRow[] }) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<NoticeRow | "new" | null>(null);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ id: string; text: string; ok: boolean } | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      return !q || r.title.toLowerCase().includes(q);
    });
  }, [rows, category, query]);

  const act = (id: string, fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const res = await fn();
      setMsg({ id, text: "error" in res ? res.error : "변경됨", ok: !("error" in res) });
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <Tabs tabs={CATEGORY_TABS.map((t) => ({ ...t, count: counts[t.key] ?? 0 }))} value={category} onChange={setCategory} />
        <div className="md:ml-auto flex gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="제목 검색" className="md:w-64" />
          <Button onClick={() => setEditing("new")}>공지 등록</Button>
        </div>
      </div>

      <Card>
        {filtered.length ? (
          <TableShell
            head={
              <>
                <Th>제목</Th>
                <Th>분류</Th>
                <Th>작성자</Th>
                <Th className="text-center">조회수</Th>
                <Th>등록일</Th>
                <Th>노출</Th>
                <Th className="text-right">관리</Th>
              </>
            }
          >
            {filtered.map((n) => {
              const meta = noticeCategoryMeta[n.category] ?? { label: n.category, tone: "gray" as const };
              return (
                <tr key={n.id} className="hover:bg-brand-light/50 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      {n.isPinned && <Badge tone="red">고정</Badge>}
                      <span className="font-semibold text-brand-dark">{n.title}</span>
                      {n.attachments.length > 0 && <AttachmentBadge items={n.attachments} />}
                    </div>
                    {msg?.id === n.id && <Notice ok={msg.ok}>{msg.text}</Notice>}
                  </Td>
                  <Td>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </Td>
                  <Td className="text-brand-sub">{n.authorName}</Td>
                  <Td className="text-center tabular-nums text-brand-sub">{formatNumber(n.viewCount)}</Td>
                  <Td className="text-brand-sub whitespace-nowrap">{formatDate(n.createdAt)}</Td>
                  <Td>
                    <Badge tone={n.isPublished ? "green" : "gray"}>{n.isPublished ? "노출중" : "비노출"}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex gap-1.5 justify-end">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(n)}>
                        수정
                      </Button>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(n.id, () => toggleNoticePinned(n.id, !n.isPinned))}>
                        {n.isPinned ? "고정해제" : "고정"}
                      </Button>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => act(n.id, () => toggleNoticePublished(n.id, !n.isPublished))}>
                        {n.isPublished ? "숨김" : "노출"}
                      </Button>
                      <Button size="sm" variant="danger" disabled={pending} onClick={() => act(n.id, () => deleteNotice(n.id))}>
                        삭제
                      </Button>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </TableShell>
        ) : (
          <EmptyState message="등록된 공지가 없습니다." />
        )}
      </Card>

      {editing && <NoticeModal notice={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function NoticeModal({ notice, onClose }: { notice: NoticeRow | null; onClose: () => void }) {
  const [form, setForm] = useState<NoticeInput>({
    id: notice?.id,
    title: notice?.title ?? "",
    content: notice?.content ?? "",
    category: notice?.category ?? "service",
    isPinned: notice?.isPinned ?? false,
    isPublished: notice?.isPublished ?? true,
    attachments: notice?.attachments ?? [],
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof NoticeInput>(key: K, value: NoticeInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const res = await upsertNotice(form);
      if ("error" in res) setError(res.error);
      else onClose();
    });
  };

  return (
    <Modal
      title={notice ? "공지 수정" : "공지 등록"}
      onClose={onClose}
      width="max-w-[640px]"
      footer={<ModalFooter onClose={onClose} onSubmit={submit} pending={pending} />}
    >
      <Field label="분류">
        <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
          <option value="service">서비스</option>
          <option value="update">업데이트</option>
          <option value="event">이벤트</option>
          <option value="maintenance">점검</option>
        </Select>
      </Field>

      <Field label="제목">
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="공지 제목" />
      </Field>

      <Field label="내용">
        <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} className="min-h-[200px]" placeholder="공지 내용" />
      </Field>

      <Field label="이미지 · 영상" hint="본문 아래에 첨부 순서대로 노출됩니다">
        <MediaUploader
          value={form.attachments ?? []}
          onChange={(next) => set("attachments", next)}
          folder="notices"
        />
      </Field>

      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
          <input type="checkbox" checked={form.isPinned} onChange={(e) => set("isPinned", e.target.checked)} className="w-4 h-4 accent-[#0D3473]" />
          상단 고정
        </label>
        <label className="flex items-center gap-2 text-[14px] text-brand-dark cursor-pointer">
          <input type="checkbox" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="w-4 h-4 accent-[#0D3473]" />
          즉시 노출
        </label>
      </div>

      {error && <Notice ok={false}>{error}</Notice>}
    </Modal>
  );
}

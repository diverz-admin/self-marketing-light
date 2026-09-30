"use client";

import React, { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import { ListPager, useAutoPageSize } from "@/components/marketing/manage-ui";
import { AttachmentGallery } from "@/components/AttachmentGallery";
import type { Attachment } from "@/lib/attachments";
import { incrementNoticeView } from "../actions";

export type NoticeItem = {
  id: string;
  title: string;
  /** 2026.09.23 — 서버에서 KST로 포맷 */
  date: string;
  /** 26.09.23 — 목록용 */
  shortDate: string;
  /** service | update | event | maintenance */
  category: string;
  isPinned: boolean;
  viewCount: number;
  paragraphs: string[];
  attachments: Attachment[];
};

const CATEGORY_TABS = [
  { key: "all", label: "전체" },
  { key: "event", label: "이벤트" },
  { key: "update", label: "업데이트" },
  { key: "maintenance", label: "점검" },
  { key: "service", label: "서비스" },
] as const;
type CategoryKey = (typeof CATEGORY_TABS)[number]["key"];

const CATEGORY_BADGE: Record<string, { label: string; cls: string }> = {
  event: { label: "이벤트", cls: "bg-orange-50 text-orange-600 border-orange-200" },
  update: { label: "업데이트", cls: "bg-teal-50 text-teal-700 border-teal-200" },
  maintenance: { label: "점검", cls: "bg-red-50 text-red-500 border-red-200" },
  service: { label: "서비스", cls: "bg-brand-primary-50 text-brand-primary border-brand-primary/20" },
};

function CategoryBadge({ category }: { category: string }) {
  const b = CATEGORY_BADGE[category] ?? CATEGORY_BADGE.service;
  return (
    <span className={`shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-md border ${b.cls}`}>{b.label}</span>
  );
}

function Pin() {
  return <span className="shrink-0 text-[14px] leading-none" aria-label="고정 공지">📌</span>;
}

export function NoticesView({ notices, initialCategory, initialPostId }: { notices: NoticeItem[]; initialCategory?: string; initialPostId?: string }) {
  const [cat, setCat] = useState<CategoryKey>(
    CATEGORY_TABS.some((t) => t.key === initialCategory) ? (initialCategory as CategoryKey) : "all",
  );
  // n = 0 은 "처음 들어온 공지(initialPostId)가 있는 페이지"를 뜻한다 — 페이지 크기는 화면을 재야 알 수 있다
  const [pageState, setPageState] = useState<{ cat: CategoryKey; n: number }>({ cat, n: initialPostId ? 0 : 1 });
  const [sizeOverride, setSizeOverride] = useState<number | null>(null);
  const autoSize = useAutoPageSize();
  const pageSize = sizeOverride ?? autoSize;
  const [pickedId, setPickedId] = useState<string | null>(initialPostId ?? null);
  // 모바일 아코디언: 클릭한 공지 내용이 목록 안에서 바로 펼쳐짐 (null = 전부 접힘)
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);
  // 조회수 — 연 공지만 +1 한 값으로 덮어쓴다
  const [views, setViews] = useState<Record<string, number>>({});
  const counted = useRef(new Set<string>());

  const filtered = cat === "all" ? notices : notices.filter((n) => n.category === cat);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  // 탭을 바꾸면 첫 페이지로
  const postIdx = pageState.n === 0 ? filtered.findIndex((n) => n.id === pickedId) : -1;
  const page = Math.min(
    pageState.cat !== cat ? 1 : pageState.n === 0 ? Math.floor(Math.max(0, postIdx) / pageSize) + 1 : pageState.n,
    totalPages,
  );
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 고른 공지가 지금 페이지에 없으면 페이지의 첫 공지를 보여준다
  const selected = pageItems.find((n) => n.id === pickedId) ?? pageItems[0] ?? null;

  // 실제로 본 공지만 한 번씩 조회수를 올린다 —
  // 데스크톱은 상세 패널에 뜬 공지, 모바일은 아코디언으로 펼친 공지 (모바일에선 상세 패널이 숨겨져 있다)
  const selectedId = selected?.id ?? null;
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 901px)").matches;
    const id = desktop ? selectedId : mobileOpenId;
    if (!id || counted.current.has(id)) return;
    counted.current.add(id);
    incrementNoticeView(id).then((v) => {
      if (v != null) setViews((prev) => ({ ...prev, [id]: v }));
    });
  }, [selectedId, mobileOpenId]);

  // 탭은 URL 에 남긴다 — 공유·새로고침 후에도 같은 목록
  const changeCategory = (key: CategoryKey) => {
    setCat(key);
    setMobileOpenId(null);
    const q = new URLSearchParams(window.location.search);
    if (key === "all") q.delete("cat");
    else q.set("cat", key);
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="w-full space-y-5">
      <PageHeader title="공지사항" subtitle="중요한 안내와 업데이트를 확인하세요." iconPath={"M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"} />

      {/* Master–Detail */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.6fr)] xl:grid-cols-[420px_minmax(0,1fr)] gap-4 items-start">
        {/* List */}
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <p className="text-[16px] font-extrabold text-brand-dark">공지사항</p>
            <p className="text-[13px] font-bold text-brand-muted">전체 {total}건</p>
          </div>

          {/* 분류 탭 */}
          <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-brand-border">
            {CATEGORY_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => changeCategory(t.key)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${
                  cat === t.key ? "bg-[#2452EB] text-white" : "bg-white border border-brand-border text-brand-sub hover:bg-brand-lighter"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {pageItems.length === 0 ? (
            <div className="py-16 text-center text-[15px] text-brand-muted">등록된 공지가 없습니다</div>
          ) : (
            pageItems.map((notice, i) => {
              const active = notice.id === selected?.id;
              const open = notice.id === mobileOpenId;
              return (
                <div key={notice.id} className={i > 0 ? "border-t border-brand-border" : ""}>
                  <button
                    type="button"
                    onClick={() => {
                      setPickedId(notice.id);
                      setMobileOpenId((prev) => (prev === notice.id ? null : notice.id));
                    }}
                    aria-current={active}
                    aria-expanded={open}
                    className={[
                      "w-full flex items-center gap-2.5 px-4 py-3.5 text-left transition-colors group relative",
                      active ? "min-[901px]:bg-brand-primary-50" : "hover:bg-brand-lighter",
                      open ? "bg-brand-primary-50" : "",
                    ].join(" ")}
                  >
                    {/* Active accent bar (데스크톱: 선택, 모바일: 펼침) */}
                    {active && <span className="hidden min-[901px]:block absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}
                    {open && <span className="min-[901px]:hidden absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}

                    {notice.isPinned && <Pin />}
                    <CategoryBadge category={notice.category} />
                    <span
                      className={[
                        "flex-1 min-w-0 block truncate text-[15px] font-semibold transition-colors",
                        open ? "text-brand-primary" : "text-brand-dark group-hover:text-brand-primary",
                        active ? "min-[901px]:text-brand-primary" : "min-[901px]:text-brand-dark",
                      ].join(" ")}
                    >
                      {notice.title}
                    </span>
                    <span className="shrink-0 text-[12.5px] text-brand-muted tabular-nums">{notice.shortDate}</span>
                  </button>

                  {/* 모바일 아코디언 본문 — 클릭한 공지 내용이 목록 안에서 바로 펼쳐짐 */}
                  <div className={`min-[901px]:hidden overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[1400px]" : "max-h-0"}`}>
                    <div className="px-4 pb-5 pt-3 space-y-3 border-t border-brand-border">
                      <p className="text-[12.5px] text-brand-muted">
                        {notice.date} · 조회 {views[notice.id] ?? notice.viewCount}
                      </p>
                      {notice.paragraphs.map((para, idx) => (
                        <p key={idx} className="text-[15px] leading-[1.7] text-brand-text">
                          {para}
                        </p>
                      ))}
                      <AttachmentGallery items={notice.attachments} className="pt-1" />
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {total > 0 && (
            <ListPager
              page={page}
              pageSize={pageSize}
              total={total}
              onPage={(n) => setPageState({ cat, n })}
              sizeValue={sizeOverride}
              onSizeChange={(n) => { setSizeOverride(n); setPageState({ cat, n: 1 }); }}
            />
          )}
        </div>

        {/* Detail (데스크톱 전용 — 모바일은 목록 내 아코디언으로 표시) */}
        <div className="hidden min-[901px]:block bg-white rounded-2xl border border-brand-border min-h-[320px] min-[901px]:sticky min-[901px]:top-6">
          {selected ? (
            <article className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selected.isPinned && <Pin />}
                  <CategoryBadge category={selected.category} />
                </div>
                <span className="text-[13px] text-brand-muted tabular-nums">조회 {views[selected.id] ?? selected.viewCount}</span>
              </div>
              <h2 className="mt-3 text-[22px] md:text-[25px] font-extrabold text-brand-dark tracking-tight leading-snug">
                {selected.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <svg className="w-3.5 h-3.5 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                </svg>
                <span className="text-[15px] text-brand-sub">{selected.date}</span>
              </div>

              <div className="mt-5 pt-5 border-t border-brand-border space-y-4">
                {selected.paragraphs.map((para, idx) => (
                  <p key={idx} className="text-[16px] leading-[1.75] text-brand-text">
                    {para}
                  </p>
                ))}
                <AttachmentGallery items={selected.attachments} />
              </div>
            </article>
          ) : (
            <div className="h-full min-h-[320px] flex items-center justify-center text-center px-6">
              <p className="text-[15px] text-brand-muted">선택된 공지가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

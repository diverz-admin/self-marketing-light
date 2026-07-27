"use client";

import React, { useMemo, useState } from "react";
import PageHeader from "@/components/marketing/PageHeader";
import { AttachmentGallery } from "@/components/AttachmentGallery";
import type { Attachment } from "@/lib/attachments";

export type NoticeItem = {
  id: string;
  title: string;
  date: string;          // 서버에서 KST로 포맷한 표시용 문자열
  categoryLabel: string;
  isPinned: boolean;
  paragraphs: string[];
  attachments: Attachment[];
};

export function NoticesView({ notices }: { notices: NoticeItem[] }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(notices[0]?.id ?? null);
  // 모바일 아코디언: 클릭한 공지 내용이 목록 안에서 바로 펼쳐짐 (null = 전부 접힘)
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      notices.filter((n) =>
        n.title.toLowerCase().includes(query.toLowerCase())
      ),
    [notices, query]
  );

  const selected = notices.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <PageHeader title="공지사항" subtitle="중요한 안내와 업데이트를 확인하세요." iconPath={"M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"} />

        <div className="bg-white border border-brand-border rounded-2xl px-5 py-3.5 text-right shrink-0">
          <p className="text-[13px] text-brand-sub mb-0.5">전체 게시글</p>
          <p className="text-[25px] font-extrabold text-brand-dark leading-none">
            {notices.length}
            <span className="text-[16px] font-semibold text-brand-sub ml-1">건</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-brand-border px-4 py-3 flex items-center gap-3">
        <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 / 내용 검색"
          className="flex-1 text-[17px] text-brand-dark placeholder-brand-muted bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {}}
          className="px-4 py-2 rounded-xl text-[15px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shrink-0"
        >
          검색
        </button>
      </div>

      {/* Master–Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[460px_minmax(0,1fr)] gap-4 items-start">
        {/* List */}
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-[17px] font-semibold text-brand-dark mb-1">검색 결과가 없습니다</p>
              <p className="text-[15px] text-brand-sub">다른 키워드로 검색해보세요.</p>
            </div>
          ) : (
            filtered.map((notice, i) => {
              const active = notice.id === selectedId;
              const open = notice.id === mobileOpenId;
              return (
                <div key={notice.id} className={i > 0 ? "border-t border-brand-border" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(notice.id);
                    setMobileOpenId((prev) => (prev === notice.id ? null : notice.id));
                  }}
                  aria-current={active}
                  aria-expanded={open}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-4 text-left transition-colors group relative",
                    active ? "lg:bg-brand-primary-50" : "hover:bg-brand-lighter",
                    open ? "bg-brand-primary-50" : "",
                  ].join(" ")}
                >
                  {/* Active accent bar (데스크톱: 선택, 모바일: 펼침) */}
                  {active && <span className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}
                  {open && <span className="lg:hidden absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}

                  {/* Badge */}
                  <span
                    className={[
                      "shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-full border",
                      open
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-brand-primary-50 text-brand-primary border-brand-primary/20",
                      active
                        ? "lg:bg-brand-primary lg:text-white lg:border-brand-primary"
                        : "lg:bg-brand-primary-50 lg:text-brand-primary lg:border-brand-primary/20",
                    ].join(" ")}
                  >
                    {notice.isPinned ? "고정" : notice.categoryLabel}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        "text-[16px] font-semibold truncate transition-colors",
                        open ? "text-brand-primary" : "text-brand-dark group-hover:text-brand-primary",
                        active ? "lg:text-brand-primary" : "lg:text-brand-dark",
                      ].join(" ")}
                    >
                      {notice.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                      </svg>
                      <span className="text-[13px] text-brand-sub">{notice.date}</span>
                    </div>
                  </div>

                  {/* Chevron (모바일: 펼치면 아래로 회전 / 데스크톱: 항상 오른쪽) */}
                  <svg
                    className={[
                      "w-4 h-4 shrink-0 transition-all lg:rotate-0",
                      open ? "text-brand-primary rotate-90" : "text-brand-border group-hover:text-brand-primary",
                      active ? "lg:text-brand-primary" : "lg:text-brand-border",
                    ].join(" ")}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* 모바일 아코디언 본문 — 클릭한 공지 내용이 목록 안에서 바로 펼쳐짐 */}
                <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[1400px]" : "max-h-0"}`}>
                  <div className="px-4 pb-5 pt-3 space-y-3 border-t border-brand-border">
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
        </div>

        {/* Detail (데스크톱 전용 — 모바일은 목록 내 아코디언으로 표시) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-brand-border min-h-[320px] lg:sticky lg:top-6">
          {selected ? (
            <article className="p-6 md:p-8">
              <span className="inline-block text-[12px] font-bold px-2.5 py-1 rounded-full bg-brand-primary-50 text-brand-primary border border-brand-primary/20">
                {selected.categoryLabel}
              </span>
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
            <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-brand-lighter flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-[17px] font-semibold text-brand-dark mb-1">게시글을 선택하세요</p>
              <p className="text-[15px] text-brand-sub">왼쪽 목록에서 공지를 클릭하면 내용이 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

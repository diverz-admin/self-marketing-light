"use client";

import React, { useState } from "react";
import AdBanners from "@/components/marketing/AdBanners";

const NOTICES = [
  {
    id: 8,
    title: "다이버즈 6월 1주차 최신 레퍼런스 공유",
    date: "2026년 06월 11일",
  },
  {
    id: 7,
    title: "[신규 기능 안내] 통합 순위관리 기능 오픈",
    date: "2026년 06월 10일",
  },
  {
    id: 6,
    title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 완료 안내",
    date: "2026년 05월 31일",
  },
  {
    id: 5,
    title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 안내",
    date: "2026년 05월 31일",
  },
  {
    id: 4,
    title: "다이버즈에 곧 쇼핑, 쿠팡 AI 주문 기능이 생성됩니다!",
    date: "2026년 05월 18일",
  },
  {
    id: 3,
    title: "다이버즈 4~5월 1주차 최신 레퍼런스 공유",
    date: "2026년 05월 13일",
  },
  {
    id: 2,
    title: "다이버즈 V2 패치 내역",
    date: "2026년 05월 08일",
  },
  {
    id: 1,
    title: "[공지] 겟잇머니 서비스 종료 및 다이버즈 통합 안내",
    date: "2026년 01월 16일",
  },
];

export default function NoticesPage() {
  const [query, setQuery] = useState("");

  const filtered = NOTICES.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-[16px] bg-brand-primary flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h1 className="text-[24px] font-extrabold text-brand-dark tracking-tight">공지사항</h1>
            <p className="text-[14px] text-brand-sub mt-0.5">중요한 안내와 업데이트를 확인하세요.</p>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl px-5 py-3.5 text-right shrink-0">
          <p className="text-[12px] text-brand-sub mb-0.5">전체 게시글</p>
          <p className="text-[22px] font-extrabold text-brand-dark leading-none">
            {NOTICES.length}
            <span className="text-[14px] font-semibold text-brand-sub ml-1">건</span>
          </p>
        </div>
      </div>

      {/* 광고 배너 */}
      <AdBanners />

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
          className="flex-1 text-[15px] text-brand-dark placeholder-brand-muted bg-transparent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {}}
          className="px-4 py-2 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors shrink-0"
        >
          검색
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[15px] font-semibold text-brand-dark mb-1">검색 결과가 없습니다</p>
            <p className="text-[13px] text-brand-sub">다른 키워드로 검색해보세요.</p>
          </div>
        ) : (
          filtered.map((notice, i) => (
            <button
              key={notice.id}
              type="button"
              className={[
                "w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-brand-lighter transition-colors group",
                i > 0 ? "border-t border-brand-border" : "",
              ].join(" ")}
            >
              {/* Badge */}
              <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-brand-primary-50 text-brand-primary border border-brand-primary/20">
                공지
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-brand-dark truncate group-hover:text-brand-primary transition-colors">
                  {notice.title}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
                  </svg>
                  <span className="text-[13px] text-brand-sub">{notice.date}</span>
                </div>
              </div>

              {/* Chevron */}
              <svg className="w-4 h-4 text-brand-border group-hover:text-brand-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

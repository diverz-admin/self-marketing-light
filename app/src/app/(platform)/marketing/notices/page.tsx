"use client";

import React, { useMemo, useState } from "react";
import Icon3D from "@/components/marketing/Icon3D";

type Notice = {
  id: number;
  title: string;
  date: string;
  content: string[];
};

const NOTICES: Notice[] = [
  {
    id: 8,
    title: "BlueEgg 6월 1주차 최신 레퍼런스 공유",
    date: "2026년 06월 11일",
    content: [
      "안녕하세요, BlueEgg입니다.",
      "6월 1주차 최신 마케팅 레퍼런스를 공유드립니다. 이번 주에는 네이버 플레이스 상위노출 성공 사례와 쇼핑 리워드 캠페인의 전환율 개선 포인트를 중점적으로 정리했습니다.",
      "자세한 내용은 커뮤니티 게시판의 첨부 자료를 확인해 주세요. 궁금하신 점은 전문 무료상담을 통해 문의하실 수 있습니다.",
    ],
  },
  {
    id: 7,
    title: "[신규 기능 안내] 통합 순위관리 기능 오픈",
    date: "2026년 06월 10일",
    content: [
      "통합 순위관리 기능이 새롭게 오픈되었습니다.",
      "이제 네이버 플레이스와 네이버 쇼핑의 키워드 순위를 한 곳에서 등록하고, 채널별 순위 변동을 실시간 그래프로 확인하실 수 있습니다.",
      "좌측 메뉴의 '통합순위관리'에서 지금 바로 이용해 보세요. 무료로 제공되는 기능입니다.",
    ],
  },
  {
    id: 6,
    title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 완료 안내",
    date: "2026년 05월 31일",
    content: [
      "순위체크 및 AI 주문 시스템의 긴급 안정화 작업이 완료되었습니다.",
      "작업 시간 동안 이용에 불편을 드려 죄송합니다. 현재 모든 기능이 정상적으로 동작하고 있으며, 순위 데이터 수집도 정상화되었습니다.",
      "이용 중 이상이 발견되면 고객센터로 알려주시기 바랍니다.",
    ],
  },
  {
    id: 5,
    title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 안내",
    date: "2026년 05월 31일",
    content: [
      "안정적인 서비스 제공을 위해 순위체크 및 AI 주문 시스템의 긴급 안정화 작업을 진행합니다.",
      "작업 중에는 일부 순위 데이터 갱신이 지연될 수 있습니다. 작업 완료 후 별도 공지로 안내드리겠습니다.",
      "양해 부탁드립니다.",
    ],
  },
  {
    id: 4,
    title: "BlueEgg에 곧 쇼핑, 쿠팡 AI 주문 기능이 생성됩니다!",
    date: "2026년 05월 18일",
    content: [
      "쇼핑과 쿠팡 캠페인을 AI가 자동으로 생성하고 최적의 리뷰어를 매칭하는 기능이 곧 출시됩니다.",
      "복잡한 설정 없이 상품 정보만 입력하면 캠페인이 자동으로 구성됩니다. 출시 일정은 추후 공지를 통해 안내드리겠습니다.",
    ],
  },
  {
    id: 3,
    title: "BlueEgg 4~5월 1주차 최신 레퍼런스 공유",
    date: "2026년 05월 13일",
    content: [
      "4월부터 5월 1주차까지의 최신 마케팅 레퍼런스를 정리하여 공유드립니다.",
      "리뷰·체험단 운영 노하우와 퍼포먼스 광고 최적화 사례가 포함되어 있습니다. 커뮤니티에서 확인해 주세요.",
    ],
  },
  {
    id: 2,
    title: "BlueEgg V2 패치 내역",
    date: "2026년 05월 08일",
    content: [
      "BlueEgg V2 업데이트가 적용되었습니다.",
      "대시보드 UI 개선, 순위 추적 정확도 향상, 캠페인 관리 화면 개편 등이 포함되었습니다. 자세한 변경 사항은 본문을 확인해 주세요.",
    ],
  },
  {
    id: 1,
    title: "[공지] 겟잇머니 서비스 종료 및 BlueEgg 통합 안내",
    date: "2026년 01월 16일",
    content: [
      "겟잇머니 서비스가 종료되고 BlueEgg로 통합됩니다.",
      "기존 겟잇머니 이용 데이터는 BlueEgg 계정으로 안전하게 이관되며, 별도 조치 없이 그대로 이용하실 수 있습니다.",
      "통합 관련 문의는 고객센터로 연락 주시기 바랍니다.",
    ],
  },
];

export default function NoticesPage() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(NOTICES[0].id);

  const filtered = useMemo(
    () =>
      NOTICES.filter((n) =>
        n.title.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  const selected = NOTICES.find((n) => n.id === selectedId) ?? null;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Icon3D name="bell" className="w-14 h-14 shrink-0" />
          <div>
            <h1 className="text-[27px] font-extrabold text-brand-dark tracking-tight">공지사항</h1>
            <p className="text-[16px] text-brand-sub mt-0.5">중요한 안내와 업데이트를 확인하세요.</p>
          </div>
        </div>

        <div className="bg-white border border-brand-border rounded-2xl px-5 py-3.5 text-right shrink-0">
          <p className="text-[13px] text-brand-sub mb-0.5">전체 게시글</p>
          <p className="text-[25px] font-extrabold text-brand-dark leading-none">
            {NOTICES.length}
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
              return (
                <button
                  key={notice.id}
                  type="button"
                  onClick={() => setSelectedId(notice.id)}
                  aria-current={active}
                  className={[
                    "w-full flex items-center gap-3 px-4 py-4 text-left transition-colors group relative",
                    i > 0 ? "border-t border-brand-border" : "",
                    active ? "bg-brand-primary-50" : "hover:bg-brand-lighter",
                  ].join(" ")}
                >
                  {/* Active accent bar */}
                  {active && <span className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}

                  {/* Badge */}
                  <span
                    className={[
                      "shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-full border",
                      active
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-brand-primary-50 text-brand-primary border-brand-primary/20",
                    ].join(" ")}
                  >
                    공지
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={[
                        "text-[16px] font-semibold truncate transition-colors",
                        active ? "text-brand-primary" : "text-brand-dark group-hover:text-brand-primary",
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

                  {/* Chevron */}
                  <svg
                    className={[
                      "w-4 h-4 shrink-0 transition-colors",
                      active ? "text-brand-primary" : "text-brand-border group-hover:text-brand-primary",
                    ].join(" ")}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="bg-white rounded-2xl border border-brand-border min-h-[320px] lg:sticky lg:top-6">
          {selected ? (
            <article className="p-6 md:p-8">
              <span className="inline-block text-[12px] font-bold px-2.5 py-1 rounded-full bg-brand-primary-50 text-brand-primary border border-brand-primary/20">
                공지
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
                {selected.content.map((para, idx) => (
                  <p key={idx} className="text-[16px] leading-[1.75] text-brand-text">
                    {para}
                  </p>
                ))}
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

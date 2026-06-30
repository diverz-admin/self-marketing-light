"use client";

import { useState } from "react";

type Platform = "네이버" | "인스타그램" | "유튜브";

const MOCK_POSTS: {
  id: number;
  platform: Platform;
  category: string;
  title: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  pinned: boolean;
}[] = [
  { id: 1, platform: "네이버", category: "공지", title: "DIVERZ 커뮤니티 이용 안내", author: "관리자", date: "2026.06.20", views: 1240, comments: 3, pinned: true },
  { id: 2, platform: "네이버", category: "자유", title: "네이버 플레이스 리워드 진행 후기 공유합니다", author: "마케터A", date: "2026.06.19", views: 312, comments: 8, pinned: false },
  { id: 3, platform: "네이버", category: "질문", title: "네이버 SA 광고 예산 어느 정도 잡으시나요?", author: "신규광고주", date: "2026.06.18", views: 234, comments: 9, pinned: false },
  { id: 4, platform: "네이버", category: "정보", title: "2026 상반기 네이버 쇼핑 키워드 트렌드 정리", author: "트렌드리서치", date: "2026.06.17", views: 623, comments: 12, pinned: false },
  { id: 5, platform: "인스타그램", category: "질문", title: "META(인스타) 광고 세팅 시 픽셀 설치 어떻게 하셨나요?", author: "광고초보", date: "2026.06.16", views: 178, comments: 5, pinned: false },
  { id: 6, platform: "인스타그램", category: "자유", title: "인스타 릴스 마케팅으로 매출 2배 올린 후기", author: "릴스장인", date: "2026.06.15", views: 489, comments: 11, pinned: false },
  { id: 7, platform: "인스타그램", category: "정보", title: "인스타그램 공동구매 진행 시 체크리스트", author: "SNS마케터", date: "2026.06.14", views: 387, comments: 4, pinned: false },
  { id: 8, platform: "유튜브", category: "정보", title: "유튜브 쇼츠 조회수 늘리는 알고리즘 정리", author: "쇼츠연구소", date: "2026.06.13", views: 712, comments: 15, pinned: false },
  { id: 9, platform: "유튜브", category: "질문", title: "유튜브 인플루언서 협찬 단가 어떻게 책정하나요?", author: "브랜드담당", date: "2026.06.12", views: 256, comments: 6, pinned: false },
  { id: 10, platform: "유튜브", category: "자유", title: "유튜브 광고 ROI 계산 방법 공유합니다", author: "파워셀러", date: "2026.06.11", views: 445, comments: 7, pinned: false },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  공지: { bg: "bg-red-50", text: "text-red-600" },
  자유: { bg: "bg-blue-50", text: "text-blue-600" },
  질문: { bg: "bg-amber-50", text: "text-amber-600" },
  정보: { bg: "bg-green-50", text: "text-green-600" },
};

const BOARD_TYPES: { key: "전체" | Platform; color: string; sub: string }[] = [
  { key: "전체", color: "#0341C7", sub: "모든 채널" },
  { key: "네이버", color: "#03C75A", sub: "블로그·카페·플레이스" },
  { key: "인스타그램", color: "#E1306C", sub: "피드·릴스·공구" },
  { key: "유튜브", color: "#FF0000", sub: "롱폼·쇼츠" },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  네이버: "#03C75A",
  인스타그램: "#E1306C",
  유튜브: "#FF0000",
};

export default function BoardPage() {
  const [activeBoard, setActiveBoard] = useState<"전체" | Platform>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = MOCK_POSTS.filter((p) => {
    const matchBoard = activeBoard === "전체" || p.platform === activeBoard || p.pinned;
    const matchSearch =
      searchQuery === "" ||
      p.title.includes(searchQuery) ||
      p.author.includes(searchQuery);
    return matchBoard && matchSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-1">DIVERZ Community</p>
          <h1 className="text-[32px] font-extrabold text-brand-dark mb-2">게시판</h1>
          <p className="text-[15px] text-brand-sub">마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요.</p>
        </div>
        <button className="shrink-0 mt-1 px-5 py-3 rounded-xl text-[14px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors">
          글쓰기
        </button>
      </div>

      {/* 게시판 종류 탭 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {BOARD_TYPES.map((b) => {
          const active = activeBoard === b.key;
          return (
            <button
              key={b.key}
              onClick={() => setActiveBoard(b.key)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${
                active
                  ? "bg-white shadow-sm"
                  : "bg-brand-lighter border-transparent hover:bg-white hover:border-brand-border"
              }`}
              style={active ? { borderColor: b.color, boxShadow: `0 4px 14px ${b.color}22` } : undefined}
            >
              <span
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-[15px]"
                style={{ background: b.color, boxShadow: `0 2px 6px ${b.color}55` }}
              >
                {b.key === "전체" ? "All" : b.key.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className={`block text-[14px] font-bold leading-tight ${active ? "text-brand-dark" : "text-brand-sub"}`}>
                  {b.key}
                </span>
                <span className="block text-[11px] text-brand-muted truncate">{b.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-brand-sub">
          총 <span className="font-bold text-brand-dark">{filtered.length}</span>개의 글
        </p>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목 또는 작성자 검색"
            className="pl-9 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-[13px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary w-full sm:w-[260px]"
          />
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="hidden sm:grid grid-cols-[90px_1fr_90px_90px_70px] gap-3 px-6 py-3 bg-brand-lighter border-b border-brand-border">
          <span className="text-[12px] font-semibold text-brand-sub">채널</span>
          <span className="text-[12px] font-semibold text-brand-sub">제목</span>
          <span className="text-[12px] font-semibold text-brand-sub text-center">작성자</span>
          <span className="text-[12px] font-semibold text-brand-sub text-center">날짜</span>
          <span className="text-[12px] font-semibold text-brand-sub text-right">조회</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[15px] text-brand-muted">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((post, i) => {
              const colors = CATEGORY_COLORS[post.category] ?? { bg: "bg-gray-50", text: "text-gray-600" };
              const pColor = PLATFORM_COLORS[post.platform];
              return (
                <li
                  key={post.id}
                  className={`px-6 py-5 flex flex-col sm:grid sm:grid-cols-[90px_1fr_90px_90px_70px] gap-2 sm:gap-3 sm:items-center cursor-pointer hover:bg-brand-lighter transition-colors ${
                    i !== filtered.length - 1 ? "border-b border-brand-border" : ""
                  } ${post.pinned ? "bg-blue-50/40" : ""}`}
                >
                  {/* 채널 */}
                  <span
                    className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-lg self-start sm:self-center"
                    style={{ background: `${pColor}14`, color: pColor }}
                  >
                    {post.platform}
                  </span>
                  {/* 제목 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                      {post.category}
                    </span>
                    {post.pinned && (
                      <span className="shrink-0">
                        <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
                        </svg>
                      </span>
                    )}
                    <span className="text-[15px] font-semibold text-brand-dark truncate">{post.title}</span>
                    {post.comments > 0 && (
                      <span className="shrink-0 text-[12px] text-brand-primary font-bold">({post.comments})</span>
                    )}
                  </div>
                  {/* 작성자 */}
                  <span className="text-[12px] text-brand-sub sm:text-center hidden sm:block">{post.author}</span>
                  {/* 날짜 */}
                  <span className="text-[12px] text-brand-muted sm:text-center hidden sm:block">{post.date}</span>
                  {/* 조회수 */}
                  <span className="text-[12px] text-brand-muted sm:text-right hidden sm:block">{post.views.toLocaleString()}</span>
                  {/* 모바일 메타 */}
                  <div className="flex items-center gap-2 sm:hidden text-[12px] text-brand-muted">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>조회 {post.views}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            className={`w-9 h-9 rounded-lg text-[14px] font-semibold transition-colors ${
              p === 1 ? "bg-brand-primary text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}

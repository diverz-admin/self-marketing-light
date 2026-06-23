"use client";

import { useState } from "react";

const MOCK_POSTS = [
  {
    id: 1,
    category: "공지",
    title: "DIVERZ 커뮤니티 이용 안내",
    author: "관리자",
    date: "2026.06.20",
    views: 1240,
    comments: 3,
    pinned: true,
  },
  {
    id: 2,
    category: "자유",
    title: "네이버 플레이스 리워드 진행 후기 공유합니다",
    author: "마케터A",
    date: "2026.06.19",
    views: 312,
    comments: 8,
    pinned: false,
  },
  {
    id: 3,
    category: "질문",
    title: "META 광고 세팅 시 픽셀 설치 어떻게 하셨나요?",
    author: "광고초보",
    date: "2026.06.18",
    views: 178,
    comments: 5,
    pinned: false,
  },
  {
    id: 4,
    category: "정보",
    title: "2026 상반기 쇼핑 키워드 트렌드 정리",
    author: "트렌드리서치",
    date: "2026.06.17",
    views: 623,
    comments: 12,
    pinned: false,
  },
  {
    id: 5,
    category: "자유",
    title: "쿠팡 리워드 ROI 계산 방법 공유",
    author: "파워셀러",
    date: "2026.06.16",
    views: 445,
    comments: 7,
    pinned: false,
  },
  {
    id: 6,
    category: "질문",
    title: "네이버 SA 광고 예산 어느 정도 잡으시나요?",
    author: "신규광고주",
    date: "2026.06.15",
    views: 234,
    comments: 9,
    pinned: false,
  },
  {
    id: 7,
    category: "정보",
    title: "카카오 오픈채팅 마케팅 활용 사례",
    author: "SNS마케터",
    date: "2026.06.14",
    views: 387,
    comments: 4,
    pinned: false,
  },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  공지: { bg: "bg-red-50", text: "text-red-600" },
  자유: { bg: "bg-blue-50", text: "text-blue-600" },
  질문: { bg: "bg-amber-50", text: "text-amber-600" },
  정보: { bg: "bg-green-50", text: "text-green-600" },
};

export default function BoardPage() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["전체", "공지", "자유", "질문", "정보"];

  const filtered = MOCK_POSTS.filter((p) => {
    const matchCat = activeCategory === "전체" || p.category === activeCategory;
    const matchSearch =
      searchQuery === "" ||
      p.title.includes(searchQuery) ||
      p.author.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold text-brand-muted uppercase tracking-widest mb-1">DIVERZ Community</p>
          <h1 className="text-[28px] font-extrabold text-brand-dark mb-2">게시판</h1>
          <p className="text-[14px] text-brand-sub">마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요.</p>
        </div>
        <button
          className="shrink-0 mt-1 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
        >
          글쓰기
        </button>
      </div>

      {/* 검색 + 카테고리 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 카테고리 탭 */}
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-brand-primary text-white"
                  : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative sm:ml-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목 또는 작성자 검색"
            className="pl-9 pr-4 py-2 rounded-xl border border-brand-border bg-white text-[13px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary w-full sm:w-[220px]"
          />
        </div>
      </div>

      {/* 게시글 목록 */}
      <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_60px] gap-2 px-5 py-2.5 bg-brand-lighter border-b border-brand-border">
          <span className="text-[11px] font-semibold text-brand-sub">제목</span>
          <span className="text-[11px] font-semibold text-brand-sub text-center">작성자</span>
          <span className="text-[11px] font-semibold text-brand-sub text-center">날짜</span>
          <span className="text-[11px] font-semibold text-brand-sub text-right">조회</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[14px] text-brand-muted">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <ul>
            {filtered.map((post, i) => {
              const colors = CATEGORY_COLORS[post.category] ?? { bg: "bg-gray-50", text: "text-gray-600" };
              return (
                <li
                  key={post.id}
                  className={`px-5 py-3.5 flex flex-col sm:grid sm:grid-cols-[1fr_80px_80px_60px] gap-1 sm:gap-2 sm:items-center cursor-pointer hover:bg-brand-lighter transition-colors ${
                    i !== filtered.length - 1 ? "border-b border-brand-border" : ""
                  } ${post.pinned ? "bg-blue-50/40" : ""}`}
                >
                  {/* 제목 */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                      {post.category}
                    </span>
                    {post.pinned && (
                      <span className="shrink-0">
                        <svg className="w-3 h-3 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z"/>
                        </svg>
                      </span>
                    )}
                    <span className="text-[13px] font-semibold text-brand-dark truncate">{post.title}</span>
                    {post.comments > 0 && (
                      <span className="shrink-0 text-[11px] text-brand-primary font-bold">({post.comments})</span>
                    )}
                  </div>
                  {/* 작성자 */}
                  <span className="text-[11px] text-brand-sub sm:text-center hidden sm:block">{post.author}</span>
                  {/* 날짜 */}
                  <span className="text-[11px] text-brand-muted sm:text-center hidden sm:block">{post.date}</span>
                  {/* 조회수 */}
                  <span className="text-[11px] text-brand-muted sm:text-right hidden sm:block">{post.views.toLocaleString()}</span>
                  {/* 모바일 메타 */}
                  <div className="flex items-center gap-2 sm:hidden text-[11px] text-brand-muted">
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
      <div className="flex justify-center gap-1">
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
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

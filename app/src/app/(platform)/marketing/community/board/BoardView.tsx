"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageHeader from "@/components/marketing/PageHeader";
import { AttachmentGallery } from "@/components/AttachmentGallery";
import type { Attachment } from "@/lib/attachments";
import { BoardComments } from "./BoardComments";
import { incrementBoardView } from "./actions";

/** 목록+상세 2단 화면이 되는 폭 — 이보다 좁으면 목록 안에서 펼친다 */
const TWO_COLUMN = "(min-width: 901px)";

type Platform = "네이버 쇼핑" | "네이버 플레이스" | "쿠팡";

export type BoardItem = {
  id: string;
  /** null = 채널 구분 없는 글 (모든 탭에 노출) */
  platform: Platform | null;
  category: string;
  title: string;
  author: string;
  date: string;          // 서버에서 KST로 포맷한 표시용 문자열
  views: number;
  comments: number;
  pinned: boolean;
  paragraphs: string[];
  attachments: Attachment[];
};

/* 어드민 게시판 종류(자유/이용후기/커머스/질문답변/노하우) + 고정 공지 */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  공지: { bg: "bg-red-50", text: "text-red-600" },
  자유게시판: { bg: "bg-blue-50", text: "text-blue-600" },
  질문답변: { bg: "bg-amber-50", text: "text-amber-600" },
  이용후기: { bg: "bg-green-50", text: "text-green-600" },
  커머스: { bg: "bg-indigo-50", text: "text-indigo-600" },
  노하우: { bg: "bg-purple-50", text: "text-purple-600" },
};
const BOARD_TYPES: { key: "전체" | Platform; color: string; sub: string }[] = [
  { key: "전체", color: "#2452EB", sub: "모든 채널" },
  { key: "네이버 쇼핑", color: "#03C75A", sub: "상위노출·리뷰" },
  { key: "네이버 플레이스", color: "#03C75A", sub: "지도·방문자 리뷰" },
  { key: "쿠팡", color: "#AE0000", sub: "로켓·검색광고" },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  "네이버 쇼핑": "#03C75A",
  "네이버 플레이스": "#03C75A",
  쿠팡: "#AE0000",
};

/* ── 채널 로고 아이콘 (흰색, 컬러 타일 위) ── */
function BoardIcon({ k }: { k: "전체" | Platform }) {
  if (k === "네이버 쇼핑") {
    return (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    );
  }
  if (k === "네이버 플레이스") {
    return (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    );
  }
  if (k === "쿠팡") {
    return (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="white" aria-hidden>
        <path d="M6 8a6 6 0 1112 0v1h1.5A1.5 1.5 0 0121 10.5v9A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5v-9A1.5 1.5 0 014.5 9H6V8zm2 1h8V8a4 4 0 10-8 0v1z" />
      </svg>
    );
  }
  return <span className="font-black text-[17px] text-white">All</span>;
}

export function BoardView({ posts }: { posts: BoardItem[] }) {
  // ?post=<id> 딥링크 (예: SNS 대시보드 → 메타광고 연동 안내)
  // effect로 뒤늦게 setState하면 렌더가 두 번 도므로 초기값으로 바로 반영한다
  const deepLinkId = useSearchParams().get("post");
  const deepLinked = deepLinkId ? posts.find((p) => p.id === deepLinkId) : undefined;

  const [activeBoard, setActiveBoard] = useState<"전체" | Platform>(deepLinked?.platform ?? "전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(deepLinked?.id ?? posts[0]?.id ?? null);
  // 모바일 아코디언: 클릭한 글 내용이 목록 안에서 바로 펼쳐짐 (null = 전부 접힘)
  const [mobileOpenId, setMobileOpenId] = useState<string | null>(deepLinked?.id ?? null);


  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchBoard = activeBoard === "전체" || p.platform === activeBoard || p.pinned;
        const matchSearch =
          searchQuery === "" ||
          p.title.includes(searchQuery) ||
          p.author.includes(searchQuery);
        return matchBoard && matchSearch;
      }),
    [posts, activeBoard, searchQuery]
  );

  const selected = posts.find((p) => p.id === selectedId) ?? null;

  // 댓글을 달거나 지우면 목록·상세의 댓글 수를 바로 맞춘다
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const onCountChange = useCallback((id: string, n: number) => {
    setCommentCounts((prev) => (prev[id] === n ? prev : { ...prev, [id]: n }));
  }, []);
  const commentsOf = (p: BoardItem) => commentCounts[p.id] ?? p.comments;

  // 실제로 본 글만 한 번씩 조회수를 올린다 — 2단 화면은 상세에 뜬 글, 좁은 화면은 펼친 글
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const counted = useRef(new Set<string>());
  useEffect(() => {
    const id = window.matchMedia(TWO_COLUMN).matches ? selectedId : mobileOpenId;
    if (!id || counted.current.has(id)) return;
    counted.current.add(id);
    incrementBoardView(id).then((v) => {
      if (v != null) setViewCounts((prev) => ({ ...prev, [id]: v }));
    });
  }, [selectedId, mobileOpenId]);
  const viewsOf = (p: BoardItem) => viewCounts[p.id] ?? p.views;

  return (
    <div className="w-full space-y-6">

      {/* 헤더 — 글쓰기는 운영자 전용이라 고객 화면에서는 노출하지 않는다 */}
      <PageHeader title="지식공유" subtitle="마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요." iconPath={"M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"} />

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
                  : "bg-white/60 border-transparent hover:bg-white hover:border-brand-border"
              }`}
              style={active ? { borderColor: b.color, boxShadow: `0 4px 14px ${b.color}22` } : undefined}
            >
              <span
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: b.color, boxShadow: `0 2px 6px ${b.color}55` }}
              >
                <BoardIcon k={b.key} />
              </span>
              <span className="min-w-0">
                <span className={`block text-[16px] font-bold leading-tight ${active ? "text-brand-dark" : "text-brand-sub"}`}>
                  {b.key}
                </span>
                <span className="block text-[12px] text-brand-muted truncate">{b.sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] text-brand-sub">
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
            className="pl-9 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-[15px] text-brand-dark placeholder:text-brand-muted focus:outline-none focus:border-brand-primary w-full sm:w-[260px]"
          />
        </div>
      </div>

      {/* 마스터–디테일 */}
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.6fr)] xl:grid-cols-[460px_minmax(0,1fr)] gap-4 items-start">

        {/* 목록 */}
        <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[17px] text-brand-muted">검색 결과가 없습니다.</p>
            </div>
          ) : (
            filtered.map((post, i) => {
              const colors = CATEGORY_COLORS[post.category] ?? { bg: "bg-gray-50", text: "text-gray-600" };
              const pColor = post.platform ? PLATFORM_COLORS[post.platform] : "#2452EB";
              const active = post.id === selectedId;
              const open = post.id === mobileOpenId;
              return (
                <div key={post.id} className={i > 0 ? "border-t border-brand-border" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(post.id);
                    // 2단 화면에선 오른쪽 상세로 열고, 좁은 화면에서만 목록 안에서 펼친다
                    if (!window.matchMedia(TWO_COLUMN).matches) {
                      setMobileOpenId((prev) => (prev === post.id ? null : post.id));
                    }
                  }}
                  aria-current={active}
                  aria-expanded={open}
                  className={[
                    "w-full text-left px-4 py-4 flex items-start gap-3 transition-colors relative",
                    active ? "min-[901px]:bg-brand-primary-50" : "hover:bg-brand-lighter",
                    open ? "bg-brand-primary-50" : "",
                  ].join(" ")}
                >
                  {active && <span className="hidden min-[901px]:block absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}
                  {open && <span className="min-[901px]:hidden absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}

                  {/* 채널 뱃지 */}
                  <span
                    className="shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-lg mt-0.5 min-[901px]:max-xl:hidden"
                    style={{ background: `${pColor}14`, color: pColor }}
                  >
                    {post.platform ?? "공지"}
                  </span>

                  {/* 본문 요약 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`shrink-0 text-[12px] font-bold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                        {post.category}
                      </span>
                      {post.pinned && (
                        <svg className="w-3.5 h-3.5 text-brand-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
                        </svg>
                      )}
                      <span
                        className={[
                          "text-[16px] font-semibold truncate transition-colors",
                          open ? "text-brand-primary" : "text-brand-dark",
                          active ? "min-[901px]:text-brand-primary" : "min-[901px]:text-brand-dark",
                        ].join(" ")}
                      >
                        {post.title}
                      </span>
                      {commentsOf(post) > 0 && (
                        <span className="shrink-0 text-[13px] text-brand-primary font-bold">({commentsOf(post)})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[13px] text-brand-muted whitespace-nowrap overflow-hidden">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>조회 {viewsOf(post).toLocaleString()}</span>
                    </div>
                  </div>
                </button>

                {/* 모바일 아코디언 본문 — 클릭한 글 내용이 목록 안에서 바로 펼쳐짐 */}
                <div className={`min-[901px]:hidden overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[4000px]" : "max-h-0"}`}>
                  <div className="px-4 pb-5 pt-3 space-y-3 border-t border-brand-border">
                    <AttachmentGallery items={post.attachments} className="pb-1" />
                    {post.paragraphs.map((para, idx) => (
                      <p key={idx} className="text-[15px] leading-[1.7] text-brand-text">
                        {para}
                      </p>
                    ))}
                    {open && (
                      <div className="pt-4 mt-2 border-t border-brand-border">
                        <BoardComments postId={post.id} onCountChange={onCountChange} />
                      </div>
                    )}
                  </div>
                </div>
                </div>
              );
            })
          )}
        </div>

        {/* 상세 (데스크톱 전용 — 모바일은 목록 내 아코디언으로 표시) */}
        <div className="hidden min-[901px]:block bg-white rounded-2xl border border-brand-border min-h-[360px] min-[901px]:sticky min-[901px]:top-6">
          {selected ? (
            <article className="p-6 md:p-8">
              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    background: `${selected.platform ? PLATFORM_COLORS[selected.platform] : "#2452EB"}14`,
                    color: selected.platform ? PLATFORM_COLORS[selected.platform] : "#2452EB",
                  }}
                >
                  {selected.platform ?? "공지"}
                </span>
                <span className={`text-[12px] font-bold px-2 py-0.5 rounded-md ${(CATEGORY_COLORS[selected.category] ?? { bg: "bg-gray-50", text: "text-gray-600" }).bg} ${(CATEGORY_COLORS[selected.category] ?? { text: "text-gray-600" }).text}`}>
                  {selected.category}
                </span>
                {selected.pinned && (
                  <svg className="w-4 h-4 text-brand-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5v6h2v-6h5v-2l-2-2z" />
                  </svg>
                )}
              </div>

              <h2 className="mt-3 text-[22px] md:text-[25px] font-extrabold text-brand-dark tracking-tight leading-snug">
                {selected.title}
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[15px] text-brand-sub">
                <span className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-brand-lighter flex items-center justify-center text-[12px] font-bold text-brand-sub">
                    {selected.author.charAt(0)}
                  </span>
                  {selected.author}
                </span>
                <span className="text-brand-muted">{selected.date}</span>
                <span className="text-brand-muted">조회 {viewsOf(selected).toLocaleString()}</span>
                <span className="text-brand-muted">댓글 {commentsOf(selected)}</span>
              </div>

              <div className="mt-5 pt-5 border-t border-brand-border space-y-4">
                {selected.paragraphs.map((para, idx) => (
                  <p key={idx} className="text-[16px] leading-[1.75] text-brand-text">
                    {para}
                  </p>
                ))}
                <AttachmentGallery items={selected.attachments} />
              </div>

              <div className="mt-8 pt-6 border-t border-brand-border">
                <BoardComments postId={selected.id} onCountChange={onCountChange} />
              </div>
            </article>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center px-6">
              <div className="h-12 w-12 rounded-2xl bg-brand-lighter flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="text-[17px] font-semibold text-brand-dark mb-1">게시글을 선택하세요</p>
              <p className="text-[15px] text-brand-sub">왼쪽 목록에서 글을 클릭하면 내용이 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

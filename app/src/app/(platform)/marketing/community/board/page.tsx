"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/marketing/PageHeader";

type Platform = "네이버" | "인스타그램" | "유튜브";

type Post = {
  id: number;
  platform: Platform;
  category: string;
  title: string;
  author: string;
  date: string;
  views: number;
  comments: number;
  pinned: boolean;
  content: string[];
};

const MOCK_POSTS: Post[] = [
  { id: 1, platform: "네이버", category: "공지", title: "BlueEgg 커뮤니티 이용 안내", author: "관리자", date: "2026.06.20", views: 1240, comments: 3, pinned: true, content: [
    "BlueEgg 커뮤니티에 오신 것을 환영합니다.",
    "본 게시판은 마케터들이 노하우를 공유하고 최신 마케팅 정보를 나누는 공간입니다. 광고성 도배, 비방, 개인정보 노출 게시글은 사전 안내 없이 삭제될 수 있습니다.",
    "건전한 커뮤니티 문화를 함께 만들어 주세요. 감사합니다.",
  ] },
  { id: 2, platform: "네이버", category: "자유", title: "네이버 플레이스 리워드 진행 후기 공유합니다", author: "마케터A", date: "2026.06.19", views: 312, comments: 8, pinned: false, content: [
    "네이버 플레이스 리워드 캠페인을 2주간 진행한 후기를 공유합니다.",
    "키워드 3개를 타겟으로 잡고 일 유입을 조절했더니 2주 차부터 순위가 눈에 띄게 올라왔습니다. 방문자 리뷰도 자연스럽게 늘어난 점이 좋았습니다.",
    "궁금한 점 있으면 댓글 남겨주세요!",
  ] },
  { id: 3, platform: "네이버", category: "질문", title: "네이버 SA 광고 예산 어느 정도 잡으시나요?", author: "신규광고주", date: "2026.06.18", views: 234, comments: 9, pinned: false, content: [
    "이제 막 네이버 SA 광고를 시작하려는 신규 광고주입니다.",
    "업종은 지역 기반 서비스업인데, 처음에 일 예산을 어느 정도로 잡고 시작하는 게 좋을까요? 클릭당 단가도 편차가 커서 감이 잘 안 옵니다.",
    "선배님들의 조언 부탁드립니다.",
  ] },
  { id: 4, platform: "네이버", category: "정보", title: "2026 상반기 네이버 쇼핑 키워드 트렌드 정리", author: "트렌드리서치", date: "2026.06.17", views: 623, comments: 12, pinned: false, content: [
    "2026 상반기 네이버 쇼핑 키워드 트렌드를 정리했습니다.",
    "계절 상품과 리빙 카테고리의 검색량이 전년 대비 크게 증가했고, 롱테일 키워드의 전환율이 대표 키워드보다 높게 나타났습니다.",
    "상세 데이터는 첨부 자료를 참고해 주세요.",
  ] },
  { id: 5, platform: "인스타그램", category: "질문", title: "META(인스타) 광고 세팅 시 픽셀 설치 어떻게 하셨나요?", author: "광고초보", date: "2026.06.16", views: 178, comments: 5, pinned: false, content: [
    "META 광고를 처음 세팅하는데 픽셀 설치에서 막혔습니다.",
    "쇼핑몰이 카페24 기반인데, 이벤트 설정까지 제대로 하려면 어떤 순서로 진행해야 하는지 궁금합니다.",
  ] },
  { id: 6, platform: "인스타그램", category: "자유", title: "인스타 릴스 마케팅으로 매출 2배 올린 후기", author: "릴스장인", date: "2026.06.15", views: 489, comments: 11, pinned: false, content: [
    "릴스 콘텐츠에 집중한 뒤로 매출이 2배 가까이 올랐습니다.",
    "제품 사용 장면을 3초 안에 보여주는 훅이 핵심이었고, 주 3회 이상 꾸준히 업로드한 것이 도달에 크게 도움이 됐습니다.",
  ] },
  { id: 7, platform: "인스타그램", category: "정보", title: "인스타그램 공동구매 진행 시 체크리스트", author: "SNS마케터", date: "2026.06.14", views: 387, comments: 4, pinned: false, content: [
    "인스타그램 공동구매를 진행하기 전 확인해야 할 체크리스트를 정리했습니다.",
    "재고·배송 일정 확정, 예상 문의 응대 시나리오, 라이브 안내 스케줄 등을 미리 준비하면 진행이 훨씬 수월합니다.",
  ] },
  { id: 8, platform: "유튜브", category: "정보", title: "유튜브 쇼츠 조회수 늘리는 알고리즘 정리", author: "쇼츠연구소", date: "2026.06.13", views: 712, comments: 15, pinned: false, content: [
    "유튜브 쇼츠 알고리즘의 핵심 지표를 정리했습니다.",
    "초반 시청 지속률과 재시청률이 노출 확대에 가장 크게 작용합니다. 첫 1초의 훅과 루프되는 구성을 신경 써 보세요.",
  ] },
  { id: 9, platform: "유튜브", category: "질문", title: "유튜브 인플루언서 협찬 단가 어떻게 책정하나요?", author: "브랜드담당", date: "2026.06.12", views: 256, comments: 6, pinned: false, content: [
    "유튜브 인플루언서 협찬을 진행하려는데 단가 책정 기준이 궁금합니다.",
    "구독자 수 기준으로 잡아야 할지, 평균 조회수 기준으로 잡아야 할지 감이 안 옵니다. 실제 진행해 보신 분들의 경험이 궁금합니다.",
  ] },
  { id: 10, platform: "유튜브", category: "자유", title: "유튜브 광고 ROI 계산 방법 공유합니다", author: "파워셀러", date: "2026.06.11", views: 445, comments: 7, pinned: false, content: [
    "유튜브 광고 ROI를 계산하는 방법을 공유합니다.",
    "광고비 대비 전환 매출뿐 아니라, 브랜드 검색량 증가와 채널 유입 같은 간접 효과까지 함께 보면 판단이 더 정확해집니다.",
  ] },
  { id: 11, platform: "인스타그램", category: "정보", title: "메타광고 계정 연동하는 법 (SNS 대시보드)", author: "BlueEgg 운영팀", date: "2026.06.21", views: 528, comments: 2, pinned: false, content: [
    "SNS 대시보드에서 메타광고 성과를 보려면 먼저 메타(페이스북) 광고 계정을 연동해야 합니다. 아래 순서대로 진행해 주세요.",
    "1. 메타 비즈니스 관리자(business.facebook.com)에 로그인합니다.",
    "2. [비즈니스 설정] → [사용자] → [파트너]에서 BlueEgg 파트너 비즈니스 ID를 추가합니다.",
    "3. 광고 계정 자산에 대한 '분석/보고서 보기' 권한을 부여합니다.",
    "4. BlueEgg SNS 대시보드의 메타광고 탭에서 [계정 연결]을 눌러 인증을 완료합니다.",
    "5. 연동 후 최대 10분 이내에 광고비·노출·클릭·전환·ROAS 데이터가 자동으로 표시됩니다.",
    "권한 오류가 발생하면 광고 계정 관리자 권한이 있는지 확인하고, 그래도 안 되면 담당 매니저에게 문의해 주세요.",
  ] },
  { id: 12, platform: "인스타그램", category: "정보", title: "인스타그램 운영 계정 연동하는 법 (SNS 대시보드)", author: "BlueEgg 운영팀", date: "2026.06.21", views: 341, comments: 1, pinned: false, content: [
    "SNS 대시보드에서 인스타그램 운영 성과를 보려면 인스타그램 프로페셔널(비즈니스/크리에이터) 계정을 연동해야 합니다.",
    "1. 인스타그램 앱에서 계정을 '프로페셔널 계정'으로 전환합니다.",
    "2. 해당 인스타그램 계정을 페이스북 페이지와 연결합니다.",
    "3. 메타 비즈니스 관리자에서 BlueEgg를 파트너로 추가하고 인사이트 보기 권한을 부여합니다.",
    "4. BlueEgg SNS 대시보드의 인스타그램 운영 탭에서 [계정 연결]을 눌러 인증을 완료합니다.",
    "5. 연동 후 도달·좋아요·저장·팔로워 증가 데이터가 자동으로 표시됩니다.",
  ] },
  { id: 13, platform: "네이버", category: "정보", title: "네이버 블로그 연동하는 법 (SNS 대시보드)", author: "BlueEgg 운영팀", date: "2026.06.21", views: 287, comments: 0, pinned: false, content: [
    "SNS 대시보드에서 블로그 발행 성과를 보려면 네이버 블로그와 애널리틱스를 연동해야 합니다.",
    "1. 네이버 블로그 관리 페이지에서 블로그 주소(아이디)를 확인합니다.",
    "2. 네이버 애널리틱스에 블로그를 등록하고 보고서 권한을 설정합니다.",
    "3. BlueEgg SNS 대시보드의 블로그 발행 탭에서 [계정 연결]을 눌러 블로그 주소를 입력합니다.",
    "4. 연동 후 방문자·조회수·상위노출 키워드 데이터가 자동으로 표시됩니다.",
  ] },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  공지: { bg: "bg-red-50", text: "text-red-600" },
  자유: { bg: "bg-blue-50", text: "text-blue-600" },
  질문: { bg: "bg-amber-50", text: "text-amber-600" },
  정보: { bg: "bg-green-50", text: "text-green-600" },
};

const BOARD_TYPES: { key: "전체" | Platform; color: string; sub: string }[] = [
  { key: "전체", color: "#0D3473", sub: "모든 채널" },
  { key: "네이버", color: "#03C75A", sub: "블로그·카페·플레이스" },
  { key: "인스타그램", color: "#E1306C", sub: "피드·릴스·공구" },
  { key: "유튜브", color: "#FF0000", sub: "롱폼·쇼츠" },
];

const PLATFORM_COLORS: Record<Platform, string> = {
  네이버: "#03C75A",
  인스타그램: "#E1306C",
  유튜브: "#FF0000",
};

/* ── 채널 로고 아이콘 (흰색, 컬러 타일 위) ── */
function BoardIcon({ k }: { k: "전체" | Platform }) {
  if (k === "네이버") {
    return (
      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="white" aria-hidden>
        <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" />
      </svg>
    );
  }
  if (k === "인스타그램") {
    return (
      <svg viewBox="0 0 24 24" className="w-[19px] h-[19px]" fill="none" stroke="white" strokeWidth={2} aria-hidden>
        <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.5" />
        <circle cx="12" cy="12" r="4.6" />
        <circle cx="17.4" cy="6.6" r="1.25" fill="white" stroke="none" />
      </svg>
    );
  }
  if (k === "유튜브") {
    return (
      <svg viewBox="0 0 24 24" className="w-[20px] h-[20px]" fill="white" aria-hidden>
        <path d="M9.6 8.15 16 12l-6.4 3.85z" />
      </svg>
    );
  }
  return <span className="font-black text-[17px] text-white">All</span>;
}

export default function BoardPage() {
  const [activeBoard, setActiveBoard] = useState<"전체" | Platform>("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number>(MOCK_POSTS[0].id);
  // 모바일 아코디언: 클릭한 글 내용이 목록 안에서 바로 펼쳐짐 (null = 전부 접힘)
  const [mobileOpenId, setMobileOpenId] = useState<number | null>(null);

  // ?post=<id> 쿼리로 특정 글 열기 (예: SNS 대시보드 → 메타광고 연동 안내)
  useEffect(() => {
    const postParam = new URLSearchParams(window.location.search).get("post");
    if (!postParam) return;
    const id = Number(postParam);
    const post = MOCK_POSTS.find((p) => p.id === id);
    if (post) {
      setSelectedId(id);
      setMobileOpenId(id);
      setActiveBoard(post.platform);
    }
  }, []);

  const filtered = useMemo(
    () =>
      MOCK_POSTS.filter((p) => {
        const matchBoard = activeBoard === "전체" || p.platform === activeBoard || p.pinned;
        const matchSearch =
          searchQuery === "" ||
          p.title.includes(searchQuery) ||
          p.author.includes(searchQuery);
        return matchBoard && matchSearch;
      }),
    [activeBoard, searchQuery]
  );

  const selected = MOCK_POSTS.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="w-full space-y-6">

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="게시판" subtitle="마케터들과 노하우를 공유하고 최신 마케팅 정보를 얻어가세요." iconPath={"M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"} />
        <button className="shrink-0 px-5 py-2.5 rounded-xl text-[15px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">
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
      <div className="grid grid-cols-1 lg:grid-cols-[460px_minmax(0,1fr)] gap-4 items-start">

        {/* 목록 */}
        <div className="rounded-2xl border border-brand-border bg-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[17px] text-brand-muted">검색 결과가 없습니다.</p>
            </div>
          ) : (
            filtered.map((post, i) => {
              const colors = CATEGORY_COLORS[post.category] ?? { bg: "bg-gray-50", text: "text-gray-600" };
              const pColor = PLATFORM_COLORS[post.platform];
              const active = post.id === selectedId;
              const open = post.id === mobileOpenId;
              return (
                <div key={post.id} className={i > 0 ? "border-t border-brand-border" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(post.id);
                    setMobileOpenId((prev) => (prev === post.id ? null : post.id));
                  }}
                  aria-current={active}
                  aria-expanded={open}
                  className={[
                    "w-full text-left px-4 py-4 flex items-start gap-3 transition-colors relative",
                    active ? "lg:bg-brand-primary-50" : "hover:bg-brand-lighter",
                    open ? "bg-brand-primary-50" : "",
                  ].join(" ")}
                >
                  {active && <span className="hidden lg:block absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}
                  {open && <span className="lg:hidden absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />}

                  {/* 채널 뱃지 */}
                  <span
                    className="shrink-0 text-[12px] font-bold px-2.5 py-1 rounded-lg mt-0.5"
                    style={{ background: `${pColor}14`, color: pColor }}
                  >
                    {post.platform}
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
                          active ? "lg:text-brand-primary" : "lg:text-brand-dark",
                        ].join(" ")}
                      >
                        {post.title}
                      </span>
                      {post.comments > 0 && (
                        <span className="shrink-0 text-[13px] text-brand-primary font-bold">({post.comments})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[13px] text-brand-muted">
                      <span>{post.author}</span>
                      <span>·</span>
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>조회 {post.views.toLocaleString()}</span>
                    </div>
                  </div>
                </button>

                {/* 모바일 아코디언 본문 — 클릭한 글 내용이 목록 안에서 바로 펼쳐짐 */}
                <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${open ? "max-h-[1600px]" : "max-h-0"}`}>
                  <div className="px-4 pb-5 pt-3 space-y-3 border-t border-brand-border">
                    {post.content.map((para, idx) => (
                      <p key={idx} className="text-[15px] leading-[1.7] text-brand-text">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
                </div>
              );
            })
          )}
        </div>

        {/* 상세 (데스크톱 전용 — 모바일은 목록 내 아코디언으로 표시) */}
        <div className="hidden lg:block bg-white rounded-2xl border border-brand-border min-h-[360px] lg:sticky lg:top-6">
          {selected ? (
            <article className="p-6 md:p-8">
              <div className="flex items-center gap-2">
                <span
                  className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: `${PLATFORM_COLORS[selected.platform]}14`, color: PLATFORM_COLORS[selected.platform] }}
                >
                  {selected.platform}
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
                <span className="text-brand-muted">조회 {selected.views.toLocaleString()}</span>
                <span className="text-brand-muted">댓글 {selected.comments}</span>
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

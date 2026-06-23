"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ── Shopping Rank Line Chart ── */
const RANK_CHART_TABS = ["통합스토어", "가격비교"] as const;
const RANK_STORES = ["아우라 패딩 | 아우라 패딩", "버터플라이 | 여성 자켓"];

const RANK_DATA = [
  { date: "10-29", rank: 74 },
  { date: "10-29", rank: 35 },
  { date: "10-30", rank: 53 },
  { date: "10-30", rank: 36 },
  { date: "10-31", rank: 36 },
  { date: "11-01", rank: 34 },
  { date: "11-02", rank: 19 },
  { date: "11-03", rank: 18 },
  { date: "11-04", rank: 16 },
  { date: "11-05", rank: 8  },
];

function RankLineChart() {
  const W = 520; const H = 180;
  const pL = 20; const pR = 20; const pT = 32; const pB = 36;
  const iW = W - pL - pR; const iH = H - pT - pB;
  const n = RANK_DATA.length;
  const maxR = Math.max(...RANK_DATA.map(d => d.rank));
  const step = iW / (n - 1);

  const pts = RANK_DATA.map((d, i) => {
    const x = pL + i * step;
    const y = pT + (d.rank / maxR) * iH;
    return { x, y, ...d };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[n - 1].x},${pT + iH}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      <defs>
        <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3182F6" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#3182F6" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {[0, 0.33, 0.66, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f}
          stroke="#F2F4F6" strokeWidth={1} />
      ))}
      <polygon points={area} fill="url(#rankFill)" />
      <polyline points={polyline} fill="none" stroke="#3182F6" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#3182F6" strokeWidth={2} />
          <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={10} fontWeight={600} fill="#4E5968">
            {p.rank}
          </text>
        </g>
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize={9.5} fill="#8B95A1">
          {p.date}
        </text>
      ))}
    </svg>
  );
}

/* ── Campaign Data ── */
const CAMPAIGNS = [
  {
    id: 1,
    status: "반려",
    statusColor: "bg-red-50 text-red-500 border-red-100",
    channel: "네이버 플레이스",
    channelColor: "bg-green-50 text-green-700 border-green-100",
    product: "아우라 방향제",
    reviewer: "앤드류",
    count: "1건",
    dateFrom: "2025-07-02",
    dateTo: "2025-07-11",
    avatarColor: "#3182F6",
  },
  {
    id: 2,
    status: "진행중",
    statusColor: "bg-blue-50 text-blue-600 border-blue-100",
    channel: "네이버 쇼핑",
    channelColor: "bg-blue-50 text-blue-700 border-blue-100",
    product: "버터플라이 자켓",
    reviewer: "김소현",
    count: "3건",
    dateFrom: "2025-07-10",
    dateTo: "2025-07-20",
    avatarColor: "#00B493",
  },
  {
    id: 3,
    status: "완료",
    statusColor: "bg-gray-50 text-gray-500 border-gray-200",
    channel: "쿠팡",
    channelColor: "bg-orange-50 text-orange-700 border-orange-100",
    product: "아우라 패딩",
    reviewer: "이준혁",
    count: "2건",
    dateFrom: "2025-06-20",
    dateTo: "2025-06-30",
    avatarColor: "#8B5CF6",
  },
];

/* ── Page ── */
export default function MarketingDashboardPage() {
  const [rankChannel, setRankChannel] = useState<"네이버 플레이스" | "네이버 쇼핑" | "쿠팡">("네이버 쇼핑");
  const [rankTab, setRankTab] = useState<typeof RANK_CHART_TABS[number]>("통합스토어");
  const [rankStore, setRankStore] = useState(RANK_STORES[0]);
  const [campaignIdx, setCampaignIdx] = useState(0);
  const campaign = CAMPAIGNS[campaignIdx];

  return (
    <div className="w-full space-y-5">

      {/* ── 광고 배너 3종 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* 배너 1: 네이버 SA 광고 */}
        <Link
          href="/marketing/ads/naver-cpc"
          className="relative rounded-2xl overflow-hidden flex items-center gap-4 px-5 py-4 group"
          style={{ background: "linear-gradient(135deg,#03C75A 0%,#02A64E 100%)", minHeight: 90 }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 50%, rgba(255,255,255,0.12), transparent 70%)" }} />
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
            <span className="text-[18px] font-extrabold text-white leading-none">N</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-0.5">네이버 광고</p>
            <p className="text-[14px] font-extrabold text-white leading-tight">SA 광고 대행</p>
            <p className="text-[11px] text-white/70 mt-0.5">클릭당 70원~, 검색결과 최상단</p>
          </div>
          <svg className="w-4 h-4 text-white/60 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>

        {/* 배너 2: META 퍼포먼스 */}
        <Link
          href="/marketing/ads/meta"
          className="relative rounded-2xl overflow-hidden flex items-center gap-4 px-5 py-4 group"
          style={{ background: "linear-gradient(135deg,#1877F2 0%,#0052CC 100%)", minHeight: 90 }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 50%, rgba(255,255,255,0.12), transparent 70%)" }} />
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-0.5">META 광고</p>
            <p className="text-[14px] font-extrabold text-white leading-tight">퍼포먼스 대행</p>
            <p className="text-[11px] text-white/70 mt-0.5">35억 명 도달, 전환율 +45%</p>
          </div>
          <svg className="w-4 h-4 text-white/60 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>

        {/* 배너 3: 네이버 카페 바이럴 */}
        <Link
          href="/marketing/community/cafe"
          className="relative rounded-2xl overflow-hidden flex items-center gap-4 px-5 py-4 group"
          style={{ background: "linear-gradient(135deg,#1B1F3B 0%,#3B2094 100%)", minHeight: 90 }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 50%, rgba(139,92,246,0.3), transparent 70%)" }} />
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-white/15">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold text-white/50 uppercase tracking-widest mb-0.5">바이럴</p>
            <p className="text-[14px] font-extrabold text-white leading-tight">네이버 카페 침투</p>
            <p className="text-[11px] text-white/60 mt-0.5">1,000+ 채널, 100% A/S 보장</p>
          </div>
          <svg className="w-4 h-4 text-white/60 shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </Link>

      </div>

      {/* ── 공지사항 + 인기 광고 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 공지사항 */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-brand-primary flex items-center justify-center shrink-0">
                <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-brand-dark leading-tight">공지사항</p>
                <p className="text-[11px] text-brand-sub leading-tight">다이버즈 새소식</p>
              </div>
            </div>
            <Link href="/marketing/notices" className="flex items-center gap-0.5 text-[12px] font-semibold text-brand-sub hover:text-brand-primary transition-colors">
              더보기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="space-y-0">
            {[
              { title: "다이버즈 6월 1주차 최신 레퍼런스 공유", date: "2026년 06월 11일", isNew: true },
              { title: "[신규 기능 안내] 통합 순위관리 기능 오픈", date: "2026년 06월 10일", isNew: true },
              { title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 완료 안내", date: "2026년 05월 31일", isNew: false },
              { title: "[공지] 순위체크 및 AI 주문 시스템 긴급 안정화 작업 안내", date: "2026년 05월 31일", isNew: false },
              { title: "다이버즈에 곧 쇼핑,쿠팡 AI 주문 기능이 생성됩니다!", date: "2026년 05월 18일", isNew: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-brand-border" : ""}`}>
                {item.isNew ? (
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-brand-primary text-white shrink-0">NEW</span>
                ) : (
                  <span className="w-[34px] shrink-0" />
                )}
                <p className="flex-1 text-[13px] text-brand-dark truncate">{item.title}</p>
                <span className="text-[11px] text-brand-muted shrink-0">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 인기 광고 */}
        <div className="bg-white rounded-2xl border border-brand-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)" }}>
                <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-bold text-brand-dark leading-tight">인기 광고</p>
                <p className="text-[11px] text-brand-sub leading-tight">웍스 광고 매출 TOP 10</p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-500 text-white">HOT</span>
          </div>

          <div className="space-y-0">
            {[
              { name: "플레이스 (모든매체사)", badge: "HOT", badgeColor: "bg-red-500 text-white", icon: "🌐" },
              { name: "플레이스 (맛집전용)",  badge: "NEW", badgeColor: "bg-[#8B5CF6] text-white", icon: "🍗" },
              { name: "쇼핑 (모든매체사)",    badge: "NEW", badgeColor: "bg-[#8B5CF6] text-white", icon: "🛍️" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-brand-border" : ""}`}>
                <div className="h-10 w-10 rounded-full bg-brand-lighter border border-brand-border flex items-center justify-center shrink-0 text-[18px]">
                  {item.icon}
                </div>
                <p className="flex-1 text-[14px] font-semibold text-brand-primary">{item.name}</p>
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 섹션 제목 ── */}
      <div className="flex items-center gap-4 pt-2">
        <div className="h-px flex-1 bg-brand-border" />
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-brand-border bg-white shadow-sm">
          <span className="h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.93V17a1 1 0 11-2 0v-.07A8.001 8.001 0 014.07 13H4a1 1 0 110-2h.07A8.001 8.001 0 0111 4.07V4a1 1 0 112 0v.07A8.001 8.001 0 0119.93 11H20a1 1 0 110 2h-.07A8.001 8.001 0 0113 16.93z" />
            </svg>
          </span>
          <h2 className="text-[14px] font-extrabold text-brand-dark tracking-tight whitespace-nowrap">내 캠페인 현황 체크하기</h2>
        </div>
        <div className="h-px flex-1 bg-brand-border" />
      </div>

      {/* ── 쇼핑 추적 슬롯 + 쇼핑 트래픽 캠페인 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 쇼핑 추적 슬롯 */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-brand-dark">내 캠페인 순위 추적하기</h2>
            <Link href="/marketing/rank" className="flex items-center gap-1 text-[12px] font-semibold text-brand-primary hover:underline">
              등록하기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>

          {/* 채널 선택 */}
          <div className="flex gap-1.5 mb-3">
            {(["네이버 플레이스", "네이버 쇼핑", "쿠팡"] as const).map((ch) => {
              const active = rankChannel === ch;
              const colors: Record<string, string> = {
                "네이버 플레이스": active ? "bg-green-500 text-white" : "bg-green-50 text-green-700 hover:bg-green-100",
                "네이버 쇼핑":     active ? "bg-blue-500 text-white"  : "bg-blue-50 text-blue-700 hover:bg-blue-100",
                "쿠팡":           active ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100",
              };
              return (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setRankChannel(ch)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${colors[ch]}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>

          {/* 탭 */}
          <div className="flex gap-2 mb-4">
            {RANK_CHART_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setRankTab(tab)}
                className={[
                  "px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all",
                  rankTab === tab
                    ? "bg-brand-dark text-white"
                    : "bg-brand-lighter text-brand-sub hover:bg-brand-border",
                ].join(" ")}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 스토어 셀렉터 */}
          <div className="relative mb-4">
            <select
              value={rankStore}
              onChange={(e) => setRankStore(e.target.value)}
              className="w-full appearance-none border border-brand-border rounded-xl px-4 py-2.5 text-[13px] text-brand-dark bg-white pr-9 focus:outline-none focus:border-brand-primary"
            >
              {RANK_STORES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* 라인 차트 */}
          <div className="flex-1">
            <RankLineChart />
          </div>
        </div>

        {/* 쇼핑 트래픽 캠페인 */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[15px] font-bold text-brand-dark">현재 운영중인 캠페인</h2>
            <Link href="/marketing/reward/shopping" className="flex items-center gap-1 text-[12px] font-semibold text-brand-primary hover:underline">
              바로가기
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </Link>
          </div>

          {/* 캐러셀 */}
          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={() => setCampaignIdx((i) => (i - 1 + CAMPAIGNS.length) % CAMPAIGNS.length)}
              className="h-8 w-8 rounded-full border border-brand-border flex items-center justify-center shrink-0 hover:bg-brand-lighter transition-colors"
            >
              <svg className="w-4 h-4 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex-1 border border-brand-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block text-[12px] font-bold px-2.5 py-0.5 rounded-md border ${campaign.statusColor}`}>
                  {campaign.status}
                </span>
                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border ${campaign.channelColor}`}>
                  {campaign.channel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-muted text-[13px]">ㄴ</span>
                <div className="flex-1 px-3 py-2 rounded-xl bg-brand-lighter border border-brand-border">
                  <p className="text-[13px] font-semibold text-brand-dark">{campaign.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div
                  className="h-6 w-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: campaign.avatarColor }}
                >
                  {campaign.reviewer.charAt(0)}
                </div>
                <span className="text-[13px] text-brand-dark font-medium">{campaign.reviewer} · {campaign.count}</span>
              </div>
              <p className="text-[12px] text-brand-sub font-medium">
                {campaign.dateFrom} ~ {campaign.dateTo}
              </p>
              <button
                type="button"
                className="px-4 py-1.5 rounded-xl border border-brand-border text-[12px] font-semibold text-brand-sub hover:bg-brand-lighter transition-colors"
              >
                복사
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCampaignIdx((i) => (i + 1) % CAMPAIGNS.length)}
              className="h-8 w-8 rounded-full border border-brand-border flex items-center justify-center shrink-0 hover:bg-brand-lighter transition-colors"
            >
              <svg className="w-4 h-4 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 인디케이터 */}
          <div className="flex justify-center gap-1.5 mt-4">
            {CAMPAIGNS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCampaignIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === campaignIdx ? "w-4 bg-brand-primary" : "w-1.5 bg-brand-border"}`}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

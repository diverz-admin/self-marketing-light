"use client";

import Link from "next/link";
import { useState } from "react";
import AdBanners from "@/components/marketing/AdBanners";

type RankPoint = { date: string; rank: number };

type Campaign = {
  id: string;
  platform: "네이버 플레이스" | "네이버 쇼핑" | "쿠팡";
  category: "리워드" | "리뷰";
  subType: string;
  campaignName: string;
  keyword: string;
  totalCount: number;
  doneCount: number;
  startDate: string;
  endDate: string;
  status: "running" | "pending" | "paused" | "done";
  manageHref: string;
  rank?: number;
  rankChange?: number;
  rankHistory?: RankPoint[];
};

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    platform: "네이버 플레이스",
    category: "리워드",
    subType: "방문 리워드",
    campaignName: "홍대 카페 방문 이벤트",
    keyword: "홍대카페",
    totalCount: 50, doneCount: 34,
    startDate: "2026-06-01", endDate: "2026-06-30",
    status: "running",
    manageHref: "/marketing/reward/place/manage",
    rank: 5, rankChange: 3,
    rankHistory: [
      { date: "6/01", rank: 18 }, { date: "6/03", rank: 15 },
      { date: "6/07", rank: 12 }, { date: "6/10", rank: 9 },
      { date: "6/13", rank: 7 },  { date: "6/16", rank: 6 },
      { date: "6/19", rank: 5 },
    ],
  },
  {
    id: "2",
    platform: "네이버 쇼핑",
    category: "리워드",
    subType: "구매 리워드",
    campaignName: "여름 신상 구매 리워드",
    keyword: "여름원피스추천",
    totalCount: 100, doneCount: 62,
    startDate: "2026-06-05", endDate: "2026-07-05",
    status: "running",
    manageHref: "/marketing/reward/shopping/manage",
    rank: 12, rankChange: -2,
    rankHistory: [
      { date: "6/05", rank: 8 },  { date: "6/07", rank: 9 },
      { date: "6/09", rank: 11 }, { date: "6/12", rank: 10 },
      { date: "6/14", rank: 13 }, { date: "6/17", rank: 14 },
      { date: "6/19", rank: 12 },
    ],
  },
  {
    id: "3",
    platform: "쿠팡",
    category: "리워드",
    subType: "구매 리워드",
    campaignName: "프로틴 파우더 구매 리워드",
    keyword: "단백질보충제추천",
    totalCount: 30, doneCount: 10,
    startDate: "2026-06-10", endDate: "2026-07-10",
    status: "paused",
    manageHref: "/marketing/reward/coupang/manage",
    rank: 8, rankChange: 0,
    rankHistory: [
      { date: "6/10", rank: 14 }, { date: "6/12", rank: 12 },
      { date: "6/14", rank: 10 }, { date: "6/16", rank: 9 },
      { date: "6/18", rank: 8 },  { date: "6/20", rank: 8 },
      { date: "6/22", rank: 8 },
    ],
  },
  {
    id: "4",
    platform: "네이버 플레이스",
    category: "리뷰",
    subType: "블로그리뷰(기자단)",
    campaignName: "강남 맛집 기자단 모집",
    keyword: "강남맛집추천",
    totalCount: 20, doneCount: 15,
    startDate: "2026-06-03", endDate: "2026-06-25",
    status: "running",
    manageHref: "/marketing/review/place/manage",
  },
  {
    id: "5",
    platform: "네이버 쇼핑",
    category: "리뷰",
    subType: "상품 체험단",
    campaignName: "콜라겐 크림 체험단",
    keyword: "콜라겐크림추천",
    totalCount: 30, doneCount: 18,
    startDate: "2026-06-10", endDate: "2026-07-05",
    status: "running",
    manageHref: "/marketing/review/shopping/manage/product-experience",
  },
  {
    id: "6",
    platform: "쿠팡",
    category: "리뷰",
    subType: "상품 체험단",
    campaignName: "쿠팡 건강기능식품 체험단",
    keyword: "건강기능식품추천",
    totalCount: 30, doneCount: 0,
    startDate: "2026-07-01", endDate: "2026-07-30",
    status: "pending",
    manageHref: "/marketing/review/coupang/manage",
  },
];

const STATUS_CONFIG = {
  running: { label: "진행중",   bg: "bg-green-50",  text: "text-green-600" },
  pending: { label: "대기중",   bg: "bg-amber-50",  text: "text-amber-600" },
  paused:  { label: "일시정지", bg: "bg-gray-100",  text: "text-gray-500"  },
  done:    { label: "완료",     bg: "bg-blue-50",   text: "text-blue-500"  },
};
const PLATFORM_CONFIG = {
  "네이버 플레이스": { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-100",  line: "#10B981" },
  "네이버 쇼핑":     { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-100",   line: "#3B82F6" },
  "쿠팡":           { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", line: "#F97316" },
};
const CATEGORY_CONFIG = {
  "리워드": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100" },
  "리뷰":   { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100" },
};

const FILTER_TABS = ["전체", "리워드", "리뷰"] as const;
type FilterTab = typeof FILTER_TABS[number];

const PLATFORM_TABS = ["전체", "네이버 플레이스", "네이버 쇼핑", "쿠팡"] as const;
type PlatformTab = typeof PLATFORM_TABS[number];

/* ── 순위 미니 차트 (Y축 반전: 숫자 작을수록 위) ── */
function RankMiniChart({ data, color }: { data: RankPoint[]; color: string }) {
  const W = 420; const H = 120;
  const pL = 32; const pR = 16; const pT = 12; const pB = 28;
  const iW = W - pL - pR; const iH = H - pT - pB;
  const n = data.length;
  const ranks = data.map((d) => d.rank);
  const minR = Math.min(...ranks);
  const maxR = Math.max(...ranks);
  const span = maxR === minR ? 1 : maxR - minR;
  const step = iW / (n - 1);

  const pts = data.map((d, i) => ({
    x: pL + i * step,
    y: pT + ((d.rank - minR) / span) * iH, // 낮은 순위(좋은)가 아래
    ...d,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${pT + iH} ${polyline} ${pts[n - 1].x},${pT + iH}`;
  const gradId = `rg-${color.replace("#", "")}`;

  const yLabels = [minR, Math.round((minR + maxR) / 2), maxR];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* 격자선 */}
      {[0, 0.5, 1].map((f, i) => (
        <line key={i} x1={pL} y1={pT + iH * f} x2={W - pR} y2={pT + iH * f}
          stroke="#F2F4F6" strokeWidth={1} />
      ))}
      {/* Y축 레이블 */}
      {yLabels.map((v, i) => (
        <text key={i} x={pL - 4} y={pT + iH * (i / 2) + 4}
          textAnchor="end" fontSize={9} fill="#8B95A1">{v}위</text>
      ))}
      {/* 면적 */}
      <polygon points={area} fill={`url(#${gradId})`} />
      {/* 라인 */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" />
      {/* 포인트 + 날짜 */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill="white" stroke={color} strokeWidth={2} />
          <text x={p.x} y={H - 4} textAnchor="middle" fontSize={9} fill="#8B95A1">{p.date}</text>
          <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize={9} fontWeight={700} fill={color}>{p.rank}</text>
        </g>
      ))}
    </svg>
  );
}

export default function MyCampaignsPage() {
  const [tab, setTab] = useState<FilterTab>("전체");
  const [platformTab, setPlatformTab] = useState<PlatformTab>("네이버 플레이스");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = CAMPAIGNS.filter((c) =>
    (platformTab === "전체" || c.platform === platformTab) &&
    (tab === "전체" || c.category === tab)
  );
  const runningReward = CAMPAIGNS.filter((c) => c.category === "리워드" && c.status === "running").length;
  const runningReview = CAMPAIGNS.filter((c) => c.category === "리뷰"   && c.status === "running").length;
  const totalRunning  = CAMPAIGNS.filter((c) => c.status === "running").length;

  return (
    <div className="w-full space-y-5">

      {/* 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">마이 캠페인 현황</span>
      </nav>

      {/* 타이틀 */}
      <div>
        <h1 className="text-[22px] font-extrabold text-brand-dark">마이 캠페인 현황</h1>
        <p className="text-[13px] text-brand-sub mt-0.5">진행 중인 리워드 · 리뷰 캠페인을 한눈에 확인하세요.</p>
      </div>

      {/* 광고 배너 */}
      <AdBanners />

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 진행중", value: totalRunning, grad: "linear-gradient(135deg,#10B981,#059669)", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
          { label: "리워드 진행중", value: runningReward, grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "리뷰 진행중",  value: runningReview, grad: "linear-gradient(135deg,#3B82F6,#1D4ED8)", icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.grad }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </span>
            <div>
              <p className="text-[12px] text-brand-sub">{stat.label}</p>
              <p className="text-[22px] font-extrabold text-brand-dark leading-tight">
                {stat.value}<span className="text-[13px] font-medium text-brand-muted ml-1">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 캠페인 테이블 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">

        {/* 플랫폼 필터 */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-brand-border">
          {PLATFORM_TABS.map((p) => {
            const active = platformTab === p;
            const colorMap: Record<string, string> = {
              "전체":          active ? "bg-brand-dark text-white"      : "bg-brand-lighter text-brand-sub hover:bg-brand-border",
              "네이버 플레이스": active ? "bg-green-500 text-white"       : "bg-green-50 text-green-700 hover:bg-green-100",
              "네이버 쇼핑":    active ? "bg-blue-500 text-white"        : "bg-blue-50 text-blue-700 hover:bg-blue-100",
              "쿠팡":          active ? "bg-orange-500 text-white"      : "bg-orange-50 text-orange-700 hover:bg-orange-100",
            };
            return (
              <button key={p} onClick={() => { setPlatformTab(p); setExpandedId(null); }}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${colorMap[p]}`}
              >
                {p}
              </button>
            );
          })}
          <div className="mx-2 h-4 w-px bg-brand-border" />
          {/* 유형 필터 */}
          {FILTER_TABS.map((t) => (
            <button key={t} onClick={() => { setTab(t); setExpandedId(null); }}
              className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                tab === t ? "bg-brand-primary text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                <th className="w-8" />
                {["플랫폼", "유형", "캠페인명 / 서브타입", "키워드", "키워드 순위", "진행률", "기간", "상태", "바로가기"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-[14px] text-brand-muted">
                    진행 중인 캠페인이 없습니다.
                  </td>
                </tr>
              ) : filtered.map((c) => {
                const st      = STATUS_CONFIG[c.status];
                const plt     = PLATFORM_CONFIG[c.platform];
                const cat     = CATEGORY_CONFIG[c.category];
                const pct     = c.totalCount === 0 ? 0 : Math.round((c.doneCount / c.totalCount) * 100);
                const rankUp  = c.rankChange !== undefined && c.rankChange > 0;
                const rankDown= c.rankChange !== undefined && c.rankChange < 0;
                const isOpen  = expandedId === c.id;
                const canExpand = c.category === "리워드" && !!c.rankHistory;

                return (
                  <>
                    <tr
                      key={c.id}
                      onClick={() => canExpand && setExpandedId(isOpen ? null : c.id)}
                      className={`border-b border-brand-border transition-colors ${canExpand ? "cursor-pointer" : ""} ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/40"}`}
                    >
                      {/* 확장 화살표 */}
                      <td className="pl-3 py-3.5">
                        {canExpand && (
                          <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </td>
                      {/* 플랫폼 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${plt.bg} ${plt.text} ${plt.border}`}>
                          {c.platform}
                        </span>
                      </td>
                      {/* 유형 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${cat.bg} ${cat.text} ${cat.border}`}>
                          {c.category}
                        </span>
                      </td>
                      {/* 캠페인명 */}
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-semibold text-brand-dark truncate max-w-[180px]">{c.campaignName}</p>
                        <p className="text-[11px] text-brand-muted mt-0.5">{c.subType}</p>
                      </td>
                      {/* 키워드 */}
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] text-brand-sub">{c.keyword}</span>
                      </td>
                      {/* 키워드 순위 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.rank !== undefined ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[15px] font-extrabold text-brand-dark">{c.rank}위</span>
                            {rankUp && (
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-green-600">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                </svg>
                                {c.rankChange}
                              </span>
                            )}
                            {rankDown && (
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-red-500">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                                {Math.abs(c.rankChange!)}
                              </span>
                            )}
                            {c.rankChange === 0 && <span className="text-[11px] text-brand-muted">–</span>}
                          </div>
                        ) : (
                          <span className="text-[12px] text-brand-muted">-</span>
                        )}
                      </td>
                      {/* 진행률 */}
                      <td className="px-4 py-3.5 min-w-[110px]">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-[11px] text-brand-muted">{c.doneCount}/{c.totalCount}</span>
                            <span className="text-[11px] font-bold text-brand-primary">{pct}%</span>
                          </div>
                          <div className="h-1.5 bg-brand-border rounded-full overflow-hidden w-24">
                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </td>
                      {/* 기간 */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11.5px] text-brand-sub">{c.startDate}</span>
                        <span className="text-brand-muted mx-1">~</span>
                        <span className="text-[11.5px] text-brand-sub">{c.endDate}</span>
                      </td>
                      {/* 상태 */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      {/* 바로가기 */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Link href={c.manageHref}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors"
                        >
                          관리
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>

                    {/* 순위 그래프 아코디언 */}
                    {isOpen && c.rankHistory && (
                      <tr key={`${c.id}-chart`} className="border-b border-brand-border">
                        <td colSpan={10} className="p-0">
                          <div className="bg-brand-lighter/50 border-t border-brand-border px-6 py-5">
                            <div className="flex items-center gap-2 mb-4">
                              <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                              </svg>
                              <p className="text-[13px] font-bold text-brand-dark">
                                키워드 순위 추이
                              </p>
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${plt.bg} ${plt.text} ${plt.border}`}>
                                {c.keyword}
                              </span>
                              <span className="text-[11px] text-brand-muted ml-1">— 숫자가 낮을수록 상위 노출</span>
                            </div>
                            <div className="bg-white rounded-xl border border-brand-border p-4">
                              <RankMiniChart data={c.rankHistory} color={plt.line} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border">
          <p className="text-[12px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
        </div>
      </div>

    </div>
  );
}

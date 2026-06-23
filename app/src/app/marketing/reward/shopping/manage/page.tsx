"use client";

import React, { useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running: { label: "진행중",   bg: "bg-green-50", text: "text-green-600" },
  pending: { label: "대기중",   bg: "bg-amber-50", text: "text-amber-600" },
  paused:  { label: "일시정지", bg: "bg-gray-100", text: "text-gray-500" },
  done:    { label: "완료",     bg: "bg-blue-50",  text: "text-blue-500" },
};

const MOCK_CAMPAIGNS = [
  {
    id: "1",
    productName: "오가닉 마스크팩 10매",
    keyword: "마스크팩 추천",
    platform: "스마트스토어",
    dailyQty: 200,
    duration: 14,
    status: "running",
    startDate: "2026-06-15",
    endDate: "2026-06-29",
    totalCost: 224000,
    rank: 5,
    rankDiff: -3,
    productUrl: "https://smartstore.naver.com/sample/products/1234567",
  },
  {
    id: "2",
    productName: "비타민C 세럼 30ml",
    keyword: "비타민세럼",
    platform: "쿠팡",
    dailyQty: 100,
    duration: 7,
    status: "pending",
    startDate: "2026-06-21",
    endDate: "2026-06-28",
    totalCost: 56000,
    rank: null,
    rankDiff: 0,
    productUrl: "https://www.coupang.com/vp/products/2345678",
  },
  {
    id: "3",
    productName: "남성 반팔 티셔츠",
    keyword: "남성 티셔츠",
    platform: "스마트스토어",
    dailyQty: 300,
    duration: 30,
    status: "done",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    totalCost: 720000,
    rank: 2,
    rankDiff: 6,
    productUrl: "https://smartstore.naver.com/sample/products/3456789",
  },
  {
    id: "4",
    productName: "무선 블루투스 이어폰",
    keyword: "블루투스 이어폰",
    platform: "쿠팡",
    dailyQty: 150,
    duration: 14,
    status: "paused",
    startDate: "2026-06-10",
    endDate: "2026-06-24",
    totalCost: 168000,
    rank: 11,
    rankDiff: 1,
    productUrl: "https://www.coupang.com/vp/products/4567890",
  },
  {
    id: "5",
    productName: "핸드크림 세트 3종",
    keyword: "핸드크림 선물세트",
    platform: "스마트스토어",
    dailyQty: 80,
    duration: 60,
    status: "running",
    startDate: "2026-06-01",
    endDate: "2026-07-31",
    totalCost: 384000,
    rank: 8,
    rankDiff: -4,
    productUrl: "https://smartstore.naver.com/sample/products/5678901",
  },
];

const RANK_HISTORY: Record<string, { date: string; rank: number }[]> = {
  "1": [
    { date: "06/13", rank: 11 },
    { date: "06/14", rank: 9 },
    { date: "06/15", rank: 8 },
    { date: "06/16", rank: 7 },
    { date: "06/17", rank: 6 },
    { date: "06/18", rank: 6 },
    { date: "06/19", rank: 5 },
  ],
  "5": [
    { date: "06/13", rank: 15 },
    { date: "06/14", rank: 14 },
    { date: "06/15", rank: 13 },
    { date: "06/16", rank: 11 },
    { date: "06/17", rank: 10 },
    { date: "06/18", rank: 9 },
    { date: "06/19", rank: 8 },
  ],
};

const CHART_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F97316"];

type TooltipState = {
  pctX: number;
  pctY: number;
  date: string;
  rank: number;
} | null;

function SingleRankChart({
  campaign,
  color,
}: {
  campaign: typeof MOCK_CAMPAIGNS[number];
  color: string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const history = RANK_HISTORY[campaign.id];
  if (!history) return null;

  const W = 400, H = 160;
  const PAD = { top: 20, right: 16, bottom: 36, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const ranks = history.map((d) => d.rank);
  const dataMin = Math.min(...ranks);
  const dataMax = Math.max(...ranks);
  const yMin = Math.max(1, dataMin - 2);
  const yMax = dataMax + 2;

  const xScale = (i: number) => PAD.left + (i / (history.length - 1)) * innerW;
  const yScale = (rank: number) => PAD.top + ((rank - yMin) / (yMax - yMin || 1)) * innerH;

  const yTickCount = 4;
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / (yTickCount - 1)));
  const yTicks: number[] = [];
  for (let t = yMin; t <= yMax; t += yStep) yTicks.push(t);

  const pts = history.map((d, i) => ({ x: xScale(i), y: yScale(d.rank), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`;

  const latestRank = history[history.length - 1].rank;
  const firstRank = history[0].rank;
  const improved = latestRank < firstRank;

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="text-[13.5px] font-extrabold text-brand-dark truncate">{campaign.productName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="text-[12px] text-brand-sub">{campaign.keyword}</span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-[22px] font-extrabold text-brand-dark leading-none">
            {latestRank}<span className="text-[13px] font-medium text-brand-muted ml-0.5">위</span>
          </p>
          <p className={`text-[11px] font-bold mt-0.5 flex items-center justify-end gap-0.5 ${improved ? "text-green-500" : "text-red-400"}`}>
            {improved ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(firstRank - latestRank)}단계
          </p>
        </div>
      </div>

      {/* 날짜별 순위 테이블 */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr>
              {history.map((d, i) => (
                <th key={i} className="px-2 py-1.5 text-[11px] font-semibold text-brand-muted border-b border-brand-border bg-brand-lighter first:rounded-tl-lg last:rounded-tr-lg">
                  {d.date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {history.map((d, i) => (
                <td key={i} className={`px-2 py-2 text-[13px] font-extrabold border-b border-brand-border ${i === history.length - 1 ? "text-brand-dark" : "text-brand-sub"}`}>
                  {d.rank}위
                </td>
              ))}
            </tr>
            <tr>
              {history.map((d, i) => {
                if (i === 0) return <td key={i} className="px-2 py-1.5 text-[11px] text-brand-muted">-</td>;
                const diff = history[i - 1].rank - d.rank;
                return (
                  <td key={i} className="px-2 py-1.5">
                    {diff === 0 ? (
                      <span className="text-[11px] text-brand-muted">-</span>
                    ) : (
                      <span className={`inline-flex items-center justify-center gap-0.5 text-[11px] font-bold ${diff > 0 ? "text-green-500" : "text-red-400"}`}>
                        {diff > 0 ? (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        ) : (
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                        {Math.abs(diff)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 차트 */}
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} y1={yScale(tick)} x2={W - PAD.right} y2={yScale(tick)} stroke="#F3F4F6" strokeWidth={1.5} />
              <text x={PAD.left - 6} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fill="#CBD5E1" fontSize={10}>{tick}위</text>
            </g>
          ))}
          {history.map((d, i) => (
            <text key={i} x={xScale(i)} y={H - PAD.bottom + 16} textAnchor="middle" fill="#CBD5E1" fontSize={10}>{d.date}</text>
          ))}
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />
          <path d={areaPath} fill={color} fillOpacity={0.08} />
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
              <circle
                cx={p.x} cy={p.y} r={13} fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setTooltip({ pctX: (p.x / W) * 100, pctY: (p.y / H) * 100, date: p.date, rank: p.rank })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className="absolute pointer-events-none z-20 bg-[#1A1E2E] text-white px-3 py-2 rounded-xl text-[12px] shadow-xl whitespace-nowrap"
            style={{ left: `${tooltip.pctX}%`, top: `${tooltip.pctY}%`, transform: "translate(-50%, -130%)" }}
          >
            <p className="text-white/60">{tooltip.date}</p>
            <p className="font-extrabold text-[14px]" style={{ color }}>{tooltip.rank}위</p>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1A1E2E" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function RankChartSection({ campaigns }: { campaigns: typeof MOCK_CAMPAIGNS }) {
  const chartCampaigns = campaigns.filter((c) => c.status === "running" && RANK_HISTORY[c.id]);
  if (chartCampaigns.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
        <h3 className="text-[14px] font-extrabold text-brand-dark">키워드별 순위 트래킹</h3>
        <span className="text-[11px] text-brand-muted">최근 7일 · 낮은 숫자가 상위 노출</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartCampaigns.map((c, i) => (
          <SingleRankChart key={c.id} campaign={c} color={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = ["진행중", "대기중", "일시정지", "완료", "전체"];
const STATUS_KEY: Record<string, string> = {
  "전체": "all", "진행중": "running", "대기중": "pending", "일시정지": "paused", "완료": "done",
};

export default function ShoppingManagePage() {
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");

  const filtered = MOCK_CAMPAIGNS.filter((c) => {
    const statusMatch = filter === "전체" || c.status === STATUS_KEY[filter];
    const searchMatch =
      !search ||
      c.productName.includes(search) ||
      c.keyword.includes(search) ||
      c.platform.includes(search);
    return statusMatch && searchMatch;
  });

  const total = MOCK_CAMPAIGNS.length;
  const running = MOCK_CAMPAIGNS.filter((c) => c.status === "running").length;
  const pending = MOCK_CAMPAIGNS.filter((c) => c.status === "pending").length;

  return (
    <div className="w-full space-y-5">
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/reward/shopping" className="hover:text-brand-text">네이버 쇼핑</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">캠페인 관리</span>
      </nav>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 캠페인", value: total,   color: "text-brand-dark",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", grad: "linear-gradient(135deg,#3B82F6,#6366F1)" },
          { label: "진행중",     value: running, color: "text-green-600", icon: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z", grad: "linear-gradient(135deg,#10B981,#059669)" },
          { label: "대기중",     value: pending, color: "text-amber-600", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", grad: "linear-gradient(135deg,#F59E0B,#D97706)" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.grad }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </span>
            <div>
              <p className="text-[12px] text-brand-sub">{stat.label}</p>
              <p className={`text-[22px] font-extrabold leading-tight ${stat.color}`}>
                {stat.value}<span className="text-[13px] font-medium text-brand-muted ml-1">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                  filter === opt ? "bg-brand-primary text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="상품명, 키워드 검색"
                className="pl-8 pr-3 py-1.5 border border-brand-border rounded-xl text-[12px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all w-48"
              />
            </div>
            <Link
              href="/marketing/reward/shopping"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              캠페인 생성
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                {["상품명", "상품 링크", "키워드", "현재 순위", "플랫폼", "일 유입량", "기간", "총 비용", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-[14px] text-brand-muted">
                    조건에 맞는 캠페인이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const st = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-brand-lighter/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="text-[13px] font-semibold text-brand-dark truncate max-w-[140px]">{c.productName}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <a
                          href={c.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[12px] text-brand-primary hover:underline"
                        >
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          상품 링크
                        </a>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[12px] font-medium text-brand-sub">{c.keyword}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.rank === null ? (
                          <span className="text-[12px] text-brand-muted">-</span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-extrabold text-brand-dark">{c.rank}위</span>
                            {c.rankDiff !== 0 && (
                              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${c.rankDiff < 0 ? "text-green-500" : "text-red-400"}`}>
                                {c.rankDiff < 0 ? (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                  </svg>
                                )}
                                {Math.abs(c.rankDiff)}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          c.platform === "쿠팡" ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-700"
                        }`}>
                          {c.platform}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] font-bold text-brand-dark">{c.dailyQty.toLocaleString()}</span>
                        <span className="text-[11px] text-brand-muted ml-0.5">유입/일</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[11.5px] text-brand-sub">{c.startDate}</span>
                        <span className="text-brand-muted mx-1">~</span>
                        <span className="text-[11.5px] text-brand-sub">{c.endDate}</span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-[13px] font-extrabold text-brand-dark">{c.totalCost.toLocaleString()}</span>
                        <span className="text-[11px] text-brand-muted ml-0.5">원</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {c.status === "running" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors">
                              일시정지
                            </button>
                          )}
                          {c.status === "paused" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                              재시작
                            </button>
                          )}
                          {c.status !== "done" && (
                            <button className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                              중단
                            </button>
                          )}
                          {c.status === "done" && (
                            <span className="text-[11px] text-brand-muted">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border">
          <p className="text-[12px] text-brand-muted">
            총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
          </p>
        </div>
      </div>

      {/* 키워드별 순위 트래킹 — 진행중 탭에서만 표시 */}
      {filter === "진행중" && <RankChartSection campaigns={MOCK_CAMPAIGNS} />}
    </div>
  );
}

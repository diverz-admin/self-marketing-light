"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running:  { label: "진행중",  bg: "bg-green-50",  text: "text-green-600" },
  pending:  { label: "대기중",  bg: "bg-amber-50",  text: "text-amber-600" },
  done:     { label: "완료",    bg: "bg-blue-50",   text: "text-blue-500" },
};

const MOCK_CAMPAIGNS = [
  {
    id: "1",
    placeName: "대박갈비 일산동구청정",
    keyword: "경주물밀라",
    media: "버즈빌",
    dailyQty: 100,
    status: "running",
    startDate: "2026-06-10",
    endDate: "2026-07-05",
    orderAmount: 12000,
    rank: 3,
    rankDiff: -2,
    placeLink: "https://m.place.naver.com/restaurant/1234567",
  },
  {
    id: "2",
    placeName: "홍길동 칼국수",
    keyword: "마포 맛집",
    media: "골든",
    dailyQty: 150,
    status: "pending",
    startDate: "2026-06-20",
    endDate: "2026-07-10",
    orderAmount: 17250,
    rank: null,
    rankDiff: 0,
    placeLink: "https://m.place.naver.com/restaurant/2345678",
  },
  {
    id: "3",
    placeName: "스타벅스 강남점",
    keyword: "강남 카페",
    media: "프리마",
    dailyQty: 200,
    status: "done",
    startDate: "2026-06-01",
    endDate: "2026-06-14",
    orderAmount: 26000,
    rank: 1,
    rankDiff: 5,
    placeLink: "https://m.place.naver.com/restaurant/3456789",
  },
  {
    id: "5",
    placeName: "파리바게뜨 이태원점",
    keyword: "이태원 베이커리",
    media: "아우라",
    dailyQty: 120,
    status: "running",
    startDate: "2026-06-18",
    endDate: "2026-07-05",
    orderAmount: 10800,
    rank: 12,
    rankDiff: -3,
    placeLink: "https://m.place.naver.com/restaurant/5678901",
  },
  {
    id: "6", placeName: "역전할머니맥주 홍대점", keyword: "홍대 맥주", media: "세븐",
    dailyQty: 90, status: "done", startDate: "2026-05-01", endDate: "2026-05-20",
    orderAmount: 13500, rank: 4, rankDiff: 3, placeLink: "https://m.place.naver.com/restaurant/6789012",
  },
  {
    id: "7", placeName: "미도인 성수점", keyword: "성수 맛집", media: "프리마",
    dailyQty: 130, status: "done", startDate: "2026-05-05", endDate: "2026-05-28",
    orderAmount: 19500, rank: 2, rankDiff: 6, placeLink: "https://m.place.naver.com/restaurant/7890123",
  },
  {
    id: "8", placeName: "온천집 강남점", keyword: "강남 이자카야", media: "골든",
    dailyQty: 110, status: "done", startDate: "2026-04-10", endDate: "2026-04-30",
    orderAmount: 16500, rank: 5, rankDiff: 2, placeLink: "https://m.place.naver.com/restaurant/8901234",
  },
];

/* 30일치 순위 이력 생성 (startRank → endRank, 06/19 기준으로 역산) */
function makeHistory(startRank: number, endRank: number, days: number) {
  const end = new Date(2026, 5, 19); // 2026-06-19
  const arr: { date: string; rank: number }[] = [];
  for (let k = 0; k < days; k++) {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - k)); // k=0 → 가장 과거, k=days-1 → 06/19
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const t = days === 1 ? 1 : k / (days - 1);
    // 약간의 노이즈로 자연스러운 하락 곡선
    const base = startRank + (endRank - startRank) * t;
    const noise = k === 0 || k === days - 1 ? 0 : Math.round(Math.sin(k * 1.3) * 0.8);
    arr.push({ date: `${mm}/${dd}`, rank: Math.max(1, Math.round(base) + noise) });
  }
  return arr;
}

const RANK_HISTORY: Record<string, { date: string; rank: number }[]> = {
  "1": makeHistory(32, 3, 30),
  "5": makeHistory(41, 12, 30),
};

const CHART_COLORS = ["#0D3473", "#2E6BE0", "#8B5CF6", "#F97316"];

type TooltipState = {
  pctX: number;
  pctY: number;
  date: string;
  rank: number;
} | null;

function SingleRankChart({ campaign, color }: {
  campaign: typeof MOCK_CAMPAIGNS[number];
  color: string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [period, setPeriod] = useState<7 | 30 | "all">(7);

  const fullHistory = RANK_HISTORY[campaign.id];
  if (!fullHistory) return null;
  const history = period === "all" ? fullHistory : fullHistory.slice(-period);

  const many = history.length > 10; // 30일/전체 → 컴팩트 모드
  const W = 900;
  const H = many ? 172 : 260;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
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

  // 시간순(과거→최근): 최근 날짜가 오른쪽에 오도록
  const chartHistory = history;
  const pts = chartHistory.map((d, i) => ({ x: xScale(i), y: yScale(d.rank), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`;

  // X축 라벨은 최대 ~8개만 표시 (30일 과밀 방지)
  const labelStep = Math.max(1, Math.ceil(chartHistory.length / 8));
  const dotStep = chartHistory.length > 16 ? 2 : 1;

  const latestRank = history[history.length - 1].rank;
  const firstRank = history[0].rank;
  const improved = latestRank < firstRank;

  // 시간순(과거→최근): 최근 날짜가 오른쪽 열에 오도록 (변동값은 직전 일자 대비)
  const tableRows = history
    .map((d, i) => ({ ...d, diff: i === 0 ? null : history[i - 1].rank - d.rank }));

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4 flex gap-0">
      {/* 왼쪽: 순위 정보 패널 */}
      <div className="w-[210px] shrink-0 flex flex-col justify-between pr-4 border-r border-brand-border">
        <div>
          <p className="text-[15px] font-extrabold text-brand-dark leading-tight mb-1">{campaign.placeName}</p>
          <div className="flex items-center gap-1 mb-5">
            <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="text-[12px] text-brand-sub truncate">{campaign.keyword}</span>
          </div>
        </div>
        <div>
          <div className="flex items-end gap-2.5">
            {/* 최초 순위 (왼쪽) */}
            <div>
              <p className="text-[11px] font-bold text-brand-muted mb-0.5">최초 순위</p>
              <p className="text-[26px] font-extrabold text-brand-muted leading-none">{firstRank}<span className="text-[12px] font-medium ml-0.5">위</span></p>
            </div>
            {/* 화살표 (→) */}
            <svg className={`w-4 h-4 mb-1.5 shrink-0 ${improved ? "text-[#0D3473]" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
            {/* 현재 순위 (오른쪽) */}
            <div>
              <p className="text-[11px] font-bold text-brand-muted mb-0.5">현재 순위</p>
              <p className="text-[30px] font-extrabold text-brand-dark leading-none">{latestRank}<span className="text-[12px] font-medium text-brand-muted ml-0.5">위</span></p>
            </div>
          </div>
          <p className={`text-[12px] font-bold mt-2 flex items-center gap-0.5 ${improved ? "text-[#0D3473]" : "text-red-400"}`}>
            {improved
              ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            }
            {Math.abs(firstRank - latestRank)}단계
          </p>
        </div>
      </div>

      {/* 오른쪽: 테이블 + 차트 */}
      <div className="flex-1 min-w-0 pl-4 flex flex-col gap-3">
        {/* 기간 선택 탭 */}
        <div className="flex items-center justify-end gap-1">
          {([["7일", 7], ["30일", 30], ["전체", "all"]] as const).map(([label, val]) => (
            <button
              key={label}
              type="button"
              onClick={() => setPeriod(val)}
              className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition-colors ${
                period === val ? "bg-brand-primary text-white" : "text-brand-sub hover:bg-brand-lighter"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 날짜별 순위 테이블 (7일=여유 / 30일·전체=컴팩트) */}
        <div className={many ? "" : "overflow-x-auto"}>
          <table className="w-full text-center border-collapse table-fixed">
            <thead>
              <tr>
                {tableRows.map((d, i) => (
                  <th key={i} className={`whitespace-nowrap font-semibold text-brand-muted border-b border-brand-border bg-brand-lighter first:rounded-tl-lg last:rounded-tr-lg ${many ? "px-0.5 py-1 text-[9px]" : "min-w-[52px] px-2 py-1.5 text-[12px]"}`}>
                    {d.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {tableRows.map((d, i) => (
                  <td key={i} className={`whitespace-nowrap font-extrabold border-b border-brand-border ${i === tableRows.length - 1 ? "text-brand-dark" : "text-brand-sub"} ${many ? "px-0.5 py-1 text-[11px]" : "min-w-[52px] px-2 py-2 text-[15px]"}`}>
                    {d.rank}위
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 차트 */}
        <div className="relative flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" style={{ height: H }}>
          {/* Grid */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} y1={yScale(tick)} x2={W - PAD.right} y2={yScale(tick)} stroke="#F3F4F6" strokeWidth={1.5} />
              <text x={PAD.left - 6} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fill="#CBD5E1" fontSize={10}>
                {tick}위
              </text>
            </g>
          ))}

          {/* X dates (라벨 솎기) */}
          {chartHistory.map((d, i) =>
            (i % labelStep === 0 || i === chartHistory.length - 1) ? (
              <text key={i} x={xScale(i)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#CBD5E1" fontSize={10}>
                {d.date}
              </text>
            ) : null
          )}

          {/* Bottom axis */}
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />

          {/* Area */}
          <path d={areaPath} fill={color} fillOpacity={0.08} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + hit areas (점 솎기, 히트영역은 전부 유지) */}
          {pts.map((p, i) => (
            <g key={i}>
              {(i % dotStep === 0 || i === pts.length - 1) && (
                <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
              )}
              <circle
                cx={p.x} cy={p.y} r={13} fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setTooltip({ pctX: (p.x / W) * 100, pctY: (p.y / H) * 100, date: p.date, rank: p.rank })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className="absolute pointer-events-none z-20 bg-[#1A1E2E] text-white px-3 py-2 rounded-xl text-[13px] shadow-xl whitespace-nowrap"
            style={{ left: `${tooltip.pctX}%`, top: `${tooltip.pctY}%`, transform: "translate(-50%, -130%)" }}
          >
            <p className="text-white/60">{tooltip.date}</p>
            <p className="font-extrabold text-[16px]" style={{ color }}>{tooltip.rank}위</p>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1A1E2E" }} />
          </div>
        )}
        </div>
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
        <h3 className="text-[16px] font-extrabold text-brand-dark">키워드별 순위 트래킹</h3>
        <span className="text-[12px] text-brand-muted">최근 7일 · 낮은 숫자가 상위 노출</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartCampaigns.map((c, i) => (
          <SingleRankChart key={c.id} campaign={c} color={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </div>
    </div>
  );
}

function addDays(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

const PERIOD_OPTIONS = [7, 15, 30];

function ExtendModal({ campaign, onClose, onConfirm }: {
  campaign: typeof MOCK_CAMPAIGNS[number];
  onClose: () => void;
  onConfirm: (payload: { dailyQty: number; days: number; amount: number; newEndDate: string }) => void;
}) {
  const unitPrice = Math.max(1, Math.round(campaign.orderAmount / campaign.dailyQty));
  const [dailyQty, setDailyQty] = useState(campaign.dailyQty);
  const [days, setDays] = useState(7);
  const [step, setStep] = useState<"form" | "done">("form");

  const amount = dailyQty * days * unitPrice;
  const newEndDate = addDays(campaign.endDate, days);

  function confirm() {
    onConfirm({ dailyQty, days, amount, newEndDate });
    setStep("done");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {step === "form" ? (
          <>
            {/* 헤더 */}
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div>
                <p className="text-[13px] font-bold text-brand-primary mb-1">캠페인 연장</p>
                <h3 className="text-[22px] font-extrabold text-brand-dark">연장 안내</h3>
                <p className="text-[15px] text-brand-sub mt-1">작업량과 기간을 설정하면 연장 금액이 자동 계산됩니다.</p>
              </div>
              <button onClick={onClose} className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-lighter transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* 캠페인 정보 */}
              <div className="rounded-xl bg-brand-lighter border border-brand-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-brand-dark truncate">{campaign.placeName}</p>
                    <p className="text-[13px] text-brand-sub mt-0.5">{campaign.keyword}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[12px] text-brand-muted">건당 단가</p>
                    <p className="text-[16px] font-extrabold text-brand-dark">{unitPrice.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-brand-border space-y-1.5 text-[13px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-muted">상품 종류</span>
                    <span className="font-semibold text-brand-dark">{campaign.media}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-muted">현재 종료일</span>
                    <span className="font-semibold text-brand-dark">{campaign.endDate}</span>
                  </div>
                </div>
              </div>

              {/* 작업량 설정 */}
              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">일 작업량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDailyQty((q) => Math.max(10, q - 10))}
                    className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[20px] font-bold shrink-0"
                  >
                    −
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl border border-brand-border bg-white">
                    <input
                      type="number"
                      value={dailyQty}
                      onChange={(e) => setDailyQty(Math.max(10, Number(e.target.value) || 0))}
                      className="w-20 text-center text-[20px] font-extrabold text-brand-dark focus:outline-none"
                    />
                    <span className="text-[15px] text-brand-muted">건/일</span>
                  </div>
                  <button
                    onClick={() => setDailyQty((q) => q + 10)}
                    className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[20px] font-bold shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 기간 설정 */}
              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">연장 기간</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((d) => {
                    const on = days === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`py-3 rounded-xl text-[16px] font-bold border transition-all ${
                          on ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-sub border-brand-border hover:bg-brand-lighter"
                        }`}
                      >
                        {d}일
                      </button>
                    );
                  })}
                </div>
                <p className="text-[13px] text-brand-muted mt-2">
                  연장 후 종료일: <span className="font-semibold text-brand-dark">{newEndDate}</span>
                </p>
              </div>

              {/* 금액 노출 */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center justify-between text-[13px] text-brand-sub mb-2">
                  <span>{dailyQty.toLocaleString()}건 × {days}일 × {unitPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[15px] font-bold text-brand-dark">연장 금액</span>
                  <span className="text-[29px] font-extrabold text-brand-primary leading-none">
                    {amount.toLocaleString()}<span className="text-[16px] font-bold ml-1">원</span>
                  </span>
                </div>
              </div>

              {/* 액션 */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-[16px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirm}
                  className="flex-[1.4] py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
                >
                  연장하기
                </button>
              </div>
            </div>
          </>
        ) : (
          /* 완료 단계 */
          <div className="px-6 py-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-[21px] font-extrabold text-brand-dark mb-1">정상적으로 접수되었습니다</h3>
            <p className="text-[15px] text-brand-sub mb-5">
              연장 신청이 정상적으로 접수되었습니다.<br />검토 후 순차 반영됩니다.
            </p>
            <div className="rounded-xl bg-brand-lighter border border-brand-border p-4 text-left space-y-2 mb-5">
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-brand-muted">일 작업량</span>
                <span className="font-semibold text-brand-dark">{dailyQty.toLocaleString()}건/일</span>
              </div>
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-brand-muted">연장 기간</span>
                <span className="font-semibold text-brand-dark">{days}일</span>
              </div>
              <div className="flex items-center justify-between text-[15px]">
                <span className="text-brand-muted">변경된 종료일</span>
                <span className="font-semibold text-brand-dark">{newEndDate}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = ["진행중", "대기중", "완료", "전체"];

const STATUS_KEY: Record<string, string> = {
  "전체": "all",
  "진행중": "running",
  "대기중": "pending",
  "완료": "done",
};

export default function PlaceManagePage() {
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [extendTarget, setExtendTarget] = useState<typeof MOCK_CAMPAIGNS[number] | null>(null);

  // 완료 캠페인 연/월 조회
  const doneDatesInit = MOCK_CAMPAIGNS.filter((c) => c.status === "done").map((c) => c.endDate).sort();
  const latestDone = doneDatesInit[doneDatesInit.length - 1] ?? "2026-06-01";
  const [doneYear, setDoneYear] = useState<number>(Number(latestDone.slice(0, 4)));
  const [doneMonth, setDoneMonth] = useState<number>(Number(latestDone.slice(5, 7)));

  const doneYears = Array.from(
    new Set(campaigns.filter((c) => c.status === "done").map((c) => Number(c.endDate.slice(0, 4))))
  ).sort((a, b) => b - a);
  const doneMonthsForYear = Array.from(
    new Set(
      campaigns
        .filter((c) => c.status === "done" && Number(c.endDate.slice(0, 4)) === doneYear)
        .map((c) => Number(c.endDate.slice(5, 7)))
    )
  ).sort((a, b) => b - a);
  const selectedYM = `${doneYear}-${String(doneMonth).padStart(2, "0")}`;

  function handleExtend(id: string, payload: { dailyQty: number; days: number; amount: number; newEndDate: string }) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, dailyQty: payload.dailyQty, endDate: payload.newEndDate, status: "running" }
          : c
      )
    );
  }

  const filtered = campaigns.filter((c) => {
    const statusMatch = filter === "전체" || c.status === STATUS_KEY[filter];
    const monthMatch = filter !== "완료" || c.endDate.slice(0, 7) === selectedYM;
    const searchMatch =
      !search ||
      c.placeName.includes(search) ||
      c.keyword.includes(search) ||
      c.media.includes(search);
    return statusMatch && monthMatch && searchMatch;
  });

  const total = campaigns.length;
  const running = campaigns.filter((c) => c.status === "running").length;
  const done = campaigns.filter((c) => c.status === "done").length;

  // 아코디언 차트를 가로 스크롤 테이블의 "보이는 폭"에 맞춰 고정
  const scrollRef = useRef<HTMLDivElement>(null);
  const [detailWidth, setDetailWidth] = useState<number>();
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setDetailWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="w-full space-y-5">
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/reward/place" className="hover:text-brand-text">네이버 플레이스</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">캠페인 관리</span>
      </nav>

      {/* 상단 요약 배너 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 전체 캠페인 (네이비) */}
        <div className="rounded-2xl p-5 min-h-[112px] flex flex-col justify-between text-white"
          style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
          <span className="text-[13px] font-bold text-white/60">전체 캠페인</span>
          <p className="text-[30px] font-extrabold leading-none tabular-nums">{total}<span className="text-[15px] font-medium text-white/55 ml-1">건</span></p>
        </div>

        {/* 진행중 (블루) */}
        <div className="rounded-2xl p-5 min-h-[112px] flex flex-col justify-between text-white"
          style={{ background: "linear-gradient(135deg,#2E6BE0 0%,#1D4ED8 100%)" }}>
          <span className="text-[13px] font-bold text-white/65">진행중</span>
          <p className="text-[30px] font-extrabold leading-none tabular-nums">{running}<span className="text-[15px] font-medium text-white/60 ml-1">건</span></p>
        </div>

        {/* 완료 (화이트) */}
        <div className="rounded-2xl border border-brand-border bg-white p-5 min-h-[112px] flex flex-col justify-between">
          <span className="text-[13px] font-bold text-brand-muted">완료</span>
          <p className="text-[30px] font-extrabold leading-none tabular-nums text-brand-dark">{done}<span className="text-[15px] font-medium text-brand-muted ml-1">건</span></p>
        </div>
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all ${
                  filter === opt
                    ? "bg-brand-primary text-white"
                    : "bg-brand-lighter text-brand-sub hover:bg-brand-border"
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
                placeholder="플레이스명, 키워드 검색"
                className="pl-8 pr-3 py-1.5 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all w-48"
              />
            </div>
            <Link
              href="/marketing/reward/place"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              캠페인 생성
            </Link>
          </div>
        </div>

        {/* 완료 캠페인 연/월 조회 */}
        {filter === "완료" && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-brand-border bg-brand-lighter/60 flex-wrap">
            <svg className="w-4 h-4 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
            </svg>
            <span className="text-[13px] font-bold text-brand-dark mr-1">완료 캠페인 조회</span>
            <select
              value={doneYear}
              onChange={(e) => {
                const y = Number(e.target.value);
                setDoneYear(y);
                const months = Array.from(
                  new Set(
                    campaigns
                      .filter((c) => c.status === "done" && Number(c.endDate.slice(0, 4)) === y)
                      .map((c) => Number(c.endDate.slice(5, 7)))
                  )
                ).sort((a, b) => b - a);
                if (months.length && !months.includes(doneMonth)) setDoneMonth(months[0]);
              }}
              className="pl-3 pr-8 py-1.5 border border-brand-border rounded-xl text-[13px] font-semibold text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
            >
              {doneYears.map((y) => (
                <option key={y} value={y}>{y}년</option>
              ))}
            </select>
            <select
              value={doneMonth}
              onChange={(e) => setDoneMonth(Number(e.target.value))}
              className="pl-3 pr-8 py-1.5 border border-brand-border rounded-xl text-[13px] font-semibold text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all cursor-pointer"
            >
              {doneMonthsForYear.map((m) => (
                <option key={m} value={m}>{m}월</option>
              ))}
            </select>
            <span className="text-[12px] text-brand-muted ml-1">해당 월 <span className="font-bold text-brand-dark">{filtered.length}</span>건</span>
          </div>
        )}

        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                <th className="w-8" />
                {["플레이스명", "플레이스 링크", "키워드", "현재 순위", "상품", "일 작업량", "기간", "주문금액", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-[16px] text-brand-muted">
                    조건에 맞는 캠페인이 없습니다.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const st = STATUS_CONFIG[c.status];
                  const canExpand = !!RANK_HISTORY[c.id];
                  const isOpen = expandedId === c.id;
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <Fragment key={c.id}>
                      <tr
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
                        <td className="px-4 py-3.5">
                          <p className="text-[15px] font-semibold text-brand-dark truncate max-w-[120px]">{c.placeName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <a
                            href={c.placeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[13px] text-brand-primary hover:underline"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            플레이스 링크
                          </a>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-medium text-brand-sub">{c.keyword}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.rank === null ? (
                            <span className="text-[13px] text-brand-muted">-</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[16px] font-extrabold text-brand-dark">{c.rank}위</span>
                              {c.rankDiff !== 0 && (
                                <span className={`flex items-center gap-0.5 text-[12px] font-bold ${c.rankDiff < 0 ? "text-[#0D3473]" : "text-red-400"}`}>
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
                          <span className="text-[13px] font-bold text-brand-dark">{c.media}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[15px] font-bold text-brand-dark">{c.dailyQty.toLocaleString()}</span>
                          <span className="text-[12px] text-brand-muted ml-0.5">건</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[13px] text-brand-sub">{c.startDate}</span>
                          <span className="text-brand-muted mx-1">~</span>
                          <span className="text-[13px] text-brand-sub">{c.endDate}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[15px] font-extrabold text-brand-dark">{c.orderAmount.toLocaleString()}</span>
                          <span className="text-[12px] text-brand-muted ml-0.5">원</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExtendTarget(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors whitespace-nowrap"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            연장하기
                          </button>
                        </td>
                      </tr>

                      {/* 아코디언 그래프 (해당 행 바로 아래 · 보이는 폭에 고정해 가로 스크롤 잘림 방지) */}
                      {isOpen && canExpand && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={11} className="p-0">
                            <div className="sticky left-0" style={{ width: detailWidth }}>
                              <div className="bg-brand-lighter/50 px-5 py-4">
                                <SingleRankChart campaign={c} color={color} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">
            총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
          </p>
        </div>
      </div>

      {extendTarget && (
        <ExtendModal
          campaign={extendTarget}
          onClose={() => setExtendTarget(null)}
          onConfirm={(payload) => handleExtend(extendTarget.id, payload)}
        />
      )}
    </div>
  );
}

"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running: { label: "진행중", bg: "bg-green-50", text: "text-green-600" },
  pending: { label: "대기중", bg: "bg-amber-50", text: "text-amber-600" },
  done: { label: "보장완료", bg: "bg-blue-50", text: "text-blue-500" },
};

const GUARANTEED_TOTAL_DAYS = 25;
const THRESHOLD = 5; // 보장 순위 (1~5위 유지 시 카운트)

const MOCK_CAMPAIGNS = [
  {
    id: "1",
    placeName: "대박갈비 일산동구청점",
    keyword: "일산 갈비",
    product: "버즈빌",
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
    placeName: "미소네 손칼국수",
    keyword: "종로 칼국수",
    product: "골든",
    dailyQty: 120,
    status: "running",
    startDate: "2026-06-12",
    endDate: "2026-07-08",
    orderAmount: 14400,
    rank: 4,
    rankDiff: -1,
    placeLink: "https://m.place.naver.com/restaurant/2345678",
  },
  {
    id: "3",
    placeName: "한신포차 강남점",
    keyword: "강남 포차",
    product: "프리마",
    dailyQty: 150,
    status: "done",
    startDate: "2026-05-20",
    endDate: "2026-06-14",
    orderAmount: 19500,
    rank: 2,
    rankDiff: 1,
    placeLink: "https://m.place.naver.com/restaurant/3456789",
  },
  {
    id: "4",
    placeName: "교동짬뽕 홍대점",
    keyword: "홍대 짬뽕",
    product: "올스타",
    dailyQty: 90,
    status: "pending",
    startDate: "2026-06-25",
    endDate: "2026-07-20",
    orderAmount: 11700,
    rank: null,
    rankDiff: 0,
    placeLink: "https://m.place.naver.com/restaurant/4567890",
  },
];

const GUARANTEED_RANK_HISTORY: Record<string, { date: string; rank: number }[]> = {
  "1": [
    { date: "06/10", rank: 12 },
    { date: "06/11", rank: 10 },
    { date: "06/12", rank: 8 },
    { date: "06/13", rank: 5 },
    { date: "06/14", rank: 4 },
    { date: "06/15", rank: 6 }, // 이탈 — 카운트 정지
    { date: "06/16", rank: 5 },
    { date: "06/17", rank: 4 },
    { date: "06/18", rank: 4 },
    { date: "06/19", rank: 3 },
  ],
  "2": [
    { date: "06/12", rank: 11 },
    { date: "06/13", rank: 9 },
    { date: "06/14", rank: 7 },
    { date: "06/15", rank: 6 },
    { date: "06/16", rank: 5 },
    { date: "06/17", rank: 5 },
    { date: "06/18", rank: 4 },
    { date: "06/19", rank: 4 },
  ],
  "3": [
    { date: "06/05", rank: 8 },
    { date: "06/06", rank: 6 },
    { date: "06/07", rank: 4 },
    { date: "06/08", rank: 3 },
    { date: "06/09", rank: 2 },
    { date: "06/10", rank: 2 },
    { date: "06/11", rank: 3 },
    { date: "06/12", rank: 2 },
    { date: "06/13", rank: 2 },
    { date: "06/14", rank: 2 },
  ],
};

const CHART_COLORS = ["#10B981", "#0341C7", "#8B5CF6", "#F97316"];

type TooltipState = { pctX: number; pctY: number; date: string; rank: number } | null;

function countedDaysOf(id: string) {
  const h = GUARANTEED_RANK_HISTORY[id];
  if (!h) return 0;
  return h.filter((d) => d.rank <= THRESHOLD).length;
}

// 보장 순위(1~5위)에 처음 진입해 카운트가 시작된 날짜
function guaranteeStartDate(id: string) {
  const h = GUARANTEED_RANK_HISTORY[id];
  if (!h) return null;
  const first = h.find((d) => d.rank <= THRESHOLD);
  if (!first) return null;
  const [mm, dd] = first.date.split("/");
  return `2026-${mm}-${dd}`;
}

function GuaranteedRankChart({ campaign, color }: {
  campaign: typeof MOCK_CAMPAIGNS[number];
  color: string;
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const history = GUARANTEED_RANK_HISTORY[campaign.id];
  if (!history) return null;

  const countedDays = history.filter((d) => d.rank <= THRESHOLD).length;
  const pausedDays = history.filter((d) => d.rank > THRESHOLD).length;
  const progressPct = Math.min((countedDays / GUARANTEED_TOTAL_DAYS) * 100, 100);

  const W = 520, H = 260;
  const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const ranks = history.map((d) => d.rank);
  const dataMin = Math.min(...ranks);
  const dataMax = Math.max(...ranks);
  const yMin = Math.max(1, dataMin - 1);
  const yMax = dataMax + 2;

  const xScale = (i: number) => PAD.left + (i / (history.length - 1)) * innerW;
  const yScale = (rank: number) => PAD.top + ((rank - yMin) / (yMax - yMin || 1)) * innerH;

  const yTickCount = 4;
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / (yTickCount - 1)));
  const yTicks: number[] = [];
  for (let t = yMin; t <= yMax; t += yStep) yTicks.push(t);

  // 최근 날짜가 왼쪽으로 오도록 역순 정렬
  const chartHistory = [...history].reverse();
  const pts = chartHistory.map((d, i) => ({ x: xScale(i), y: yScale(d.rank), ...d, counted: d.rank <= THRESHOLD }));

  const thresholdY = yScale(THRESHOLD);
  const firstRank = history[0].rank;
  const latestRank = history[history.length - 1].rank;
  const improved = latestRank < firstRank;

  // 최근 날짜가 앞으로 오도록 테이블 역순
  const tableRows = [...history].reverse();

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4 flex gap-0">
      {/* 왼쪽: 플레이스 정보 + 보장 카운트 + 순위 */}
      <div className="w-[200px] shrink-0 flex flex-col gap-3 pr-4 border-r border-brand-border">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <p className="text-[13px] font-extrabold text-brand-dark leading-tight">{campaign.placeName}</p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-green-50 text-green-700 border border-green-200 shrink-0">
              🛡️ 보장형
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="text-[11px] text-brand-sub truncate">{campaign.keyword}</span>
          </div>
        </div>

        {/* 보장 카운트 */}
        <div className="p-2.5 rounded-xl bg-green-50 border border-green-100">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <span className="text-[11px] font-extrabold text-green-700">보장 카운트</span>
            </div>
            <span className="text-[12px] font-extrabold text-green-700">{countedDays}<span className="text-[10px] font-medium text-green-600"> / {GUARANTEED_TOTAL_DAYS}</span></span>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[9px] text-green-600">1~{THRESHOLD}순위 유지 일수만 카운트</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
              카운트 {countedDays}일
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
              정지 {pausedDays}일
            </span>
          </div>
          <p className="text-[10px] text-brand-muted mt-1">잔여 {Math.max(0, GUARANTEED_TOTAL_DAYS - countedDays)}일</p>
        </div>

        {/* 최초 → 현재 순위 */}
        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-bold text-brand-muted mb-0.5">최초 순위</p>
            <p className="text-[26px] font-extrabold text-brand-muted leading-none">{firstRank}<span className="text-[12px] font-medium ml-0.5">위</span></p>
          </div>
          <svg className={`w-4 h-4 ${improved ? "text-green-500" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-6 6m6-6l6 6" />
          </svg>
          <div>
            <p className="text-[10px] font-bold text-brand-muted mb-0.5">현재 순위</p>
            <p className="text-[30px] font-extrabold text-brand-dark leading-none">{latestRank}<span className="text-[12px] font-medium text-brand-muted ml-0.5">위</span></p>
            <p className={`text-[11px] font-bold mt-1 flex items-center gap-0.5 ${improved ? "text-green-500" : "text-red-400"}`}>
              {improved
                ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              }
              {Math.abs(firstRank - latestRank)}단계
            </p>
          </div>
        </div>
      </div>

      {/* 오른쪽: 날짜 테이블 + 차트 */}
      <div className="flex-1 min-w-0 pl-4 flex flex-col gap-3">
        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                {tableRows.map((d, i) => (
                  <th key={i} className="px-2 py-1.5 text-[11px] font-semibold text-brand-muted border-b border-brand-border bg-brand-lighter first:rounded-tl-lg last:rounded-tr-lg">
                    {d.date}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {tableRows.map((d, i) => {
                  const counted = d.rank <= THRESHOLD;
                  return (
                    <td key={i} className={`px-2 py-2 text-[12px] font-extrabold border-b border-brand-border ${counted ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-50"}`}>
                      {d.rank}위
                      {!counted && <span className="block text-[9px] font-bold text-orange-400 leading-none mt-0.5">정지</span>}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 차트 */}
        <div className="relative flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} height={H} className="w-full overflow-visible" style={{ height: H }}>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={PAD.left} y1={yScale(tick)} x2={W - PAD.right} y2={yScale(tick)} stroke="#F3F4F6" strokeWidth={1.5} />
                <text x={PAD.left - 6} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fill="#CBD5E1" fontSize={10}>{tick}위</text>
              </g>
            ))}
            <line x1={PAD.left} y1={thresholdY} x2={W - PAD.right} y2={thresholdY}
              stroke="#10B981" strokeWidth={1.5} strokeDasharray="5,4" />
            <text x={W - PAD.right + 4} y={thresholdY} dominantBaseline="middle" fill="#10B981" fontSize={9} fontWeight={700}>{THRESHOLD}위</text>
            {pts.map((p, i) => (
              <text key={i} x={p.x} y={H - PAD.bottom + 14} textAnchor="middle" fill="#CBD5E1" fontSize={9}>{p.date}</text>
            ))}
            <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />
            {pts.map((p, i) => {
              if (i === 0) return null;
              const prev = pts[i - 1];
              const both = p.counted && prev.counted;
              return (
                <line key={i}
                  x1={prev.x} y1={prev.y} x2={p.x} y2={p.y}
                  stroke={both ? "#10B981" : "#D1D5DB"}
                  strokeWidth={2.5} strokeLinecap="round"
                  strokeDasharray={both ? undefined : "4,3"}
                />
              );
            })}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4.5}
                  fill={p.counted ? "#10B981" : "#9CA3AF"}
                  stroke="white" strokeWidth={2} />
                <circle
                  cx={p.x} cy={p.y} r={13} fill="transparent" className="cursor-pointer"
                  onMouseEnter={() => setTooltip({ pctX: (p.x / W) * 100, pctY: (p.y / H) * 100, date: p.date, rank: p.rank })}
                  onMouseLeave={() => setTooltip(null)}
                />
              </g>
            ))}
          </svg>

          {tooltip && (
            <div className="absolute pointer-events-none z-20 bg-[#1A1E2E] text-white px-3 py-2 rounded-xl text-[12px] shadow-xl whitespace-nowrap"
              style={{ left: `${tooltip.pctX}%`, top: `${tooltip.pctY}%`, transform: "translate(-50%, -130%)" }}>
              <p className="text-white/60">{tooltip.date}</p>
              <p className="font-extrabold text-[14px]" style={{ color: tooltip.rank <= THRESHOLD ? "#10B981" : "#9CA3AF" }}>
                {tooltip.rank}위 {tooltip.rank <= THRESHOLD ? "✓ 카운트" : "⏸ 정지"}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #1A1E2E" }} />
            </div>
          )}
        </div>
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
            <div className="flex items-start justify-between px-6 pt-6 pb-4">
              <div>
                <p className="text-[12px] font-bold text-green-600 mb-1">보장형 캠페인 연장</p>
                <h3 className="text-[20px] font-extrabold text-brand-dark">연장 안내</h3>
                <p className="text-[13px] text-brand-sub mt-1">작업량과 기간을 설정하면 연장 금액이 자동 계산됩니다.</p>
              </div>
              <button onClick={onClose} className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-brand-lighter transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5">
              <div className="rounded-xl bg-brand-lighter border border-brand-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-brand-dark truncate">{campaign.placeName}</p>
                    <p className="text-[12px] text-brand-sub mt-0.5">{campaign.keyword}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-brand-muted">건당 단가</p>
                    <p className="text-[14px] font-extrabold text-brand-dark">{unitPrice.toLocaleString()}원</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-brand-border flex items-center gap-1.5 text-[12px] text-brand-sub">
                  <span className="text-brand-muted">현재 종료일</span>
                  <span className="font-semibold text-brand-dark">{campaign.endDate}</span>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">일 작업량</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDailyQty((q) => Math.max(10, q - 10))} className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[18px] font-bold shrink-0">−</button>
                  <div className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl border border-brand-border bg-white">
                    <input type="number" value={dailyQty} onChange={(e) => setDailyQty(Math.max(10, Number(e.target.value) || 0))} className="w-20 text-center text-[18px] font-extrabold text-brand-dark focus:outline-none" />
                    <span className="text-[13px] text-brand-muted">건/일</span>
                  </div>
                  <button onClick={() => setDailyQty((q) => q + 10)} className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[18px] font-bold shrink-0">+</button>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">연장 기간</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((d) => {
                    const on = days === d;
                    return (
                      <button key={d} onClick={() => setDays(d)} className={`py-3 rounded-xl text-[14px] font-bold border transition-all ${on ? "bg-green-600 text-white border-green-600" : "bg-white text-brand-sub border-brand-border hover:bg-brand-lighter"}`}>
                        {d}일
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12px] text-brand-muted mt-2">
                  연장 후 종료일: <span className="font-semibold text-brand-dark">{newEndDate}</span>
                </p>
              </div>

              <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                <div className="flex items-center justify-between text-[12px] text-brand-sub mb-2">
                  <span>{dailyQty.toLocaleString()}건 × {days}일 × {unitPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[13px] font-bold text-brand-dark">연장 금액</span>
                  <span className="text-[26px] font-extrabold text-green-600 leading-none">
                    {amount.toLocaleString()}<span className="text-[14px] font-bold ml-1">원</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-[14px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">취소</button>
                <button onClick={confirm} className="flex-[1.4] py-3 rounded-xl text-[14px] font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
                  연장 신청하기
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-[19px] font-extrabold text-brand-dark mb-1">신청이 접수되었습니다</h3>
            <p className="text-[13px] text-brand-sub mb-5">
              연장 신청이 정상적으로 접수되었습니다.<br />검토 후 순차 반영됩니다.
            </p>
            <div className="rounded-xl bg-brand-lighter border border-brand-border p-4 text-left space-y-2 mb-5">
              <div className="flex items-center justify-between text-[13px]"><span className="text-brand-muted">일 작업량</span><span className="font-semibold text-brand-dark">{dailyQty.toLocaleString()}건/일</span></div>
              <div className="flex items-center justify-between text-[13px]"><span className="text-brand-muted">연장 기간</span><span className="font-semibold text-brand-dark">{days}일</span></div>
              <div className="flex items-center justify-between text-[13px]"><span className="text-brand-muted">변경된 종료일</span><span className="font-semibold text-brand-dark">{newEndDate}</span></div>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-[14px] font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = ["진행중", "대기중", "보장완료", "전체"];

const STATUS_KEY: Record<string, string> = {
  "전체": "all",
  "진행중": "running",
  "대기중": "pending",
  "보장완료": "done",
};

export default function GuaranteedManagePage() {
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [extendTarget, setExtendTarget] = useState<typeof MOCK_CAMPAIGNS[number] | null>(null);

  function handleExtend(id: string, payload: { dailyQty: number; days: number; amount: number; newEndDate: string }) {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, dailyQty: payload.dailyQty, endDate: payload.newEndDate, status: "running" } : c))
    );
  }

  const filtered = campaigns.filter((c) => {
    const statusMatch = filter === "전체" || c.status === STATUS_KEY[filter];
    const searchMatch = !search || c.placeName.includes(search) || c.keyword.includes(search) || c.product.includes(search);
    return statusMatch && searchMatch;
  });

  const total = campaigns.length;
  const running = campaigns.filter((c) => c.status === "running").length;
  const doneCount = campaigns.filter((c) => c.status === "done").length;

  return (
    <div className="w-full space-y-5">
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/reward/place" className="hover:text-brand-text">네이버 플레이스</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">[보장형] 캠페인 관리</span>
      </nav>

      <div className="flex items-center gap-2">
        <h1 className="text-[22px] font-extrabold text-brand-dark">보장형 캠페인 관리</h1>
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-green-50 text-green-700 border border-green-200">🛡️ 보장형</span>
      </div>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 보장 캠페인", value: total, color: "text-brand-dark", grad: "linear-gradient(135deg,#10B981,#059669)", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          { label: "진행중", value: running, color: "text-green-600", grad: "linear-gradient(135deg,#10B981,#059669)", icon: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" },
          { label: "보장완료", value: doneCount, color: "text-blue-500", grad: "linear-gradient(135deg,#3B82F6,#0341C7)", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-brand-border p-4 flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.grad }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
              </svg>
            </span>
            <div>
              <p className="text-[12px] text-brand-sub">{stat.label}</p>
              <p className={`text-[22px] font-extrabold leading-tight ${stat.color}`}>{stat.value}<span className="text-[13px] font-medium text-brand-muted ml-1">건</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* 테이블 카드 */}
      <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-brand-border flex-wrap">
          <div className="flex items-center gap-2">
            {FILTER_OPTIONS.map((opt) => (
              <button key={opt} onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${filter === opt ? "bg-green-600 text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border"}`}>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="플레이스명, 키워드 검색"
                className="pl-8 pr-3 py-1.5 border border-brand-border rounded-xl text-[12px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-green-500 focus:bg-white transition-all w-48" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-lighter">
                <th className="w-8" />
                {["플레이스명", "플레이스 링크", "키워드", "현재 순위", "보장 카운트", "보장 카운트 시작일", "캠페인 시작일", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-[14px] text-brand-muted">조건에 맞는 캠페인이 없습니다.</td>
                </tr>
              ) : (
                filtered.map((c, idx) => {
                  const st = STATUS_CONFIG[c.status];
                  const canExpand = !!GUARANTEED_RANK_HISTORY[c.id];
                  const isOpen = expandedId === c.id;
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  const counted = countedDaysOf(c.id);
                  const countPct = Math.min((counted / GUARANTEED_TOTAL_DAYS) * 100, 100);
                  const guaranteeStart = guaranteeStartDate(c.id);
                  return (
                    <Fragment key={c.id}>
                      <tr onClick={() => canExpand && setExpandedId(isOpen ? null : c.id)}
                        className={`border-b border-brand-border transition-colors ${canExpand ? "cursor-pointer" : ""} ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/40"}`}>
                        <td className="pl-3 py-3.5">
                          {canExpand && (
                            <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-semibold text-brand-dark truncate max-w-[120px]">{c.placeName}</p>
                            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-green-50 text-green-700 border border-green-200">보장형</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <a href={c.placeLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[12px] text-brand-primary hover:underline">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            플레이스 링크
                          </a>
                        </td>
                        <td className="px-4 py-3.5"><span className="text-[12px] font-medium text-brand-sub">{c.keyword}</span></td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.rank === null ? (
                            <span className="text-[12px] text-brand-muted">-</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[14px] font-extrabold text-brand-dark">{c.rank}위</span>
                              {c.rankDiff !== 0 && (
                                <span className={`flex items-center gap-0.5 text-[11px] font-bold ${c.rankDiff < 0 ? "text-green-500" : "text-red-400"}`}>
                                  {c.rankDiff < 0 ? (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                  ) : (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                  )}
                                  {Math.abs(c.rankDiff)}
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-green-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${countPct}%` }} />
                            </div>
                            <span className="text-[12px] font-bold text-green-700">{counted}<span className="text-[10px] text-green-600 font-medium">/{GUARANTEED_TOTAL_DAYS}</span></span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {guaranteeStart ? (
                            <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-green-700">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {guaranteeStart}
                            </span>
                          ) : (
                            <span className="text-[12px] text-brand-muted">카운트 전</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11.5px] text-brand-sub">{c.startDate}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setExtendTarget(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-green-600 text-white hover:bg-green-700 transition-colors">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            연장 신청하기
                          </button>
                        </td>
                      </tr>

                      {isOpen && canExpand && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={10} className="p-0">
                            <div className="bg-brand-lighter/50 px-6 py-4">
                              <GuaranteedRankChart campaign={c} color={color} />
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
          <p className="text-[12px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
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

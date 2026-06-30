"use client";

import React, { Fragment, useState } from "react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running:  { label: "진행중",  bg: "bg-green-50",  text: "text-green-600" },
  pending:  { label: "대기중",  bg: "bg-amber-50",  text: "text-amber-600" },
  paused:   { label: "일시정지", bg: "bg-gray-100",  text: "text-gray-500" },
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
    id: "4",
    placeName: "맘스터치 신촌점",
    keyword: "신촌 햄버거",
    media: "올스타",
    dailyQty: 80,
    status: "paused",
    startDate: "2026-06-10",
    endDate: "2026-06-25",
    orderAmount: 6400,
    rank: 7,
    rankDiff: 1,
    placeLink: "https://m.place.naver.com/restaurant/4567890",
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
];

const RANK_HISTORY: Record<string, { date: string; rank: number }[]> = {
  "1": [
    { date: "06/13", rank: 9 },
    { date: "06/14", rank: 8 },
    { date: "06/15", rank: 7 },
    { date: "06/16", rank: 6 },
    { date: "06/17", rank: 5 },
    { date: "06/18", rank: 4 },
    { date: "06/19", rank: 3 },
  ],
  "5": [
    { date: "06/13", rank: 18 },
    { date: "06/14", rank: 17 },
    { date: "06/15", rank: 16 },
    { date: "06/16", rank: 15 },
    { date: "06/17", rank: 14 },
    { date: "06/18", rank: 13 },
    { date: "06/19", rank: 12 },
  ],
};

const CHART_COLORS = ["#10B981", "#0341C7", "#8B5CF6", "#F97316"];

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

  const history = RANK_HISTORY[campaign.id];
  if (!history) return null;

  const W = 520, H = 260;
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

  // 최근 날짜가 왼쪽으로 오도록 역순 정렬
  const chartHistory = [...history].reverse();
  const pts = chartHistory.map((d, i) => ({ x: xScale(i), y: yScale(d.rank), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${H - PAD.bottom} L ${pts[0].x} ${H - PAD.bottom} Z`;

  const latestRank = history[history.length - 1].rank;
  const firstRank = history[0].rank;
  const improved = latestRank < firstRank;

  // 최근 날짜가 앞으로 오도록 역순 정렬 (변동값은 직전 일자 대비)
  const tableRows = history
    .map((d, i) => ({ ...d, diff: i === 0 ? null : history[i - 1].rank - d.rank }))
    .reverse();

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4 flex gap-0">
      {/* 왼쪽: 순위 정보 패널 */}
      <div className="w-[152px] shrink-0 flex flex-col justify-between pr-4 border-r border-brand-border">
        <div>
          <p className="text-[13px] font-extrabold text-brand-dark leading-tight mb-1">{campaign.placeName}</p>
          <div className="flex items-center gap-1 mb-5">
            <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="text-[11px] text-brand-sub truncate">{campaign.keyword}</span>
          </div>
        </div>
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

      {/* 오른쪽: 테이블 + 차트 */}
      <div className="flex-1 min-w-0 pl-4 flex flex-col gap-3">
        {/* 날짜별 순위 테이블 */}
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
                {tableRows.map((d, i) => (
                  <td key={i} className={`px-2 py-2 text-[13px] font-extrabold border-b border-brand-border ${i === 0 ? "text-brand-dark" : "text-brand-sub"}`}>
                    {d.rank}위
                  </td>
                ))}
              </tr>
              <tr>
                {tableRows.map((d, i) => {
                  const diff = d.diff;
                  if (diff === null) return <td key={i} className="px-2 py-1.5 text-[11px] text-brand-muted">-</td>;
                  return (
                    <td key={i} className="px-2 py-1.5">
                      {diff === 0 ? <span className="text-[11px] text-brand-muted">-</span> : (
                        <span className={`inline-flex items-center justify-center gap-0.5 text-[11px] font-bold ${diff > 0 ? "text-green-500" : "text-red-400"}`}>
                          {diff > 0
                            ? <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                            : <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                          }
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
        <div className="relative flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} height={H} className="w-full overflow-visible" style={{ height: H }}>
          {/* Grid */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line x1={PAD.left} y1={yScale(tick)} x2={W - PAD.right} y2={yScale(tick)} stroke="#F3F4F6" strokeWidth={1.5} />
              <text x={PAD.left - 6} y={yScale(tick)} textAnchor="end" dominantBaseline="middle" fill="#CBD5E1" fontSize={10}>
                {tick}위
              </text>
            </g>
          ))}

          {/* X dates */}
          {chartHistory.map((d, i) => (
            <text key={i} x={xScale(i)} y={H - PAD.bottom + 14} textAnchor="middle" fill="#CBD5E1" fontSize={10}>
              {d.date}
            </text>
          ))}

          {/* Bottom axis */}
          <line x1={PAD.left} y1={H - PAD.bottom} x2={W - PAD.right} y2={H - PAD.bottom} stroke="#E5E7EB" strokeWidth={1} />

          {/* Area */}
          <path d={areaPath} fill={color} fillOpacity={0.08} />

          {/* Line */}
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {/* Dots + hit areas */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="white" stroke={color} strokeWidth={2} />
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
                <p className="text-[12px] font-bold text-brand-primary mb-1">캠페인 연장</p>
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
              {/* 캠페인 정보 */}
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

              {/* 작업량 설정 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">일 작업량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDailyQty((q) => Math.max(10, q - 10))}
                    className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[18px] font-bold shrink-0"
                  >
                    −
                  </button>
                  <div className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl border border-brand-border bg-white">
                    <input
                      type="number"
                      value={dailyQty}
                      onChange={(e) => setDailyQty(Math.max(10, Number(e.target.value) || 0))}
                      className="w-20 text-center text-[18px] font-extrabold text-brand-dark focus:outline-none"
                    />
                    <span className="text-[13px] text-brand-muted">건/일</span>
                  </div>
                  <button
                    onClick={() => setDailyQty((q) => q + 10)}
                    className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[18px] font-bold shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 기간 설정 */}
              <div>
                <label className="block text-[13px] font-bold text-brand-dark mb-2">연장 기간</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((d) => {
                    const on = days === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`py-3 rounded-xl text-[14px] font-bold border transition-all ${
                          on ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-sub border-brand-border hover:bg-brand-lighter"
                        }`}
                      >
                        {d}일
                      </button>
                    );
                  })}
                </div>
                <p className="text-[12px] text-brand-muted mt-2">
                  연장 후 종료일: <span className="font-semibold text-brand-dark">{newEndDate}</span>
                </p>
              </div>

              {/* 금액 노출 */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center justify-between text-[12px] text-brand-sub mb-2">
                  <span>{dailyQty.toLocaleString()}건 × {days}일 × {unitPrice.toLocaleString()}원</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[13px] font-bold text-brand-dark">연장 금액</span>
                  <span className="text-[26px] font-extrabold text-brand-primary leading-none">
                    {amount.toLocaleString()}<span className="text-[14px] font-bold ml-1">원</span>
                  </span>
                </div>
              </div>

              {/* 액션 */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-[14px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirm}
                  className="flex-[1.4] py-3 rounded-xl text-[14px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
                >
                  연장 신청하기
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
            <h3 className="text-[19px] font-extrabold text-brand-dark mb-1">정상적으로 접수되었습니다</h3>
            <p className="text-[13px] text-brand-sub mb-5">
              연장 신청이 정상적으로 접수되었습니다.<br />검토 후 순차 반영됩니다.
            </p>
            <div className="rounded-xl bg-brand-lighter border border-brand-border p-4 text-left space-y-2 mb-5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-brand-muted">일 작업량</span>
                <span className="font-semibold text-brand-dark">{dailyQty.toLocaleString()}건/일</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-brand-muted">연장 기간</span>
                <span className="font-semibold text-brand-dark">{days}일</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-brand-muted">변경된 종료일</span>
                <span className="font-semibold text-brand-dark">{newEndDate}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-[14px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = ["진행중", "대기중", "일시정지", "완료", "전체"];

const STATUS_KEY: Record<string, string> = {
  "전체": "all",
  "진행중": "running",
  "대기중": "pending",
  "일시정지": "paused",
  "완료": "done",
};

export default function PlaceManagePage() {
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [extendTarget, setExtendTarget] = useState<typeof MOCK_CAMPAIGNS[number] | null>(null);

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
    const searchMatch =
      !search ||
      c.placeName.includes(search) ||
      c.keyword.includes(search) ||
      c.media.includes(search);
    return statusMatch && searchMatch;
  });

  const total = campaigns.length;
  const running = campaigns.filter((c) => c.status === "running").length;
  const pending = campaigns.filter((c) => c.status === "pending").length;

  return (
    <div className="w-full space-y-5">
      <nav className="flex items-center gap-1.5 text-[13px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <Link href="/marketing/reward/place" className="hover:text-brand-text">네이버 플레이스</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">캠페인 관리</span>
      </nav>

      {/* 상단 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "전체 캠페인", value: total,   color: "text-brand-dark",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", grad: "linear-gradient(135deg,#0341C7,#0235A8)" },
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
                className="pl-8 pr-3 py-1.5 border border-brand-border rounded-xl text-[12px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all w-48"
              />
            </div>
            <Link
              href="/marketing/reward/place"
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
                <th className="w-8" />
                {["플레이스명", "플레이스 링크", "키워드", "현재 순위", "상품", "일 작업량", "기간", "주문금액", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-brand-muted uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-[14px] text-brand-muted">
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
                          <p className="text-[13px] font-semibold text-brand-dark truncate max-w-[120px]">{c.placeName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <a
                            href={c.placeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[12px] text-brand-primary hover:underline"
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            플레이스 링크
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
                          <span className="text-[12px] font-bold text-brand-dark">{c.media}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13px] font-bold text-brand-dark">{c.dailyQty.toLocaleString()}</span>
                          <span className="text-[11px] text-brand-muted ml-0.5">건</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[11.5px] text-brand-sub">{c.startDate}</span>
                          <span className="text-brand-muted mx-1">~</span>
                          <span className="text-[11.5px] text-brand-sub">{c.endDate}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[13px] font-extrabold text-brand-dark">{c.orderAmount.toLocaleString()}</span>
                          <span className="text-[11px] text-brand-muted ml-0.5">원</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${st.bg} ${st.text}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setExtendTarget(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            연장 신청하기
                          </button>
                        </td>
                      </tr>

                      {/* 아코디언 그래프 */}
                      {isOpen && canExpand && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={11} className="p-0">
                            <div className="bg-brand-lighter/50 px-6 py-4">
                              <SingleRankChart campaign={c} color={color} />
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
          <p className="text-[12px] text-brand-muted">
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

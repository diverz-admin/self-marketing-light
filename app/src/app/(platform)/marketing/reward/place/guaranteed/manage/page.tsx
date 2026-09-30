"use client";

import React, { Fragment, useEffect, useRef, useState } from "react";
import { useItemGroups, groupItems } from "@/lib/item-groups";
import { ItemGroupBar, ItemGroupHeaderRow, ItemGroupPicker } from "@/components/marketing/ItemGroupBar";
import Link from "next/link";
import { PeriodRankChart } from "@/components/marketing/RankManagement";
import PageHeader from "@/components/marketing/PageHeader";
import {
  StatusFilterCards, PeriodFilter, usePeriodFilter, ManageListHeader,
  StatusDot, NameChip, type StatusKey, type StatusLabels,
} from "@/components/marketing/manage-ui";

/** 이 화면에서 done 은 "보장완료"로 읽는다 */
const GUAR_LABELS: StatusLabels = { all: "전체 보장 캠페인", done: "보장완료" };
const GUAR_PILL_LABELS: StatusLabels = { done: "보장완료" };

/*
 * 예시 데이터라 기준 날짜를 new Date() 로 잡으면 서버·클라이언트 렌더가 갈리고,
 * 날이 바뀔 때마다 기간 칩 결과도 달라진다. 자료에 있는 가장 늦은 날을 오늘로 본다.
 */
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
  {
    id: "5", placeName: "온천집 성수점", keyword: "성수 이자카야", product: "프리마",
    dailyQty: 130, status: "done", startDate: "2026-05-01", endDate: "2026-05-28",
    orderAmount: 16900, rank: 2, rankDiff: -1, placeLink: "https://m.place.naver.com/restaurant/5678901",
  },
  {
    id: "6", placeName: "미도인 강남점", keyword: "강남 맛집", product: "골든",
    dailyQty: 110, status: "done", startDate: "2026-04-05", endDate: "2026-04-30",
    orderAmount: 14300, rank: 3, rankDiff: 1, placeLink: "https://m.place.naver.com/restaurant/6789012",
  },
];

/** 예시 자료의 가장 늦은 날 = 이 화면의 "오늘" */
const TODAY = MOCK_CAMPAIGNS.map((c) => c.endDate).sort().slice(-1)[0];

/* 보장형 순위 이력 생성
   - 초반 진입(startRank → top5) 후 1~5위 유지, 중간중간 5순위 이탈(정지)일 포함
   - 이탈일은 카운트되지 않으므로 총 일수(days)가 보장 카운트일(25)보다 길어짐 */
function makeGHistory(startRank: number, days: number, endY = 2026, endM = 5, endD = 19) {
  const end = new Date(endY, endM, endD);
  const arr: { date: string; rank: number }[] = [];
  for (let k = 0; k < days; k++) {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - k));
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    let rank: number;
    if (k < 3) {
      // 진입 구간 (startRank → 4위)
      rank = Math.round(startRank - (startRank - 4) * (k / 3));
    } else {
      // top5 유지 (2~5위) + 주기적 이탈(6~7위, 정지)
      rank = 3 + Math.round(Math.sin(k * 1.15) * 1.5);
      if (k % 6 === 4) rank = 6 + (k % 2); // 이탈일
      rank = Math.max(1, rank);
    }
    arr.push({ date: `${mm}/${dd}`, rank });
  }
  return arr;
}

// 카운트(1~5위) 25일 + 이탈(정지) 약 5일 → 총 30일치 (완료 캠페인은 종료월 기준)
const GUARANTEED_RANK_HISTORY: Record<string, { date: string; rank: number }[]> = {
  "1": makeGHistory(9, 30),
  "2": makeGHistory(11, 30),
  "3": makeGHistory(8, 30, 2026, 5, 14),  // 완료 · 06월
  "5": makeGHistory(9, 30, 2026, 4, 28),  // 완료 · 05월
  "6": makeGHistory(8, 30, 2026, 3, 30),  // 완료 · 04월
};

const CHART_COLORS = ["#2452EB", "#2452EB", "#8B5CF6", "#F97316"];

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
  const fullHistory = GUARANTEED_RANK_HISTORY[campaign.id];
  if (!fullHistory) return null;

  // 보장 카운트는 전체 이력 누적 기준
  const countedDays = fullHistory.filter((d) => d.rank <= THRESHOLD).length;
  const pausedDays = fullHistory.filter((d) => d.rank > THRESHOLD).length;
  const progressPct = Math.min((countedDays / GUARANTEED_TOTAL_DAYS) * 100, 100);

  const firstRank = fullHistory[0].rank;
  const latestRank = fullHistory[fullHistory.length - 1].rank;
  const improved = latestRank < firstRank;

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4 flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* 왼쪽: 플레이스 정보 + 보장 카운트 + 순위 */}
      <div className="lg:w-[210px] shrink-0 flex flex-col gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <p className="text-[15px] font-extrabold text-brand-dark leading-tight">{campaign.placeName}</p>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-primary-50 text-brand-primary border border-[#BFCCFA] shrink-0">
              보장형
            </span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <span className="text-[12px] text-brand-sub truncate">{campaign.keyword}</span>
          </div>
        </div>

        {/* 보장 카운트 */}
        <div className="p-2.5 rounded-xl bg-brand-primary-50 border border-[#BFCCFA]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <span className="text-[12px] font-extrabold text-brand-primary">보장 카운트</span>
            </div>
            <span className="text-[13px] font-extrabold text-brand-primary">{countedDays}<span className="text-[11px] font-medium text-brand-primary"> / {GUARANTEED_TOTAL_DAYS}</span></span>
          </div>
          <div className="h-2 bg-brand-primary-50 rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[10px] text-brand-primary">1~{THRESHOLD}순위 유지 일수만 카운트</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="flex items-center gap-0.5 text-[11px] text-brand-primary font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-primary" />
              카운트 {countedDays}일
            </span>
            <span className="flex items-center gap-0.5 text-[11px] text-gray-400 font-medium">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300" />
              정지 {pausedDays}일
            </span>
          </div>
          <p className="text-[11px] text-brand-muted mt-1">잔여 {Math.max(0, GUARANTEED_TOTAL_DAYS - countedDays)}일</p>
        </div>

        {/* 최초 → 현재 순위 (가로) */}
        <div>
          <div className="flex items-end gap-2.5">
            <div>
              <p className="text-[11px] font-bold text-brand-muted mb-0.5">최초 순위</p>
              <p className="text-[26px] font-extrabold text-brand-muted leading-none">{firstRank}<span className="text-[12px] font-medium ml-0.5">위</span></p>
            </div>
            <svg className={`w-4 h-4 mb-1.5 shrink-0 ${improved ? "text-[#2452EB]" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
            <div>
              <p className="text-[11px] font-bold text-brand-muted mb-0.5">현재 순위</p>
              <p className="text-[30px] font-extrabold text-brand-dark leading-none">{latestRank}<span className="text-[12px] font-medium text-brand-muted ml-0.5">위</span></p>
            </div>
          </div>
          <p className={`text-[12px] font-bold mt-2 flex items-center gap-0.5 ${improved ? "text-[#2452EB]" : "text-red-400"}`}>
            {improved
              ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            }
            {Math.abs(firstRank - latestRank)}단계
          </p>
        </div>
      </div>

      {/* 오른쪽: 순위 추이 차트 (마이 캠페인과 동일 디자인) */}
      <div className="flex-1 min-w-0">
        <PeriodRankChart base={fullHistory.map((h) => h.rank)} color={color} uid={campaign.id} />
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
                <p className="text-[13px] font-bold text-brand-primary mb-1">보장형 캠페인 연장</p>
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
                    <span className="font-semibold text-brand-dark">{campaign.product}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-brand-muted">현재 종료일</span>
                    <span className="font-semibold text-brand-dark">{campaign.endDate}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">일 작업량</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setDailyQty((q) => Math.max(10, q - 10))} className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[20px] font-bold shrink-0">−</button>
                  <div className="flex-1 flex items-center justify-center gap-1 h-11 rounded-xl border border-brand-border bg-white">
                    <input type="number" value={dailyQty} onChange={(e) => setDailyQty(Math.max(10, Number(e.target.value) || 0))} className="w-20 text-center text-[20px] font-extrabold text-brand-dark focus:outline-none" />
                    <span className="text-[15px] text-brand-muted">건/일</span>
                  </div>
                  <button onClick={() => setDailyQty((q) => q + 10)} className="h-11 w-11 rounded-xl border border-brand-border text-brand-sub hover:bg-brand-lighter transition-colors text-[20px] font-bold shrink-0">+</button>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">연장 기간</label>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((d) => {
                    const on = days === d;
                    return (
                      <button key={d} onClick={() => setDays(d)} className={`py-3 rounded-xl text-[16px] font-bold border transition-all ${on ? "bg-brand-primary text-white border-brand-primary" : "bg-white text-brand-sub border-brand-border hover:bg-brand-lighter"}`}>
                        {d}일
                      </button>
                    );
                  })}
                </div>
                <p className="text-[13px] text-brand-muted mt-2">
                  연장 후 종료일: <span className="font-semibold text-brand-dark">{newEndDate}</span>
                </p>
              </div>

              <div className="rounded-xl bg-brand-primary-50 border border-[#BFCCFA] p-4">
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

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-[16px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors">취소</button>
                <button onClick={confirm} className="flex-[1.4] py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">
                  연장하기
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
            <h3 className="text-[21px] font-extrabold text-brand-dark mb-1">신청이 접수되었습니다</h3>
            <p className="text-[15px] text-brand-sub mb-5">
              연장 신청이 정상적으로 접수되었습니다.<br />검토 후 순차 반영됩니다.
            </p>
            <div className="rounded-xl bg-brand-lighter border border-brand-border p-4 text-left space-y-2 mb-5">
              <div className="flex items-center justify-between text-[15px]"><span className="text-brand-muted">일 작업량</span><span className="font-semibold text-brand-dark">{dailyQty.toLocaleString()}건/일</span></div>
              <div className="flex items-center justify-between text-[15px]"><span className="text-brand-muted">연장 기간</span><span className="font-semibold text-brand-dark">{days}일</span></div>
              <div className="flex items-center justify-between text-[15px]"><span className="text-brand-muted">변경된 종료일</span><span className="font-semibold text-brand-dark">{newEndDate}</span></div>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors">확인</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuaranteedManagePage() {
  const grp = useItemGroups("reward-guaranteed");
  const [pickGroupId, setPickGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [campaigns] = useState(MOCK_CAMPAIGNS);
  const [extendTarget, setExtendTarget] = useState<typeof MOCK_CAMPAIGNS[number] | null>(null);

  const period = usePeriodFilter(TODAY, "3m");

  // 카드 건수는 기간만 적용한 모집단에서 센다
  const inPeriod = campaigns.filter((c) => period.contains(c.startDate));

  const counts = {
    all: inPeriod.length,
    pending: inPeriod.filter((c) => c.status === "pending").length,
    running: inPeriod.filter((c) => c.status === "running").length,
    done: inPeriod.filter((c) => c.status === "done").length,
  };

  const filtered = inPeriod.filter((c) => {
    const statusMatch = status === "all" || c.status === status;
    const searchMatch = !search || c.placeName.includes(search) || c.keyword.includes(search) || c.product.includes(search);
    return statusMatch && searchMatch;
  });

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
      {/* 페이지 헤더 */}
      <PageHeader
        title="보장형 캠페인 관리"
        subtitle="보장 순위 유지 현황을 확인하고 관리하세요."
        iconPath={"M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"}
      />

      {/* 상태별 건수 — 카드가 곧 필터다.
          보장형은 개발본과 같이 대기중을 카드로 두지 않는다 (알약에는 있다). */}
      <StatusFilterCards
        counts={counts}
        value={status}
        onChange={setStatus}
        keys={["all", "running", "done"]}
        labels={GUAR_LABELS}
      />

      <PeriodFilter period={period} basisLabel="시작일" />

      {/* ── 목록 ──
          상자를 두지 않는다. 위 요약 카드만 면을 가지므로 "지금 보는 범위"와
          "목록"이 나뉜다. (다른 캠페인 관리 화면과 같은 규칙) */}
      <div className="mt-6 md:mt-8">
        <ManageListHeader
          title="내 보장형 캠페인"
          count={filtered.length}
          value={status}
          onChange={setStatus}
          labels={GUAR_PILL_LABELS}
          className="px-5 md:px-6 pt-4 pb-3 border-b border-brand-border"
          action={
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="플레이스명, 키워드 검색"
                className="pl-8 pr-3 py-2 border border-brand-border rounded-lg text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all w-48" />
            </div>
          }
        />

        {/* ── 그룹 묶어보기 ── */}
        <ItemGroupBar
          groups={grp.groups}
          onAdd={(name) => grp.addGroup(name)}
          className="px-5 md:px-6 py-3 border-b border-brand-border"
        />

        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full min-w-max text-left">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="w-8" />
                {["플레이스명", "플레이스 링크", "키워드", "현재 순위", "보장 카운트", "보장 카운트 시작일", "캠페인 시작일", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-16 text-center text-[16px] text-brand-muted">조건에 맞는 캠페인이 없습니다.</td>
                </tr>
              ) : (
                groupItems(filtered, (c) => String(c.id), grp.groups, grp.assign).flatMap((g) => [
                  ...(grp.groups.length
                    ? [
                        <ItemGroupHeaderRow
                          key={`gh-${g.gid ?? "none"}`}
                          colSpan={11}
                          name={g.name}
                          count={g.items.length}
                          onPick={g.gid !== null ? () => setPickGroupId(g.gid!) : undefined}
                          onRename={
                            g.gid !== null
                              ? () => {
                                  const next = window.prompt("그룹 이름", g.name ?? "");
                                  if (next) grp.renameGroup(g.gid!, next);
                                }
                              : undefined
                          }
                          onRemove={g.gid !== null ? () => grp.removeGroup(g.gid!) : undefined}
                        />,
                      ]
                    : []),
                  ...(g.empty && grp.groups.length
                    ? [
                        <tr key={`ge-${g.gid}`}>
                          <td colSpan={11} className="px-5 md:px-6 py-4 text-[13px] text-brand-muted">
                            「편성」을 눌러 이 그룹에 넣을 캠페인을 고르세요.
                          </td>
                        </tr>,
                      ]
                    : []),
                  ...g.items.map((c, idx) => {
                  const canExpand = !!GUARANTEED_RANK_HISTORY[c.id];
                  const isOpen = expandedId === c.id;
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  const counted = countedDaysOf(c.id);
                  const countPct = Math.min((counted / GUARANTEED_TOTAL_DAYS) * 100, 100);
                  const guaranteeStart = guaranteeStartDate(c.id);
                  return (
                    <Fragment key={c.id}>
                      <tr onClick={() => canExpand && setExpandedId(isOpen ? null : c.id)}
                        className={`transition-colors ${canExpand ? "cursor-pointer" : ""} ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/50"}`}>
                        <td className="pl-3 py-3.5">
                          {canExpand && (
                            <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <NameChip name={c.placeName} />
                            <p className="text-[15px] font-semibold text-brand-dark truncate max-w-[120px]">{c.placeName}</p>
                            <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-extrabold bg-brand-primary-50 text-brand-primary border border-[#BFCCFA]">보장형</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <a href={c.placeLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-[13px] text-brand-primary hover:underline">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            플레이스 링크
                          </a>
                        </td>
                        <td className="px-4 py-3.5"><span className="text-[13px] font-medium text-brand-sub">{c.keyword}</span></td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.rank === null ? (
                            <span className="text-[13px] text-brand-muted">-</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[16px] font-extrabold text-brand-dark">{c.rank}위</span>
                              {c.rankDiff !== 0 && (
                                <span className={`flex items-center gap-0.5 text-[12px] font-bold ${c.rankDiff < 0 ? "text-[#2452EB]" : "text-red-400"}`}>
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
                            <div className="w-16 h-1.5 bg-brand-primary-50 rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary rounded-full" style={{ width: `${countPct}%` }} />
                            </div>
                            <span className="text-[13px] font-bold text-brand-primary">{counted}<span className="text-[11px] text-brand-primary font-medium">/{GUARANTEED_TOTAL_DAYS}</span></span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {guaranteeStart ? (
                            <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-brand-primary">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {guaranteeStart}
                            </span>
                          ) : (
                            <span className="text-[13px] text-brand-muted">카운트 전</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[13px] text-brand-sub">{c.startDate}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusDot status={c.status as "pending" | "running" | "done"} labels={GUAR_PILL_LABELS} />
                        </td>
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setExtendTarget(c)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors whitespace-nowrap">
                            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            연장신청하기
                          </button>
                        </td>
                      </tr>

                      {/* 아코디언 그래프 (해당 행 바로 아래 · 보이는 폭에 고정해 가로 스크롤 잘림 방지) */}
                      {isOpen && canExpand && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={11} className="p-0">
                            <div className="sticky left-0" style={{ width: detailWidth }}>
                              <div className="bg-brand-lighter/50 px-5 py-4">
                                <GuaranteedRankChart campaign={c} color={color} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                  }),
                ])
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 md:px-6 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">총 <span className="font-bold text-brand-dark">{filtered.length}</span>건</p>
        </div>
      </div>

      {pickGroupId !== null && (
        <ItemGroupPicker
          groupName={grp.groups.find((g) => g.id === pickGroupId)?.name ?? "그룹"}
          groupId={pickGroupId}
          items={MOCK_CAMPAIGNS}
          idOf={(c) => String(c.id)}
          labelOf={(c) => c.placeName}
          subLabelOf={(c) => c.keyword}
          assign={grp.assign}
          onApply={(add, remove) => {
            grp.assignMany(add, pickGroupId);
            grp.assignMany(remove, null);
          }}
          onClose={() => setPickGroupId(null)}
        />
      )}

      {extendTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40" onClick={() => setExtendTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto h-14 w-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-[20px] font-extrabold text-brand-dark mb-1.5">연장이 접수되었습니다</h3>
            <p className="text-[14px] text-brand-sub mb-4">검토 후 순차적으로 반영됩니다.</p>
            <div className="rounded-xl bg-brand-lighter border border-brand-border px-4 py-3 mb-6 text-left">
              <p className="text-[15px] font-bold text-brand-dark truncate">{extendTarget.placeName}</p>
              <div className="mt-1.5 flex items-center gap-3 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <span className="text-brand-muted">상품 종류</span>
                  <span className="font-semibold text-brand-dark">{extendTarget.product}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-brand-muted">키워드</span>
                  <span className="font-semibold text-brand-dark">{extendTarget.keyword}</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setExtendTarget(null)}
              className="w-full py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-brand-primary-hover transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

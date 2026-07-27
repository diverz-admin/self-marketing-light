"use client";

import React, { Fragment, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { PeriodRankChart } from "@/components/marketing/RankManagement";
import PageHeader from "@/components/marketing/PageHeader";
import { requestCampaignExtension } from "../../../actions";
import type { MyRewardCampaign, RankPoint } from "@/lib/my-reward-campaigns";

type MyCampaign = MyRewardCampaign;

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  running:  { label: "진행중",  bg: "bg-green-50",  text: "text-green-600" },
  pending:  { label: "대기중",  bg: "bg-amber-50",  text: "text-amber-600" },
  done:     { label: "완료",    bg: "bg-blue-50",   text: "text-blue-500" },
};


const CHART_COLORS = ["#0D3473", "#2E6BE0", "#8B5CF6", "#F97316"];

function SingleRankChart({ campaign, color, history }: {
  campaign: MyCampaign;
  color: string;
  history: RankPoint[] | undefined;
}) {
  const fullHistory = history;
  if (!fullHistory || fullHistory.length < 2) return null;
  const firstRank = fullHistory[0].rank;
  const latestRank = fullHistory[fullHistory.length - 1].rank;
  const improved = latestRank < firstRank;

  return (
    <div className="bg-white rounded-2xl border border-brand-border p-4 flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* 왼쪽: 순위 정보 패널 */}
      <div className="lg:w-52 shrink-0 flex flex-col lg:justify-between gap-3 lg:gap-8">
        <div>
          <p className="text-[15px] font-extrabold text-brand-dark leading-tight mb-1">{campaign.targetName}</p>
          <div className="flex items-center gap-1">
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

function ExtendModal({ campaign, onClose }: {
  campaign: MyCampaign;
  onClose: () => void;
}) {
  // 단가는 어드민이 등록한 상품 단가를 그대로 쓴다 (주문금액 ÷ 수량으로 되짚지 않는다)
  const unitPrice = campaign.unitPrice;
  const [dailyQty, setDailyQty] = useState(campaign.dailyQty);
  const [days, setDays] = useState(7);
  const [step, setStep] = useState<"form" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const amount = dailyQty * days * unitPrice;
  const newEndDate = addDays(campaign.endDate, days);

  function confirm() {
    setError(null);
    startTransition(async () => {
      const res = await requestCampaignExtension({ campaignId: campaign.id, dailyQty, days });
      if ("error" in res) setError(res.error);
      else setStep("done");
    });
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
                    <p className="text-[16px] font-bold text-brand-dark truncate">{campaign.targetName}</p>
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
                    <span className="font-semibold text-brand-dark">{campaign.productTitle}</span>
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

              {error && (
                <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[14px] font-semibold text-red-500">
                  {error}
                </p>
              )}

              {/* 액션 */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  disabled={pending}
                  className="flex-1 py-3 rounded-xl text-[16px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors disabled:opacity-60"
                >
                  취소
                </button>
                <button
                  onClick={confirm}
                  disabled={pending}
                  className="flex-[1.4] py-3 rounded-xl text-[16px] font-bold bg-brand-primary text-white hover:bg-blue-600 transition-colors disabled:opacity-60"
                >
                  {pending ? "신청 중…" : "연장하기"}
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

export default function PlaceManageView({ campaigns, rankHistory, today }: {
  campaigns: MyCampaign[];
  rankHistory: Record<string, RankPoint[]>;
  today: string;
}) {
  const [filter, setFilter] = useState("진행중");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [extendTarget, setExtendTarget] = useState<MyCampaign | null>(null);

  // 완료 캠페인 연/월 조회 — 기준 날짜는 서버에서 받아 하이드레이션이 어긋나지 않게 한다
  const doneDatesInit = campaigns.filter((c) => c.status === "done").map((c) => c.endDate).sort();
  const latestDone = doneDatesInit[doneDatesInit.length - 1] ?? today;
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

  const filtered = campaigns.filter((c) => {
    const statusMatch = filter === "전체" || c.status === STATUS_KEY[filter];
    const monthMatch = filter !== "완료" || c.endDate.slice(0, 7) === selectedYM;
    const searchMatch =
      !search ||
      c.targetName.includes(search) ||
      c.keyword.includes(search) ||
      c.productTitle.includes(search);
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
      {/* 페이지 헤더 */}
      <PageHeader
        title="네이버 플레이스 상위노출 캠페인 관리"
        subtitle="진행 중인 순위 상승 캠페인을 확인하고 관리하세요."
        iconPath={["M15 10.5a3 3 0 11-6 0 3 3 0 016 0z", "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"]}
      />

      {/* 상단 요약 배너 */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 전체 캠페인 (네이비) */}
        <div className="rounded-2xl px-3.5 sm:px-5 py-3.5 sm:py-5 min-h-[80px] sm:min-h-[112px] flex flex-col justify-between gap-2 text-white"
          style={{ background: "linear-gradient(135deg,#1B3160 0%,#111D37 100%)" }}>
          <span className="text-[13px] font-bold text-white/60">전체 캠페인</span>
          <p className="text-[21px] sm:text-[30px] font-extrabold leading-none tabular-nums">{total}<span className="text-[15px] font-medium text-white/55 ml-1">건</span></p>
        </div>

        {/* 진행중 (블루) */}
        <div className="rounded-2xl px-3.5 sm:px-5 py-3.5 sm:py-5 min-h-[80px] sm:min-h-[112px] flex flex-col justify-between gap-2 text-white"
          style={{ background: "linear-gradient(135deg,#2E6BE0 0%,#1D4ED8 100%)" }}>
          <span className="text-[13px] font-bold text-white/65">진행중</span>
          <p className="text-[21px] sm:text-[30px] font-extrabold leading-none tabular-nums">{running}<span className="text-[15px] font-medium text-white/60 ml-1">건</span></p>
        </div>

        {/* 완료 (화이트) */}
        <div className="rounded-2xl border border-brand-border bg-white px-3.5 sm:px-5 py-3.5 sm:py-5 min-h-[80px] sm:min-h-[112px] flex flex-col justify-between gap-2">
          <span className="text-[13px] font-bold text-brand-muted">완료</span>
          <p className="text-[21px] sm:text-[30px] font-extrabold leading-none tabular-nums text-brand-dark">{done}<span className="text-[15px] font-medium text-brand-muted ml-1">건</span></p>
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
          <table className="w-full min-w-max text-left">
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
                  const canExpand = !!rankHistory[c.id];
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
                          <p className="text-[15px] font-semibold text-brand-dark truncate max-w-[120px]">{c.targetName}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <a
                            href={c.targetUrl}
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
                          <span className="text-[13px] font-bold text-brand-dark">{c.productTitle}</span>
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
                                <SingleRankChart campaign={c} color={color} history={rankHistory[c.id]} />
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
        <ExtendModal campaign={extendTarget} onClose={() => setExtendTarget(null)} />
      )}
    </div>
  );
}

"use client";

import React, { Fragment, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { PeriodRankChart } from "@/components/marketing/RankManagement";
import PageHeader from "@/components/marketing/PageHeader";
import {
  StatusFilterCards, PeriodFilter, usePeriodFilter, ManageListHeader,
  StatusDot, NameChip, ProgressCell, progressOf,
  type StatusKey,
} from "@/components/marketing/manage-ui";
import { requestCampaignExtension } from "@/app/(platform)/marketing/actions";
import type { MyRewardCampaign, RankPoint } from "@/lib/my-reward-campaigns";
import { useItemGroups, groupItems } from "@/lib/item-groups";
import { ItemGroupBar, ItemGroupHeaderRow, ItemGroupPicker } from "@/components/marketing/ItemGroupBar";

type MyCampaign = MyRewardCampaign;


const CHART_COLORS = ["#2452EB", "#2452EB", "#8B5CF6", "#F97316"];

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
            <svg className={`w-4 h-4 mb-1.5 shrink-0 ${improved ? "text-[#2452EB]" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
            </svg>
            {/* 현재 순위 (오른쪽) */}
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

function ExtendModal({ campaign, onClose }: {
  campaign: MyCampaign;
  onClose: () => void;
}) {
  // 단가는 어드민이 등록한 상품 단가를 그대로 쓴다 (총 비용 ÷ 수량으로 되짚지 않는다)
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
                <div className="mt-3 pt-3 border-t border-brand-border flex items-center gap-1.5 text-[13px] text-brand-sub">
                  <span className="text-brand-muted">현재 종료일</span>
                  <span className="font-semibold text-brand-dark">{campaign.endDate}</span>
                </div>
              </div>

              {/* 작업량 설정 */}
              <div>
                <label className="block text-[15px] font-bold text-brand-dark mb-2">일 유입량</label>
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
                    <span className="text-[15px] text-brand-muted">유입/일</span>
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
                <span className="text-brand-muted">일 유입량</span>
                <span className="font-semibold text-brand-dark">{dailyQty.toLocaleString()}유입/일</span>
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

/**
 * 네이버 쇼핑 · 쿠팡 상위노출 캠페인 관리 화면 (두 채널이 같은 표를 쓴다).
 * 플레이스는 노출 항목이 달라 별도 화면(PlaceManageView)을 쓴다.
 */
export default function RewardManageView({ campaigns, rankHistory, today, title, createHref, groupScope }: {
  campaigns: MyCampaign[];
  rankHistory: Record<string, RankPoint[]>;
  today: string;
  title: string;
  createHref: string;
  /** 그룹 보관함 이름 — 화면마다 달라야 쇼핑 그룹이 쿠팡 목록에 나오지 않는다 */
  groupScope: string;
}) {
  const grp = useItemGroups(groupScope);
  const [pickGroupId, setPickGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [extendTarget, setExtendTarget] = useState<MyCampaign | null>(null);

  const period = usePeriodFilter(today, "3m");

  // 카드 건수는 기간만 적용한 모집단에서 센다 — 상태를 고를 때마다 카드 숫자가
  // 따라 줄면 카드를 필터로 쓸 수 없다.
  const inPeriod = campaigns.filter((c) => period.contains(c.appliedAt));

  const counts = {
    all: inPeriod.length,
    pending: inPeriod.filter((c) => c.status === "pending").length,
    running: inPeriod.filter((c) => c.status === "running").length,
    done: inPeriod.filter((c) => c.status === "done").length,
  };

  const filtered = inPeriod.filter((c) => {
    const statusMatch = status === "all" || c.status === status;
    const searchMatch =
      !search ||
      c.targetName.includes(search) ||
      c.keyword.includes(search) ||
      c.productTitle.includes(search);
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
        title={title}
        subtitle="진행 중인 순위 상승 캠페인을 확인하고 관리하세요."
        iconPath={"M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"}
      />

      {/* 상태별 건수 — 카드가 곧 필터다 */}
      <StatusFilterCards counts={counts} value={status} onChange={setStatus} />

      <PeriodFilter period={period} basisLabel="신청일" />

      {/* ── 목록 ──
          상자를 두지 않는다. 위 요약 카드만 면을 가지므로 "지금 보는 범위"와
          "목록"이 나뉜다. (플레이스 캠페인 관리·통합순위관리와 같은 규칙) */}
      <div className="mt-6 md:mt-8">
        <ManageListHeader
          title="내 상위노출 캠페인"
          count={filtered.length}
          value={status}
          onChange={setStatus}
          className="px-5 md:px-6 pt-4 pb-3 border-b border-brand-border"
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="상품명, 키워드 검색"
                  className="pl-8 pr-3 py-2 border border-brand-border rounded-lg text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all w-44"
                />
              </div>
              <Link
                href={createHref}
                className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-lg text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-point)", boxShadow: "var(--shadow-point)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                새 캠페인 신청
              </Link>
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
                {["상품명", "상품 링크", "키워드", "현재 순위", "일 유입량", "기간", "진행률", "총 비용", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">
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
                groupItems(filtered, (c) => c.id, grp.groups, grp.assign).flatMap((g) => [
                  // 그룹을 하나도 만들지 않았으면 머리글 없이 목록만 보인다
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
                  const canExpand = !!rankHistory[c.id];
                  const isOpen = expandedId === c.id;
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <Fragment key={c.id}>
                      <tr
                        onClick={() => canExpand && setExpandedId(isOpen ? null : c.id)}
                        className={`transition-colors ${canExpand ? "cursor-pointer" : ""} ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/50"}`}
                      >
                        <td className="pl-3 py-3.5">
                          {canExpand && (
                            <svg className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-2">
                            <NameChip name={c.targetName} />
                            <span className="text-[15px] font-semibold text-brand-dark truncate max-w-[140px]">{c.targetName}</span>
                          </span>
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
                            상품 링크
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
                                <span className={`flex items-center gap-0.5 text-[12px] font-bold ${c.rankDiff < 0 ? "text-[#2452EB]" : "text-red-400"}`}>
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
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[15px] font-bold text-brand-dark">{c.dailyQty.toLocaleString()}</span>
                          <span className="text-[12px] text-brand-muted ml-0.5">유입/일</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[13px] text-brand-sub">{c.startDate}</span>
                          <span className="text-brand-muted mx-1">~</span>
                          <span className="text-[13px] text-brand-sub">{c.endDate}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <ProgressCell
                            pct={progressOf(c.startDate, c.endDate, today, c.status)}
                            waiting={c.status === "pending"}
                            days={c.durationDays}
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[15px] font-extrabold text-brand-dark">{c.orderAmount.toLocaleString()}</span>
                          <span className="text-[12px] text-brand-muted ml-0.5">원</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusDot status={c.status} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {c.status === "done" || c.status === "stopped" ? (
                            <Link
                              href={createHref}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border/60 transition-colors whitespace-nowrap"
                            >
                              재신청
                            </Link>
                          ) : (
                            <button
                              onClick={() => setExtendTarget(c)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-bold bg-brand-lighter text-brand-text hover:bg-brand-border/60 transition-colors whitespace-nowrap"
                            >
                              연장하기
                            </button>
                          )}
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
                  }),
                ])
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 md:px-6 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">
            총 <span className="font-bold text-brand-dark">{filtered.length}</span>건
          </p>
        </div>
      </div>

      {extendTarget && (
        <ExtendModal
          campaign={extendTarget}
          onClose={() => setExtendTarget(null)}
        />
      )}

      {pickGroupId !== null && (
        <ItemGroupPicker
          groupName={grp.groups.find((g) => g.id === pickGroupId)?.name ?? "그룹"}
          groupId={pickGroupId}
          // 편성은 필터·검색과 무관하게 전체에서 고른다 —
          // 진행중만 보고 있을 때 완료 건을 넣지 못하면 그룹을 못 만든다
          items={campaigns}
          idOf={(c) => c.id}
          labelOf={(c) => c.targetName}
          subLabelOf={(c) => `${c.keyword} · ${c.productTitle}`}
          assign={grp.assign}
          onApply={(add, remove) => {
            grp.assignMany(add, pickGroupId);
            grp.assignMany(remove, null);
          }}
          onClose={() => setPickGroupId(null)}
        />
      )}
    </div>
  );
}

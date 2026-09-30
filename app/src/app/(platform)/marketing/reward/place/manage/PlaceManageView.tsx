"use client";

import React, { Fragment, useEffect, useRef, useState, useTransition } from "react";
import { useItemGroups, groupItems } from "@/lib/item-groups";
import { ItemGroupBar, ItemGroupHeaderRow, ItemGroupPicker } from "@/components/marketing/ItemGroupBar";
import Link from "next/link";
import CampaignRankDetail from "@/components/marketing/CampaignRankDetail";
import PageHeader from "@/components/marketing/PageHeader";
import {
  StatusFilterCards, PeriodFilter, usePeriodFilter, ManageListHeader,
  NameChip,
  type StatusKey,
} from "@/components/marketing/manage-ui";
import { requestCampaignExtension } from "../../../actions";
import type { MyRewardCampaign, RankPoint } from "@/lib/my-reward-campaigns";

type MyCampaign = MyRewardCampaign;


/** 상태 알약 — 개발본처럼 색 면 위 글자 */
const PILL: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: "#FFF4DE", fg: "#C58A0B", label: "접수 대기" },
  running: { bg: "#E3F6EA", fg: "#1E9E54", label: "진행중" },
  done: { bg: "#E7ECFF", fg: "#2452EB", label: "완료" },
  paused: { bg: "#FFE3E8", fg: "#E5484D", label: "일시정지" },
  stopped: { bg: "#EEF0F2", fg: "#6B7482", label: "중단" },
};
function StatusPill({ status }: { status: string }) {
  const p = PILL[status] ?? PILL.pending;
  return (
    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-[12.5px] font-bold whitespace-nowrap" style={{ background: p.bg, color: p.fg }}>
      {p.label}
    </span>
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

export default function PlaceManageView({ campaigns, rankHistory, today }: {
  campaigns: MyCampaign[];
  rankHistory: Record<string, RankPoint[]>;
  today: string;
}) {
  const grp = useItemGroups("reward-place");
  const [pickGroupId, setPickGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusKey>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [extendTarget, setExtendTarget] = useState<MyCampaign | null>(null);

  // 기간은 개발본과 같이 칩으로 고른다. 기준 날짜는 서버에서 받아 하이드레이션을 맞춘다.
  const period = usePeriodFilter(today, "3m");

  // 기간만 적용한 모집단 — 카드 건수는 이 위에서 센다. 상태 카드가 스스로 만든
  // 조건까지 반영하면 "진행중 3건"을 눌렀을 때 3이 1로 줄어드는 일이 생긴다.
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
        title="네이버 플레이스 상위노출 캠페인 관리"
        subtitle="진행 중인 순위 상승 캠페인을 확인하고 관리하세요."
        iconPath={["M15 10.5a3 3 0 11-6 0 3 3 0 016 0z", "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"]}
      />

      {/* 상태별 건수 — 카드가 곧 필터다 */}
      <StatusFilterCards counts={counts} value={status} onChange={setStatus} />

      <PeriodFilter period={period} basisLabel="신청일" />

      {/* ── 목록 ──
          통합순위관리와 같이 상자를 두지 않는다. 위 요약 카드만 면을 가지므로
          "지금 보는 범위"와 "목록"이 나뉜다. */}
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
                  placeholder="플레이스명, 키워드 검색"
                  className="pl-8 pr-3 py-2 border border-brand-border rounded-lg text-[13px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all w-44"
                />
              </div>
              <Link
                href="/marketing/reward/place"
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
                {["플레이스 명", "상품", "키워드", "일 작업량", "기간", "상태", "관리"].map((h) => (
                  <th key={h} className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-[16px] text-brand-muted">
                    조건에 맞는 캠페인이 없습니다.
                  </td>
                </tr>
              ) : (
                groupItems(filtered, (c) => c.id, grp.groups, grp.assign).flatMap((g) => [
                  ...(grp.groups.length
                    ? [
                        <ItemGroupHeaderRow
                          key={`gh-${g.gid ?? "none"}`}
                          colSpan={8}
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
                          <td colSpan={8} className="px-5 md:px-6 py-4 text-[13px] text-brand-muted">
                            「편성」을 눌러 이 그룹에 넣을 캠페인을 고르세요.
                          </td>
                        </tr>,
                      ]
                    : []),
                  ...g.items.map((c) => {
                  // 개발본과 같이 모든 행이 펼쳐진다 — 순위가 없으면 "순위 추적에 연결되지 않았습니다"를 보여준다
                  const isOpen = expandedId === c.id;
                  return (
                    <Fragment key={c.id}>
                      <tr
                        onClick={() => setExpandedId(isOpen ? null : c.id)}
                        className={`cursor-pointer transition-colors border-b border-brand-border ${isOpen ? "shadow-[inset_0_-2px_0_var(--point-500)]" : "hover:bg-brand-lighter/50"}`}
                      >
                        {/* 확장 화살표 */}
                        <td className="pl-4 py-3.5">
                          <span className={`inline-block text-[10px] text-brand-primary transition-transform ${isOpen ? "rotate-90" : ""}`}>▶</span>
                        </td>
                        {/* 플레이스 명 — 썸네일에 현재 순위 배지 + 새 창 링크 */}
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-2.5">
                            <span className="relative shrink-0">
                              <NameChip name={c.targetName} size={30} />
                              {c.rank != null && (
                                <span className="absolute -right-1.5 -bottom-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-dark text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums ring-2 ring-white">
                                  {c.rank}
                                </span>
                              )}
                            </span>
                            <span className="text-[14.5px] font-bold text-brand-dark truncate max-w-[180px]">{c.targetName}</span>
                            {c.targetUrl && (
                              <a
                                href={c.targetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="플레이스 링크 새 창으로 열기"
                                className="text-[13px] font-bold text-brand-primary hover:opacity-70"
                              >
                                ↗
                              </a>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-2">
                            <NameChip name={c.productTitle} size={30} />
                            <span className="text-[14px] font-bold text-brand-dark whitespace-nowrap">{c.productTitle}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-[13.5px] text-brand-text">{c.keyword}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="text-[14.5px] font-extrabold text-brand-dark">일 {c.dailyQty.toLocaleString()}건</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-[13px] text-brand-sub tabular-nums">
                            {c.startDate.slice(5).replace("-", ".")}~{c.endDate.slice(5).replace("-", ".")}
                          </p>
                          <p className="text-[11.5px] text-brand-muted">{c.durationDays}일</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {c.status === "done" || c.status === "stopped" ? (
                            <Link
                              href="/marketing/reward/place"
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-brand-primary-50 text-brand-primary border border-brand-border hover:opacity-80 whitespace-nowrap"
                            >
                              재신청
                            </Link>
                          ) : (
                            <button
                              onClick={() => setExtendTarget(c)}
                              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12.5px] font-bold bg-brand-primary-50 text-brand-primary border border-brand-border hover:opacity-80 whitespace-nowrap"
                            >
                              연장하기
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* 상세 (해당 행 바로 아래 · 보이는 폭에 고정해 가로 스크롤 잘림 방지) */}
                      {isOpen && (
                        <tr className="border-b border-brand-border">
                          <td colSpan={8} className="p-0">
                            <div className="sticky left-0 bg-brand-lighter/60" style={{ width: detailWidth }}>
                              <CampaignRankDetail
                                platform="place"
                                targetName={c.targetName}
                                targetUrl={c.targetUrl}
                                keyword={c.keyword}
                                dailyQty={c.dailyQty}
                                totalQty={c.dailyQty * c.durationDays}
                                period={`${c.startDate}~${c.endDate.slice(5)}`}
                                history={rankHistory[c.id]}
                                linkLabel="플레이스 링크"
                              />
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
        <ExtendModal campaign={extendTarget} onClose={() => setExtendTarget(null)} />
      )}

      {pickGroupId !== null && (
        <ItemGroupPicker
          groupName={grp.groups.find((g) => g.id === pickGroupId)?.name ?? "그룹"}
          groupId={pickGroupId}
          // 편성은 필터·검색과 무관하게 전체에서 고른다
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

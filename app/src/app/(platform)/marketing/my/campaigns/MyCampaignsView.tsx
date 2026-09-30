"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { PeriodRankChart } from "@/components/marketing/RankManagement";
import PageHeader from "@/components/marketing/PageHeader";
import { ListPager, NameChip, PeriodFilter, useAutoPageSize, usePeriodFilter, type PeriodKey } from "@/components/marketing/manage-ui";
import type { MyCampaignKind, MyCampaignPlatform, MyCampaignRow, MyCampaignStatus, RankPoint } from "@/lib/my-campaigns";

/* ────────────────────────────────────────────────────────────
   필터 · 표기
──────────────────────────────────────────────────────────── */

const PLATFORM_TABS: { value: "all" | MyCampaignPlatform; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "place", label: "네이버 플레이스" },
  { value: "shopping", label: "네이버 쇼핑" },
  { value: "coupang", label: "쿠팡" },
];
const KIND_TABS: ("전체" | MyCampaignKind)[] = ["전체", "리워드", "보장형", "리뷰"];
const STATUS_TABS: { value: "all" | MyCampaignStatus; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "wait", label: "접수대기" },
  { value: "live", label: "진행중" },
  { value: "done", label: "완료" },
  { value: "stop", label: "중단" },
];

const PLATFORM_CONFIG: Record<MyCampaignPlatform, { label: string; cls: string }> = {
  place: { label: "네이버 플레이스", cls: "bg-green-50 text-green-700 border-green-200" },
  shopping: { label: "네이버 쇼핑", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  coupang: { label: "쿠팡", cls: "bg-orange-50 text-orange-600 border-orange-200" },
};
const KIND_CONFIG: Record<MyCampaignKind, string> = {
  리워드: "bg-pink-50 text-pink-600 border-pink-200",
  보장형: "bg-blue-50 text-[#2452EB] border-blue-200",
  리뷰: "bg-indigo-50 text-indigo-600 border-indigo-200",
};
const STATUS_CONFIG: Record<MyCampaignStatus, { label: string; cls: string }> = {
  wait: { label: "접수대기", cls: "bg-amber-50 text-amber-600" },
  live: { label: "진행중", cls: "bg-green-50 text-green-700" },
  done: { label: "완료", cls: "bg-blue-50 text-[#2452EB]" },
  stop: { label: "중단", cls: "bg-red-50 text-red-500" },
};
const STATUS_ORDER: Record<MyCampaignStatus, number> = { wait: 0, live: 1, done: 2, stop: 3 };

type SortKey = "rank" | "period" | "status";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;

const PERIOD_KEYS: PeriodKey[] = ["all", "today", "7d", "30d", "3m", "6m", "1y", "custom"];

/** 기간 표기 — 2026-09-16~10-16 (시작 전이면 · 시작 대기) */
function periodText(start: string, end: string, today: string) {
  if (!start) return "시작 대기";
  const range = end ? `${start}~${end.slice(5)}` : start;
  return start > today ? `${range} · 시작 대기` : range;
}

/* ────────────────────────────────────────────────────────────
   작은 부품
──────────────────────────────────────────────────────────── */

function Badge({ cls, children }: { cls: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-lg text-[12px] font-bold border ${cls}`}>
      {children}
    </span>
  );
}

function StatusBadge({ status }: { status: MyCampaignStatus }) {
  const st = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg text-[12px] font-bold ${st.cls}`}>
      {st.label}
    </span>
  );
}

function RankCell({ rank, up }: { rank: number | null; up: number }) {
  if (rank == null) return <span className="text-[13px] text-brand-muted">–</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[17px] font-extrabold text-brand-dark tabular-nums">{rank}위</span>
      {up > 0 && (
        <span className="flex items-center gap-0.5 text-[12px] font-bold text-green-600">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
          {up}
        </span>
      )}
    </span>
  );
}

function ManageLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-lg text-[12px] font-bold bg-brand-lighter text-brand-sub hover:bg-brand-border transition-colors"
    >
      관리
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function Caret({ open, locked }: { open: boolean; locked: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-90" : ""} ${locked ? "text-brand-border" : "text-brand-muted"}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function SortHeader({ label, sortKey, sort, onSort }: { label: string; sortKey: SortKey; sort: Sort; onSort: (k: SortKey) => void }) {
  const on = sort?.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      title="정렬"
      className={`inline-flex items-center gap-1 text-[11.5px] font-semibold whitespace-nowrap hover:text-brand-primary ${on ? "text-brand-primary" : "text-brand-muted"}`}
    >
      {label}
      <span className="text-[10px]">{on ? (sort!.dir === "desc" ? "▼" : "▲") : "⇅"}</span>
    </button>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-brand-border px-4 py-3">
      <p className="text-[12px] text-brand-muted mb-1">{label}</p>
      <p className="text-[16px] font-extrabold text-brand-dark leading-none tabular-nums">{value}</p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   상세 (행을 펼치면 보이는 영역)
──────────────────────────────────────────────────────────── */

function RankSummary({ name, keyword, initialRank, currentRank, children }: {
  name: string; keyword: string; initialRank: number | null; currentRank: number | null; children?: React.ReactNode;
}) {
  const diff = initialRank != null && currentRank != null ? initialRank - currentRank : 0; // + 상승
  return (
    <div className="lg:w-52 shrink-0 flex flex-col lg:justify-between gap-3 lg:gap-8">
      <div>
        <p className="text-[16px] font-extrabold text-brand-dark leading-snug">{name}</p>
        <div className="flex items-center gap-1 mt-1.5 text-[13px] text-brand-muted">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>
          <span className="truncate">{keyword}</span>
        </div>
        {children}
      </div>
      <div>
        <div className="flex items-end gap-3">
          <div>
            <p className="text-[12px] text-brand-muted mb-1">최초 순위</p>
            <p className="text-[22px] font-extrabold text-brand-muted leading-none">
              {initialRank != null ? <>{initialRank}<span className="text-[12px] font-bold ml-0.5">위</span></> : "-"}
            </p>
          </div>
          <svg className="w-4 h-4 text-brand-muted mb-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
          <div>
            <p className="text-[12px] text-brand-muted mb-1">최근 순위</p>
            <p className="text-[28px] font-extrabold leading-none text-[#2452EB]">
              {currentRank != null ? <>{currentRank}<span className="text-[13px] font-bold ml-0.5">위</span></> : "-"}
            </p>
          </div>
        </div>
        {diff !== 0 && (
          <p className={`mt-2 text-[13px] font-bold ${diff > 0 ? "text-[#2452EB]" : "text-red-500"}`}>
            {diff > 0 ? "↑" : "↓"} {Math.abs(diff)}단계
          </p>
        )}
      </div>
    </div>
  );
}

function RankTrend({ history, uid, platform }: { history: RankPoint[]; uid: string; platform: MyCampaignPlatform }) {
  // 방문자·블로그 리뷰 수는 네이버 플레이스에만 있다
  const showReviews = platform === "place";
  return (
    <>
      {history.length > 1 ? (
        <PeriodRankChart
          base={history.map((h) => h.rank)}
          color="#2452EB"
          uid={uid}
          reviews={showReviews ? history.map((h) => ({ visit: h.visit, blog: h.blog })) : undefined}
        />
      ) : (
        <div className="py-6 text-center text-[13px] text-brand-muted">해당 기간의 순위 기록이 없습니다.</div>
      )}
      <p className="mt-2 rounded-lg bg-brand-lighter px-3 py-2.5 text-[12px] leading-relaxed text-brand-muted">
        순위는 매일 자동 측정됩니다.{showReviews && " 방은 방문자 리뷰, 블은 블로그 리뷰 수입니다."} 순위추적 항목에 쌓인 기록이라 캠페인 기간 밖의 날짜도 들어 있을 수 있습니다.
      </p>
    </>
  );
}

function CampaignDetail({ c, today }: { c: MyCampaignRow; today: string }) {
  const d = c.detail;

  if (d.kind === "리뷰") {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <InfoTile label="총 수량" value={d.totalQty.toLocaleString()} />
          <InfoTile label="완료 수량" value={d.completedQty.toLocaleString()} />
          <InfoTile label="기간" value={periodText(c.startDate, c.endDate, today)} />
        </div>
        <div className="mt-3 bg-white rounded-xl border border-brand-border overflow-hidden">
          {d.posts.length === 0 ? (
            <div className="px-4 py-8 text-center text-[14px] text-brand-muted">아직 발행된 리뷰가 없습니다.</div>
          ) : (
            d.posts.map((p, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-brand-border" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-brand-dark">네이버 블로그</span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700">발행완료</span>
                  </div>
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="mt-1 block truncate text-[12px] font-semibold text-brand-primary hover:underline">
                    {p.url.replace(/^https?:\/\//, "")}
                  </a>
                </div>
                {p.date && <span className="text-[12px] text-brand-muted shrink-0 tabular-nums">{p.date}</span>}
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  if (d.kind === "보장형") {
    const pct = d.guaranteedDays ? Math.round((d.achievedDays / d.guaranteedDays) * 100) : 0;
    return (
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <RankSummary name={c.name} keyword={c.keyword} initialRank={d.initialRank} currentRank={c.rank}>
          <div className="mt-3 rounded-xl border border-[#2452EB]/25 bg-blue-50 p-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[12px] font-extrabold text-[#2452EB]">보장 카운트</span>
              <span className="text-[13px] font-extrabold text-[#2452EB] whitespace-nowrap">
                {d.achievedDays}<span className="text-[11px] font-medium"> / {d.guaranteedDays}</span>
              </span>
            </div>
            <div className="h-2 rounded-full bg-white overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-[#2452EB]" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-[11px] text-[#2452EB]">1~{d.targetRank}순위 유지 일수만 카운트</p>
            <div className="mt-1.5 flex items-center gap-2 text-[11px] font-medium">
              <span className="flex items-center gap-1 text-[#2452EB]"><span className="h-1.5 w-1.5 rounded-full bg-[#2452EB]" />카운트 {d.achievedDays}일</span>
              <span className="flex items-center gap-1 text-brand-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand-border" />정지 {d.missedDays}일</span>
            </div>
            <p className="mt-1 text-[11px] text-brand-muted">잔여 {Math.max(0, d.guaranteedDays - d.achievedDays)}일</p>
          </div>
        </RankSummary>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <InfoTile label="보장 순위" value={`1~${d.targetRank}위`} />
            <InfoTile label="보장 일수" value={`${d.guaranteedDays}일`} />
            <InfoTile label="카운트 시작" value={d.countStartDate ?? "카운트 전"} />
          </div>
          <RankTrend history={d.history} uid={c.id} platform={c.platform} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <RankSummary name={c.name} keyword={c.keyword} initialRank={d.initialRank} currentRank={c.rank} />
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <InfoTile label="일 작업량" value={d.dailyQty != null ? `${d.dailyQty.toLocaleString()}건` : "-"} />
          <InfoTile label="총 작업량" value={`${d.totalQty.toLocaleString()}건`} />
          <InfoTile label="기간" value={periodText(c.startDate, c.endDate, today)} />
        </div>
        <RankTrend history={d.history} uid={c.id} platform={c.platform} />
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   화면
──────────────────────────────────────────────────────────── */

export type InitialFilters = {
  plat?: string;
  kind?: string;
  status?: string;
  period?: string;
  from?: string;
  to?: string;
};

function pick<T extends string>(v: string | undefined, allowed: readonly T[], fallback: T): T {
  return v && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

export default function MyCampaignsView({
  campaigns,
  today,
  initial,
}: {
  campaigns: MyCampaignRow[];
  today: string;
  initial: InitialFilters;
}) {
  const [plat, setPlat] = useState(pick(initial.plat, PLATFORM_TABS.map((t) => t.value), "all"));
  const [kind, setKind] = useState(pick(initial.kind, KIND_TABS, "전체"));
  // 기본은 진행중 — 들어오자마자 지금 돌고 있는 캠페인부터 보이게
  const [status, setStatus] = useState(pick(initial.status, STATUS_TABS.map((t) => t.value), "live"));
  const period = usePeriodFilter(today, pick(initial.period, PERIOD_KEYS, "3m"));
  const [sort, setSort] = useState<Sort>(null);
  // 페이지·펼친 행은 필터 조합에 묶어 둔다 — 필터가 바뀌면 자연히 첫 페이지 · 모두 접힘으로 돌아간다
  const [pageState, setPageState] = useState<{ key: string; n: number }>({ key: "", n: 1 });
  const [openState, setOpenState] = useState<{ key: string; id: string | null }>({ key: "", id: null });
  const [sizeOverride, setSizeOverride] = useState<number | null>(null);
  const autoSize = useAutoPageSize();
  const pageSize = sizeOverride ?? autoSize;
  const [toast, setToast] = useState<string | null>(null);

  // 직접 지정 기간은 URL 에서 복원한다 (처음 한 번)
  const { setCustomFrom, setCustomTo } = period;
  useEffect(() => {
    if (initial.from) setCustomFrom(initial.from);
    if (initial.to) setCustomTo(initial.to);
  }, [initial.from, initial.to, setCustomFrom, setCustomTo]);

  // 필터를 URL 에 남긴다 — 새로고침·뒤로가기 후에도 같은 목록이 보이게
  useEffect(() => {
    const q = new URLSearchParams();
    if (plat !== "all") q.set("plat", plat);
    if (kind !== "전체") q.set("kind", kind);
    if (status !== "live") q.set("status", status);
    if (period.key !== "3m") q.set("period", period.key);
    if (period.key === "custom") {
      q.set("from", period.customFrom);
      q.set("to", period.customTo);
    }
    const qs = q.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [plat, kind, status, period.key, period.customFrom, period.customTo]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // 필터가 바뀌면 첫 페이지로, 펼친 행은 접는다
  const viewKey = [plat, kind, status, period.key, period.customFrom, period.customTo, sizeOverride].join("|");
  const page = pageState.key === viewKey ? pageState.n : 1;
  const expandedId = openState.key === `${viewKey}|${page}` ? openState.id : null;
  const setPage = (n: number) => setPageState({ key: viewKey, n });

  const filtered = useMemo(() => {
    const list = campaigns.filter((c) =>
      (plat === "all" || c.platform === plat) &&
      (kind === "전체" || c.kind === kind) &&
      (status === "all" || c.status === status) &&
      period.contains(c.requestDate),
    );
    if (!sort) return list;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "rank") {
        // 순위 없는 행은 방향과 관계없이 맨 뒤로
        if (a.rank == null || b.rank == null) return a.rank == null ? (b.rank == null ? 0 : 1) : -1;
        return (a.rank - b.rank) * dir;
      }
      if (sort.key === "period") return a.startDate.localeCompare(b.startDate) * dir;
      return (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]) * dir;
    });
  }, [campaigns, plat, kind, status, period, sort]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const curPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((curPage - 1) * pageSize, curPage * pageSize);

  const isFiltered = plat !== "all" || kind !== "전체" || status !== "all" || period.key !== "all";

  const onSort = (key: SortKey) => {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
    setPage(1);
  };

  const toggle = (c: MyCampaignRow) => {
    if (c.lockedReason) { setToast(c.lockedReason); return; }
    setOpenState({ key: `${viewKey}|${page}`, id: expandedId === c.id ? null : c.id });
  };

  const chip = (active: boolean, activeCls: string) =>
    `px-3.5 py-1.5 rounded-xl text-[13px] font-bold transition-all ${active ? activeCls : "bg-brand-lighter text-brand-sub hover:bg-brand-border"}`;

  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="마이 캠페인 현황"
        subtitle="리워드·리뷰 등 이용 중인 캠페인을 한눈에 확인하세요."
        iconPath={"M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"}
      />

      {/* ── 목록 ──
          상자를 두지 않고 선으로만 구획한다 (캠페인 관리 화면과 같은 규칙) */}
      <div className="mt-6 md:mt-8">
        <p className="px-5 md:px-6 pt-4 pb-3 border-b border-brand-border text-[17px] font-extrabold text-brand-dark whitespace-nowrap">
          캠페인 상세 <span className="text-brand-muted font-bold">· {total}건</span>
        </p>

        {/* 필터 (플랫폼 / 유형 / 상태 / 기간) */}
        <div className="px-5 md:px-6 py-4 border-b border-brand-border space-y-2.5">
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">플랫폼</span>
            {PLATFORM_TABS.map((p) => (
              <button key={p.value} type="button" onClick={() => { setPlat(p.value) }}
                className={chip(plat === p.value, "bg-brand-dark text-white")}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">유형</span>
            {KIND_TABS.map((t) => (
              <button key={t} type="button" onClick={() => { setKind(t) }}
                className={chip(kind === t, "bg-brand-primary text-white")}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center flex-wrap gap-1.5 gap-y-2">
            <span className="text-[12px] font-bold text-brand-muted w-[52px] shrink-0">상태</span>
            {STATUS_TABS.map((s) => (
              <button key={s.value} type="button" onClick={() => { setStatus(s.value) }}
                className={chip(status === s.value, "bg-[#2452EB] text-white")}>
                {s.label}
              </button>
            ))}
          </div>
          <PeriodFilter period={period} basisLabel="신청일" />
        </div>

        {pageItems.length === 0 ? (
          <div className="px-4 py-16 text-center text-[15px] text-brand-muted">
            {isFiltered ? "조건에 맞는 캠페인이 없습니다" : "아직 진행한 캠페인이 없습니다"}
          </div>
        ) : (
          <>
            {/* 데스크톱 표 */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="w-8" />
                    {["플랫폼", "유형", "캠페인명", "키워드"].map((h) => (
                      <th key={h} className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-4 py-3"><SortHeader label="키워드 순위" sortKey="rank" sort={sort} onSort={onSort} /></th>
                    <th className="px-4 py-3"><SortHeader label="기간" sortKey="period" sort={sort} onSort={onSort} /></th>
                    <th className="px-4 py-3"><SortHeader label="상태" sortKey="status" sort={sort} onSort={onSort} /></th>
                    <th className="px-4 pt-3 pb-2 text-[11.5px] font-semibold text-brand-muted whitespace-nowrap">바로가기</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => {
                    const isOpen = expandedId === c.id;
                    return (
                      <Fragment key={c.id}>
                        <tr
                          onClick={() => toggle(c)}
                          title={c.lockedReason ?? "클릭하면 상세가 열립니다"}
                          className={`border-b border-brand-border transition-colors cursor-pointer ${isOpen ? "bg-brand-lighter/60" : "hover:bg-brand-lighter/40"}`}
                        >
                          <td className="pl-3 py-3.5"><Caret open={isOpen} locked={!!c.lockedReason} /></td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Badge cls={PLATFORM_CONFIG[c.platform].cls}>{PLATFORM_CONFIG[c.platform].label}</Badge>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <Badge cls={KIND_CONFIG[c.kind]}>{c.typeLabel}</Badge>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="flex items-center gap-2.5">
                              <NameChip name={c.name} size={30} />
                              {/* p 대신 span — 전역 `p { text-wrap: pretty }` 가 truncate 를 덮어쓴다 */}
                              <span className="block text-[15px] font-semibold text-brand-dark truncate max-w-[180px]">{c.name}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] text-brand-sub">{c.keyword}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap"><RankCell rank={c.rank} up={c.rankUp} /></td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="text-[13px] text-brand-sub tabular-nums">{periodText(c.startDate, c.endDate, today)}</span>
                          </td>
                          <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                          <td className="px-4 py-3.5"><ManageLink href={c.manageHref} /></td>
                        </tr>
                        {isOpen && (
                          <tr className="border-b border-brand-border">
                            <td colSpan={9} className="p-0">
                              <div className="bg-brand-lighter/50 px-5 py-4">
                                <div className="bg-white rounded-2xl border border-brand-border p-4">
                                  <CampaignDetail c={c} today={today} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 모바일 카드 — 캠페인마다 카드 한 장, 카드 사이를 띄워 구분한다 */}
            <div className="md:hidden px-3 py-3 space-y-2.5">
              {pageItems.map((c) => {
                const isOpen = expandedId === c.id;
                return (
                  <div key={c.id}
                    className={`rounded-2xl border bg-white overflow-hidden transition-shadow ${isOpen ? "border-brand-primary/40 shadow-md" : "border-brand-border shadow-sm"}`}>
                    {/* 헤더: 이름 · 상태 */}
                    <button type="button" onClick={() => toggle(c)}
                      className="w-full flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 text-left">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <NameChip name={c.name} size={32} />
                        <span className="block truncate text-[15px] font-extrabold text-brand-dark">{c.name}</span>
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={c.status} />
                        <Caret open={isOpen} locked={!!c.lockedReason} />
                      </span>
                    </button>

                    {/* 플랫폼 · 유형 */}
                    <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3">
                      <Badge cls={PLATFORM_CONFIG[c.platform].cls}>{PLATFORM_CONFIG[c.platform].label}</Badge>
                      <Badge cls={KIND_CONFIG[c.kind]}>{c.typeLabel}</Badge>
                    </div>

                    {/* 핵심 수치 — 키워드 · 순위 */}
                    <div className="mx-4 grid grid-cols-2 rounded-xl bg-brand-lighter divide-x divide-brand-border">
                      <div className="px-3 py-2.5 min-w-0">
                        <p className="text-[11px] font-bold text-brand-muted">키워드</p>
                        <p className="mt-0.5 truncate text-[14px] font-bold text-brand-dark">{c.keyword || "–"}</p>
                      </div>
                      <div className="px-3 py-2.5">
                        <p className="text-[11px] font-bold text-brand-muted">키워드 순위</p>
                        <div className="mt-0.5"><RankCell rank={c.rank} up={c.rankUp} /></div>
                      </div>
                    </div>

                    {/* 하단: 기간 · 관리 */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <span className="flex items-center gap-1.5 text-[12.5px] text-brand-sub tabular-nums">
                        <svg className="w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {periodText(c.startDate, c.endDate, today)}
                      </span>
                      <ManageLink href={c.manageHref} />
                    </div>

                    {isOpen && (
                      <div className="border-t border-brand-border bg-brand-lighter/50 p-3">
                        <CampaignDetail c={c} today={today} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <ListPager page={curPage} pageSize={pageSize} total={total} onPage={setPage}
          sizeValue={sizeOverride} onSizeChange={setSizeOverride} />

        <div className="px-5 md:px-6 py-3 border-t border-brand-border">
          <p className="text-[13px] text-brand-muted">총 <span className="font-bold text-brand-dark">{total}</span>건</p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[90vw] rounded-xl bg-brand-dark px-4 py-3 text-[13px] font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

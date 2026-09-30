"use client";

/**
 * 캠페인 관리 화면 공용 부품 — 개발본(blueegg-frontend)의 관리 화면 구성을 따른다.
 *
 * 네 화면(플레이스 상위노출·쇼핑/쿠팡 상위노출·보장형·리뷰)이 같은 일을 한다:
 * "내 캠페인을 상태와 기간으로 좁혀 본다". 그래서 좁히는 장치를 한 곳에 두고
 * 화면은 표만 각자 그린다.
 *
 * 개발본에서 가져온 것 — 여기 담긴 건 취향이 아니라 기능이다:
 *   · 상단 요약 카드가 곧 상태 필터다 (보기만 하는 카드가 아니다)
 *   · 기간은 신청일 기준 칩으로 고른다 (완료 캠페인만 연/월로 고르던 방식을 대체)
 *   · 목록 머리글에 상태 알약을 한 번 더 둔다 — 표를 보다 스크롤을 올리지 않아도 된다
 */

import React, { useEffect, useMemo, useState } from "react";

/* ────────────────────────────────────────────────────────────
   상태
──────────────────────────────────────────────────────────── */

/**
 * 화면이 쓰는 상태 값 — 개발본의 접수 대기 / 진행중 / 완료와 같다.
 * `paused`(일시정지)는 리뷰·체험단에만 있어 기본 순서에 넣지 않는다 —
 * 쓰는 화면이 `keys` 로 직접 넘긴다.
 */
export type ManageStatus = "pending" | "running" | "paused" | "done" | "stopped";

export const STATUS_LABEL: Record<ManageStatus, string> = {
  pending: "접수 대기",
  running: "진행중",
  paused: "일시정지",
  done: "완료",
  stopped: "중단",
};

const STATUS_DOT: Record<ManageStatus, string> = {
  pending: "#F5A524",
  running: "#16A34A",
  paused: "#DC2626",
  done: "#2452EB",
  stopped: "#99A0AC",
};

export type StatusKey = "all" | ManageStatus;

export const STATUS_ORDER: StatusKey[] = ["all", "pending", "running", "done"];

/**
 * 화면마다 같은 상태를 다르게 부른다 — 보장형의 done 은 "완료"가 아니라 "보장완료"다.
 * 뜻이 다른 게 아니라 이름만 다르므로 상태 값을 늘리지 않고 라벨만 갈아 끼운다.
 */
export type StatusLabels = Partial<Record<StatusKey, string>>;

export function statusLabel(key: StatusKey, labels?: StatusLabels) {
  return labels?.[key] ?? (key === "all" ? "전체" : STATUS_LABEL[key]);
}

/** 표 안의 상태 표시 — 점 + 글자. 배지를 쓰면 한 줄에 색면이 너무 많아진다 */
export function StatusDot({ status, labels }: { status: ManageStatus; labels?: StatusLabels }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="h-[6px] w-[6px] rounded-full shrink-0" style={{ background: STATUS_DOT[status] }} />
      <span className="text-[13px] font-bold" style={{ color: STATUS_DOT[status] }}>
        {statusLabel(status, labels)}
      </span>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   상단 요약 카드 = 상태 필터
──────────────────────────────────────────────────────────── */

/**
 * 고른 카드에 테두리와 링을 준다.
 *
 * 카드에 색면을 깔지 않는 이유: 네 장 모두 색이면 "지금 고른 것"을 색으로 나타낼
 * 자리가 없어진다. 흰 카드 + 파란 테두리라야 선택이 한눈에 읽힌다.
 */
export function StatusFilterCards({
  counts,
  value,
  onChange,
  keys = STATUS_ORDER,
  labels,
}: {
  counts: Partial<Record<StatusKey, number>>;
  value: StatusKey;
  onChange: (key: StatusKey) => void;
  keys?: StatusKey[];
  labels?: StatusLabels;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-3 ${keys.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {keys.map((key) => {
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={on}
            className={`text-left rounded-2xl bg-white px-4 sm:px-5 py-3.5 sm:py-4 transition-all ${
              on
                ? "border-2 border-[#2452EB] ring-4 ring-[#2452EB]/10"
                : "border-2 border-brand-border hover:border-brand-border-strong"
            }`}
          >
            <span className={`block text-[12.5px] font-bold ${on ? "text-brand-primary" : "text-brand-muted"}`}>
              {statusLabel(key, labels)}
            </span>
            <span className={`block mt-1.5 text-[24px] sm:text-[27px] font-extrabold leading-none tabular-nums ${
              on ? "text-brand-primary" : "text-brand-dark"
            }`}>
              {counts[key] ?? 0}
              <span className="text-[14px] font-bold ml-0.5">건</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   기간 필터
──────────────────────────────────────────────────────────── */

export type PeriodKey = "all" | "today" | "7d" | "30d" | "3m" | "6m" | "1y" | "custom";

const PERIOD_LABEL: Record<PeriodKey, string> = {
  all: "전체",
  today: "오늘",
  "7d": "최근 7일",
  "30d": "최근 30일",
  "3m": "최근 3개월",
  "6m": "최근 6개월",
  "1y": "최근 1년",
  custom: "직접 지정",
};

const PERIOD_KEYS: PeriodKey[] = ["all", "today", "7d", "30d", "3m", "6m", "1y", "custom"];

function shift(ymd: string, opt: { days?: number; months?: number; years?: number }) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (opt.days) dt.setDate(dt.getDate() - opt.days);
  if (opt.months) dt.setMonth(dt.getMonth() - opt.months);
  if (opt.years) dt.setFullYear(dt.getFullYear() - opt.years);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/**
 * 기간 상태. `today` 는 서버가 넘겨준 날짜를 쓴다 —
 * 클라이언트에서 new Date() 를 부르면 하이드레이션 때 서버와 값이 갈린다.
 */
export function usePeriodFilter(today: string, initial: PeriodKey = "3m") {
  const [key, setKey] = useState<PeriodKey>(initial);
  const [customFrom, setCustomFrom] = useState(shift(today, { months: 1 }));
  const [customTo, setCustomTo] = useState(today);

  const range = useMemo((): { from: string | null; to: string } => {
    switch (key) {
      case "all": return { from: null, to: today };
      case "today": return { from: today, to: today };
      case "7d": return { from: shift(today, { days: 7 }), to: today };
      case "30d": return { from: shift(today, { days: 30 }), to: today };
      case "3m": return { from: shift(today, { months: 3 }), to: today };
      case "6m": return { from: shift(today, { months: 6 }), to: today };
      case "1y": return { from: shift(today, { years: 1 }), to: today };
      case "custom": return { from: customFrom, to: customTo };
    }
  }, [key, today, customFrom, customTo]);

  /** 날짜 문자열(YYYY-MM-DD) 하나가 범위 안인지 */
  const contains = useMemo(
    () => (ymd: string) => {
      if (!ymd) return true;
      if (range.from && ymd < range.from) return false;
      return ymd <= range.to;
    },
    [range],
  );

  return { key, setKey, range, contains, customFrom, setCustomFrom, customTo, setCustomTo };
}

export function PeriodFilter({
  period,
  /** 무엇을 기준으로 거르는지 밝힌다 — "신청일"과 "종료일"은 결과가 크게 다르다 */
  basisLabel = "신청일",
  className = "",
}: {
  period: ReturnType<typeof usePeriodFilter>;
  basisLabel?: string;
  className?: string;
}) {
  const { key, setKey, range, customFrom, setCustomFrom, customTo, setCustomTo } = period;
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[12.5px] font-bold text-brand-muted mr-1 shrink-0">기간</span>
        {PERIOD_KEYS.map((k) => {
          const on = key === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKey(k)}
              className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-colors ${
                on ? "bg-[#2452EB] text-white" : "bg-white border border-brand-border text-brand-sub hover:bg-brand-lighter"
              }`}
            >
              {PERIOD_LABEL[k]}
            </button>
          );
        })}
      </div>

      {key === "custom" ? (
        <div className="flex items-center gap-2 mt-2">
          <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-brand-border text-[12.5px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary" />
          <span className="text-[12.5px] text-brand-muted">~</span>
          <input type="date" value={customTo} min={customFrom} onChange={(e) => setCustomTo(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-brand-border text-[12.5px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary" />
        </div>
      ) : (
        <p className="mt-2 text-[12px] text-brand-muted">
          {basisLabel} 기준 {range.from ? `${range.from} ~ ${range.to}` : "전체 기간"}
        </p>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   목록 머리글
──────────────────────────────────────────────────────────── */

export function ManageListHeader({
  title,
  count,
  counts,
  value,
  onChange,
  keys = STATUS_ORDER,
  labels,
  action,
  className = "",
}: {
  /** "내 상위노출 캠페인" — 뒤에 건수가 붙는다 */
  title: string;
  count: number;
  counts?: Partial<Record<StatusKey, number>>;
  value: StatusKey;
  onChange: (key: StatusKey) => void;
  keys?: StatusKey[];
  labels?: StatusLabels;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 flex-wrap ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[17px] font-extrabold text-brand-dark whitespace-nowrap">
          {title} <span className="text-brand-muted font-bold">· {count}건</span>
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {keys.map((k) => {
            const on = value === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange(k)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold whitespace-nowrap transition-colors ${
                  on ? "bg-[#2452EB] text-white" : "bg-brand-lighter text-brand-sub hover:bg-brand-border/60"
                }`}
              >
                {statusLabel(k, labels)}
                {counts && <span className="ml-1 opacity-70 tabular-nums">{counts[k] ?? 0}</span>}
              </button>
            );
          })}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   표 안의 작은 부품
──────────────────────────────────────────────────────────── */

const CHIP_TONES = ["#2452EB", "#7C3AED", "#0D9488", "#DB2777", "#EA580C", "#0369A1"];

/** 이름 첫 글자 칩 — 행이 많을 때 같은 업체를 색으로 훑게 한다 */
export function NameChip({ name, size = 26 }: { name: string; size?: number }) {
  // 이름이 같으면 색도 같아야 한다 — 매번 랜덤이면 훑는 데 쓸 수 없다
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const bg = CHIP_TONES[h % CHIP_TONES.length];
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg font-extrabold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.42 }}
    >
      {name.trim().slice(0, 1) || "?"}
    </span>
  );
}

/**
 * 진행률 막대.
 * 아직 시작하지 않은 캠페인은 0% 대신 "시작 대기"로 적는다 —
 * 0% 는 "하다가 못 했다"로 읽히고, 대기는 그런 뜻이 아니다.
 */
export function ProgressCell({ pct, waiting, days }: { pct: number; waiting?: boolean; days?: number }) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="h-[6px] w-[64px] rounded-full bg-brand-lighter overflow-hidden shrink-0">
        <span className="block h-full rounded-full" style={{ width: `${v}%`, background: v >= 100 ? "#2452EB" : "#4F7DF3" }} />
      </span>
      <span className="text-[12.5px] font-bold text-brand-sub tabular-nums">
        {waiting ? <span className="font-semibold text-brand-muted">시작 대기{days ? ` · ${days}일` : ""}</span> : `${v}%`}
      </span>
    </span>
  );
}

/** 며칠짜리 캠페인이 오늘까지 얼마나 지났는지 (0~100) */
export function progressOf(startDate: string, endDate: string, today: string, status: ManageStatus) {
  if (status === "done") return 100;
  if (status === "pending" || !startDate || today < startDate) return 0;
  const day = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
  };
  const span = day(endDate) - day(startDate) + 1;
  if (span <= 0) return 100;
  return Math.min(100, ((day(today) - day(startDate) + 1) / span) * 100);
}

/* ────────────────────────────────────────────────────────────
   페이징
──────────────────────────────────────────────────────────── */

const PAGE_SIZES = [5, 10, 20, 30, 50];

/** 페이지 크기 "자동" — 모바일 5 / 그 외 10 (통합순위관리와 같은 기준) */
export function useAutoPageSize() {
  const [size, setSize] = useState(10);
  useEffect(() => {
    const calc = () => setSize(document.documentElement.clientWidth <= 700 ? 5 : 10);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return size;
}

/** "1–6 / 6  ‹ 1 ›  [자동]" — 목록 하단 페이징 줄 */
export function ListPager({
  page,
  pageSize,
  total,
  onPage,
  sizeValue,
  onSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (n: number) => void;
  /** null = 자동 */
  sizeValue: number | null;
  onSizeChange: (n: number | null) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-brand-border">
      <span className="text-[13px] text-brand-muted tabular-nums">{from}–{to} / {total}</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
          className="px-2.5 py-1.5 rounded-lg text-[13px] font-bold text-brand-sub disabled:opacity-35 hover:bg-brand-lighter transition-colors">
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button key={n} type="button" onClick={() => onPage(n)}
            className={`min-w-[30px] px-2 py-1.5 rounded-lg text-[13px] font-bold transition-colors ${n === page ? "text-white" : "text-brand-sub hover:bg-brand-lighter"}`}
            style={n === page ? { background: "var(--gradient-point)" } : undefined}>
            {n}
          </button>
        ))}
        <button type="button" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
          className="px-2.5 py-1.5 rounded-lg text-[13px] font-bold text-brand-sub disabled:opacity-35 hover:bg-brand-lighter transition-colors">
          ›
        </button>
      </div>
      <select
        value={sizeValue ?? "auto"}
        onChange={(e) => onSizeChange(e.target.value === "auto" ? null : Number(e.target.value))}
        className="px-2.5 py-1.5 rounded-lg border border-brand-border text-[12.5px] font-bold text-brand-sub bg-white focus:outline-none focus:border-brand-primary"
      >
        <option value="auto">자동</option>
        {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}개씩</option>)}
      </select>
    </div>
  );
}

"use client";

/**
 * 캠페인 설정 — 상위노출 신청 화면(플레이스·쇼핑·쿠팡)이 공유하는 일정·수량 입력.
 *
 * 개발본(blueegg-frontend)의 「2 캠페인 설정」과 같은 항목을 둔다:
 *   작업 시작일 · 작업 종료일(자동 계산) · 구동 기간(일) · 일 작업량(건)
 *
 * 이전 화면에는 누르면 아무 일도 없는 "날짜 선택" 버튼 하나뿐이었고 기간이라는
 * 개념 자체가 없었다. 그래서 주문 금액이 `일 작업량 × 단가` 로만 계산돼, 며칠을
 * 돌리든 금액이 같았다. 기간을 넣으면서 금액도 `일 작업량 × 기간 × 단가` 가 된다.
 *
 * ── 시작일 규칙 (PU-02 / CS-02) ──
 * 과거·주말·공휴일은 고를 수 없고, 오늘은 마감시각 전까지만 고를 수 있다.
 * HTML date 입력은 임의의 날짜를 막을 수 없어 `min` 으로 과거만 막고 주말·공휴일은
 * 고른 뒤 메시지로 알린다 — 달력을 직접 그리면 접근성·모바일 기본 UI를 잃는다.
 */

import { useMemo, useState } from "react";
import { isBusinessDay, ymd } from "@/lib/policy";

function parseYMD(s: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function addDays(s: string, n: number) {
  const dt = parseYMD(s);
  if (!dt) return "";
  dt.setDate(dt.getDate() + n);
  return ymd(dt);
}

/**
 * 일정 규칙은 상품마다 다르다 — 어드민 "리워드 상품등록 › 구독 정보"에서 정한
 * 값(당일 접수 마감 · 당일 구동 가능 · 최소 구동 기간)을 그대로 받는다.
 * 화면에 13:30 이나 3일을 적어 두지 않는다.
 */
export type ScheduleLimits = {
  /** 상품이 정한 일 작업량 범위 — 상한이 없으면 maxDaily 는 null */
  minDaily: number;
  maxDaily: number | null;
  /** 최소 구동 기간(일) */
  minDays: number;
  /** "13:30" — 비어 있으면 마감 문구를 빼고 규칙만 안내한다 */
  cutoffTime: string | null;
  /** 당일 시작을 받는 상품인지 */
  sameDayStart: boolean;
};

function cutoffText(limits: ScheduleLimits) {
  if (!limits.cutoffTime) return null;
  return limits.sameDayStart
    ? `당일 마감 ${limits.cutoffTime} 전까지 당일 시작 가능`
    : `당일 접수 마감 ${limits.cutoffTime}`;
}

export function useCampaignSchedule(today: string, limits: ScheduleLimits) {
  const [startDate, setStartDate] = useState("");
  const [days, setDays] = useState(limits.minDays);
  const [dailyQty, setDailyQty] = useState(0);

  /* 종료일은 달력 기준으로 이어 센다 — 시작일 당일이 1일째다 */
  const endDate = useMemo(
    () => (startDate && days > 0 ? addDays(startDate, days - 1) : ""),
    [startDate, days],
  );

  const startDateError = useMemo(() => {
    if (!startDate) return null;
    if (startDate < today) return "지난 날짜는 고를 수 없습니다.";
    if (startDate === today && !limits.sameDayStart) return "이 상품은 당일 시작을 받지 않습니다.";
    const dt = parseYMD(startDate);
    if (dt && !isBusinessDay(dt)) return "주말·공휴일은 시작일로 고를 수 없습니다.";
    return null;
  }, [startDate, today, limits.sameDayStart]);

  const clampDaily = (v: number) => {
    if (v <= 0) return 0;
    const n = Math.max(limits.minDaily, Math.round(v));
    return limits.maxDaily === null ? n : Math.min(limits.maxDaily, n);
  };

  return {
    startDate,
    setStartDate,
    days,
    setDays: (v: number) => setDays(Math.max(limits.minDays, Math.round(v) || limits.minDays)),
    dailyQty,
    setDailyQty: (v: number) => setDailyQty(clampDaily(v)),
    endDate,
    startDateError,
    totalQty: dailyQty * days,
    /** 모두 채워졌는지 — 결제 버튼을 열지 판단한다 */
    ready: !!startDate && !startDateError && days >= limits.minDays && dailyQty >= limits.minDaily,
  };
}

export type CampaignSchedule = ReturnType<typeof useCampaignSchedule>;

/* ────────────────────────────────────────────────────────────
   수량 조절 — 숫자 입력 + 양옆 버튼
──────────────────────────────────────────────────────────── */

function Stepper({
  value,
  onChange,
  step = 1,
  min,
  max,
  placeholder,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min: number;
  max?: number;
  placeholder: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-stretch h-[42px] rounded-xl border border-brand-border bg-white overflow-hidden focus-within:border-brand-primary transition-colors">
      <button
        type="button"
        aria-label="줄이기"
        onClick={() => onChange(Math.max(min, (value || min) - step))}
        className="w-11 shrink-0 flex items-center justify-center text-brand-sub hover:bg-brand-lighter transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M5 12h14" />
        </svg>
      </button>
      <div className="flex-1 min-w-0 flex items-center justify-center gap-1">
        <input
          type="number"
          value={value || ""}
          placeholder={placeholder}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full min-w-0 text-center text-[15px] font-bold text-brand-dark bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && value > 0 && <span className="shrink-0 pr-1 text-[13px] text-brand-muted">{suffix}</span>}
      </div>
      <button
        type="button"
        aria-label="늘리기"
        onClick={() => onChange(Math.min(max ?? Number.MAX_SAFE_INTEGER, (value || 0) + step))}
        className="w-11 shrink-0 flex items-center justify-center text-brand-sub hover:bg-brand-lighter transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

const LABEL = "block text-[13px] font-bold text-brand-dark mb-1.5";
const REQ = <span className="text-red-500 ml-0.5">*</span>;

/* ────────────────────────────────────────────────────────────
   일정 · 수량 입력 묶음
──────────────────────────────────────────────────────────── */

export function CampaignScheduleFields({
  schedule,
  today,
  limits,
  unitPrice,
}: {
  schedule: CampaignSchedule;
  today: string;
  limits: ScheduleLimits;
  unitPrice: number;
}) {
  const { startDate, setStartDate, days, setDays, dailyQty, setDailyQty, endDate, startDateError } = schedule;
  const cutoff = cutoffText(limits);

  return (
    <>
      {/* 작업 시작일 */}
      <div>
        <label className={LABEL}>작업 시작일{REQ}</label>
        <input
          type="date"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[14px] text-brand-dark bg-white focus:outline-none focus:border-brand-primary transition-all"
        />
        <p className={`text-[12px] mt-1.5 ${startDateError ? "text-red-500 font-semibold" : "text-brand-muted"}`}>
          {startDateError ?? [cutoff, "주말·공휴일·과거 선택 불가"].filter(Boolean).join(" · ")}
        </p>
      </div>

      {/* 작업 종료일 — 시작일 + 기간으로 정해지므로 직접 고치지 않는다 */}
      <div>
        <label className={LABEL}>작업 종료일 <span className="text-[12px] font-medium text-brand-muted">자동 계산</span></label>
        <div className="w-full h-[42px] px-3 flex items-center rounded-xl border border-brand-border bg-brand-lighter text-[14px]">
          {endDate
            ? <span className="font-bold text-brand-dark">{endDate}</span>
            : <span className="text-brand-muted">시작일과 기간을 입력하면 표시됩니다</span>}
        </div>
      </div>

      {/* 구동 기간 · 일 작업량 — 주문 금액을 함께 만드는 짝이라 좁은 화면에서도 나란히 둔다.
          부모 그리드(sm:grid-cols-2)에서는 두 칸을 차지해 기존 배치가 그대로 유지된다. */}
      <div className="sm:col-span-2 grid grid-cols-2 gap-x-3 sm:gap-x-5">
      {/* 구동 기간 */}
      <div>
        <label className={LABEL}>구동 기간 (일){REQ}</label>
        <Stepper value={days} onChange={setDays} min={limits.minDays}
          placeholder={`최소 ${limits.minDays}일`} suffix="일" />
      </div>

      {/* 일 작업량 */}
      <div>
        <label className={LABEL}>일 작업량 (건){REQ}</label>
        <Stepper
          value={dailyQty}
          onChange={setDailyQty}
          step={10}
          min={limits.minDaily}
          max={limits.maxDaily ?? undefined}
          placeholder={limits.maxDaily === null ? `최소 ${limits.minDaily}건` : `${limits.minDaily}~${limits.maxDaily}`}
          suffix="건"
        />
        <p className="text-[12px] text-brand-muted mt-1.5">
          {/* 단위는 같은 화면의 상품 카드와 맞춘다 — 카드가 "원"인데 여기만 "P"면 다른 값처럼 읽힌다 */}
          단가 {unitPrice.toLocaleString()}원 · 일 {dailyQty.toLocaleString()}건 · {days.toLocaleString()}일
        </p>
      </div>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   구독 정보 — 상품 카드 · 선택한 상품 패널이 함께 쓴다
──────────────────────────────────────────────────────────── */

export type SubscriptionRow = { label: string; value?: string; badge?: string; highlight?: boolean };

/**
 * 상품에 실제로 등록된 일정 규칙만 줄로 만든다.
 *
 * 전에는 세 줄이 "13시 30분 / 가능 / 최소 3일 이상"으로 박혀 있어, 어떤 상품을
 * 골라도 같은 값이 나왔고 아래 입력칸이 쓰는 값과도 달랐다. 등록되지 않은 항목은
 * 줄을 빼는 편이 없는 규칙을 있는 것처럼 보여 주는 것보다 낫다.
 */
export function subscriptionRows(p: {
  orderCutoffTime: string | null;
  sameDayStart: boolean;
  minRunDays: number | null;
}): SubscriptionRow[] {
  const rows: SubscriptionRow[] = [];
  if (p.orderCutoffTime) {
    const [h, m] = p.orderCutoffTime.split(":");
    rows.push({ label: "당일 접수 마감", value: m && m !== "00" ? `${Number(h)}시 ${Number(m)}분` : `${Number(h)}시`, highlight: true });
  }
  rows.push(p.sameDayStart ? { label: "당일 구동", badge: "가능" } : { label: "당일 구동", value: "불가" });
  if (p.minRunDays) rows.push({ label: "구동 기간", value: `최소 ${p.minRunDays}일 이상` });
  return rows;
}

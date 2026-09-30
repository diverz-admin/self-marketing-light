"use client";

import { useEffect } from "react";
import { efficiencyLabel } from "@/components/marketing/SelectedProductCard";
import { subscriptionRows } from "@/components/marketing/CampaignScheduleFields";

/** 리워드 신청 화면(플레이스·쇼핑)의 상품 — 모달이 쓰는 칸만 */
export type ProductDetail = {
  name: string;
  desc: string;
  sale: boolean;
  recommended: boolean;
  bg: string;
  initial: string;
  price: number;
  efficiency: number;
  riseRate: number;
  trend: number[];
  minQty: number;
  maxQty: number | null;
  orderCutoffTime: string | null;
  sameDayStart: boolean;
  minRunDays: number | null;
};

/* 순위 상승 추이 미니 차트 — 숫자가 작을수록(상위) 선이 위로 향함 */
function RankRiseMiniChart({ trend }: { trend: number[] }) {
  // 상승 전/후 순위가 비어 있는 상품은 그릴 값이 없다
  if (!trend.length) return null;
  const W = 280, H = 76, pad = 10;
  const min = Math.min(...trend), max = Math.max(...trend);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (trend.length - 1)) * (W - pad * 2);
  // 순위가 작을수록(상위) y가 작아지게 → 상위일수록 위로
  const y = (r: number) => pad + ((r - min) / range) * (H - pad * 2);
  const pts = trend.map((r, i) => [x(i), y(r)] as const);
  const line = pts.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${x(0)},${H - pad} ${line} ${x(trend.length - 1)},${H - pad}`;
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rankRiseFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2452EB" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#2452EB" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rankRiseStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EA0F2" />
          <stop offset="100%" stopColor="#2452EB" />
        </linearGradient>
      </defs>
      {/* 기준선 */}
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#CBD9F4" strokeWidth={1} strokeDasharray="3 4" />
      <polygon points={area} fill="url(#rankRiseFill)" />
      <polyline points={line} fill="none" stroke="url(#rankRiseStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {/* 마지막 지점 후광 */}
      <circle cx={ex} cy={ey} r={7} fill="#2452EB" opacity={0.16} />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 3.8 : 2.2}
          fill={i === pts.length - 1 ? "#2452EB" : "white"} stroke="#2452EB" strokeWidth={1.6} />
      ))}
    </svg>
  );
}

/* 모바일 — 상품을 누르면 뜨는 설명 모달 (데스크톱은 오른쪽 「선택한 상품」 카드가 같은 역할) */
export default function ProductDetailModal({ item, onClose }: { item: ProductDetail; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const trend = item.trend;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${item.name} 상품 설명`}
        className="relative w-full sm:max-w-md max-h-[85vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* 헤더 */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-brand-border">
          <div
            className="h-11 w-11 rounded-full flex items-center justify-center text-white text-[16px] font-extrabold shrink-0 ring-2 ring-white shadow-md"
            style={{ background: item.bg }}
          >
            {item.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[17px] font-extrabold text-brand-dark">{item.name}</p>
              {item.sale && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-500 text-white">SALE</span>}
              {item.recommended && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-brand-primary-50 text-brand-primary">👍 추천</span>}
            </div>
            {item.desc && <p className="mt-1 text-[13px] leading-relaxed text-brand-sub whitespace-pre-wrap">{item.desc}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="h-8 w-8 -mr-1 rounded-full flex items-center justify-center shrink-0 text-brand-muted hover:bg-brand-lighter hover:text-brand-dark transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
          {/* 상품 효율 */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-brand-sub">상품 효율</span>
              <span className="inline-flex items-baseline gap-1.5">
                <span className="text-[14px] font-extrabold text-brand-dark tabular-nums">{item.efficiency}%</span>
                <span className="text-[11px] font-bold text-brand-primary">{efficiencyLabel(item.efficiency)}</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-brand-lighter overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${item.efficiency}%`, background: "linear-gradient(90deg,#2452EB,#6D5CE0,#8B5CF6)" }} />
            </div>
          </div>

          {/* 순위 상승 추이 */}
          <div className="rounded-xl bg-brand-primary-50/40 border border-brand-primary/15 p-3">
            <p className="text-[12px] leading-snug text-brand-sub mb-2">
              이 상품을 사용하신 고객님의 <span className="font-extrabold" style={{ color: "#2452EB" }}>{item.riseRate}%</span>가 순위 상승을 경험했습니다.
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-brand-sub">순위 상승 추이</span>
              <span className="text-[11px] font-bold" style={{ color: "#2452EB" }}>
                {trend.length > 0 ? `${trend[0]}위 → ${trend[trend.length - 1]}위` : "집계 준비 중"}
              </span>
            </div>
            <RankRiseMiniChart trend={trend} />
          </div>

          {/* 단가 */}
          <div className="flex items-center justify-between rounded-xl bg-brand-lighter px-3.5 py-2.5">
            <span className="text-[13px] font-semibold text-brand-sub">단가</span>
            <span className="text-[18px] font-extrabold text-brand-dark tabular-nums">{item.price}<span className="text-[12px] font-medium text-brand-sub ml-1">원</span></span>
          </div>

          {/* 구독 정보 */}
          <div className="rounded-xl border border-brand-border p-3 space-y-1.5">
            <p className="text-[12px] font-bold text-brand-dark mb-1">구독 정보</p>
            {subscriptionRows(item).map((row, i) => (
              <div key={i} className="flex items-center justify-between text-[12.5px]">
                <span className="text-brand-sub">{row.label}</span>
                {row.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[11px]">{row.badge}</span>
                ) : (
                  <span className={`font-bold ${row.highlight ? "text-red-500" : "text-brand-dark"}`}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 하단 */}
        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-white hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg,#152C9E,#2452EB)" }}
          >
            이 상품으로 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}


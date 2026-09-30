/**
 * 리워드 신청 화면 오른쪽 「선택한 상품」 카드 — 플레이스·쇼핑·쿠팡이 함께 쓴다.
 * 개발본과 같은 항목: 상품 효율 · 순위 상승 경험률 · 일 작업량 · 단가 · 당일 마감/당일 구동/최소 기간
 */
export type SelectedProduct = {
  name: string;
  desc: string;
  initial: string;
  bg: string;
  price: number;
  efficiency: number;
  riseRate: number;
  minQty: number;
  maxQty: number | null;
  orderCutoffTime: string | null;
  sameDayStart: boolean;
  minRunDays: number | null;
};

export function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

/** "13:30:00" → "13:30" */
function hhmm(t: string | null) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}`;
}

export default function SelectedProductCard({ item, className = "" }: { item: SelectedProduct | undefined; className?: string }) {
  if (!item) return null;
  const qty = item.maxQty != null ? `${item.minQty.toLocaleString()} ~ ${item.maxQty.toLocaleString()}건` : `${item.minQty.toLocaleString()}건 이상`;
  const tiles = [
    { label: "당일 마감", value: hhmm(item.orderCutoffTime) },
    { label: "당일 구동", value: item.sameDayStart ? "가능" : "불가능" },
    { label: "최소 기간", value: `${item.minRunDays ?? 1}일` },
  ];

  return (
    <section className={`bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm ${className}`}>
      {/* 그라데이션 헤더 */}
      <div className="relative px-5 pt-4 pb-5 text-white overflow-hidden" style={{ background: "var(--gradient-point)" }}>
        <div className="absolute -top-10 -right-8 w-28 h-28 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-12 -left-6 w-24 h-24 rounded-full bg-white/[0.05]" />
        <div className="relative flex items-center justify-between mb-4">
          <span className="text-[12px] font-bold text-white/60 tracking-wider">선택한 상품</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            선택됨
          </span>
        </div>
        <div className="relative flex items-center gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-[18px] font-extrabold shrink-0 ring-2 ring-white/70 shadow-lg"
            style={{ background: item.bg, color: "white" }}
          >
            {item.initial}
          </div>
          <div className="min-w-0">
            <p className="text-[19px] font-extrabold leading-tight truncate">{item.name}</p>
            <p className="text-[12px] text-white/60 truncate mt-0.5">{item.desc}</p>
          </div>
        </div>
      </div>

      {/* 본문 — 구분선으로 구획 */}
      <div className="px-5 pb-5 divide-y divide-brand-border">
        <div className="py-3.5 flex items-center justify-between">
          <span className="text-[13.5px] font-semibold text-brand-text">상품 효율</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">{item.efficiency}%</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-primary-50 text-brand-primary">{efficiencyLabel(item.efficiency)}</span>
          </span>
        </div>

        <p className="py-3.5 text-[13.5px] leading-relaxed text-brand-text">
          이 상품을 사용하신 고객님의 <b className="font-extrabold text-brand-primary">{item.riseRate}%</b>가 순위 상승을 경험했습니다.
        </p>

        <div className="py-3.5 flex items-center justify-between">
          <span className="text-[13.5px] font-semibold text-brand-text">일 작업량</span>
          <span className="text-[14px] font-extrabold text-brand-dark tabular-nums">{qty}</span>
        </div>

        <div className="pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[13.5px] font-semibold text-brand-text">
              단가 <span className="text-[12px] font-medium text-brand-muted">1건 기준</span>
            </span>
            <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">{item.price.toLocaleString()}P</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-xl bg-brand-lighter px-2 py-2.5 text-center">
                <p className="text-[11.5px] text-brand-sub">{t.label}</p>
                <p className="mt-0.5 text-[14px] font-extrabold text-brand-dark tabular-nums">{t.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

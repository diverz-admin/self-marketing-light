"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/marketing/CartContext";
import MobilePayBar from "@/components/marketing/MobilePayBar";
import PageHeader from "@/components/marketing/PageHeader";

/* ── 매체사 데이터 ── */
const MEDIA_GROUPS = [
  {
    category: "공통",
    color: "#0D3473",
    items: [
      { id: "olstar",  name: "올스타",  desc: "1일 단위 구독",  sale: true,  bg: "#1C1C2E",                                 textColor: "white", initial: "O" },
      { id: "buzzvil", name: "버즈빌",  desc: "+150여 채널",    sale: false, bg: "linear-gradient(135deg,#FF6B35,#FF4E88)", textColor: "white", initial: "B" },
      { id: "nbt",     name: "nbt",    desc: "+200여 채널",    sale: false, bg: "#111111",                                 textColor: "white", initial: "N" },
    ],
  },
  {
    category: "쿠팡 전용",
    color: "#AE0000",
    items: [
      { id: "golden",  name: "골든",   desc: "신로직 세팅",    sale: false, bg: "linear-gradient(135deg,#F59E0B,#EF4444)", textColor: "white", initial: "G" },
      { id: "randomx", name: "원람X",  desc: "+ 11타입 액션",  sale: false, bg: "linear-gradient(135deg,#374151,#1F2937)", textColor: "white", initial: "X" },
      { id: "golen",   name: "골렌",   desc: "N2갈 최적화",    sale: false, bg: "linear-gradient(135deg,#059669,#10B981)", textColor: "white", initial: "G" },
      { id: "prima",   name: "프리마", desc: "IP 디타겟팅",    sale: true,  bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", textColor: "white", initial: "P" },
    ],
  },
  {
    category: "로켓배송",
    color: "#AE0000",
    items: [
      { id: "rocket1", name: "로켓A",  desc: "로켓배송 최적화", sale: false, bg: "linear-gradient(135deg,#EF4444,#DC2626)", textColor: "white", initial: "R" },
      { id: "rocket2", name: "로켓B",  desc: "최저가 공략",     sale: true,  bg: "linear-gradient(135deg,#F97316,#DC2626)", textColor: "white", initial: "R" },
    ],
  },
];

const MEDIA_PRICES: Record<string, number> = {
  olstar: 75, buzzvil: 110, nbt: 100,
  golden: 105, randomx: 65, golen: 70, prima: 120,
  rocket1: 90, rocket2: 95,
};

const MEDIA_EFFICIENCY: Record<string, number> = {
  olstar: 63, buzzvil: 78, nbt: 72,
  golden: 76, randomx: 53, golen: 60, prima: 83,
  rocket1: 71, rocket2: 74,
};

/* ── 상품별 순위 상승 레퍼런스 (실제 데이터 추출 기준, 순위 상승률 %) ── */
const MEDIA_RISE_RATE: Record<string, number> = {
  olstar: 58, buzzvil: 73, nbt: 69,
  golden: 74, randomx: 47, golen: 57, prima: 82,
  rocket1: 68, rocket2: 71,
};

/* ── 상품별 순위 상승 추이 (실제 고객 데이터, 오래된→최근 · 숫자 작을수록 상위) ── */
const MEDIA_RANK_TREND: Record<string, number[]> = {
  olstar:  [17, 14, 12, 9, 7, 6],
  buzzvil: [18, 14, 11, 8, 5, 3],
  nbt:     [16, 13, 10, 8, 6, 4],
  golden:  [17, 13, 10, 7, 5, 3],
  randomx: [23, 20, 17, 14, 12, 11],
  golen:   [20, 17, 14, 12, 10, 9],
  prima:   [22, 16, 11, 7, 4, 2],
  rocket1: [19, 16, 13, 10, 8, 6],
  rocket2: [18, 15, 12, 9, 7, 5],
};

/* 순위 상승 추이 미니 차트 — 숫자가 작을수록(상위) 선이 위로 향함 */
function RankRiseMiniChart({ trend }: { trend: number[] }) {
  const W = 280, H = 76, pad = 10;
  const min = Math.min(...trend), max = Math.max(...trend);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (trend.length - 1)) * (W - pad * 2);
  const y = (r: number) => pad + ((r - min) / range) * (H - pad * 2);
  const pts = trend.map((r, i) => [x(i), y(r)] as const);
  const line = pts.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${x(0)},${H - pad} ${line} ${x(trend.length - 1)},${H - pad}`;
  const [ex, ey] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="rankRiseFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E6BE0" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#2E6BE0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="rankRiseStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6EA0F2" />
          <stop offset="100%" stopColor="#2E6BE0" />
        </linearGradient>
      </defs>
      {/* 기준선 */}
      <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke="#CBD9F4" strokeWidth={1} strokeDasharray="3 4" />
      <polygon points={area} fill="url(#rankRiseFill)" />
      <polyline points={line} fill="none" stroke="url(#rankRiseStroke)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      {/* 마지막 지점 후광 */}
      <circle cx={ex} cy={ey} r={7} fill="#2E6BE0" opacity={0.16} />
      {pts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === pts.length - 1 ? 3.8 : 2.2}
          fill={i === pts.length - 1 ? "#2E6BE0" : "white"} stroke="#2E6BE0" strokeWidth={1.6} />
      ))}
    </svg>
  );
}

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

/* ── Page ── */
export default function CoupangCampaignPage() {
  const { balance, addItem, spend } = useCart();
  const [selectedMedia, setSelectedMedia] = useState("buzzvil");
  const [serviceType, setServiceType] = useState<"search" | "wishlist">("search");
  const [productName, setProductName] = useState("제주 오메기떡 선물 택배 50개입");
  const [productUrl, setProductUrl] = useState("https://www.coupang.com/vp/products/");
  const [rankKeyword, setRankKeyword] = useState("오메기떡 선물세트");
  const [dailyQty, setDailyQty] = useState(100);
  const [isPending, setIsPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [instantPending, setInstantPending] = useState(false);
  const [instantPaid, setInstantPaid] = useState(false);

  const price = MEDIA_PRICES[selectedMedia] ?? 100;
  const efficiency = MEDIA_EFFICIENCY[selectedMedia] ?? 60;
  const orderAmount = dailyQty * price;
  const selectedItem = MEDIA_GROUPS.flatMap((g) => g.items).find((i) => i.id === selectedMedia);
  const insufficient = balance < orderAmount;
  const incomplete = !productUrl || !rankKeyword;

  const handleSubmit = async () => {
    if (!productUrl || !rankKeyword) { setPayError("상품 URL과 순위 상승 희망 키워드를 입력해주세요."); return; }
    if (insufficient) {
      setPayError("보유 포인트가 부족합니다. 충전 후 다시 시도해주세요.");
      return;
    }
    setPayError(null);
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 700));
    // 결제 시 즉시 포인트 차감 + 장바구니 담기
    addItem({
      platform: "쿠팡",
      name: selectedItem?.name ?? "",
      initial: selectedItem?.initial ?? "",
      bg: selectedItem?.bg ?? "#0D3473",
      textColor: selectedItem?.textColor ?? "white",
      target: productName,
      keyword: rankKeyword,
      dailyQty,
      price,
      amount: orderAmount,
    });
    setIsPending(false);
    setJustAdded(true);
    setInstantPaid(false);
  };

  // 즉시 포인트 차감하기 — 장바구니를 거치지 않고 바로 결제
  const handleInstantPay = async () => {
    if (!productUrl || !rankKeyword) { setPayError("상품 URL과 순위 상승 희망 키워드를 입력해주세요."); return; }
    if (insufficient) {
      setPayError("보유 포인트가 부족합니다. 충전 후 다시 시도해주세요.");
      return;
    }
    setPayError(null);
    setInstantPending(true);
    await new Promise((r) => setTimeout(r, 700));
    spend(orderAmount);
    setInstantPending(false);
    setInstantPaid(true);
    setJustAdded(false);
  };

  return (
    <div className="w-full space-y-5 pb-36 lg:pb-0">
      {/* 페이지 헤더 */}
      <PageHeader
        title="쿠팡 유입 캠페인 신청"
        subtitle="상품을 선택하고 캠페인 정보를 입력한 뒤 바로 신청하세요."
        iconPath={"M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"}
      />

      {/* Row 1: 매체사 선택 | 선택한 매체사 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">

        {/* ── STEP 1: 매체사 선택 ── */}
        <section className="bg-white rounded-2xl border border-brand-border px-8 py-6 space-y-5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">1</span>
            <h2 className="text-[18px] font-extrabold text-brand-dark">상품 선택</h2>
          </div>

          {MEDIA_GROUPS.map((group) => (
            <div key={group.category}>
              <p className="text-[13px] font-bold mb-2.5" style={{ color: group.color }}>{group.category}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.items.map((item) => {
                  const isSelected = selectedMedia === item.id;
                  const itemPrice = MEDIA_PRICES[item.id] ?? 100;
                  const itemEff = MEDIA_EFFICIENCY[item.id] ?? 60;
                  const itemTrend = MEDIA_RANK_TREND[item.id] ?? [18, 14, 11, 8, 5, 3];
                  const itemRate = MEDIA_RISE_RATE[item.id] ?? 60;
                  return (
                    <React.Fragment key={item.id}>
                    <button
                      onClick={() => setSelectedMedia(item.id)}
                      className={`relative rounded-2xl p-3 text-left transition-all border-2 ${
                        isSelected
                          ? "border-brand-primary shadow-[0_0_0_3px_rgba(13,52,115,0.10)] bg-white"
                          : "border-brand-border bg-white hover:border-brand-primary/40 hover:shadow-sm"
                      }`}
                    >
                      {/* SALE 리본 (좌상단) */}
                      {item.sale && (
                        <span className="absolute top-0 left-3 z-10 bg-red-500 text-white text-[9px] font-extrabold tracking-wide px-1.5 pt-1.5 pb-2 leading-none [clip-path:polygon(0_0,100%_0,100%_100%,50%_78%,0_100%)]">
                          SALE
                        </span>
                      )}
                      {/* 선택 뱃지 (우상단) */}
                      <span className="absolute top-2 right-2 z-10">
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </span>

                      {/* 로고(왼쪽) + 이름·설명(오른쪽) */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[15px] font-extrabold shrink-0 ring-2 ring-white shadow-md"
                          style={{ background: item.bg }}
                        >
                          {item.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-brand-dark truncate">{item.name}</p>
                          <p className="text-[10.5px] text-brand-sub truncate">{item.desc}</p>
                        </div>
                      </div>

                      {/* 효율 */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-brand-muted">효율</span>
                          <span className="text-[11px] font-bold text-brand-primary">{efficiencyLabel(itemEff)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-brand-lighter overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${itemEff}%`, background: "linear-gradient(90deg,#0D3473,#22C7E0)" }} />
                        </div>
                      </div>

                      {/* 단가 */}
                      <div className="mt-2 pt-2 border-t border-brand-border flex items-baseline justify-between">
                        <span className="text-[11px] text-brand-muted">단가</span>
                        <span className="text-[15px] font-extrabold text-brand-dark tabular-nums">
                          {itemPrice}<span className="text-[11px] font-medium text-brand-sub ml-0.5">원</span>
                        </span>
                      </div>
                    </button>

                    {/* 모바일 전용 — 선택 상품 상세 아코디언 */}
                    {isSelected && (
                      <div className="col-span-full lg:hidden rounded-2xl border border-brand-primary/25 bg-brand-primary-50/40 p-4 space-y-3.5">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-semibold text-brand-sub">상품 효율</span>
                            <span className="inline-flex items-baseline gap-1.5">
                              <span className="text-[14px] font-extrabold text-brand-dark tabular-nums">{itemEff}%</span>
                              <span className="text-[11px] font-bold text-brand-primary">{efficiencyLabel(itemEff)}</span>
                            </span>
                          </div>
                          <div className="h-2.5 rounded-full bg-white overflow-hidden ring-1 ring-inset ring-black/[0.04]">
                            <div className="h-full rounded-full" style={{ width: `${itemEff}%`, background: "linear-gradient(90deg,#0D3473,#6D5CE0,#8B5CF6)" }} />
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/70 border border-white p-2.5">
                          <p className="text-[12px] leading-snug text-brand-sub mb-2">
                            이 상품을 사용하신 고객님의 <span className="font-extrabold" style={{ color: "#2E6BE0" }}>{itemRate}%</span>가 순위 상승을 경험했습니다.
                          </p>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-brand-sub">순위 상승 추이</span>
                            <span className="text-[11px] font-bold" style={{ color: "#2E6BE0" }}>
                              {itemTrend[0]}위 → {itemTrend[itemTrend.length - 1]}위 <span className="text-red-500">▲{itemTrend[0] - itemTrend[itemTrend.length - 1]}</span>
                            </span>
                          </div>
                          <RankRiseMiniChart trend={itemTrend} />
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5">
                          <span className="text-[13px] font-semibold text-brand-sub">단가</span>
                          <span className="text-[18px] font-extrabold text-brand-dark tabular-nums">{itemPrice}<span className="text-[12px] font-medium text-brand-sub ml-1">원</span></span>
                        </div>
                        <div className="rounded-xl border border-brand-border bg-white p-3 space-y-1.5">
                          <p className="text-[12px] font-bold text-brand-dark mb-1">구독 정보</p>
                          {[
                            { label: "당일 접수 마감", value: "13시 30분", highlight: true },
                            { label: "당일 구동", badge: "가능" },
                            { label: "구동 기간", value: "최소 3일 이상" },
                          ].map((row, i) => (
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
                    )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* 선택한 상품 요약 (데스크톱 전용 — 모바일은 상품 아래 아코디언) */}
        <section className="hidden lg:block bg-white rounded-2xl border border-brand-border overflow-hidden shadow-sm h-full">
          {/* 그라데이션 헤더 */}
          <div className="relative px-5 pt-4 pb-5 text-white overflow-hidden" style={{ background: "linear-gradient(135deg,#0D3473 0%,#16345C 55%,#111D37 100%)" }}>
            <div className="absolute -top-10 -right-8 w-28 h-28 rounded-full bg-white/[0.06]" />
            <div className="absolute -bottom-12 -left-6 w-24 h-24 rounded-full bg-white/[0.05]" />
            <div className="relative flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-white/55 uppercase tracking-wider">선택한 상품</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                선택됨
              </span>
            </div>
            <div className="relative flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-[18px] font-extrabold shrink-0 ring-2 ring-white/25 shadow-lg"
                style={{ background: selectedItem?.bg, color: selectedItem?.textColor }}>
                {selectedItem?.initial}
              </div>
              <div className="min-w-0">
                <p className="text-[19px] font-extrabold leading-tight truncate">{selectedItem?.name}</p>
                <p className="text-[12px] text-white/55 truncate mt-0.5">{selectedItem?.desc}</p>
              </div>
            </div>
          </div>

          {/* 본문 — 원페이지 (개별 박스 없이 구분선으로 구획) */}
          <div className="p-5 divide-y divide-brand-border">
            {/* 상품 효율 */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-brand-sub">상품 효율</span>
                <span className="inline-flex items-baseline gap-1.5">
                  <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">{efficiency}%</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-primary">{efficiencyLabel(efficiency)}</span>
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-brand-lighter ring-1 ring-inset ring-black/[0.04] overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                  style={{ width: `${efficiency}%`, background: "linear-gradient(90deg,#0D3473,#6D5CE0,#8B5CF6)" }} />
              </div>
            </div>

            {/* 순위 상승 레퍼런스 */}
            {(() => {
              const trend = MEDIA_RANK_TREND[selectedMedia] ?? [18, 14, 11, 8, 5, 3];
              const startRank = trend[0];
              const nowRank = trend[trend.length - 1];
              const rate = MEDIA_RISE_RATE[selectedMedia] ?? 60;
              return (
                <div className="py-4">
                  {/* 메시지 */}
                  <div className="flex items-start gap-2.5">
                    <span className="h-8 w-8 rounded-lg bg-brand-lighter flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" style={{ color: "#2E6BE0" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8m0 0h-5m5 0v5" />
                      </svg>
                    </span>
                    <p className="text-[12.5px] leading-snug text-brand-sub pt-0.5">
                      이 상품을 사용하신 고객님의{" "}
                      <span className="font-extrabold" style={{ color: "#2E6BE0" }}>{rate}%</span>
                      가 순위 상승을 경험했습니다.
                    </p>
                  </div>

                  {/* 순위 상승 추이 차트 */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-brand-sub">순위 상승 추이</span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-brand-muted tabular-nums">{startRank}위</span>
                        <svg className="w-3 h-3 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                        </svg>
                        <span className="text-[12px] font-extrabold tabular-nums" style={{ color: "#2E6BE0" }}>{nowRank}위</span>
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-extrabold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">▲{startRank - nowRank}</span>
                      </span>
                    </div>
                    <RankRiseMiniChart trend={trend} />
                  </div>
                </div>
              );
            })()}

            {/* 단가 */}
            <div className="py-4 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-semibold text-brand-sub">단가</span>
                <span className="text-[11px] text-brand-muted">1건 기준</span>
              </div>
              <span className="text-[24px] font-extrabold text-brand-dark tabular-nums leading-none">{price}<span className="text-[14px] font-medium text-brand-sub ml-1">원</span></span>
            </div>

            {/* 구독 정보 */}
            <div className="pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-[13px] font-bold text-brand-dark">구독 정보</p>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "당일 접수 마감", value: "13시 30분", highlight: true },
                  { label: "당일 구동", badge: "가능" },
                  { label: "구동 기간", value: "최소 3일 이상" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between text-[13px]">
                    <span className="text-brand-sub">{row.label}</span>
                    {row.badge ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-bold text-[12px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />{row.badge}
                      </span>
                    ) : (
                      <span className={`font-bold ${row.highlight ? "text-red-500" : "text-brand-dark"}`}>{row.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Row 2: 캠페인 설정 | 결제 (높이 맞춤) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">

        {/* ── STEP 2: 캠페인 설정 ── */}
        <section className="bg-white rounded-2xl border border-brand-border px-8 py-6 h-full min-w-0">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">2</span>
            <h2 className="text-[18px] font-extrabold text-brand-dark">캠페인 설정</h2>
          </div>

          {/* 서비스 선택 (쿠팡 전용) */}
          <div className="mb-5">
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">서비스 선택</label>
            <div className="flex gap-3">
              {[
                {
                  id: "search", label: "검색하기",
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>,
                },
                {
                  id: "wishlist", label: "찜하기",
                  icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>,
                },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceType(s.id as "search" | "wishlist")}
                  className={`flex-1 flex items-center justify-center gap-2 h-[42px] rounded-xl border-2 transition-all ${
                    serviceType === s.id
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-brand-border text-brand-muted hover:border-brand-primary/40"
                  }`}
                >
                  {s.icon}
                  <span className="text-[13px] font-bold">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
            {/* 작업 기간 */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">작업 기간</label>
              <button className="w-full h-[42px] flex items-center gap-2 px-3 rounded-xl border border-brand-border bg-brand-lighter hover:bg-white hover:border-brand-primary transition-colors text-brand-sub text-[14px]">
                <svg className="w-4 h-4 text-brand-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                날짜 선택
              </button>
              <p className="text-[12px] text-red-500 mt-1.5">* 주말 접수 시 구동 시작일은 평일로 설정해주세요.</p>
            </div>

            {/* 일 작업량 */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">일 작업량</label>
              <input
                type="number"
                value={dailyQty}
                onChange={(e) => setDailyQty(Number(e.target.value))}
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[16px] font-bold text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
              <p className="text-[12px] text-brand-muted mt-1.5">단가 {price.toLocaleString()}원 · 일 {dailyQty.toLocaleString()}회</p>
            </div>

            {/* 순위 상승 희망 키워드 */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">순위 상승 희망 키워드</label>
              <input
                value={rankKeyword}
                onChange={(e) => setRankKeyword(e.target.value)}
                placeholder="예) 오메기떡 선물세트"
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>

            {/* 상품 URL */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">상품 URL <span className="text-[12px] font-medium text-red-500">* 쿠팡 상품 URL</span></label>
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://www.coupang.com/vp/products/..."
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[14px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>

          </div>
        </section>

        {/* 결제 */}
        <section className="bg-white rounded-2xl border border-brand-border p-5 h-full flex flex-col">
          <h3 className="text-[15px] font-extrabold text-brand-dark mb-3">결제</h3>
          {/* 쿠폰 받기 */}
          <button type="button" className="w-full flex items-center justify-between rounded-xl border border-brand-border bg-brand-lighter px-3.5 py-3 mb-3 hover:border-brand-primary/40 transition-colors">
            <span className="text-[13px] font-medium text-brand-dark">받지 않은 쿠폰이 더 있어요</span>
            <span className="inline-flex items-center gap-1 text-[13px] font-bold text-red-500">
              쿠폰 받기
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></svg>
            </span>
          </button>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-sub">보유 포인트</span>
              <span className="text-[15px] font-bold text-brand-dark tabular-nums">{balance.toLocaleString()} P</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-sub">주문 금액</span>
              <span className="text-[15px] font-bold text-brand-dark tabular-nums">{orderAmount.toLocaleString()} 원</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-brand-sub">할인 금액</span>
              <span className="text-[15px] font-bold text-red-500 tabular-nums">-0 원</span>
            </div>
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-brand-border">
              <span className="text-[14px] font-bold text-brand-dark">결제 금액</span>
              <span className="text-[22px] font-extrabold text-brand-primary tabular-nums">{orderAmount.toLocaleString()}<span className="text-[14px] font-medium text-brand-sub ml-1">원</span></span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-brand-muted">결제 후 예상 잔액</span>
              <span className={`font-bold tabular-nums ${insufficient ? "text-red-500" : "text-brand-sub"}`}>{Math.max(0, balance - orderAmount).toLocaleString()} P</span>
            </div>
          </div>

          {payError && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[12px] font-semibold text-red-600">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              {payError}
            </div>
          )}

            {/* 즉시 포인트 차감하기 (바로 결제) */}
            {incomplete && <p className="hidden lg:block text-[12px] font-semibold text-red-500 mt-3 -mb-1">캠페인 정보를 모두 입력해주세요</p>}
            <div className="hidden lg:grid grid-cols-[1.5fr_1fr] gap-2.5 mt-4">
            <button
              onClick={handleInstantPay}
              disabled={isPending || instantPending || incomplete}
              className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:shadow-none cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}
            >
              {instantPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  결제 처리 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  즉시 포인트 차감하기
                </>
              )}
            </button>

            {/* 장바구니 담기 */}
            <button
              onClick={handleSubmit}
              disabled={isPending || instantPending || incomplete}
              className="w-full py-3.5 rounded-xl text-[15px] font-extrabold border-2 border-brand-primary text-brand-primary bg-white hover:bg-brand-primary/5 transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  담는 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                  </svg>
                  장바구니
                </>
              )}
            </button>

          </div>
          {justAdded && (
            <Link href="/marketing/cart" className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3 hover:bg-green-100/60 transition-colors">
              <span className="h-6 w-6 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-green-700 leading-tight">장바구니에 담겼습니다</p>
                <p className="text-[11px] text-green-600/80">포인트가 즉시 차감되었습니다</p>
              </div>
              <span className="text-[13px] font-bold text-green-700 whitespace-nowrap">장바구니 →</span>
            </Link>
          )}
            {instantPaid && (
              <Link href="/marketing/my/campaigns" className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3 hover:bg-green-100/60 transition-colors">
                <span className="h-6 w-6 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-green-700 leading-tight">결제가 완료되었습니다</p>
                  <p className="text-[11px] text-green-600/80">포인트가 즉시 차감되고 캠페인이 등록되었습니다</p>
                </div>
                <span className="text-[13px] font-bold text-green-700 whitespace-nowrap">주문내역 →</span>
              </Link>
            )}
        </section>
      </div>


      {/* 모바일 하단 고정 결제 바 + 시트 */}
      <MobilePayBar
        orderAmount={orderAmount}
        balance={balance}
        insufficient={insufficient}
        isPending={isPending}
        instantPending={instantPending}
        onInstantPay={handleInstantPay}
        onAddToCart={handleSubmit}
        payError={payError}
        disabled={incomplete}
      />
    </div>
  );
}

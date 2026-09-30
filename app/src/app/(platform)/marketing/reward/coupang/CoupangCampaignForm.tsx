"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/marketing/CartContext";
import { CartAddedModal, CartSummaryCard, MobileCartBar } from "@/components/marketing/CartAddPanel";
import PageHeader from "@/components/marketing/PageHeader";
import SelectedProductCard from "@/components/marketing/SelectedProductCard";
import { CampaignScheduleFields, useCampaignSchedule, subscriptionRows } from "@/components/marketing/CampaignScheduleFields";

/* 상품은 어드민 "리워드 상품등록"(products, category=reward_coupang)에서 내려온다 */
export type RewardProduct = {
  id: string;
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

export type RewardGroup = { category: string; color: string; items: RewardProduct[] };


/* 순위 상승 추이 미니 차트 — 숫자가 작을수록(상위) 선이 위로 향함 */
function RankRiseMiniChart({ trend }: { trend: number[] }) {
  // 상승 전/후 순위가 비어 있는 상품은 그릴 값이 없다
  if (!trend.length) return null;
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

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

/* ── Page ── */
export default function CoupangCampaignForm({ groups, today }: { groups: RewardGroup[]; today: string }) {
  const allItems = groups.flatMap((g) => g.items);
  const { items, addItem } = useCart();
  const [selectedMedia, setSelectedMedia] = useState(allItems[0]?.id ?? "");
  const [serviceType, setServiceType] = useState<"search" | "wishlist">("search");
  // 입력 UI 없이 고정으로 쓰는 예시 값 (쇼핑 신청 화면과 동일한 구성)
  // 빈 칸으로 시작한다 — 예시 값을 채워 두면 그대로 신청되는 일이 생긴다
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [rankKeyword, setRankKeyword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [addedOpen, setAddedOpen] = useState(false);

  const selectedItem = allItems.find((i) => i.id === selectedMedia);
  const price = selectedItem?.price ?? 0;
  // 일정 규칙은 고른 상품이 정한다 (어드민 상품등록 › 구독 정보)
  const limits = {
    minDaily: selectedItem?.minQty ?? 1,
    maxDaily: selectedItem?.maxQty ?? null,
    minDays: selectedItem?.minRunDays ?? 1,
    cutoffTime: selectedItem?.orderCutoffTime ?? null,
    sameDayStart: selectedItem?.sameDayStart ?? false,
  };
  const schedule = useCampaignSchedule(today, limits);
  const { startDate, days, dailyQty } = schedule;

  // 기간이 금액에 들어간다 — 이전에는 일 작업량만 곱해 며칠을 돌리든 금액이 같았다
  const orderAmount = dailyQty * days * price;
  const incomplete = !productName || !productUrl || !rankKeyword || !schedule.ready;

  // 담기만 한다 — 주문·결제는 장바구니에서 (개발본과 같은 흐름)
  const handleAddToCart = async () => {
    if (!schedule.ready || !startDate) return setPayError("작업 시작일을 선택해 주세요");
    if (!rankKeyword.trim()) return setPayError("메인 키워드를 입력해 주세요");
    if (!productUrl.trim()) return setPayError("상품 URL을 입력해 주세요");
    if (!productName.trim()) return setPayError("상품명을 직접 입력해 주세요");
    if (limits.maxDaily != null && dailyQty > limits.maxDaily) return setPayError(`최대 ${limits.maxDaily}건까지만 가능합니다.`);
    if (dailyQty < limits.minDaily) return setPayError(`최소 ${limits.minDaily}건 이상 설정 부탁드립니다.`);
    if (days < limits.minDays) return setPayError(`최소 구동기간 ${limits.minDays}일 이상 설정 부탁드립니다.`);
    setPayError(null);
    setIsPending(true);
    addItem({
      productId: selectedMedia,
      platform: "쿠팡",
      name: selectedItem?.name ?? "",
      initial: selectedItem?.initial ?? "",
      bg: selectedItem?.bg ?? "#2452EB",
      textColor: "white",
      target: productName.trim(),
      keyword: rankKeyword.trim(),
      dailyQty,
      price,
      amount: orderAmount,
      channel: "coupang",
      days,
      startDate,
      url: productUrl.trim(),
      serviceType,
    });
    setIsPending(false);
    setAddedOpen(true);
  };

  return (
    <div className="w-full space-y-5 pb-4 lg:pb-0">
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

          {groups.map((group) => (
            <div key={group.category}>
              <p className="text-[13px] font-bold mb-2.5" style={{ color: group.color }}>{group.category}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.items.map((item) => {
                  const isSelected = selectedMedia === item.id;
                  const itemPrice = item.price;
                  const itemEff = item.efficiency;
                  const itemTrend = item.trend;
                  const itemRate = item.riseRate;
                  return (
                    <React.Fragment key={item.id}>
                    <button
                      onClick={() => setSelectedMedia(item.id)}
                      className={`relative rounded-2xl p-3 text-left transition-all border-2 ${
                        isSelected
                          ? "border-brand-primary shadow-[0_0_0_3px_rgba(36,82,235,0.10)] bg-white"
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
                          <div className="h-full rounded-full" style={{ width: `${itemEff}%`, background: "linear-gradient(90deg,#2452EB,#22C7E0)" }} />
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
                            <div className="h-full rounded-full" style={{ width: `${itemEff}%`, background: "linear-gradient(90deg,#2452EB,#6D5CE0,#8B5CF6)" }} />
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/70 border border-white p-2.5">
                          <p className="text-[12px] leading-snug text-brand-sub mb-2">
                            이 상품을 사용하신 고객님의 <span className="font-extrabold" style={{ color: "#2452EB" }}>{itemRate}%</span>가 순위 상승을 경험했습니다.
                          </p>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-brand-sub">순위 상승 추이</span>
                            <span className="text-[11px] font-bold" style={{ color: "#2452EB" }}>
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
                    )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* 선택한 상품 요약 (데스크톱 전용 — 모바일은 상품 아래 아코디언) */}
        <SelectedProductCard item={selectedItem} className="hidden lg:block self-start sticky top-4" />
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
            <CampaignScheduleFields schedule={schedule} today={today} unitPrice={price} limits={limits} />

            {/* 순위 상승 희망 키워드 */}
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">메인 키워드<span className="text-red-500 ml-0.5">*</span></label>
              <input
                value={rankKeyword}
                onChange={(e) => setRankKeyword(e.target.value)}
                placeholder="예: 오메기떡 선물세트"
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-[15px]"
              />
            </div>

            {/* 상품 URL */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">
                상품 URL<span className="text-red-500 ml-0.5">*</span>
                <span className="text-[12px] font-medium text-brand-muted ml-1">쿠팡 상품 URL</span>
              </label>
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://www.coupang.com/vp/products/..."
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-[14px]"
              />
            </div>

            {/* 상품명 — URL만으로는 어드민이 어느 상품인지 못 알아본다 */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">
                상품명<span className="text-red-500 ml-0.5">*</span>
                <span className="text-[12px] font-medium text-brand-muted ml-1">링크에서 자동 · 직접 수정 가능</span>
              </label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="링크를 넣으면 자동으로 채워집니다"
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all text-[14px]"
              />
            </div>
          </div>
        </section>

        {/* 결제 */}
        <CartSummaryCard
          productName={selectedItem?.name ?? ""}
          dailyQty={dailyQty}
          days={days}
          unitPrice={price}
          pending={isPending}
          error={payError}
          missing={incomplete ? "캠페인 정보를 모두 입력해주세요" : null}
          onAdd={handleAddToCart}
        />
      </div>


      {/* 신청 뒤 어디서 보는지 — 개발본과 같이 한 줄로 알린다 */}
      <p className="text-[13px] text-brand-sub">
        신청한 캠페인은{" "}
        <Link href="/marketing/reward/coupang/manage" className="font-bold text-brand-primary hover:underline">
          [상위노출] 캠페인 관리
        </Link>
        에서 확인할 수 있습니다.
      </p>

      {/* 모바일 하단 고정 — 예상 금액 + 담기 */}
      <MobileCartBar amount={orderAmount} pending={isPending} onAdd={handleAddToCart} />

      {addedOpen && (
        <CartAddedModal label={selectedItem?.name ?? ""} count={items.length} onMore={() => setAddedOpen(false)} />
      )}
    </div>
  );
}

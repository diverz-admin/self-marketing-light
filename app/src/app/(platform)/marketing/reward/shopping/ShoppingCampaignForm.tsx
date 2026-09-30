"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/marketing/CartContext";
import { CartAddedModal, CartSummaryCard, MobileCartBar } from "@/components/marketing/CartAddPanel";
import PageHeader from "@/components/marketing/PageHeader";
import SelectedProductCard from "@/components/marketing/SelectedProductCard";
import ProductDetailModal from "@/components/marketing/ProductDetailModal";
import { CampaignScheduleFields, useCampaignSchedule } from "@/components/marketing/CampaignScheduleFields";

/* 상품은 어드민 "리워드 상품등록"(products, category=reward_shopping)에서 내려온다 */
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

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

/* ── Page ── */
export default function ShoppingCampaignForm({ groups, today }: { groups: RewardGroup[]; today: string }) {
  const allItems = groups.flatMap((g) => g.items);
  const { items, addItem } = useCart();
  const [selectedMedia, setSelectedMedia] = useState(allItems[0]?.id ?? "");
  // 입력 UI 없이 고정으로 쓰는 예시 값 (플레이스 신청 화면과 동일한 구성)
  // 빈 칸으로 시작한다 — 예시 값을 채워 두면 그대로 신청되는 일이 생긴다
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [rankKeyword, setRankKeyword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [addedOpen, setAddedOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

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
    if (!productUrl.trim()) return setPayError("상품 링크를 입력해 주세요");
    if (!productName.trim()) return setPayError("상품명을 입력해 주세요");
    if (limits.maxDaily != null && dailyQty > limits.maxDaily) return setPayError(`최대 ${limits.maxDaily}건까지만 가능합니다.`);
    if (dailyQty < limits.minDaily) return setPayError(`최소 ${limits.minDaily}건 이상 설정 부탁드립니다.`);
    if (days < limits.minDays) return setPayError(`최소 구동기간 ${limits.minDays}일 이상 설정 부탁드립니다.`);
    setPayError(null);
    setIsPending(true);
    addItem({
      productId: selectedMedia,
      platform: "네이버 쇼핑",
      name: selectedItem?.name ?? "",
      initial: selectedItem?.initial ?? "",
      bg: selectedItem?.bg ?? "#2452EB",
      textColor: "white",
      target: productName.trim(),
      keyword: rankKeyword.trim(),
      dailyQty,
      price,
      amount: orderAmount,
      channel: "shopping",
      days,
      startDate,
      url: productUrl.trim(),
    });
    setIsPending(false);
    setAddedOpen(true);
  };

  return (
    <div className="w-full space-y-5 pb-4 lg:pb-0">
      {/* breadcrumb */}
      {/* 페이지 헤더 */}
      <PageHeader
        title="네이버 쇼핑 유입 캠페인 신청"
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
                  return (
                    <React.Fragment key={item.id}>
                    <button
                      onClick={() => {
                        setSelectedMedia(item.id);
                        // 모바일은 오른쪽 「선택한 상품」 카드가 없어 설명을 모달로 띄운다
                        if (window.matchMedia("(max-width: 1023px)").matches) setDetailOpen(true);
                      }}
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

      {detailOpen && selectedItem && (
        <ProductDetailModal item={selectedItem} onClose={() => setDetailOpen(false)} />
      )}

      {/* Row 2: 캠페인 설정 | 결제 (높이 맞춤) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">

        {/* ── STEP 2: 캠페인 설정 ── */}
        <section className="bg-white rounded-2xl border border-brand-border px-8 py-6 h-full min-w-0">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">2</span>
            <h2 className="text-[18px] font-extrabold text-brand-dark">캠페인 설정</h2>
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
                <span className="text-[12px] font-medium text-brand-muted ml-1">스마트스토어 상품 URL</span>
              </label>
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://smartstore.naver.com/..."
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
        <Link href="/marketing/reward/shopping/manage" className="font-bold text-brand-primary hover:underline">
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

"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ── 매체사 데이터 ── */
const MEDIA_GROUPS = [
  {
    category: "공통",
    color: "#0D3473",
    items: [
      { id: "olstar",  name: "올스타",  desc: "1일 단위 구독",  sale: true,  bg: "#1C1C2E",                                 textColor: "white", initial: "O" },
      { id: "aura",    name: "아우라",  desc: "신규오파일",     sale: true,  bg: "linear-gradient(135deg,#667eea,#764ba2)", textColor: "white", initial: "A" },
      { id: "buzzvil", name: "버즈빌",  desc: "+150여 채널",    sale: false, bg: "linear-gradient(135deg,#FF6B35,#FF4E88)", textColor: "white", initial: "B" },
      { id: "nbt",     name: "nbt",    desc: "+200여 채널",    sale: false, bg: "#111111",                                 textColor: "white", initial: "N" },
    ],
  },
];

const MEDIA_PRICES: Record<string, number> = {
  olstar: 80, aura: 90, buzzvil: 120, nbt: 110,
  seven: 100, andrew: 95, gamgyul: 85, prima: 130, golden: 115,
  randomx: 70, golen: 75,
};

const MEDIA_EFFICIENCY: Record<string, number> = {
  olstar: 65, aura: 70, buzzvil: 80, nbt: 75,
  seven: 60, andrew: 72, gamgyul: 68, prima: 85, golden: 78,
  randomx: 55, golen: 62,
};

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

/* ── 상품 순위 (전체 표시 순서 기준) ── */
const RANK_BY_ID: Record<string, number> = {};
MEDIA_GROUPS.flatMap((g) => g.items).forEach((it, i) => {
  RANK_BY_ID[it.id] = i + 1;
});

/* ── Page ── */
export default function ShoppingCampaignPage() {
  const [selectedMedia, setSelectedMedia] = useState("buzzvil");
  const [productName, setProductName] = useState("제주 오메기떡 선물 택배 50개입");
  const [productUrl, setProductUrl] = useState("https://smartstore.naver.com/");
  const [rankKeyword, setRankKeyword] = useState("오메기떡 선물세트");
  const [dailyQty, setDailyQty] = useState(100);
  const [aiToggle, setAiToggle] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const price = MEDIA_PRICES[selectedMedia] ?? 100;
  const efficiency = MEDIA_EFFICIENCY[selectedMedia] ?? 60;
  const orderAmount = dailyQty * price;
  const selectedItem = MEDIA_GROUPS.flatMap((g) => g.items).find((i) => i.id === selectedMedia);

  const handleSubmit = async () => {
    if (!productName || !productUrl || !rankKeyword) return;
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsPending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-brand-border p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-green-50 mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">캠페인 등록 완료</h2>
          <p className="text-[16px] text-brand-sub mb-8">검수 후 1~2일 내 캠페인이 시작됩니다.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketing/my/campaigns" className="px-5 py-3 rounded-2xl text-[16px] font-bold bg-brand-primary text-white">
              주문내역 확인
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-3 rounded-2xl text-[16px] font-bold bg-brand-lighter text-brand-text border border-brand-border cursor-pointer"
            >
              새 캠페인 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">네이버 쇼핑 유입</span>
      </nav>

      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-[24px] font-extrabold text-brand-dark tracking-tight">네이버 쇼핑 유입 캠페인 신청</h1>
        <p className="text-[15px] text-brand-sub mt-1">매체사를 선택하고 캠페인 정보를 입력한 뒤 바로 신청하세요.</p>
      </div>

      {/* Row 1: 매체사 선택 | 선택한 매체사 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">

        {/* ── STEP 1: 매체사 선택 ── */}
        <section className="bg-white rounded-2xl border border-brand-border p-6 space-y-5 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">1</span>
            <h2 className="text-[18px] font-extrabold text-brand-dark">매체사 선택</h2>
          </div>

          {MEDIA_GROUPS.map((group) => (
            <div key={group.category}>
              <p className="text-[13px] font-bold mb-2.5" style={{ color: group.color }}>{group.category}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {group.items.map((item) => {
                  const isSelected = selectedMedia === item.id;
                  const itemPrice = MEDIA_PRICES[item.id] ?? 100;
                  const itemEff = MEDIA_EFFICIENCY[item.id] ?? 60;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMedia(item.id)}
                      className={`relative rounded-2xl p-4 text-left transition-all border-2 ${
                        isSelected
                          ? "border-brand-primary shadow-[0_0_0_3px_rgba(13,52,115,0.10)] bg-white"
                          : "border-brand-border bg-white hover:border-brand-primary/40 hover:shadow-sm"
                      }`}
                    >
                      {/* 뱃지: SALE(좌) / 선택(우) */}
                      {item.sale && (
                        <span className="absolute top-2 left-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-500 text-white z-10">
                          SALE
                        </span>
                      )}
                      <span className="absolute top-2 right-2 z-10">
                        {isSelected && (
                          <span className="h-5 w-5 rounded-full bg-brand-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </span>

                      {/* 아바타 + 이름 */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-[16px] font-extrabold shrink-0 tabular-nums"
                          style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)", boxShadow: "0 2px 8px rgba(13,52,115,0.25)" }}
                        >
                          {RANK_BY_ID[item.id]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-brand-dark truncate">{item.name}</p>
                          <p className="text-[11px] text-brand-sub truncate">{item.desc}</p>
                        </div>
                      </div>

                      {/* 효율 */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-brand-muted">효율</span>
                          <span className="text-[11px] font-bold text-brand-primary">{efficiencyLabel(itemEff)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-brand-lighter overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${itemEff}%`, background: "linear-gradient(90deg,#0D3473,#22C7E0)" }} />
                        </div>
                      </div>

                      {/* 단가 */}
                      <div className="mt-2.5 pt-2.5 border-t border-brand-border flex items-baseline justify-between">
                        <span className="text-[11px] text-brand-muted">단가</span>
                        <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">
                          {itemPrice}<span className="text-[11px] font-medium text-brand-sub ml-0.5">원</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        {/* 선택한 매체사 요약 */}
        <section className="bg-white rounded-2xl border border-brand-border p-5 space-y-4 h-full">
          <h3 className="text-[15px] font-extrabold text-brand-dark">선택한 매체사</h3>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full flex items-center justify-center text-[16px] font-extrabold shrink-0"
              style={{ background: selectedItem?.bg, color: selectedItem?.textColor }}>
              {selectedItem?.initial}
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-bold text-brand-dark truncate">{selectedItem?.name}</p>
              <p className="text-[12px] text-brand-sub truncate">{selectedItem?.desc}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-brand-border">
            <span className="text-[14px] text-brand-sub">가격</span>
            <span className="text-[20px] font-extrabold text-brand-dark tabular-nums">{price}<span className="text-[14px] font-medium text-brand-sub ml-1">원</span></span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] text-brand-sub">매체 효율</span>
              <span className="text-[13px] font-bold text-brand-primary">{efficiencyLabel(efficiency)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-brand-lighter overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${efficiency}%`, background: "linear-gradient(90deg,#0D3473,#8B5CF6)" }} />
            </div>
          </div>
          <div className="rounded-2xl border border-brand-border bg-brand-lighter p-4 space-y-1.5">
            <p className="text-[13px] font-bold text-brand-sub mb-1">구독 정보</p>
            {[
              { label: "당일 접수 마감", value: "13시 30분", highlight: true },
              { label: "당일 구동", badge: "가능" },
              { label: "구동 기간", value: "최소 3일 이상" },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2 text-[13px]">
                <span className="text-brand-muted">-</span>
                <span className="text-brand-sub">{row.label} :</span>
                {row.badge ? (
                  <span className="px-2 py-0.5 rounded-full bg-brand-primary text-white font-bold text-[12px]">{row.badge}</span>
                ) : (
                  <span className={`font-semibold ${row.highlight ? "text-red-500" : "text-brand-dark"}`}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Row 2: 캠페인 설정 | 결제 (높이 맞춤) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">

        {/* ── STEP 2: 캠페인 설정 ── */}
        <section className="bg-white rounded-2xl border border-brand-border p-6 h-full min-w-0">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">2</span>
            <h2 className="text-[18px] font-extrabold text-brand-dark">캠페인 설정</h2>
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

            {/* 상품명 */}
            <div>
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">상품명</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="예) 제주 오메기떡 선물 택배 50개입"
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
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

            {/* 상품 URL (full width) */}
            <div className="sm:col-span-2">
              <label className="block text-[13px] font-bold text-brand-dark mb-1.5">상품 URL <span className="text-[12px] font-medium text-red-500">* 스마트스토어 또는 쿠팡 상품 URL</span></label>
              <input
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://smartstore.naver.com/..."
                className="w-full h-[42px] px-3 border border-brand-border rounded-xl text-[14px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
              />
            </div>

            {/* 작업 세팅 키워드 토글 (full width) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between rounded-xl border border-brand-border bg-brand-lighter px-4 py-3">
                <div>
                  <p className="text-[14px] font-bold text-brand-dark">AI 키워드 자동 세팅</p>
                  <p className="text-[12px] text-brand-sub mt-0.5">최적의 키워드를 자동으로 설정합니다</p>
                </div>
                <button
                  onClick={() => setAiToggle((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${aiToggle ? "bg-brand-primary" : "bg-brand-border"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform ${aiToggle ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              </div>
              {aiToggle && (
                <div className="mt-3 rounded-2xl p-3.5 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg,#0D3473 0%,#16345C 45%,#111D37 100%)" }}>
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-[18px]">🤖</div>
                  <div>
                    <p className="text-[15px] font-extrabold leading-tight">AI 키워드 자동 세팅 작동중</p>
                    <p className="text-[12px] text-white/70 mt-0.5">최적의 키워드를 자동으로 설정합니다</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 결제 */}
        <section className="bg-white rounded-2xl border border-brand-border p-5 h-full flex flex-col">
          <h3 className="text-[15px] font-extrabold text-brand-dark mb-3">결제</h3>
          <div className="space-y-2">
            {[
              { label: "할인 적용", value: "쿠폰 확인", valueClass: "text-brand-primary text-[13px] font-bold cursor-pointer underline" },
              { label: "보유 금액", value: "11,500 원", valueClass: "text-[15px] font-bold text-brand-dark tabular-nums" },
              { label: "주문 금액", value: `${orderAmount.toLocaleString()} 원`, valueClass: "text-[15px] font-bold text-brand-dark tabular-nums" },
              { label: "할인 금액", value: "-0 원", valueClass: "text-[15px] font-bold text-red-500 tabular-nums" },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">{row.label}</span>
                <span className={row.valueClass}>{row.value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-brand-border">
              <span className="text-[14px] font-bold text-brand-dark">결제 금액</span>
              <span className="text-[22px] font-extrabold text-brand-primary tabular-nums">{orderAmount.toLocaleString()}<span className="text-[14px] font-medium text-brand-sub ml-1">원</span></span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || !productName || !productUrl || !rankKeyword}
            className="mt-auto w-full py-3.5 rounded-xl text-[16px] font-extrabold text-white bg-brand-dark hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {isPending ? "등록 중..." : "캠페인 등록 / 결제"}
          </button>
        </section>
      </div>
    </div>
  );
}

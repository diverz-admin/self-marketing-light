"use client";

import React, { useState } from "react";
import Link from "next/link";

/* ── 매체사 데이터 ── */
const MEDIA_GROUPS = [
  {
    category: "공통",
    color: "#0D3473",
    items: [
      { id: "olstar",  name: "올스타",  desc: "1일 단위 구독",  sale: true,  bg: "#1C1C2E",                                 initial: "O" },
      { id: "aura",    name: "아우라",  desc: "신규오파일",     sale: true,  bg: "linear-gradient(135deg,#667eea,#764ba2)", initial: "A" },
      { id: "buzzvil", name: "버즈빌",  desc: "+150여 채널",    sale: false, bg: "linear-gradient(135deg,#FF6B35,#FF4E88)", initial: "B" },
      { id: "nbt",     name: "nbt",    desc: "+200여 채널",    sale: false, bg: "#111111",                                 initial: "N" },
    ],
  },
  {
    category: "쿠팡 전용",
    color: "#F97316",
    items: [
      { id: "golden",  name: "골든",   desc: "신로직 세팅",    sale: false, bg: "linear-gradient(135deg,#F59E0B,#EF4444)", initial: "G",  bookmarked: true },
      { id: "randomx", name: "원람X",  desc: "+ 11타입 액션",  sale: false, bg: "linear-gradient(135deg,#374151,#1F2937)", initial: "X",  bookmarked: true },
      { id: "golen",   name: "골렌",   desc: "N2갈 최적화",    sale: false, bg: "linear-gradient(135deg,#059669,#10B981)", initial: "G",  bookmarked: true },
      { id: "prima",   name: "프리마", desc: "IP 디타겟팅",    sale: true,  bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", initial: "P",  bookmarked: true },
    ],
  },
  {
    category: "로켓배송",
    color: "#EF4444",
    items: [
      { id: "rocket1", name: "로켓A",  desc: "로켓배송 최적화", sale: false, bg: "linear-gradient(135deg,#EF4444,#DC2626)", initial: "R" },
      { id: "rocket2", name: "로켓B",  desc: "최저가 공략",     sale: true,  bg: "linear-gradient(135deg,#F97316,#DC2626)", initial: "R", bookmarked: true },
    ],
  },
];

const MEDIA_PRICES: Record<string, number> = {
  olstar: 75, aura: 85, buzzvil: 110, nbt: 100,
  golden: 105, randomx: 65, golen: 70, prima: 120,
  rocket1: 90, rocket2: 95,
};

const MEDIA_EFFICIENCY: Record<string, number> = {
  olstar: 63, aura: 68, buzzvil: 78, nbt: 72,
  golden: 76, randomx: 53, golen: 60, prima: 83,
  rocket1: 71, rocket2: 74,
};

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

export default function CoupangCampaignPage() {
  const [selectedMedia, setSelectedMedia] = useState("buzzvil");
  const [serviceType, setServiceType] = useState<"search" | "wishlist">("search");
  const [productName, setProductName] = useState("제주 오메기떡 선물 택배 50개입");
  const [productUrl, setProductUrl] = useState("https://www.coupang.com/vp/products/");
  const [rankKeyword, setRankKeyword] = useState("오메기떡 선물세트");
  const [dailyQty, setDailyQty] = useState(100);
  const [aiToggle, setAiToggle] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const price = MEDIA_PRICES[selectedMedia] ?? 100;
  const efficiency = MEDIA_EFFICIENCY[selectedMedia] ?? 60;
  const orderAmount = dailyQty * price;

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
    <div className="w-full space-y-4">
      <nav className="flex items-center gap-1.5 text-[15px] text-brand-sub">
        <Link href="/marketing" className="hover:text-brand-text">대시보드</Link>
        <span>›</span>
        <span className="text-brand-text font-medium">쿠팡 유입</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_260px_1fr] gap-4 items-start">

        {/* ── Panel 1: 매체사 선택 ── */}
        <div className="bg-white rounded-2xl border border-brand-border p-4 space-y-4">
          <h2 className="text-[17px] font-extrabold text-brand-dark">매체사 선택</h2>

          {MEDIA_GROUPS.map((group) => (
            <div key={group.category}>
              <p className="text-[13px] font-bold mb-2" style={{ color: group.color }}>{group.category}</p>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => {
                  const isSelected = selectedMedia === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMedia(item.id)}
                      className={`relative rounded-2xl p-3 text-left transition-all border-2 ${
                        isSelected
                          ? "border-brand-primary shadow-md"
                          : "border-brand-border hover:border-brand-primary/40 bg-brand-lighter"
                      }`}
                    >
                      {item.sale && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-500 text-white z-10">
                          SALE
                        </span>
                      )}
                      {"bookmarked" in item && item.bookmarked && (
                        <span className="absolute top-1.5 right-1.5 z-10">
                          <svg className="w-3.5 h-3.5 fill-brand-primary text-brand-primary" viewBox="0 0 24 24">
                            <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
                          </svg>
                        </span>
                      )}
                      <div
                        className="h-10 w-10 rounded-full flex items-center justify-center text-[16px] font-extrabold text-white mb-2 mx-auto"
                        style={{ background: item.bg }}
                      >
                        {item.initial}
                      </div>
                      <p className="text-[15px] font-bold text-brand-dark text-center truncate">{item.name}</p>
                      <p className="text-[11px] text-brand-sub text-center truncate mt-0.5">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Panel 2: 서비스 선택 ── */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5">
          <h2 className="text-[17px] font-extrabold text-brand-dark">서비스 선택</h2>

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
                className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl border-2 transition-all ${
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

          <div className="flex items-center justify-between py-3 border-t border-brand-border">
            <span className="text-[16px] text-brand-sub">가격</span>
            <span className="text-[22px] font-extrabold text-brand-dark">
              {price}<span className="text-[15px] font-medium text-brand-sub ml-1">원</span>
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[16px] text-brand-sub">매체 효율</span>
              <span className="text-[13px] font-bold text-brand-primary">{efficiencyLabel(efficiency)}</span>
            </div>
            <div className="h-3 rounded-full bg-brand-lighter overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${efficiency}%`, background: "linear-gradient(90deg,#F97316,#EF4444)" }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-lighter p-4 space-y-2.5">
            <p className="text-[13px] font-bold text-brand-sub">구독 정보</p>
            <p className="text-[15px] text-brand-dark font-medium">모든 트래픽 구독 시작일은 평일로 설정해주세요.</p>
            <div className="space-y-1.5">
              {[
                { label: "당일 접수 마감", value: "13시 30분", red: true },
                { label: "당일 구동",     badge: "가능" },
                { label: "구동 기간",     value: "최소 3일 이상" },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className="text-brand-muted">-</span>
                  <span className="text-brand-sub">{row.label} :</span>
                  {row.badge ? (
                    <span className="px-2 py-0.5 rounded-full bg-brand-primary text-white font-bold text-[12px]">{row.badge}</span>
                  ) : (
                    <span className={`font-semibold ${row.red ? "text-red-500" : "text-brand-dark"}`}>{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Panel 3: 캠페인 설정 + 결제 ── */}
        <div className="bg-white rounded-2xl border border-brand-border p-5 space-y-5 sticky top-8 self-start">
          <h2 className="text-[17px] font-extrabold text-brand-dark">캠페인 설정</h2>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">작업 기간</label>
            <p className="text-[12px] text-red-500 mb-2">* 주말 접수시 구동 시작일은 반드시 평일로 설정해주세요.</p>
            <button className="h-8 w-8 flex items-center justify-center rounded-xl border border-brand-border hover:bg-brand-lighter transition-colors">
              <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">일 작업량</label>
            <input
              type="number"
              value={dailyQty}
              onChange={(e) => setDailyQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[16px] font-bold text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">상품명</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예) 제주 오메기떡 선물 택배 50개입"
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1">상품 URL</label>
            <p className="text-[12px] text-red-500 mb-1.5">* 쿠팡 상품 URL을 입력해주세요.</p>
            <input
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://www.coupang.com/vp/products/..."
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[13px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">순위 상승 희망 키워드</label>
            <input
              value={rankKeyword}
              onChange={(e) => setRankKeyword(e.target.value)}
              placeholder="예) 오메기떡 선물세트"
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-brand-dark">작업 세팅 키워드</label>
            <button
              onClick={() => setAiToggle((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${aiToggle ? "bg-brand-primary" : "bg-brand-border"}`}
            >
              <span className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform ${aiToggle ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {aiToggle && (
            <div className="rounded-2xl p-3.5 text-white flex items-center gap-3" style={{ background: "linear-gradient(135deg,#F97316,#EF4444)" }}>
              <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 text-[18px]">🤖</div>
              <div>
                <p className="text-[15px] font-extrabold leading-tight">AI 키워드 자동 세팅 작동중</p>
                <p className="text-[12px] text-white/70 mt-0.5">최적의 키워드를 자동으로 설정합니다</p>
              </div>
            </div>
          )}

          <div className="border-t border-brand-border pt-4">
            <p className="text-[16px] font-extrabold text-brand-dark mb-3">4. 결제</p>
            <div className="space-y-2">
              {[
                { label: "할인 적용", value: "쿠폰 확인",                        cls: "text-brand-primary text-[13px] font-bold cursor-pointer underline" },
                { label: "보유 금액", value: "11,500 원",                        cls: "text-[16px] font-extrabold text-brand-dark" },
                { label: "주문 금액", value: `${orderAmount.toLocaleString()} 원`, cls: "text-[16px] font-extrabold text-brand-dark" },
                { label: "할인 금액", value: "-0 원",                            cls: "text-[16px] font-extrabold text-red-500" },
                { label: "결제 금액", value: `${orderAmount.toLocaleString()} 원`, cls: "text-[16px] font-extrabold text-brand-dark" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[13px] text-brand-sub">{row.label}</span>
                  <span className={row.cls}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isPending || !productName || !productUrl || !rankKeyword}
            className="w-full py-3.5 rounded-xl text-[16px] font-extrabold text-white bg-brand-dark hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer"
          >
            {isPending ? "등록 중..." : "캠페인 등록 / 결제"}
          </button>
        </div>

      </div>
    </div>
  );
}

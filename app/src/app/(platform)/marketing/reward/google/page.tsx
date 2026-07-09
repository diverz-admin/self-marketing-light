"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/marketing/CartContext";
import MobilePayBar from "@/components/marketing/MobilePayBar";
import PageHeader from "@/components/marketing/PageHeader";

const MEDIA_GROUPS = [
  {
    category: "검색",
    color: "#EA4335",
    items: [
      { id: "gsearch1", name: "구글 SA",   desc: "검색광고 기본형",  sale: false, bg: "linear-gradient(135deg,#EA4335,#FBBC05)", textColor: "white", initial: "G" },
      { id: "gsearch2", name: "구글 SA+",  desc: "확장 검색매칭",   sale: true,  bg: "linear-gradient(135deg,#4285F4,#34A853)", textColor: "white", initial: "G+" },
    ],
  },
  {
    category: "디스플레이",
    color: "#4285F4",
    items: [
      { id: "gdisplay1", name: "GDN 배너",   desc: "디스플레이 네트워크", sale: false, bg: "linear-gradient(135deg,#4285F4,#0F9D58)", textColor: "white", initial: "D" },
      { id: "gdisplay2", name: "GDN 리타겟", desc: "리마케팅 타겟",       sale: true,  bg: "linear-gradient(135deg,#0F9D58,#34A853)", textColor: "white", initial: "R", bookmarked: true },
    ],
  },
  {
    category: "유튜브",
    color: "#FBBC05",
    items: [
      { id: "yt1", name: "YT 인스트림", desc: "건너뛰기 가능",   sale: false, bg: "linear-gradient(135deg,#FF0000,#CC0000)", textColor: "white", initial: "Y" },
      { id: "yt2", name: "YT 범퍼",    desc: "6초 노출 최적화", sale: false, bg: "linear-gradient(135deg,#EA4335,#FF6D00)", textColor: "white", initial: "B", bookmarked: true },
    ],
  },
];

const MEDIA_PRICES: Record<string, number> = {
  gsearch1: 120, gsearch2: 150,
  gdisplay1: 90, gdisplay2: 110,
  yt1: 100, yt2: 80,
};

const MEDIA_EFFICIENCY: Record<string, number> = {
  gsearch1: 75, gsearch2: 85,
  gdisplay1: 65, gdisplay2: 78,
  yt1: 70, yt2: 60,
};

function efficiencyLabel(v: number) {
  if (v >= 80) return "높음";
  if (v >= 65) return "보통";
  return "낮음";
}

export default function GoogleRewardPage() {
  const { balance, addItem, spend } = useCart();
  const [selectedMedia, setSelectedMedia] = useState("gsearch1");
  const [serviceType, setServiceType] = useState<"search" | "display">("search");
  const [siteUrl, setSiteUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dailyQty, setDailyQty] = useState(100);
  const [isPending, setIsPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [instantPending, setInstantPending] = useState(false);
  const [instantPaid, setInstantPaid] = useState(false);

  const price = MEDIA_PRICES[selectedMedia] ?? 100;
  const efficiency = MEDIA_EFFICIENCY[selectedMedia] ?? 65;
  const orderAmount = dailyQty * price;
  const selectedItem = MEDIA_GROUPS.flatMap((g) => g.items).find((i) => i.id === selectedMedia);
  const insufficient = balance < orderAmount;
  const incomplete = !siteUrl || !keyword;

  const handleSubmit = async () => {
    if (!siteUrl || !keyword) { setPayError("사이트 URL과 키워드를 입력해주세요."); return; }
    if (insufficient) {
      setPayError("보유 포인트가 부족합니다. 충전 후 다시 시도해주세요.");
      return;
    }
    setPayError(null);
    setIsPending(true);
    await new Promise((r) => setTimeout(r, 700));
    // 결제 시 즉시 포인트 차감 + 장바구니 담기
    addItem({
      platform: "구글",
      name: selectedItem?.name ?? "",
      initial: selectedItem?.initial ?? "",
      bg: selectedItem?.bg ?? "#0D3473",
      textColor: selectedItem?.textColor ?? "white",
      target: siteUrl,
      keyword,
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
    if (!siteUrl || !keyword) { setPayError("사이트 URL과 키워드를 입력해주세요."); return; }
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
    <div className="w-full space-y-4 pb-36 lg:pb-0">
      <PageHeader
        title="구글 리워드 캠페인 신청"
        subtitle="매체사를 선택하고 캠페인 정보를 입력한 뒤 바로 신청하세요."
        iconPath={"M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"}
      />
      <div className="grid grid-cols-1 xl:grid-cols-[300px_260px_1fr] gap-4 items-start">

        {/* Panel 1: 매체사 선택 */}
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
                        isSelected ? "border-brand-primary shadow-md" : "border-brand-border hover:border-brand-primary/40 bg-brand-lighter"
                      }`}
                    >
                      {item.sale && (
                        <span className="absolute top-1.5 left-1.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-500 text-white z-10">SALE</span>
                      )}
                      {"bookmarked" in item && item.bookmarked && (
                        <span className="absolute top-1.5 right-1.5 z-10">
                          <svg className="w-3.5 h-3.5 text-brand-primary fill-brand-primary" viewBox="0 0 24 24">
                            <path d="M5 3a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2H5z" />
                          </svg>
                        </span>
                      )}
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-[15px] font-extrabold mb-2 mx-auto"
                        style={{ background: item.bg, color: item.textColor }}>
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

        {/* Panel 2: 서비스 선택 */}
        <div className="bg-white rounded-2xl border border-brand-border px-8 py-5 space-y-5">
          <h2 className="text-[17px] font-extrabold text-brand-dark">서비스 선택</h2>

          <div className="flex gap-3">
            {[
              { id: "search",  label: "검색 유입",    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg> },
              { id: "display", label: "디스플레이",   icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> },
            ].map((s) => (
              <button key={s.id}
                onClick={() => setServiceType(s.id as "search" | "display")}
                className={`flex flex-col items-center gap-1.5 px-6 py-3 rounded-xl border-2 transition-all ${
                  serviceType === s.id ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-brand-border text-brand-muted hover:border-brand-primary/40"
                }`}
              >
                {s.icon}
                <span className="text-[13px] font-bold">{s.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between py-3 border-t border-brand-border">
            <span className="text-[16px] text-brand-sub">가격</span>
            <span className="text-[22px] font-extrabold text-brand-dark">{price}<span className="text-[15px] font-medium text-brand-sub ml-1">원</span></span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[16px] text-brand-sub">매체 효율</span>
              <span className="text-[13px] font-bold text-brand-primary">{efficiencyLabel(efficiency)}</span>
            </div>
            <div className="h-3 rounded-full bg-brand-lighter overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${efficiency}%`, background: "linear-gradient(90deg,#EA4335,#FBBC05)" }} />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-border bg-brand-lighter p-4 space-y-2.5">
            <p className="text-[13px] font-bold text-brand-sub">운영 안내</p>
            <div className="space-y-1.5">
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
          </div>
        </div>

        {/* Panel 3: 캠페인 설정 */}
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
            <input type="number" value={dailyQty} onChange={(e) => setDailyQty(Number(e.target.value))}
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[16px] font-bold text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">사이트 URL</label>
            <input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)}
              placeholder="https://www.example.com"
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
          </div>

          <div>
            <label className="block text-[13px] font-bold text-brand-dark mb-1.5">타겟 키워드</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              placeholder="예) 강남 맛집 추천"
              className="w-full px-3 py-2 border border-brand-border rounded-xl text-[15px] text-brand-dark bg-brand-lighter focus:outline-none focus:border-brand-primary focus:bg-white transition-all" />
          </div>

          <div className="border-t border-brand-border pt-4">
            <p className="text-[16px] font-extrabold text-brand-dark mb-3">결제</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">보유 포인트</span>
                <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">{balance.toLocaleString()} P</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">주문 금액</span>
                <span className="text-[16px] font-extrabold text-brand-dark tabular-nums">{orderAmount.toLocaleString()} 원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">할인 금액</span>
                <span className="text-[16px] font-extrabold text-red-500 tabular-nums">-0 원</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                <span className="text-[14px] font-bold text-brand-dark">결제 금액</span>
                <span className="text-[16px] font-extrabold text-brand-primary tabular-nums">{orderAmount.toLocaleString()} 원</span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-brand-muted">결제 후 예상 잔액</span>
                <span className={`font-bold tabular-nums ${insufficient ? "text-red-500" : "text-brand-sub"}`}>{Math.max(0, balance - orderAmount).toLocaleString()} P</span>
              </div>
            </div>
          </div>

          {payError && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[12px] font-semibold text-red-600">
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
            <Link href="/marketing/cart" className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3 hover:bg-green-100/60 transition-colors">
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
            <Link href="/marketing/my/campaigns" className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3 hover:bg-green-100/60 transition-colors">
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
        </div>

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

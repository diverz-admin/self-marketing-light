"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/marketing/CartContext";
import PageHeader from "@/components/marketing/PageHeader";

/* 플랫폼별 뱃지 색상 + 신청 페이지 경로 */
const PLATFORM_META: Record<string, { badge: string; href: string }> = {
  "네이버 플레이스": { badge: "bg-green-50 text-green-700 border-green-100", href: "/marketing/reward/place" },
  "네이버 쇼핑":     { badge: "bg-blue-50 text-blue-700 border-blue-100",    href: "/marketing/reward/shopping" },
  "쿠팡":           { badge: "bg-orange-50 text-orange-700 border-orange-100", href: "/marketing/reward/coupang" },
  "구글":           { badge: "bg-red-50 text-red-700 border-red-100",        href: "/marketing/reward/google" },
};

export default function CartPage() {
  const { items, balance, total, removeItem, clear } = useCart();
  const [ordered, setOrdered] = useState(false);
  const [pending, setPending] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setPending(true);
    await new Promise((r) => setTimeout(r, 800));
    // 포인트는 담을 때 이미 차감됨 → 목록만 확정 처리
    clear();
    setPending(false);
    setOrdered(true);
  };

  /* 주문 완료 화면 */
  if (ordered) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-brand-border p-12 md:p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-green-50 mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-[22px] font-extrabold text-brand-dark mb-2">주문이 확정되었습니다</h2>
          <p className="text-[15px] text-brand-sub mb-8">검수 후 1~2일 내 캠페인이 순차적으로 시작됩니다.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/marketing/my/campaigns" className="px-5 py-3 rounded-xl text-[15px] font-bold bg-brand-primary text-white hover:opacity-90 transition-opacity">주문내역 확인</Link>
            <Link href="/marketing/reward/place" className="px-5 py-3 rounded-xl text-[15px] font-bold bg-brand-lighter text-brand-text border border-brand-border hover:bg-brand-border/40 transition-colors">캠페인 더 담기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-5">
      {/* 페이지 헤더 */}
      <PageHeader title="장바구니" subtitle="결제 시 포인트가 즉시 차감되며, 주문 확정 시 캠페인이 시작됩니다." iconPath={"M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"} />

      {items.length === 0 ? (
        /* 빈 장바구니 */
        <div className="bg-white rounded-2xl border border-brand-border p-12 md:p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-lighter mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold text-brand-dark mb-1.5">장바구니가 비어 있습니다</h2>
          <p className="text-[14px] text-brand-sub mb-6">리워드 캠페인을 신청하면 이곳에 담깁니다.</p>
          <Link href="/marketing/reward/place" className="inline-flex px-5 py-3 rounded-xl text-[15px] font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}>
            캠페인 신청하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          {/* 담긴 목록 */}
          <section className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-extrabold text-brand-dark">담긴 캠페인</h2>
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white tabular-nums">{items.length}</span>
              </div>
              <button onClick={clear} className="text-[13px] font-semibold text-brand-muted hover:text-red-500 transition-colors">전체 비우기</button>
            </div>

            <div className="divide-y divide-brand-border">
              {items.map((item) => {
                const meta = PLATFORM_META[item.platform];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center text-[16px] font-extrabold shrink-0"
                      style={{ background: item.bg, color: item.textColor ?? "white" }}>
                      {item.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${meta?.badge ?? "bg-brand-lighter text-brand-sub border-brand-border"}`}>{item.platform}</span>
                        <p className="text-[15px] font-bold text-brand-dark truncate">{item.name}</p>
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-primary truncate">{item.keyword}</span>
                      </div>
                      <p className="text-[12px] text-brand-sub truncate mt-1">
                        {item.target} · 일 {item.dailyQty.toLocaleString()}회 · 단가 {item.price.toLocaleString()}원
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[16px] font-extrabold text-brand-dark tabular-nums leading-none">{item.amount.toLocaleString()}<span className="text-[12px] font-medium text-brand-sub ml-0.5">원</span></p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                      aria-label="삭제"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 결제 요약 */}
          <section className="bg-white rounded-2xl border border-brand-border p-5 lg:sticky lg:top-6">
            <h3 className="text-[15px] font-extrabold text-brand-dark mb-3">결제 요약</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">담긴 캠페인</span>
                <span className="text-[14px] font-bold text-brand-dark tabular-nums">{items.length}건</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">총 결제 금액</span>
                <span className="text-[15px] font-bold text-brand-dark tabular-nums">{total.toLocaleString()} 원</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">차감된 포인트</span>
                <span className="text-[15px] font-bold text-red-500 tabular-nums">-{total.toLocaleString()} P</span>
              </div>
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-brand-border">
                <span className="text-[14px] font-bold text-brand-dark">보유 포인트 잔액</span>
                <span className="text-[22px] font-extrabold text-brand-primary tabular-nums">{balance.toLocaleString()}<span className="text-[13px] font-medium text-brand-sub ml-1">P</span></span>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2">
              <svg className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              <p className="text-[12px] text-brand-sub leading-snug">포인트는 담을 때 이미 차감되었습니다. 삭제 시 자동 환급됩니다.</p>
            </div>

            <button
              onClick={handleCheckout}
              disabled={pending}
              className="mt-4 w-full py-3.5 rounded-xl text-[16px] font-extrabold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}
            >
              {pending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  주문 확정 중...
                </>
              ) : "주문 확정하기"}
            </button>
            <Link href="/marketing/reward/place" className="mt-2 block text-center text-[13px] font-semibold text-brand-sub hover:text-brand-primary transition-colors py-1">
              캠페인 더 담기
            </Link>
          </section>
        </div>
      )}
    </div>
  );
}

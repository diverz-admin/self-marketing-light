"use client";

import { useState } from "react";

/* ── 모바일 하단 고정 결제 바 + 슬라이드업 시트 ──
   데스크톱에서는 렌더링되지 않으며(lg:hidden), 모바일에서만
   화면 하단에 버튼을 고정하고 탭 시 결제 요약 시트를 올린다. */

interface Props {
  orderAmount: number;
  balance: number;
  insufficient: boolean;
  isPending: boolean;
  instantPending: boolean;
  onInstantPay: () => void;
  onAddToCart: () => void;
  payError?: string | null;
  disabled?: boolean;
}

export default function MobilePayBar({
  orderAmount,
  balance,
  insufficient,
  isPending,
  instantPending,
  onInstantPay,
  onAddToCart,
  payError,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const remaining = Math.max(0, balance - orderAmount);
  const busy = isPending || instantPending;

  const boltIcon = (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
  const cartIcon = (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );

  return (
    <>
      {/* ── 하단 고정 바 (플랫폼 하단 네비 60px 위에 위치) ── */}
      <div className="lg:hidden fixed inset-x-0 bottom-[60px] md:bottom-0 z-40 bg-white border-t border-brand-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(17,29,55,0.10)]">
        {disabled && (
          <p className="mb-2 text-center text-[12px] font-semibold text-red-500">캠페인 정보를 모두 입력해주세요</p>
        )}
        <div className="grid grid-cols-[1.5fr_1fr] gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={disabled}
            className="w-full py-3 rounded-xl text-[15px] font-extrabold text-white flex items-center justify-center gap-1.5 whitespace-nowrap active:opacity-90 disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}
          >
            {boltIcon}
            즉시 포인트 차감하기
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={disabled}
            className="w-full py-3 rounded-xl text-[15px] font-extrabold border-2 border-brand-primary text-brand-primary bg-white flex items-center justify-center gap-1.5 whitespace-nowrap active:bg-brand-primary/5 disabled:opacity-40 transition-colors"
          >
            {cartIcon}
            장바구니
          </button>
        </div>
      </div>

      {/* ── 슬라이드업 시트 (플랫폼 네비 z-50 위) ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full bg-white rounded-t-2xl px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] animate-sheet-up max-h-[85vh] overflow-y-auto">
            {/* 핸들 */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-brand-border" />

            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[16px] font-extrabold text-brand-dark">결제</h3>
              <button onClick={() => setOpen(false)} className="text-brand-muted hover:text-brand-dark" aria-label="닫기">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 쿠폰 받기 */}
            <button type="button" className="w-full flex items-center justify-between rounded-xl border border-brand-border bg-brand-lighter px-3.5 py-3 mb-3">
              <span className="text-[13px] font-medium text-brand-dark">받지 않은 쿠폰이 더 있어요</span>
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-red-500">
                쿠폰 받기
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75" /></svg>
              </span>
            </button>

            {/* 요약 */}
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
                <span className={`font-bold tabular-nums ${insufficient ? "text-red-500" : "text-brand-sub"}`}>{remaining.toLocaleString()} P</span>
              </div>
            </div>

            {payError && (
              <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-[12px] font-semibold text-red-600">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                {payError}
              </div>
            )}

            {/* 확정 버튼 */}
            <div className="grid grid-cols-[1.5fr_1fr] gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => { onInstantPay(); }}
                disabled={disabled || busy}
                className="w-full py-3.5 rounded-xl text-[15px] font-extrabold text-white flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg,#1D3E7E,#0D3473)" }}
              >
                {instantPending ? "결제 처리 중..." : (<>{boltIcon}즉시 포인트 차감하기</>)}
              </button>
              <button
                type="button"
                onClick={() => { onAddToCart(); }}
                disabled={disabled || busy}
                className="w-full py-3.5 rounded-xl text-[15px] font-extrabold border-2 border-brand-primary text-brand-primary bg-white flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-40 transition-colors"
              >
                {isPending ? "담는 중..." : (<>{cartIcon}장바구니</>)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

/** 헤더 포인트 잔액 칩 — 전역 장바구니 스토어의 잔액을 표시 */
export function HeaderBalance() {
  const { balance } = useCart();
  return (
    <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED]">
      <svg className="w-3.5 h-3.5 text-[#0D3473] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-[12px] text-[#5B6472] font-medium hidden sm:inline">포인트</span>
      <span className="text-[15px] font-extrabold text-[#0D3473] tabular-nums whitespace-nowrap">{balance.toLocaleString()} P</span>
    </div>
  );
}

/** 헤더 장바구니 버튼 — 담긴 개수 배지 + 장바구니 페이지 링크 */
export function HeaderCartButton() {
  const { items } = useCart();
  return (
    <Link
      href="/marketing/cart"
      aria-label="장바구니"
      className="relative h-8 w-8 rounded-xl bg-[#F5F6F8] border border-[#E2E6ED] flex items-center justify-center hover:bg-[#F2F4F6] transition-colors"
    >
      <svg className="w-4 h-4 text-[#5B6472]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
      </svg>
      {items.length > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0D3473] text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums border-2 border-white">
          {items.length}
        </span>
      )}
    </Link>
  );
}

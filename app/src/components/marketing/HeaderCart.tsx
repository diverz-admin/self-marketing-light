"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { toast } from "@/components/ui/toast";
import { useDropdown } from "./useDropdown";

/** 헤더 포인트 칩 — 누르면 충전 화면으로 간다 */
export function HeaderBalance() {
  const { balance } = useCart();
  return (
    <Link
      href="/marketing/my/charge"
      title="클릭하면 포인트 충전"
      className="flex items-center gap-1.5 px-2.5 md:px-3 h-9 rounded-xl bg-brand-lighter border border-brand-border hover:border-brand-primary transition-colors"
    >
      <svg className="w-3.5 h-3.5 text-brand-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-[15px] font-extrabold text-brand-primary tabular-nums whitespace-nowrap">{balance.toLocaleString()} P</span>
    </Link>
  );
}

/** 헤더 장바구니 — 담긴 개수 배지 + 목록 드롭다운 */
export function HeaderCartButton() {
  const { items, total, removeItem } = useCart();
  const { open, setOpen, ref } = useDropdown();
  const count = items.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`장바구니 ${count}개`}
        aria-expanded={open}
        className="relative h-9 w-9 rounded-xl bg-brand-lighter border border-brand-border flex items-center justify-center hover:border-brand-border-strong transition-colors"
      >
        <svg className="w-4 h-4 text-brand-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-primary text-white text-[10px] font-extrabold flex items-center justify-center tabular-nums border-2 border-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-be-fade absolute right-0 top-[calc(100%+8px)] z-50 w-[320px] rounded-xl border border-brand-border bg-white shadow-[0_16px_40px_-12px_rgba(17,29,55,.24)]">
          <p className="px-4 pt-3.5 pb-2.5 text-[14px] font-extrabold text-brand-dark border-b border-brand-border">
            장바구니 <span className="text-brand-primary">{count}</span>
          </p>
          {count === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-brand-sub">장바구니가 비어 있습니다</p>
          ) : (
            <ul className="max-h-[300px] overflow-y-auto">
              {items.map((it) => (
                <li key={it.id} className="flex items-start gap-2.5 px-4 py-3 border-b border-brand-border last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold text-brand-dark truncate">{it.target || it.name || "이름 없음"}</p>
                    <p className="text-[12px] text-brand-sub truncate">
                      {it.keyword ? `${it.keyword} · ` : ""}
                      {it.dailyQty ? `${it.dailyQty}건` : "상담 견적"}
                    </p>
                    <p className="mt-0.5 text-[13px] font-extrabold text-brand-dark tabular-nums">{it.amount.toLocaleString()} P</p>
                  </div>
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={() => {
                      removeItem(it.id);
                      toast.success("장바구니에서 삭제했습니다");
                    }}
                    className="h-6 w-6 rounded-full flex items-center justify-center text-brand-muted hover:bg-brand-lighter hover:text-brand-error"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-3 border-t border-brand-border">
            <p className="flex items-center justify-between text-[13.5px]">
              <span className="text-brand-sub">합계</span>
              <b className="font-extrabold text-brand-dark tabular-nums">{total.toLocaleString()} P</b>
            </p>
            <Link
              href="/marketing/cart"
              onClick={() => setOpen(false)}
              className="mt-2.5 block w-full rounded-xl bg-brand-primary py-2.5 text-center text-[14px] font-bold text-white hover:bg-brand-primary-hover"
            >
              장바구니로 이동하기
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

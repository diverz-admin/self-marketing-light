"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * 리워드 신청 3단계 「장바구니 담기」 — 개발본과 같이 주문·결제는 장바구니에서만 한다.
 * 신청 화면은 담기만 하고, 포인트는 장바구니에서 주문할 때 한꺼번에 빠진다.
 */
export function CartSummaryCard({
  productName, dailyQty, days, unitPrice, pending, error, missing, onAdd,
}: {
  productName: string;
  dailyQty: number;
  days: number;
  unitPrice: number;
  pending: boolean;
  error: string | null;
  /** 아직 비어 있는 필수 항목 안내 (없으면 null) */
  missing: string | null;
  onAdd: () => void;
}) {
  const amount = dailyQty * days * unitPrice;
  const rows = [
    { label: "상품", value: productName || "—" },
    { label: "일 작업량", value: `${dailyQty.toLocaleString()}건` },
    { label: "구동 기간", value: `${days.toLocaleString()}일` },
    { label: "건당 단가", value: `${unitPrice.toLocaleString()}P` },
  ];

  return (
    <section className="h-full flex flex-col">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="h-7 w-7 rounded-full bg-brand-primary text-white text-[13px] font-extrabold flex items-center justify-center shrink-0">3</span>
        <h2 className="text-[18px] font-extrabold text-brand-dark">장바구니 담기</h2>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-brand-border p-5 flex flex-col">
        <p className="text-[15px] font-extrabold text-brand-dark pb-3 border-b border-brand-border">주문 요약</p>

        <dl className="py-3 space-y-2.5 border-b border-brand-border">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-3 text-[13.5px]">
              <dt className="text-brand-sub">{r.label}</dt>
              <dd className="font-bold text-brand-dark tabular-nums truncate">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] font-bold text-brand-dark">예상 주문 금액</span>
            <span className="text-[24px] font-extrabold text-brand-primary tabular-nums">{amount.toLocaleString()}P</span>
          </div>
          <p className="mt-1 text-right text-[12px] text-brand-muted tabular-nums">
            {dailyQty.toLocaleString()}건 × {days.toLocaleString()}일 × {unitPrice.toLocaleString()}P
          </p>
        </div>

        {(error || missing) && (
          <p className={`mt-3 text-[12.5px] font-semibold ${error ? "text-brand-error" : "text-brand-sub"}`}>{error ?? missing}</p>
        )}

        <button
          type="button"
          onClick={onAdd}
          disabled={pending}
          className="mt-4 w-full rounded-xl bg-brand-primary py-3.5 text-[15px] font-extrabold text-white hover:bg-brand-primary-hover disabled:opacity-50 transition-colors"
        >
          {pending ? "담는 중…" : "장바구니에 담기"}
        </button>

        <p className="mt-3 flex gap-2 rounded-xl bg-brand-lighter px-3.5 py-3 text-[12.5px] leading-relaxed text-brand-sub">
          <svg className="w-4 h-4 shrink-0 mt-px text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <span>
            주문·결제는 <b className="font-bold text-brand-dark">장바구니</b>에서 진행됩니다. 여러 캠페인을 담아 한 번에 주문할 수 있어요.
          </span>
        </p>
      </div>
    </section>
  );
}

/** 담기 완료 — 더 담을지, 장바구니로 갈지 묻는다 */
export function CartAddedModal({ label, count, onMore }: { label: string; count: number; onMore: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onMore();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onMore]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4" onMouseDown={onMore}>
      <div role="dialog" aria-modal aria-label="장바구니에 담았습니다" className="animate-be-fade w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <span className="mx-auto h-12 w-12 rounded-full flex items-center justify-center" style={{ background: "var(--success-bg)", color: "var(--success-fg)" }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </span>
        <p className="mt-3 text-[18px] font-extrabold text-brand-dark">장바구니에 담았습니다</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-brand-sub">
          {label} 캠페인을 담았어요.
          <br />
          장바구니에 <b className="font-bold text-brand-primary">{count}건</b>이 있습니다. 지금 주문하러 이동할까요?
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onMore} className="rounded-xl border border-brand-border py-3 text-[14px] font-bold text-brand-dark hover:bg-brand-lighter">
            캠페인 더 담기
          </button>
          <Link href="/marketing/cart" className="rounded-xl bg-brand-primary py-3 text-[14px] font-bold text-white hover:bg-brand-primary-hover">
            장바구니로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}

/** 모바일 하단 고정 바 — 예상 금액 + 담기 */
export function MobileCartBar({ amount, pending, onAdd }: { amount: number; pending: boolean; onAdd: () => void }) {
  return (
    <div className="lg:hidden fixed inset-x-0 bottom-[60px] z-40 border-t border-brand-border bg-white px-4 py-3 flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-brand-sub">예상 주문 금액</p>
        <p className="text-[18px] font-extrabold text-brand-primary tabular-nums">{amount.toLocaleString()}P</p>
      </div>
      <button type="button" onClick={onAdd} disabled={pending} className="rounded-xl bg-brand-primary px-5 py-3 text-[14.5px] font-extrabold text-white disabled:opacity-50">
        {pending ? "담는 중…" : "장바구니에 담기"}
      </button>
    </div>
  );
}

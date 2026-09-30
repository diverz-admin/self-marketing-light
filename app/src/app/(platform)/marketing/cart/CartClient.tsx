"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart, type CartItem } from "@/components/marketing/CartContext";
import PageHeader from "@/components/marketing/PageHeader";
import PolicyNotice from "@/components/marketing/PolicyNotice";
import ExecutionDate from "@/components/marketing/ExecutionDate";
import { toast } from "@/components/ui/toast";
import { POLICY, isStaleCartItem } from "@/lib/policy";
import { checkoutCart, checkoutAdminCartItems } from "../actions";
import type { AdminCartLineItem } from "@/lib/admin-cart-items";

const CART_ICON =
  "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z";

/* 플랫폼별 뱃지 색상 */
const PLATFORM_BADGE: Record<string, string> = {
  "네이버 플레이스": "bg-green-50 text-green-700 border-green-100",
  "네이버 쇼핑": "bg-blue-50 text-blue-700 border-blue-100",
  "쿠팡": "bg-orange-50 text-orange-700 border-orange-100",
};

/* 개발본과 같은 순서·이름으로 묶는다 */
type Group = "REWARD" | "REVIEW" | "GUARANTEED" | "CONTENT";
const GROUPS: Group[] = ["REWARD", "REVIEW", "GUARANTEED", "CONTENT"];
const GROUP_META: Record<Group, { label: string; dot: string }> = {
  REWARD: { label: "리워드 마케팅", dot: "#2452EB" },
  REVIEW: { label: "리뷰 체험단", dot: "#0EA5A4" },
  GUARANTEED: { label: "보장형", dot: "#F5B72A" },
  CONTENT: { label: "콘텐츠 · 추가 서비스", dot: "#99A0AC" },
};

/**
 * 장바구니 한 줄. 두 출처가 섞인다.
 *  · local — 고객이 신청 화면에서 담은 리워드·리뷰 (브라우저 localStorage)
 *  · admin — 관리자가 상담 후 담아준 보장형·콘텐츠 (서버, 고객이 지울 수 없다)
 */
type Line =
  | { key: string; source: "local"; group: Group; amount: number; item: CartItem }
  | { key: string; source: "admin"; group: Group; amount: number; item: AdminCartLineItem };

function fmtDate(ymd: string) {
  return ymd.slice(0, 10).replaceAll("-", ".");
}

/** 부족분을 충전 단위로 올림한다 — 최소 충전 포인트보다 작으면 최소값으로 */
function chargeAmountFor(shortfall: number) {
  const { minCharge, chargeUnit } = POLICY.point;
  return Math.max(minCharge, Math.ceil(shortfall / chargeUnit) * chargeUnit);
}

export default function CartClient({
  adminItems,
  holidays,
}: {
  adminItems: AdminCartLineItem[];
  /** CS-03 서버가 읽어 내려준 공휴일 — 예상 집행일(PU-02) 계산에 쓴다 */
  holidays?: readonly string[];
}) {
  const router = useRouter();
  const { items, balance, removeItem, clear } = useCart();

  const lines = useMemo<Line[]>(
    () => [
      ...items.map((item) => ({
        key: `l-${item.id}`,
        source: "local" as const,
        group: (item.kind === "review" ? "REVIEW" : "REWARD") as Group,
        amount: item.amount,
        item,
      })),
      ...adminItems.map((item) => ({
        key: `a-${item.id}`,
        source: "admin" as const,
        group: (item.group === "리워드" ? "GUARANTEED" : "CONTENT") as Group,
        amount: item.amount,
        item,
      })),
    ],
    [items, adminItems],
  );

  // 해제한 줄만 기억한다 — 새로 담긴 건 기본으로 선택된다
  const [unchecked, setUnchecked] = useState<Set<string>>(new Set());
  const selected = lines.filter((l) => !unchecked.has(l.key));
  const allChecked = lines.length > 0 && selected.length === lines.length;

  const [ordered, setOrdered] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shortOpen, setShortOpen] = useState(false);

  const orderTotal = selected.reduce((s, l) => s + l.amount, 0);
  const remain = balance - orderTotal;
  const shortfall = Math.max(0, -remain);
  const isShort = selected.length > 0 && shortfall > 0;
  const chargeHref = `/marketing/my/charge?amount=${chargeAmountFor(shortfall)}`;

  function toggle(key: string) {
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAll() {
    setUnchecked(allChecked ? new Set(lines.map((l) => l.key)) : new Set());
  }

  function removeLocal(id: number) {
    removeItem(id);
    toast.success("장바구니에서 삭제했습니다");
  }

  function clearLocal() {
    if (!items.length) return;
    clear();
    toast.success("담은 캠페인을 모두 비웠습니다", adminItems.length ? "상담으로 담긴 상품은 그대로 남습니다" : undefined);
  }

  // 주문은 서버에서 상품 단가로 금액을 다시 계산하고 포인트를 차감한다 (어드민 주문/결제에 남는다)
  async function handleCheckout() {
    const localSel = selected.filter((l): l is Extract<Line, { source: "local" }> => l.source === "local");
    const adminSel = selected.filter((l): l is Extract<Line, { source: "admin" }> => l.source === "admin");
    if (!localSel.length && !adminSel.length) return;

    setConfirmOpen(false);
    setPending(true);
    let paid = 0;

    // 리워드는 상품 단가로 서버가 다시 계산하고, 관리자가 담아준 건은 정해진 금액으로 결제한다
    if (localSel.length) {
      const res = await checkoutCart(
        localSel.map(({ item: it }) => ({
          productId: it.productId,
          channel: it.channel,
          target: it.target,
          url: it.url,
          keyword: it.keyword,
          dailyQty: it.dailyQty,
          days: it.days,
          startDate: it.startDate,
          serviceType: it.serviceType,
          kind: it.kind,
          review: it.review,
        })),
      );
      if ("error" in res) {
        setPending(false);
        if (res.error.includes("부족")) setShortOpen(true);
        else toast.error(res.error);
        return;
      }
      paid += res.total;
      localSel.forEach((l) => removeItem(l.item.id));
    }
    if (adminSel.length) {
      const res = await checkoutAdminCartItems(adminSel.map((l) => l.item.id));
      if ("error" in res) {
        setPending(false);
        if (res.error.includes("부족")) setShortOpen(true);
        else toast.error(res.error);
        // 앞 단계(리워드)가 이미 결제됐다면 그만큼은 알린다
        if (paid) toast.success(`담은 캠페인 ${localSel.length}건은 주문 확정되었습니다`);
        return;
      }
      paid += res.total;
    }

    setPending(false);
    setUnchecked(new Set());
    toast.success(`${selected.length}건 주문 확정 · ${paid.toLocaleString()}P 결제`);
    // 남은 항목이 없으면 완료 화면, 선택하지 않은 항목이 남았으면 장바구니에 머문다
    if (selected.length === lines.length) setOrdered(true);
  }

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
          <p className="text-[15px] text-brand-sub mb-6">검수 후 캠페인이 순차적으로 시작됩니다. 마감시각 전 결제분은 당일, 이후·주말·공휴일 결제분은 다음 영업일에 발주됩니다.</p>
          <PolicyNotice
            className="mb-8 text-left"
            title="주문 후 안내"
            anchor="cart"
            items={[
              { code: "C-03", text: <>주문 취소는 화면에서 직접 하실 수 없습니다. 카카오톡 상담({POLICY.support.kakaoChannel})으로 요청해 주세요.</> },
              { code: "M-02", text: "캠페인 중도 종료 시 환불은 포인트로 환급되며, 현금 환불은 포인트 환불 절차로 별도 신청하셔야 합니다." },
              { code: "PD-01", text: "집행 중인 캠페인은 결제 시점 단가로 고정되어 이후 단가가 올라도 추가 청구하지 않습니다." },
            ]}
          />
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
      <PageHeader title="장바구니" subtitle="주문을 확정하면 포인트가 즉시 차감되고 캠페인 접수가 시작됩니다." iconPath={CART_ICON} />

      {lines.length === 0 ? (
        /* 빈 장바구니 */
        <div className="bg-white rounded-2xl border border-brand-border p-12 md:p-16 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-lighter mx-auto flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={CART_ICON} />
            </svg>
          </div>
          <h2 className="text-[18px] font-bold text-brand-dark mb-1.5">장바구니가 비어 있습니다</h2>
          <p className="text-[14px] text-brand-sub mb-6">캠페인을 신청하면 이곳에 담깁니다.</p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <Link href="/marketing/reward/place" className="inline-flex px-5 py-3 rounded-xl text-[15px] font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg,#152C9E,#2452EB)" }}>
              리워드 마케팅 신청하기
            </Link>
            <Link href="/marketing/review/place" className="inline-flex px-5 py-3 rounded-xl text-[15px] font-bold text-brand-sub border border-brand-border hover:border-brand-primary hover:text-brand-primary transition-colors">
              리뷰·체험단 신청하기
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">

          {/* 담긴 목록 */}
          <section className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-[18px] w-[18px] rounded accent-brand-primary"
                />
                <span className="text-[15px] font-extrabold text-brand-dark">전체 선택</span>
                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full bg-brand-primary text-white tabular-nums">
                  {selected.length}/{lines.length}
                </span>
              </label>
              {items.length > 0 && (
                <button onClick={clearLocal} className="text-[13px] font-semibold text-brand-muted hover:text-red-500 transition-colors">
                  전체 비우기
                </button>
              )}
            </div>

            {GROUPS.map((g) => {
              const rows = lines.filter((l) => l.group === g);
              if (!rows.length) return null;
              return (
                <div key={g}>
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-brand-lighter border-b border-brand-border text-[13px] font-extrabold text-brand-text">
                    <span className="h-2 w-2 rounded-full" style={{ background: GROUP_META[g].dot }} />
                    {GROUP_META[g].label}
                    <span className="text-brand-muted font-bold tabular-nums">{rows.length}</span>
                  </div>
                  <div className="divide-y divide-brand-border border-b border-brand-border last:border-b-0">
                    {rows.map((l) => (
                      <LineRow
                        key={l.key}
                        line={l}
                        checked={!unchecked.has(l.key)}
                        onToggle={() => toggle(l.key)}
                        onRemove={l.source === "local" ? () => removeLocal(l.item.id) : undefined}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </section>

          {/* 주문 요약 */}
          <section className="bg-white rounded-2xl border border-brand-border p-5 lg:sticky lg:top-6">
            <h3 className="text-[15px] font-extrabold text-brand-dark mb-3">주문 요약</h3>

            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <span className="text-[13px] text-brand-sub">선택한 캠페인</span>
              <span className="text-[14px] font-bold text-brand-dark tabular-nums">{selected.length}건</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-brand-border">
              <span className="text-[13px] text-brand-sub">상품 금액</span>
              <span className="text-[14px] font-bold text-brand-dark tabular-nums">{orderTotal.toLocaleString()}P</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[14px] font-extrabold text-brand-dark">주문 금액</span>
              <span className="text-[22px] font-extrabold text-brand-primary tabular-nums">
                {orderTotal.toLocaleString()}<span className="text-[13px] font-medium text-brand-sub ml-0.5">P</span>
              </span>
            </div>

            <div className="space-y-2 pt-3 border-t border-brand-border">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub">보유 포인트</span>
                <span className="text-[14px] font-bold text-brand-dark tabular-nums">{balance.toLocaleString()}P</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[13px] ${isShort ? "font-bold text-red-500" : "text-brand-sub"}`}>주문 후 남는 포인트</span>
                <span className="flex items-center gap-2">
                  {isShort && (
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-red-50 text-red-500 tabular-nums">
                      {shortfall.toLocaleString()}P 부족
                    </span>
                  )}
                  <span className={`text-[14px] font-bold tabular-nums ${isShort ? "text-red-500" : "text-brand-dark"}`}>
                    {remain.toLocaleString()}P
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-brand-sub" title="마감시각 전 결제분은 당일, 이후·주말·공휴일 결제분은 다음 영업일에 발주됩니다. (PU-02)">
                  예상 집행일
                </span>
                <span className="text-[14px] font-bold text-brand-dark">
                  <ExecutionDate holidays={holidays} />
                </span>
              </div>
            </div>

            {isShort && (
              <p className="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-[12.5px] font-semibold text-red-500 leading-snug">
                보유 포인트가 <b className="font-extrabold">{shortfall.toLocaleString()}P</b> 부족합니다. 충전 후 주문할 수 있습니다.
              </p>
            )}

            <div className="mt-3 flex items-start gap-1.5 rounded-lg bg-blue-50/60 border border-blue-100 px-3 py-2">
              <svg className="w-3.5 h-3.5 text-brand-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
              <p className="text-[12px] text-brand-sub leading-snug">주문을 확정하면 선택한 캠페인의 포인트가 차감되고 접수가 시작됩니다.</p>
            </div>

            <PolicyNotice
              className="mt-3"
              title="주문 전 확인"
              anchor="cart"
              items={[
                { code: "C-01", text: "담으신 뒤 단가가 바뀌면 주문 시점의 가격으로 다시 계산됩니다." },
                { code: "C-02", text: <>장바구니는 기한 없이 보관되지만, 담으신 지 {POLICY.cart.staleDays}일이 지나면 &ldquo;확인 필요&rdquo;로 표시됩니다.</> },
                { code: "C-03", text: "주문 취소는 카카오톡 상담으로만 접수합니다." },
                { code: "AG-02", text: "결제 주체는 언제나 로그인한 계정입니다." },
              ]}
            />

            <button
              onClick={isShort ? () => router.push(chargeHref) : () => setConfirmOpen(true)}
              disabled={pending || selected.length === 0}
              className="mt-4 w-full py-3.5 rounded-xl text-[16px] font-extrabold text-white shadow-md hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg,#152C9E,#2452EB)" }}
            >
              {pending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  주문 처리 중…
                </>
              ) : isShort ? (
                "충전하고 주문하기"
              ) : selected.length ? (
                `선택 캠페인 주문 확정 · ${selected.length}건`
              ) : (
                "캠페인을 선택하세요"
              )}
            </button>
            <Link href="/marketing/reward/place" className="mt-2 block text-center text-[13px] font-semibold text-brand-sub hover:text-brand-primary transition-colors py-1">
              캠페인 더 담기
            </Link>
          </section>
        </div>
      )}

      {confirmOpen && (
        <ConfirmModal
          tone="warn"
          title={`${orderTotal.toLocaleString()}P를 결제하고 주문을 확정할까요?`}
          description="확인을 누르면 포인트가 즉시 차감되고 캠페인 접수가 시작됩니다."
          rows={[
            { label: "캠페인", value: `${selected.length}건` },
            { label: "결제 금액", value: `${orderTotal.toLocaleString()}P` },
            { label: "결제 후 잔액", value: `${remain.toLocaleString()}P` },
          ]}
          warning="시작한 뒤에는 취소할 수 없고, 중단하고 환불받는 것만 가능합니다."
          confirmLabel="결제하고 시작"
          pending={pending}
          onConfirm={handleCheckout}
          onClose={() => setConfirmOpen(false)}
        />
      )}

      {shortOpen && (
        <ConfirmModal
          tone="info"
          title="포인트가 부족합니다"
          description="보유 포인트로는 이 주문을 결제할 수 없습니다. 충전 후 다시 시도해 주세요. 선택한 캠페인은 그대로 유지됩니다."
          rows={[
            { label: "주문 금액", value: `${orderTotal.toLocaleString()}P` },
            { label: "보유 포인트", value: `${balance.toLocaleString()}P` },
            { label: "부족 포인트", value: `${shortfall.toLocaleString()}P` },
          ]}
          confirmLabel="충전하러 가기"
          onConfirm={() => {
            setShortOpen(false);
            router.push(chargeHref);
          }}
          onClose={() => setShortOpen(false)}
        />
      )}
    </div>
  );
}

function LineRow({
  line,
  checked,
  onToggle,
  onRemove,
}: {
  line: Line;
  checked: boolean;
  onToggle: () => void;
  /** 관리자가 담아준 건은 고객이 지울 수 없다 */
  onRemove?: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 px-5 py-4 transition-opacity ${checked ? "" : "opacity-55"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label="주문에 포함"
        className="h-[18px] w-[18px] rounded accent-brand-primary shrink-0"
      />

      {line.source === "local" ? (
        <>
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-[16px] font-extrabold shrink-0"
            style={{ background: line.item.bg, color: line.item.textColor ?? "white" }}
          >
            {line.item.initial}
          </div>
          <LocalInfo item={line.item} />
        </>
      ) : (
        <AdminInfo item={line.item} />
      )}

      <p className="text-[16px] font-extrabold text-brand-dark tabular-nums leading-none shrink-0">
        {line.amount.toLocaleString()}
        <span className="text-[12px] font-medium text-brand-sub ml-0.5">P</span>
      </p>

      {onRemove ? (
        <button
          onClick={onRemove}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-brand-muted hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
          aria-label="삭제"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      ) : (
        <span className="h-8 w-8 shrink-0" aria-hidden />
      )}
    </div>
  );
}

function LocalInfo({ item }: { item: CartItem }) {
  const keywords = item.review?.mainKeywords?.length ? item.review.mainKeywords : item.keyword ? [item.keyword] : [];
  const serviceLabel = item.serviceType === "wishlist" ? "찜하기" : item.serviceType === "search" ? "검색하기" : null;
  const days = item.days ?? 1;
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${PLATFORM_BADGE[item.platform] ?? "bg-brand-lighter text-brand-sub border-brand-border"}`}>
          {item.platform}
        </span>
        <p className="text-[15px] font-bold text-brand-dark truncate">{item.target || item.name}</p>
        {keywords.length > 0 && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-primary truncate">
            {keywords[0]}
            {keywords.length > 1 && ` 외 ${keywords.length - 1}`}
          </span>
        )}
        {serviceLabel && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-brand-lighter text-brand-sub">{serviceLabel}</span>
        )}
        {isStaleCartItem(item.addedAt) && (
          <span
            className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0"
            title={`담으신 지 ${POLICY.cart.staleDays}일이 지났습니다. 주문 시 최신 단가로 다시 계산됩니다. (C-02)`}
          >
            확인 필요
          </span>
        )}
      </div>
      <p className="text-[12px] text-brand-sub truncate mt-1 tabular-nums">
        {item.name} · 일 {item.dailyQty.toLocaleString()}건 · {days}일 · 단가 {item.price.toLocaleString()}P
        {item.startDate ? ` · ${fmtDate(item.startDate)} 시작` : ""}
      </p>
    </div>
  );
}

function AdminInfo({ item }: { item: AdminCartLineItem }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md border bg-brand-primary-50 text-brand-primary border-brand-primary-100">
          상담 견적
        </span>
        <p className="text-[15px] font-bold text-brand-dark truncate">{item.title}</p>
        {item.quantity > 1 && <span className="text-[12px] text-brand-sub tabular-nums">×{item.quantity}</span>}
      </div>
      <p className="text-[12px] text-brand-sub truncate mt-1">
        담당자가 담아드린 건입니다{item.target ? ` · ${item.target}` : ""}
      </p>
      {item.note && (
        <p className="text-[12px] text-brand-muted whitespace-pre-wrap mt-1.5 leading-relaxed">{item.note}</p>
      )}
    </div>
  );
}

function ConfirmModal({
  tone,
  title,
  description,
  rows,
  warning,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
}: {
  tone: "warn" | "info";
  title: string;
  description: string;
  rows: { label: string; value: string }[];
  warning?: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const iconBg = tone === "warn" ? "#FCEFD9" : "#E7ECFF";
  const iconFg = tone === "warn" ? "#B7791F" : "#2452EB";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: iconBg, color: iconFg }}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {tone === "warn" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94L1.82 18a1.875 1.875 0 001.61 2.81h17.14a1.875 1.875 0 001.61-2.81L13.66 3.94a1.875 1.875 0 00-3.32 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
              )}
            </svg>
          </div>
          <p className="text-[18px] font-extrabold text-brand-dark leading-snug">{title}</p>
          <p className="text-[14px] text-brand-sub mt-1.5 leading-relaxed">{description}</p>

          <dl className="mt-4 rounded-xl bg-brand-lighter border border-brand-border divide-y divide-brand-border">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                <dt className="text-[13px] text-brand-sub">{r.label}</dt>
                <dd className="text-[14px] font-bold text-brand-dark tabular-nums">{r.value}</dd>
              </div>
            ))}
          </dl>

          {warning && (
            <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[12.5px] font-semibold text-amber-700">
              {warning}
            </p>
          )}
        </div>

        <div className="flex gap-2 px-6 py-5">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[15px] font-bold text-brand-sub bg-brand-lighter border border-brand-border hover:bg-brand-border/40 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            className="flex-1 py-3 rounded-xl text-[15px] font-extrabold text-white hover:opacity-90 transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#152C9E,#2452EB)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

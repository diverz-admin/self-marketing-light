"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/* ── 장바구니 아이템 (리워드 신청 → 결제 시 즉시 담김) ── */
export type CartItem = {
  id: number;
  productId: string;      // 어드민 상품등록의 상품 ID — 주문 확정 시 금액을 다시 계산하는 기준
  platform: string;       // "네이버 플레이스" / "네이버 쇼핑" / "쿠팡"
  name: string;           // 매체 상품명 (버즈빌 등)
  initial: string;
  bg: string;
  textColor?: string;
  target: string;         // 플레이스명 / 상품명 / 사이트 URL
  keyword: string;
  dailyQty: number;
  price: number;
  amount: number;
};

type CartContextValue = {
  items: CartItem[];
  balance: number;
  total: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: number) => void;
  clear: () => void;
  charge: (amount: number) => void;
  spend: (amount: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const LS_ITEMS = "be_cart_items_v1";

/**
 * 잔액은 서버(credits 원장)가 기준이다 — 레이아웃이 초기값을 내려주고,
 * 화면 안에서의 증감은 서버 반영 전까지의 임시 표시로만 쓴다.
 * (장바구니 목록만 localStorage 에 남긴다)
 */
export function CartProvider({ children, initialBalance = 0 }: {
  children: React.ReactNode;
  initialBalance?: number;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /**
   * 화면 안에서 발생한 증감분만 따로 들고, 표시 잔액은 서버 값 + 증감분으로 계산한다.
   * 서버가 새 잔액을 내려주면(충전 승인·주문 반영) 그 값이 자동으로 기준이 된다.
   */
  const [pendingDelta, setPendingDelta] = useState(0);
  const balance = initialBalance + pendingDelta;
  const adjust = (delta: number) => setPendingDelta((d) => d + delta);

  // 최초 마운트 시 localStorage 로부터 장바구니 복원
  useEffect(() => {
    try {
      const rawItems = localStorage.getItem(LS_ITEMS);
      if (rawItems) setItems(JSON.parse(rawItems));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // 변경 시 localStorage 반영 (복원 완료 후에만)
  useEffect(() => {
    if (hydrated) localStorage.setItem(LS_ITEMS, JSON.stringify(items));
  }, [items, hydrated]);

  // 결제(담기) 시 포인트 즉시 차감
  const addItem = (item: Omit<CartItem, "id">) => {
    setItems((prev) => [{ ...item, id: Date.now() }, ...prev]);
    adjust(-item.amount);
  };

  // 삭제 시 차감했던 포인트 환급
  const removeItem = (id: number) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) adjust(target.amount);
      return prev.filter((it) => it.id !== id);
    });
  };

  // 주문 확정 — 포인트는 담을 때 이미 차감되었으므로 목록만 비움
  const clear = () => setItems([]);

  // 포인트 충전
  const charge = (amount: number) => adjust(amount);

  // 장바구니를 거치지 않고 포인트만 즉시 차감 (즉시 결제)
  const spend = (amount: number) => adjust(-amount);

  const total = items.reduce((s, it) => s + it.amount, 0);

  return (
    <CartContext.Provider value={{ items, balance, total, addItem, removeItem, clear, charge, spend }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

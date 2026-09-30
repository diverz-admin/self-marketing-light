"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

/* ── 장바구니 아이템 — 리워드 신청 화면에서 담고, 주문·결제는 장바구니에서 한 번에 한다 ── */
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
  /** C-02 담은 시각 — 30일이 지나면 장바구니에서 "확인 필요"로 표시한다 */
  addedAt?: number;
  /* ── 주문할 때 캠페인으로 만들 정보 ── */
  channel?: "place" | "shopping" | "coupang";
  days?: number;
  startDate?: string;
  /** 플레이스 링크 / 상품 URL */
  url?: string;
  /** 쿠팡 — 검색하기(search) · 찜하기(wishlist) */
  serviceType?: "search" | "wishlist";
  /** 리뷰·체험단이면 "review" — 주문 때 리뷰 캠페인으로 만든다 (없으면 리워드) */
  kind?: "reward" | "review";
  review?: ReviewCartPayload;
};

/** 리뷰 캠페인 신청 내용 — 주문하면 이 값 그대로 리뷰 캠페인이 된다 */
export type ReviewCartPayload = {
  reviewType: "blog_distribute";
  mainKeywords: string[];
  postingType: "후기성" | "정보성";
  hashtags: string[];
  businessInfo: string;
  imageMode: "CRAWL" | "ATTACH";
  imageDriveUrl?: string;
  crawlRequest?: string;
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

  // 담기만 한다 — 포인트는 장바구니에서 주문할 때 빠진다 (개발본과 같은 흐름)
  const addItem = (item: Omit<CartItem, "id">) => {
    const now = Date.now();
    setItems((prev) => [{ addedAt: now, ...item, id: now }, ...prev]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

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

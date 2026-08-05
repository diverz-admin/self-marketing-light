"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type NavItem = { href: string; label: string; icon: React.ReactNode; exact?: boolean };
type NavGroup = { title: string; items: NavItem[] };

const icon = (path: string) => (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const I = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  users: "M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-6 4 4 0 004 6zm6 0a4 4 0 10-2-7.75",
  point: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  coupon: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
  notice: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z",
  board: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  rank: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z",
  product: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  campaign: "M13 10V3L4 14h7v7l9-11h-7z",
  guaranteed: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  place: "M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
  shopping: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  request: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  order: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  settlement: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
  cart: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  back: "M11 16l-4-4m0 0l4-4m-4 4h14M3 12a9 9 0 1118 0 9 9 0 01-18 0z",
};

// 기획서 구조 그대로 반영
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "기본",
    items: [
      { href: "/admin", exact: true, label: "대시보드", icon: icon(I.dashboard) },
      { href: "/admin/users", label: "회원관리", icon: icon(I.users) },
      { href: "/admin/points", label: "포인트충전", icon: icon(I.point) },
      { href: "/admin/coupons", label: "쿠폰", icon: icon(I.coupon) },
      { href: "/admin/notices", label: "공지사항", icon: icon(I.notice) },
      { href: "/admin/board", label: "게시판", icon: icon(I.board) },
    ],
  },
  {
    title: "통합순위관리",
    items: [{ href: "/admin/rank", label: "키워드 순위", icon: icon(I.rank) }],
  },
  {
    title: "리워드마케팅",
    items: [
      { href: "/admin/reward/products", label: "리워드 상품등록", icon: icon(I.product) },
      { href: "/admin/reward/campaigns/place", label: "플레이스 상위노출 관리", icon: icon(I.campaign) },
      { href: "/admin/reward/campaigns/shopping", label: "쇼핑 상위노출 관리", icon: icon(I.campaign) },
      { href: "/admin/reward/campaigns/coupang", label: "쿠팡 상위노출 관리", icon: icon(I.campaign) },
      { href: "/admin/reward/guaranteed", label: "보장형 캠페인 관리", icon: icon(I.guaranteed) },
    ],
  },
  {
    title: "리뷰/체험단",
    items: [
      { href: "/admin/review/products", label: "리뷰 상품등록", icon: icon(I.product) },
      { href: "/admin/review/place", label: "플레이스 리뷰 관리", icon: icon(I.place) },
      { href: "/admin/review/shopping", label: "쇼핑 리뷰 관리", icon: icon(I.shopping) },
    ],
  },
  {
    title: "퍼포먼스·바이럴·콘텐츠",
    items: [{ href: "/admin/requests", label: "서비스 신청내역", icon: icon(I.request) }],
  },
  {
    title: "상담·문의",
    items: [{ href: "/admin/cart", label: "장바구니 담아주기", icon: icon(I.cart) }],
  },
  {
    title: "정산",
    items: [{ href: "/admin/purchases", label: "발주 관리", icon: icon(I.settlement) }],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function useIsActive() {
  const pathname = usePathname();
  return (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
}

export function AdminSidebar({ adminName }: { adminName: string }) {
  const isActive = useIsActive();
  return (
    <aside
      className="w-[248px] shrink-0 sticky top-0 h-screen hidden md:flex flex-col text-white"
      style={{ background: "linear-gradient(180deg,#0D3473 0%,#111D37 100%)" }}
    >
      <div className="px-5 pt-6 pb-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-[15px] font-black">B</span>
          <div className="leading-tight">
            <p className="text-[15px] font-extrabold">BLUE EGG</p>
            <p className="text-[11px] text-white/55">관리자 콘솔</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 pb-4 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-4">
            <p className="px-3 mb-1.5 text-[11px] font-bold text-white/40 tracking-wide uppercase">{group.title}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                      active ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-[13px] font-semibold text-white truncate">{adminName}</p>
          <p className="text-[11px] text-white/50">관리자</p>
        </div>
        <Link
          href="/marketing"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-white/65 hover:bg-white/8 hover:text-white transition-all"
        >
          {icon(I.back)}
          서비스로 돌아가기
        </Link>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const isActive = useIsActive();
  return (
    <div className="md:hidden sticky top-0 z-40 bg-[#0D3473] text-white">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center text-[13px] font-black">B</span>
          <span className="text-[14px] font-extrabold">관리자 콘솔</span>
        </Link>
        <Link href="/marketing" className="text-[12px] text-white/70">
          서비스 →
        </Link>
      </div>
      <nav className="flex gap-1.5 px-3 pb-2.5 overflow-x-auto no-scrollbar">
        {ALL_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all ${
                active ? "bg-white text-[#0D3473]" : "bg-white/12 text-white/80"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

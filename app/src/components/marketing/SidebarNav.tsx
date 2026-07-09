"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";

// ── User summary card ─────────────────────────────────────────
const USER = { name: "사용자", grade: "Bronze", point: 0, activeAdCount: 0 };

function UserCard({ pathname }: { pathname: string }) {
  const campaignsActive = pathname === "/marketing/my/campaigns" || pathname.startsWith("/marketing/my/campaigns/");
  const reportActive = pathname === "/marketing/report" || pathname.startsWith("/marketing/report/");
  const chatActive = pathname === "/marketing/community/chatroom" || pathname.startsWith("/marketing/community/chatroom/");
  return (
    <div className="mx-1 mt-1.5 mb-4 rounded-2xl overflow-hidden"
      style={{ background: "linear-gradient(155deg,#1B3160 0%,#111D37 100%)", boxShadow: "0 8px 22px rgba(13,52,115,0.20)" }}>

      {/* 프로필 */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full flex items-center justify-center text-[#0D3473] font-extrabold text-[18px] shrink-0 bg-white">
            {USER.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-white leading-tight truncate">{USER.name} 님</p>
            <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#B45309]">
              {USER.grade}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10 my-3" />

        {/* 사용 가능 포인트 */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-white/55">사용 가능 포인트</span>
          <span className="text-[16px] font-extrabold text-white">
            {USER.point.toLocaleString()} <span className="text-[12px] font-bold text-white/50">P</span>
          </span>
        </div>

        <div className="h-px bg-white/10 my-3" />

        {/* 만료 예정 광고 */}
        <div className="flex items-center justify-between">
          <span className="text-[14px] text-white/55">만료 예정 광고</span>
          <span className="text-[16px] font-extrabold text-white">
            {USER.activeAdCount} <span className="text-[12px] font-bold text-white/50">개</span>
          </span>
        </div>

        {/* 충전 버튼 */}
        <Link href="/marketing/my/charge"
          className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl bg-white text-[#0D3473] text-[15px] font-bold hover:bg-white/90 transition-colors">
          포인트 충전하기
        </Link>

        <div className="h-px bg-white/10 mt-4" />

        {/* 배너 내 바로가기 */}
        <div className="mt-3 space-y-1">
          <Link href="/marketing/my/campaigns"
            className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${campaignsActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/[0.06]"}`}>
            마이 캠페인 현황
            <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/marketing/report"
            className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${reportActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/[0.06]"}`}>
            My SNS 대시보드
            <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/marketing/community/chatroom"
            className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${chatActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/[0.06]"}`}>
            <span className="flex items-center gap-1.5">
              오픈채팅
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-70" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#22C55E]" />
              </span>
            </span>
            <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Icon system ──────────────────────────────────────────────
type NavIcon =
  | { kind: "svg"; d: string }
  | { kind: "letter"; ch: string; bg: string }
  | { kind: "sqsvg"; d: string; bg: string }
  | { kind: "brand"; brand: BrandKey }
  | { kind: "meta" };

// 실제 플랫폼/서비스 심볼 (컬러 타일 + 화이트 로고)
type BrandKey = "naver" | "naver-place" | "naver-shopping" | "naver-cafe" | "coupang" | "google" | "instagram" | "youtube";
const BRAND_LOGOS: Record<BrandKey, { bg: string; viewBox: string; path: string; size: number; mode: "fill" | "stroke" }> = {
  naver:            { bg: "#03C75A", viewBox: "0 0 24 24", size: 14, mode: "fill",   path: "M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" },
  "naver-place":    { bg: "#03C75A", viewBox: "0 0 24 24", size: 17, mode: "stroke", path: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
  "naver-shopping": { bg: "#03C75A", viewBox: "0 0 24 24", size: 16, mode: "stroke", path: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" },
  "naver-cafe":     { bg: "#03C75A", viewBox: "0 0 24 24", size: 17, mode: "stroke", path: "M4.5 9.75h13.5v6a4.5 4.5 0 01-4.5 4.5H9a4.5 4.5 0 01-4.5-4.5v-6zM18 10.5h1.5a2.25 2.25 0 010 4.5H18M8 4.75v2M11.5 4.75v2M15 4.75v2" },
  coupang:   { bg: "#AE0000", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M6 8a6 6 0 1112 0v1h1.5A1.5 1.5 0 0121 10.5v9A1.5 1.5 0 0119.5 21h-15A1.5 1.5 0 013 19.5v-9A1.5 1.5 0 014.5 9H6V8zm2 1h8V8a4 4 0 10-8 0v1z" },
  google:    { bg: "#FFFFFF", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M21.35 11.1h-9.17v2.98h5.27c-.23 1.4-1.64 4.1-5.27 4.1-3.17 0-5.76-2.62-5.76-5.85s2.59-5.85 5.76-5.85c1.8 0 3.01.77 3.7 1.43l2.52-2.43C16.46 3.6 14.46 2.7 12.18 2.7 7.03 2.7 2.85 6.88 2.85 12.03s4.18 9.33 9.33 9.33c5.39 0 8.96-3.79 8.96-9.12 0-.61-.07-1.08-.16-1.54z" },
  instagram: { bg: "#E1306C", viewBox: "0 0 24 24", size: 15, mode: "fill", path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.12 1.38A5.86 5.86 0 00.63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.12.66.66 1.33 1.07 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 002.12-1.38 5.86 5.86 0 001.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 00-1.38-2.12A5.86 5.86 0 0019.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 105.84 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 118 12a4 4 0 014 4zm6.41-10.4a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z" },
  youtube:   { bg: "#FF0000", viewBox: "0 0 24 24", size: 16, mode: "fill", path: "M9.6 8.15 16 12l-6.4 3.85z" },
};

function NavIconEl({ icon, active }: { icon: NavIcon; active?: boolean }) {
  if (icon.kind === "svg") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
        style={{ color: active ? "#0D3473" : "#5B6472", flexShrink: 0 }}
        stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d={icon.d} />
      </svg>
    );
  }
  if (icon.kind === "letter") {
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0 font-black select-none"
        style={{ color: icon.bg, fontSize: 16, lineHeight: 1 }}>
        {icon.ch}
      </span>
    );
  }
  if (icon.kind === "sqsvg") {
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={icon.bg} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
          <path d={icon.d} />
        </svg>
      </span>
    );
  }
  if (icon.kind === "brand") {
    const b = BRAND_LOGOS[icon.brand];
    const isStroke = b.mode === "stroke";
    const glyphColor = icon.brand === "google" ? "#4285F4" : b.bg;
    return (
      <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
        <svg width={b.size + 2} height={b.size + 2} viewBox={b.viewBox} aria-hidden
          fill={isStroke ? "none" : glyphColor}
          stroke={isStroke ? glyphColor : "none"} strokeWidth={isStroke ? 2 : undefined}
          strokeLinecap="round" strokeLinejoin="round">
          <path d={b.path} />
        </svg>
      </span>
    );
  }
  // META infinity
  return (
    <span className="h-[22px] w-[22px] flex items-center justify-center shrink-0">
      <svg width="22" height="13" viewBox="0 0 24 14" fill="none">
        <path
          d="M1.5 7C1.5 4.2 3.2 2 5.5 2C7.8 2 9.2 3.7 10.5 6.2C11.8 8.7 13.2 10.5 15.5 10.5C17.8 10.5 19.5 8.3 19.5 5.5M19.5 5.5C19.5 2.7 17.8 0.5 15.5 0.5C13.2 0.5 11.8 2.3 10.5 4.8M22.5 5.5C22.5 8.3 20.8 10.5 18.5 10.5"
          stroke="#1877F2" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ── Nav data ─────────────────────────────────────────────────
type SubItem = { label: string; href: string };
interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
  free?: boolean;
  children?: SubItem[];
}
interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "마이 캠페인 현황",
        href: "/marketing/my/campaigns",
        icon: { kind: "svg", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
      },
      {
        label: "홈",
        href: "/marketing",
        icon: { kind: "svg", d: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
      },
      {
        label: "커뮤니티",
        href: "/marketing/community",
        icon: { kind: "svg", d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" },
        children: [
          { label: "공지사항", href: "/marketing/notices" },
          { label: "게시판", href: "/marketing/community/board" },
          { label: "오픈채팅", href: "/marketing/community/chatroom" },
        ],
      },
    ],
  },
  {
    title: "통합순위관리",
    items: [
      {
        label: "통합순위관리",
        href: "/marketing/rank",
        icon: { kind: "svg", d: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" },
        free: true,
        children: [
          { label: "네이버 플레이스", href: "/marketing/rank/place" },
          { label: "네이버 쇼핑", href: "/marketing/rank/shopping" },
        ],
      },
    ],
  },
  {
    title: "리워드 마케팅",
    items: [
      {
        label: "네이버 플레이스 리워드",
        href: "/marketing/reward/place",
        icon: { kind: "brand", brand: "naver-place" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/place" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/place/manage" },
          { label: "[보장형] 캠페인 신청", href: "/marketing/reward/place/guaranteed" },
          { label: "[보장형] 캠페인 관리", href: "/marketing/reward/place/guaranteed/manage" },
        ],
      },
      {
        label: "네이버 쇼핑 리워드",
        href: "/marketing/reward/shopping",
        icon: { kind: "brand", brand: "naver-shopping" },
        children: [
          { label: "[상위노출] 캠페인 신청", href: "/marketing/reward/shopping" },
          { label: "[상위노출] 캠페인 관리", href: "/marketing/reward/shopping/manage" },
        ],
      },
    ],
  },
  {
    title: "리뷰·체험단",
    items: [
      {
        label: "네이버 플레이스 리뷰",
        href: "/marketing/review/place",
        icon: { kind: "brand", brand: "naver-place" },
        children: [
          { label: "캠페인 신청", href: "/marketing/review/place" },
          { label: "캠페인 관리", href: "/marketing/review/place/manage" },
        ],
      },
      {
        label: "쇼핑 리뷰",
        href: "/marketing/review/shopping",
        icon: { kind: "brand", brand: "naver-shopping" },
        children: [
          { label: "캠페인 신청", href: "/marketing/review/shopping" },
          { label: "캠페인 관리", href: "/marketing/review/shopping/manage" },
        ],
      },
    ],
  },
  {
    title: "퍼포먼스 마케팅",
    items: [
      {
        label: "네이버",
        href: "/marketing/ads/naver-cpc",
        icon: { kind: "brand", brand: "naver" },
        children: [
          { label: "네이버 SA광고 최적화", href: "/marketing/ads/naver-cpc" },
          { label: "네이버 광고비 환급받기", href: "/marketing/ads/naver-cpc-refund" },
        ],
      },
    ],
  },
  {
    title: "바이럴·커뮤니티",
    items: [
      {
        label: "네이버 카페 침투",
        href: "/marketing/community/cafe",
        icon: { kind: "brand", brand: "naver-cafe" },
      },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      {
        label: "고퀄리티 이미지 제작",
        href: "/marketing/content/image",
        icon: { kind: "sqsvg", d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", bg: "#DB2777" },
      },
      {
        label: "Total 브랜딩",
        href: "/marketing/content/branding",
        icon: { kind: "letter", ch: "T", bg: "#7C3AED" },
      },
      {
        label: "홈페이지",
        href: "/marketing/content/homepage",
        icon: { kind: "sqsvg", d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", bg: "#1E40AF" },
      },
      {
        label: "상세페이지",
        href: "/marketing/content/detail",
        icon: { kind: "sqsvg", d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", bg: "#0D9488" },
      },
      {
        label: "영상 제작",
        href: "/marketing/content/video",
        icon: { kind: "sqsvg", d: "M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", bg: "#DC2626" },
      },
    ],
  },
];

// ── Chevron ───────────────────────────────────────────────────
function ChevronRight({ active }: { active: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: active ? "#0D3473" : "#C4C9D4", flexShrink: 0 }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}
function ChevronDown({ open, anyActive }: { open: boolean; anyActive: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ color: anyActive ? "#0D3473" : "#C4C9D4", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
      stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ── Accordion item ────────────────────────────────────────────
function AccordionItem({ item, pathname, open, onToggle }: { item: NavItem; pathname: string; open: boolean; onToggle: () => void }) {
  const children = item.children!;
  const anyActive = children.some(c => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
    <div>
      <button onClick={onToggle}
        className={`relative w-full flex items-center gap-2.5 px-3 py-[10px] rounded-xl transition-all text-left ${
          anyActive ? "bg-[#E8ECF8] text-[#0D3473]" : "text-[#2B3648] hover:bg-[#F2F4FA]"
        }`}>
        {anyActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#0D3473]" />}
        <NavIconEl icon={item.icon} active={anyActive} />
        <span className="flex-1 text-[15px] font-semibold truncate">{item.label}</span>
        <ChevronDown open={open} anyActive={anyActive} />
      </button>

      {open && (
        <div className="mt-0.5 ml-[50px] mr-2 mb-1 space-y-0.5 border-l-2 border-[#E2E6ED] pl-3">
          {children.map(sub => {
            const active = pathname === sub.href;
            return (
              <Link key={sub.href} href={sub.href}
                className={`flex items-center gap-2 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all ${
                  active ? "bg-[#E8ECF8] text-[#0D3473] font-semibold" : "text-[#5B6472] hover:bg-[#F2F4FA] hover:text-[#2B3648]"
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-[#0D3473]" : "bg-[#C4C9D4]"}`} />
                {sub.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Leaf item ─────────────────────────────────────────────────
function LeafItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href}
      className={`relative flex items-center gap-2.5 px-3 py-[10px] rounded-xl transition-all ${
        active ? "bg-[#E8ECF8] text-[#0D3473] font-semibold" : "text-[#2B3648] hover:bg-[#F2F4FA]"
      }`}>
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#0D3473]" />}
      <NavIconEl icon={item.icon} active={active} />
      <span className="flex-1 text-[15px] font-semibold truncate">{item.label}</span>
      {item.free && (
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
          active ? "bg-[#0D3473] text-white" : "bg-[#E8ECF8] text-[#0D3473]"
        }`}>무료</span>
      )}
      <ChevronRight active={active} />
    </Link>
  );
}

// ── Group title ───────────────────────────────────────────────
function GroupTitle({ title }: { title: string }) {
  if (!title) return null;
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1.5">
      <span className="h-[3px] w-[3px] rounded-full bg-[#0D3473] shrink-0 opacity-70" />
      <p className="text-[13px] font-bold text-[#4E5968] tracking-tight">{title}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────
function activeAccordionKey(pathname: string): string | null {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + "/"))) {
        return item.href;
      }
    }
  }
  return null;
}

export default function SidebarNav() {
  const pathname = usePathname();
  // 한 번에 하나의 아코디언만 열림 (다른 메뉴는 자동으로 닫힘)
  const [openKey, setOpenKey] = useState<string | null>(() => activeAccordionKey(pathname));

  return (
    <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-none">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi}>
          {gi > 0 && <div className="h-px bg-[#EBEEF2] mx-1 my-2" />}
          <GroupTitle title={group.title} />
          {group.items.map(item => {
            // 마이 캠페인 현황 + 프로필을 하나의 네이비 배너로 통합
            if (item.href === "/marketing/my/campaigns") {
              return (
                <UserCard key={item.href} pathname={pathname} />
              );
            }
            return (
              <Fragment key={item.href}>
                {item.children ? (
                  <AccordionItem
                    item={item}
                    pathname={pathname}
                    open={openKey === item.href}
                    onToggle={() => setOpenKey(prev => (prev === item.href ? null : item.href))}
                  />
                ) : (
                  <LeafItem item={item}
                    active={item.href === "/marketing" ? pathname === "/marketing" : pathname === item.href || pathname.startsWith(item.href + "/")} />
                )}
              </Fragment>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

import React from "react";

/**
 * Icon3D — BlueEgg 디자인 시스템 §7 "3D 아이콘" 의 벡터(2.5D) 구현.
 * 규칙: 좌상단 45° 광원 · 네이비 베이스(+카테고리 액센트) · 라운드 · 소프트 드롭섀도.
 * 소형(<24px)에서는 라인 아이콘 fallback 을 쓰고, 카드 헤더/페이지 헤더 등 큰 자리에 사용.
 */

export type Icon3DName =
  | "bell"       // 공지
  | "clipboard"  // 캠페인
  | "chart"      // 순위/퍼포먼스
  | "coin"       // 포인트/리워드
  | "star"       // 리뷰·체험단
  | "search"     // 광고/검색
  | "chat";      // 커뮤니티

const NAVY_A = "#152C9E";
const NAVY_B = "#2452EB";
const NAVY_C = "#0C285A";
const BLUE = "#2E7BE6";
const CYAN = "#22C7E0";
const AMBER = "#F5B72A";
const AMBER_D = "#C97E23";

function Shadow() {
  return <ellipse cx="28" cy="50" rx="14" ry="3" fill="#152C9E" opacity="0.16" />;
}
function Gloss({ d }: { d: string }) {
  return <path d={d} fill="#FFFFFF" opacity="0.22" />;
}

export default function Icon3D({
  name,
  className = "w-10 h-10",
}: {
  name: Icon3DName;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 56 56" className={className} fill="none" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`i3d-navy-${name}`} x1="14" y1="8" x2="42" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor={NAVY_A} /><stop offset="0.55" stopColor={NAVY_B} /><stop offset="1" stopColor={NAVY_C} />
        </linearGradient>
        <linearGradient id={`i3d-accent-${name}`} x1="14" y1="10" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor={CYAN} /><stop offset="1" stopColor={BLUE} />
        </linearGradient>
        <linearGradient id={`i3d-amber-${name}`} x1="14" y1="8" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9C254" /><stop offset="0.55" stopColor={AMBER} /><stop offset="1" stopColor={AMBER_D} />
        </linearGradient>
      </defs>

      {name === "bell" && (
        <>
          <Shadow />
          <path d="M28 9c-7.2 0-12 5.2-12 13.3 0 6.2-2 9.4-3.9 11.4-1.1 1.2-.3 3.3 1.6 3.3h28.6c1.9 0 2.7-2.1 1.6-3.3-1.9-2-3.9-5.2-3.9-11.4C40 14.2 35.2 9 28 9Z" fill={`url(#i3d-navy-${name})`} />
          <circle cx="28" cy="8.5" r="2.8" fill={`url(#i3d-navy-${name})`} />
          <path d="M23 42.5h10a5 5 0 0 1-10 0Z" fill={`url(#i3d-accent-${name})`} />
          <path d="M17.5 33.5c1.6-2.1 2.9-5.2 2.9-9.6" stroke={CYAN} strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
          <Gloss d="M22.5 14.5c-2.4 2.2-3.6 5.3-3.9 9.2-.1 1.2 1.6 1.5 2 .3 1-3.4 2.3-6 4.2-7.9 1-1 .3-2.6-.9-2.4-.5.1-1 .4-1.4.8Z" />
        </>
      )}

      {name === "clipboard" && (
        <>
          <Shadow />
          <rect x="14" y="12" width="28" height="34" rx="6.5" fill={`url(#i3d-navy-${name})`} />
          <rect x="18" y="16.5" width="20" height="25" rx="3" fill="#F5F7FB" />
          <rect x="23" y="8.5" width="10" height="7" rx="3.5" fill={`url(#i3d-accent-${name})`} />
          <rect x="22" y="22" width="12" height="2.4" rx="1.2" fill={BLUE} opacity="0.55" />
          <rect x="22" y="27.5" width="9" height="2.4" rx="1.2" fill={BLUE} opacity="0.4" />
          <rect x="22" y="33" width="11" height="2.4" rx="1.2" fill={BLUE} opacity="0.4" />
          <Gloss d="M17 15c-1 .8-1.6 2-1.6 3.4V40c0 .7 1 .9 1.3.2.4-1 .6-8 .6-13.5S18 16.9 18 15.7c0-.9-.6-1.2-1-.7Z" />
        </>
      )}

      {name === "chart" && (
        <>
          <Shadow />
          <rect x="12" y="12" width="32" height="32" rx="8" fill={`url(#i3d-navy-${name})`} />
          <rect x="18" y="30" width="5.5" height="9" rx="2" fill="#EAF2FF" opacity="0.92" />
          <rect x="25.25" y="25" width="5.5" height="14" rx="2" fill="#EAF2FF" opacity="0.92" />
          <rect x="32.5" y="20" width="5.5" height="19" rx="2" fill={`url(#i3d-accent-${name})`} />
          <path d="M19 27l6-4 5 2 7-7" stroke={CYAN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M33 18h5v5" stroke={CYAN} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <Gloss d="M15 16c-1 .9-1.6 2.2-1.6 3.7v9c0 .8 1.1 1 1.4.2.5-1.4.7-4.8.7-8.6s.5-3.7.5-4.6c0-.7-.6-1-1-.7Z" />
        </>
      )}

      {name === "coin" && (
        <>
          <Shadow />
          <circle cx="28" cy="26" r="16.5" fill={`url(#i3d-accent-${name})`} />
          <circle cx="28" cy="26" r="16.5" stroke="#2452EB" strokeOpacity="0.18" strokeWidth="1.4" />
          <circle cx="28" cy="26" r="12.5" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.4" />
          <text x="28" y="33" textAnchor="middle" fontSize="18" fontWeight="900" fill="#0C285A" fillOpacity="0.85" fontFamily="system-ui,sans-serif">P</text>
          <ellipse cx="21.5" cy="17.5" rx="7.5" ry="4.5" fill="#FFFFFF" opacity="0.35" transform="rotate(-30 21.5 17.5)" />
        </>
      )}

      {name === "star" && (
        <>
          <Shadow />
          <path d="M28 8.5l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L28 33.4l-9.7 5.1 1.9-10.9-7.9-7.7 10.9-1.6L28 8.5Z" fill={`url(#i3d-amber-${name})`} />
          <path d="M28 8.5l4.9 9.9 10.9 1.6-7.9 7.7 1.9 10.9L28 33.4l-9.7 5.1 1.9-10.9-7.9-7.7 10.9-1.6L28 8.5Z" stroke={AMBER_D} strokeOpacity="0.4" strokeWidth="1" strokeLinejoin="round" />
          <ellipse cx="23" cy="16" rx="6" ry="3.6" fill="#FFFFFF" opacity="0.4" transform="rotate(-28 23 16)" />
        </>
      )}

      {name === "search" && (
        <>
          <Shadow />
          <rect x="30" y="30" width="14" height="7" rx="3.5" transform="rotate(45 30 30)" fill={`url(#i3d-navy-${name})`} />
          <circle cx="25" cy="23" r="13" fill={`url(#i3d-navy-${name})`} />
          <circle cx="25" cy="23" r="8.5" fill={`url(#i3d-accent-${name})`} />
          <circle cx="25" cy="23" r="8.5" fill="#0C285A" fillOpacity="0.15" />
          <ellipse cx="20.5" cy="17.5" rx="4.5" ry="2.8" fill="#FFFFFF" opacity="0.4" transform="rotate(-30 20.5 17.5)" />
        </>
      )}

      {name === "chat" && (
        <>
          <Shadow />
          <path d="M14 14h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H24l-8 6v-6h-2a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" fill={`url(#i3d-navy-${name})`} />
          <circle cx="21" cy="25" r="2.3" fill="#EAF2FF" />
          <circle cx="28" cy="25" r="2.3" fill={`url(#i3d-accent-${name})`} />
          <circle cx="35" cy="25" r="2.3" fill="#EAF2FF" />
          <Gloss d="M15 17c-1 .8-1.6 2-1.6 3.4v10c0 .8 1.1 1 1.4.2.5-1.3.7-4.4.7-8.1s.5-3.7.5-4.8c0-.7-.6-1-1-.7Z" />
        </>
      )}
    </svg>
  );
}

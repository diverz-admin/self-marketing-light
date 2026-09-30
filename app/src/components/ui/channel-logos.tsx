"use client";

/**
 * 채널 심볼 — 네이버 플레이스·쇼핑·카페, 쿠팡.
 *
 * 사이드바 네비와 통합순위관리 탭이 같이 쓴다. 같은 채널이 화면마다 다른
 * 그림으로 나오면 안 되므로 한 곳에 둔다.
 *
 * size 는 렌더 크기(px)다. 원본들이 앱 아이콘(512px) 전제라 작은 크기에서는
 * 잔디테일이 뭉갠다 — 16px 미만으로는 쓰지 말 것.
 */

import { useId } from "react";

/**
 * 네이버 카페 잔.
 *
 * 진한 초록 찻잔(평평한 윗면 + 반원 바닥 + 오른쪽 손잡이) 위에 연초록 잎.
 * 두 색을 쓰는 이유는 잎이 잔과 같은 초록이면 20px 에서 한 덩어리로 뭉치기
 * 때문이다. 원본도 잎이 한 톤 밝다.
 */
export function NaverCafeCup({ size = 20 }: { size?: number }) {
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size + 2, height: size + 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        {/* 잎 — 끝이 왼쪽 아래, 몸통이 오른쪽 위로 눕는다 */}
        <path
          d="M8.9 8.9C8.9 5.2 11.8 2.6 15.6 2.6 15.6 6.3 12.7 8.9 8.9 8.9Z"
          fill="#63DC4B"
        />
        {/* 손잡이 — 잔 오른쪽에 붙는 고리. 잔보다 먼저 그려 겹침을 잔이 덮는다 */}
        <path
          d="M15.6 11.9a3.05 3.05 0 0 1 0 5.6"
          fill="none"
          stroke="#10B93F"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        {/* 잔 — 평평한 윗면에서 반원 바닥으로 */}
        <path d="M4.3 10.6h11.6v2.4a5.8 5.8 0 0 1-11.6 0z" fill="#10B93F" />
      </svg>
    </span>
  );
}

/**
 * 쿠팡 배지.
 *
 * 톱니 원(16스파이크)에 빨강 그라디언트, 가운데 흰 coupang 워드마크.
 * 톱니 좌표는 중심 (12,12)·바깥 10.7·안쪽 9.0 으로 계산해 넣었다.
 *
 * 워드마크는 20px 에서 읽히지 않는다. 그래도 넣는 이유는, 빼면 그냥 빨간
 * 톱니 원이 되어 쿠팡으로 식별되지 않기 때문이다 — 흰 띠의 위치와 비율이
 * 이 아이콘을 쿠팡으로 읽게 만드는 단서다.
 */
export function CoupangBurst({ size = 20 }: { size?: number }) {
  const gid = useId();
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size + 2, height: size + 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8452E" />
            <stop offset="100%" stopColor="#C8200A" />
          </linearGradient>
        </defs>
        <path d="M12.00 1.30 L13.76 3.17 L16.09 2.11 L17.00 4.52 L19.57 4.43 L19.48 7.00 L21.89 7.91 L20.83 10.24 L22.70 12.00 L20.83 13.76 L21.89 16.09 L19.48 17.00 L19.57 19.57 L17.00 19.48 L16.09 21.89 L13.76 20.83 L12.00 22.70 L10.24 20.83 L7.91 21.89 L7.00 19.48 L4.43 19.57 L4.52 17.00 L2.11 16.09 L3.17 13.76 L1.30 12.00 L3.17 10.24 L2.11 7.91 L4.52 7.00 L4.43 4.43 L7.00 4.52 L7.91 2.11 L10.24 3.17 Z" fill={`url(#${gid})`} />
        <text
          x="12"
          y="13.15"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="5.3"
          fontWeight={700}
          letterSpacing="-0.25"
          fontFamily='"Pretendard Variable", Pretendard, system-ui, sans-serif'
        >
          coupang
        </text>
      </svg>
    </span>
  );
}

/**
 * 네이버 쇼핑 타일.
 *
 * 초록 → 청록 → 파랑 대각 그라디언트 위에 흰 쇼핑백 면, 손잡이는 초록 곡선,
 * 우하단에 파란 N. 메뉴 두 곳(쇼핑 리워드 · 쇼핑 리뷰)에서 함께 쓴다.
 *
 * 20px 로 줄어드는 자리라 원본의 잔details 를 그대로 옮기면 뭉갠다. 읽히는
 * 요소(타일 그라디언트 · 흰 면 · 손잡이 곡선 · N)만 남기고 획을 굵혔다.
 */
export function NaverShoppingTile({ size = 20 }: { size?: number }) {
  const gid = useId();
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size + 2, height: size + 2 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#10D24B" />
            <stop offset="50%" stopColor="#17BFC0" />
            <stop offset="100%" stopColor="#5B87F0" />
          </linearGradient>
        </defs>
        <rect x="1.4" y="1.4" width="21.2" height="21.2" rx="5.4" fill={`url(#${gid})`} />
        {/* 쇼핑백 면 */}
        <rect x="5.4" y="5" width="13.2" height="13.4" fill="#FFFFFF" />
        {/* 손잡이 — 양 끝 점에서 아래로 늘어진 곡선 */}
        <path d="M9.1 7.7c0 4.9 5.8 4.9 5.8 0" fill="none" stroke="#22C55E" strokeWidth="1.15" strokeLinecap="round" />
        <circle cx="9.1" cy="7.7" r="0.62" fill="#22C55E" />
        <circle cx="14.9" cy="7.7" r="0.62" fill="#22C55E" />
        {/* 네이버 N — 흰 면 우하단 */}
        <g transform="translate(12.9 13.1) scale(0.196 0.19)">
          <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" fill="#4D7FE8" />
        </g>
      </svg>
    </span>
  );
}


/**
 * 네이버 플레이스 핀.
 *
 * 위 파랑 → 아래 초록 그라디언트에 흰 N 이 얹힌 물방울 핀. 메뉴 두 곳
 * (플레이스 리워드 · 플레이스 리뷰)에서 함께 쓴다.
 *
 * 그라디언트 id 는 useId 로 인스턴스마다 다르게 준다. 같은 문서에 같은 id 가
 * 두 번 들어가면 유효하지 않은 마크업이 된다.
 */
export function NaverPlacePin({ size = 20 }: { size?: number }) {
  const gid = useId();
  return (
    <span className="inline-flex items-center justify-center shrink-0" style={{ width: size + 2, height: size + 2 }}>
      <svg width={size * 0.95} height={size} viewBox="0 0 24 25" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1273E8" />
            <stop offset="45%" stopColor="#10B5C0" />
            <stop offset="100%" stopColor="#00C400" />
          </linearGradient>
        </defs>
        {/* 물방울 핀 — 둥근 머리에서 아래 한 점으로 모인다 */}
        <path
          d="M12 1.4C6.7 1.4 2.4 5.7 2.4 11c0 2.24.77 4.3 2.06 5.93L12 24.6l7.54-7.67A9.55 9.55 0 0 0 21.6 11c0-5.3-4.3-9.6-9.6-9.6z"
          fill={`url(#${gid})`}
        />
        {/* 네이버 N — 공식 심볼 경로를 핀 머리 안쪽에 맞춰 축소 배치 */}
        <g transform="translate(7.5 6.1) scale(0.375)">
          <path d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727z" fill="#FFFFFF" />
        </g>
      </svg>
    </span>
  );
}


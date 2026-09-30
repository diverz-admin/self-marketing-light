/**
 * 수치 표기 공용 부품 — 어드민 콘솔과 고객 대시보드가 같이 쓴다.
 *
 * 숫자를 모노스페이스로 찍으면 자릿수가 세로로 맞고, 화면이 "계기판"처럼
 * 읽힌다. 단위(원·건·명·P)는 한글이라 모노 폴백이 깨지므로 Num 밖에 둔다.
 */

import * as React from "react";

/**
 * 모노스페이스 수치.
 * 한글이 섞이면 모노 폴백이 깨지므로, 단위(원·건·명)는 밖에서 따로 붙인다.
 */
export function Num({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono tabular-nums tracking-[-0.02em] ${className}`}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {children}
    </span>
  );
}

/**
 * 증감 칩 — `+12.4%` / `-3.1%`.
 * 화살표 대신 부호를 쓴다. 콘솔에서는 부호가 더 빨리 읽히고 폭도 일정하다.
 * delta 가 null 이면(비교 대상이 0이라 비율을 낼 수 없음) 아무것도 그리지 않는다.
 */
export function DeltaChip({ delta }: { delta: number | null }) {
  if (delta === null) return null;
  const tone =
    delta > 0
      ? "bg-brand-success-bg text-brand-success"
      : delta < 0
        ? "bg-brand-error-bg text-brand-error"
        : "bg-brand-light text-brand-muted";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${tone}`}>
      <Num>
        {sign}
        {Math.abs(delta)}%
      </Num>
    </span>
  );
}

/* ────────────────────────────────────────────────────────────
   스파크라인
──────────────────────────────────────────────────────────── */

/**
 * 카드 안에 넣는 작은 추세선.
 *
 * Recharts 를 쓰지 않고 SVG 를 직접 그린다. 이 크기에서는 축·툴팁·범례가 모두
 * 불필요하고, 서버 컴포넌트로 남길 수 있어 클라이언트 번들이 늘지 않는다.
 *
 * 값이 전부 같으면(0만 있는 신규 서비스처럼) 가운데 가로선을 긋는다 —
 * 0으로 나누면 NaN 이 되어 선이 사라진다.
 */
export function Sparkline({
  values,
  width = 132,
  height = 34,
  className = "",
  tone = "currentColor",
}: {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  tone?: string;
}) {
  if (values.length < 2) return null;

  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;

  /*
   * 값이 전부 같으면(매출이 계속 0이거나, 기간 내 신규 가입이 없어 총원이 그대로)
   * 실선을 긋지 않는다. 한가운데 자신 있게 그은 선은 "데이터가 있고 평평하다"로
   * 읽히는데, 실제로는 보여 줄 변화가 없는 것이다. 점선 + 흐린 색으로 구분한다.
   */
  if (span === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        aria-hidden
      >
        <line
          x1={pad}
          y1={height - pad - 1}
          x2={width - pad}
          y2={height - pad - 1}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="text-brand-border-strong"
        />
      </svg>
    );
  }

  const x = (i: number) => pad + (i * (width - pad * 2)) / (values.length - 1);
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);

  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  const lastX = x(values.length - 1);
  const lastY = y(values[values.length - 1]);
  const gid = `spark-${values.length}-${Math.round(max)}-${Math.round(min)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      style={{ color: tone }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* 마지막 점 — "지금 여기"를 찍어 준다 */}
      <circle cx={lastX} cy={lastY} r="2.5" fill="currentColor" />
    </svg>
  );
}

/**
 * 일별 증가분을 누적 추세로 바꾼다.
 *
 * "전체 회원" 같은 누적 지표는 일별 신규 건수를 그대로 그리면 안 된다 —
 * 매일 0~2명이라 선이 바닥에서 튀기만 하고, 카드에 적힌 큰 숫자(누적 총원)와
 * 아무 관계가 없어 보인다. 현재 총원에서 거꾸로 빼 나가며 과거 시점의 총원을
 * 복원해야 "여기까지 이렇게 쌓였다"가 읽힌다.
 */
export function cumulative(daily: number[], total: number): number[] {
  const out = new Array<number>(daily.length);
  let running = total;
  for (let i = daily.length - 1; i >= 0; i--) {
    out[i] = running;
    running -= daily[i];
  }
  return out;
}

